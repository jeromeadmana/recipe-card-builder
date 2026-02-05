import { pool } from './pool';

async function migrate() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('Creating rcb_users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS rcb_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('guest', 'home_cook', 'chef')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('Creating rcb_recipes table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS rcb_recipes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES rcb_users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        is_public BOOLEAN DEFAULT false,
        canvas_data JSONB NOT NULL,
        thumbnail_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('Creating rcb_templates table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS rcb_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        canvas_data JSONB NOT NULL,
        thumbnail_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('Creating rcb_sessions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS rcb_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES rcb_users(id) ON DELETE CASCADE,
        token VARCHAR(500) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('Creating indexes...');
    await client.query('CREATE INDEX IF NOT EXISTS idx_rcb_recipes_user_id ON rcb_recipes(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_rcb_recipes_is_public ON rcb_recipes(is_public)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_rcb_sessions_token ON rcb_sessions(token)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_rcb_sessions_user_id ON rcb_sessions(user_id)');

    await client.query('COMMIT');
    console.log('Migration completed successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(console.error);
