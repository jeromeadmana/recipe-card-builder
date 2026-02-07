import { Router, Response } from 'express';
import { pool } from '../db/pool';
import { authenticate, AuthRequest } from '../middleware/auth';
import { checkRecipeQuota, validateCanvasSize } from '../middleware/quota';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // Pagination
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    let query = '';
    let countQuery = '';
    let params: any[] = [];

    if (req.user!.role === 'chef') {
      query = 'SELECT * FROM rcb_recipes ORDER BY created_at DESC LIMIT $1 OFFSET $2';
      countQuery = 'SELECT COUNT(*) FROM rcb_recipes';
      params = [limit, offset];
    } else if (req.user!.role === 'home_cook') {
      query = `SELECT * FROM rcb_recipes
               WHERE is_public = true OR user_id = $1
               ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
      countQuery = `SELECT COUNT(*) FROM rcb_recipes WHERE is_public = true OR user_id = $1`;
      params = [req.user!.id, limit, offset];
    } else {
      query = 'SELECT * FROM rcb_recipes WHERE is_public = true ORDER BY created_at DESC LIMIT $1 OFFSET $2';
      countQuery = 'SELECT COUNT(*) FROM rcb_recipes WHERE is_public = true';
      params = [limit, offset];
    }

    const result = await pool.query(query, params);
    const countResult = await pool.query(countQuery, req.user!.role === 'home_cook' ? [req.user!.id] : []);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      recipes: result.rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM rcb_recipes WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const recipe = result.rows[0];

    if (req.user!.role === 'guest' && !recipe.is_public) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user!.role === 'home_cook' && !recipe.is_public && recipe.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ recipe });
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, checkRecipeQuota, validateCanvasSize, async (req: AuthRequest, res: Response) => {
  const { title, description, is_public = false, canvas_data } = req.body;

  if (req.user!.role === 'guest') {
    return res.status(403).json({ error: 'Guests cannot create recipes' });
  }

  if (!title || !canvas_data) {
    return res.status(400).json({ error: 'Title and canvas_data are required' });
  }

  // Validate title length
  if (title.length > 255) {
    return res.status(400).json({ error: 'Title must be 255 characters or less' });
  }

  // Validate description length
  if (description && description.length > 5000) {
    return res.status(400).json({ error: 'Description must be 5000 characters or less' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO rcb_recipes (user_id, title, description, is_public, canvas_data)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user!.id, title, description, is_public, JSON.stringify(canvas_data)]
    );

    res.status(201).json({ recipe: result.rows[0] });
  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticate, validateCanvasSize, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, description, is_public, canvas_data } = req.body;

  if (req.user!.role === 'guest') {
    return res.status(403).json({ error: 'Guests cannot edit recipes' });
  }

  // Validate title length
  if (title && title.length > 255) {
    return res.status(400).json({ error: 'Title must be 255 characters or less' });
  }

  // Validate description length
  if (description && description.length > 5000) {
    return res.status(400).json({ error: 'Description must be 5000 characters or less' });
  }

  try {
    const checkResult = await pool.query('SELECT user_id FROM rcb_recipes WHERE id = $1', [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const recipe = checkResult.rows[0];

    if (req.user!.role === 'home_cook' && recipe.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'You can only edit your own recipes' });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (is_public !== undefined) {
      updates.push(`is_public = $${paramCount++}`);
      values.push(is_public);
    }
    if (canvas_data !== undefined) {
      updates.push(`canvas_data = $${paramCount++}`);
      values.push(JSON.stringify(canvas_data));
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE rcb_recipes SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    res.json({ recipe: result.rows[0] });
  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (req.user!.role === 'guest') {
    return res.status(403).json({ error: 'Guests cannot delete recipes' });
  }

  try {
    const checkResult = await pool.query('SELECT user_id FROM rcb_recipes WHERE id = $1', [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const recipe = checkResult.rows[0];

    if (req.user!.role === 'home_cook' && recipe.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'You can only delete your own recipes' });
    }

    await pool.query('DELETE FROM rcb_recipes WHERE id = $1', [id]);
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's recipe statistics
router.get('/stats/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const maxRecipes = parseInt(process.env.MAX_RECIPES_PER_USER || '10');

    const result = await pool.query(
      'SELECT COUNT(*) as count FROM rcb_recipes WHERE user_id = $1',
      [userId]
    );

    const count = parseInt(result.rows[0].count);

    res.json({
      recipeCount: count,
      recipeLimit: maxRecipes,
      remainingSlots: Math.max(0, maxRecipes - count),
      limitReached: count >= maxRecipes
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset all user's recipes (manual reset for demo users)
router.delete('/reset/all', authenticate, async (req: AuthRequest, res: Response) => {
  if (req.user!.role === 'guest') {
    return res.status(403).json({ error: 'Guests cannot reset data' });
  }

  const client = await pool.connect();

  try {
    const userId = req.user!.id;

    await client.query('BEGIN');

    // Get count before deletion
    const countResult = await client.query(
      'SELECT COUNT(*) as count FROM rcb_recipes WHERE user_id = $1',
      [userId]
    );
    const deletedCount = parseInt(countResult.rows[0].count);

    // Delete all user's recipes
    await client.query('DELETE FROM rcb_recipes WHERE user_id = $1', [userId]);

    await client.query('COMMIT');

    res.json({
      message: 'All your recipes have been successfully deleted',
      deletedCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Reset recipes error:', error);
    res.status(500).json({ error: 'Failed to reset recipes. Please try again.' });
  } finally {
    client.release();
  }
});

export default router;
