import { Router, Response } from 'express';
import { pool } from '../db/pool';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    let query = '';
    let params: any[] = [];

    if (req.user!.role === 'chef') {
      query = 'SELECT * FROM rcb_recipes ORDER BY created_at DESC';
    } else if (req.user!.role === 'home_cook') {
      query = `SELECT * FROM rcb_recipes
               WHERE is_public = true OR user_id = $1
               ORDER BY created_at DESC`;
      params = [req.user!.id];
    } else {
      query = 'SELECT * FROM rcb_recipes WHERE is_public = true ORDER BY created_at DESC';
    }

    const result = await pool.query(query, params);
    res.json({ recipes: result.rows });
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

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { title, description, is_public = false, canvas_data } = req.body;

  if (req.user!.role === 'guest') {
    return res.status(403).json({ error: 'Guests cannot create recipes' });
  }

  if (!title || !canvas_data) {
    return res.status(400).json({ error: 'Title and canvas_data are required' });
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

router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, description, is_public, canvas_data } = req.body;

  if (req.user!.role === 'guest') {
    return res.status(403).json({ error: 'Guests cannot edit recipes' });
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

export default router;
