import { pool } from '../db/pool';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Cleanup script for demo mode
 *
 * This script:
 * 1. Deletes recipes older than 30 days
 * 2. Deletes users older than 14 days (except protected demo users)
 * 3. Deletes expired sessions
 * 4. Runs VACUUM to optimize database
 *
 * Protected demo users (not deleted):
 * - testchef
 * - homecook
 * - guest1
 */

const PROTECTED_USERNAMES = ['testchef', 'homecook', 'guest1'];
const RECIPE_MAX_AGE_DAYS = 30;
const USER_MAX_AGE_DAYS = 14;

async function cleanup() {
  const client = await pool.connect();

  try {
    console.log('Starting demo data cleanup...');
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('---');

    await client.query('BEGIN');

    // 1. Delete old recipes
    console.log(`Deleting recipes older than ${RECIPE_MAX_AGE_DAYS} days...`);
    const recipeResult = await client.query(
      `DELETE FROM rcb_recipes
       WHERE created_at < NOW() - INTERVAL '${RECIPE_MAX_AGE_DAYS} days'
       RETURNING id`
    );
    console.log(`✓ Deleted ${recipeResult.rowCount} old recipes`);

    // 2. Delete old users (except protected ones)
    console.log(`Deleting users older than ${USER_MAX_AGE_DAYS} days...`);
    const userResult = await client.query(
      `DELETE FROM rcb_users
       WHERE created_at < NOW() - INTERVAL '${USER_MAX_AGE_DAYS} days'
       AND username NOT IN (${PROTECTED_USERNAMES.map((_, i) => `$${i + 1}`).join(', ')})
       RETURNING id, username`,
      PROTECTED_USERNAMES
    );
    console.log(`✓ Deleted ${userResult.rowCount} old users`);
    if (userResult.rows.length > 0) {
      console.log(`  Deleted usernames: ${userResult.rows.map(r => r.username).join(', ')}`);
    }

    // 3. Delete expired sessions
    console.log('Deleting expired sessions...');
    const sessionResult = await client.query(
      `DELETE FROM rcb_sessions
       WHERE expires_at < NOW()
       RETURNING id`
    );
    console.log(`✓ Deleted ${sessionResult.rowCount} expired sessions`);

    // 4. Get statistics
    const stats = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM rcb_users) as total_users,
        (SELECT COUNT(*) FROM rcb_recipes) as total_recipes,
        (SELECT COUNT(*) FROM rcb_templates) as total_templates,
        (SELECT COUNT(*) FROM rcb_sessions) as total_sessions
    `);

    console.log('---');
    console.log('Current database statistics:');
    console.log(`  Users: ${stats.rows[0].total_users}`);
    console.log(`  Recipes: ${stats.rows[0].total_recipes}`);
    console.log(`  Templates: ${stats.rows[0].total_templates}`);
    console.log(`  Sessions: ${stats.rows[0].total_sessions}`);

    await client.query('COMMIT');
    console.log('---');
    console.log('✓ Cleanup completed successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('✗ Cleanup failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run cleanup if executed directly
if (require.main === module) {
  cleanup()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default cleanup;
