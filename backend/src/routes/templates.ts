import { Router, Response } from 'express';
import { pool } from '../db/pool';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM rcb_templates ORDER BY created_at DESC');
    res.json({ templates: result.rows });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM rcb_templates WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ template: result.rows[0] });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, authorize('chef'), async (req: AuthRequest, res: Response) => {
  const { name, description, canvas_data } = req.body;

  if (!name || !canvas_data) {
    return res.status(400).json({ error: 'Name and canvas_data are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO rcb_templates (name, description, canvas_data)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description, JSON.stringify(canvas_data)]
    );

    res.status(201).json({ template: result.rows[0] });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticate, authorize('chef'), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, description, canvas_data } = req.body;

  try {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (canvas_data !== undefined) {
      updates.push(`canvas_data = $${paramCount++}`);
      values.push(JSON.stringify(canvas_data));
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE rcb_templates SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ template: result.rows[0] });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, authorize('chef'), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM rcb_templates WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
