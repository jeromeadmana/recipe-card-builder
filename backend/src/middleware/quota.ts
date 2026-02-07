import { Request, Response, NextFunction } from 'express';
import { pool } from '../db/pool';

// Demo mode limits
const MAX_RECIPES_PER_USER = parseInt(process.env.MAX_RECIPES_PER_USER || '10');
const MAX_CANVAS_SIZE_BYTES = parseInt(process.env.MAX_CANVAS_SIZE_BYTES || '204800'); // 200KB

export async function checkRecipeQuota(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Count user's current recipes
    const result = await pool.query(
      'SELECT COUNT(*) FROM rcb_recipes WHERE user_id = $1',
      [userId]
    );

    const recipeCount = parseInt(result.rows[0].count);

    if (recipeCount >= MAX_RECIPES_PER_USER) {
      return res.status(403).json({
        error: `Recipe limit reached. Demo users can create up to ${MAX_RECIPES_PER_USER} recipes.`,
        limit: MAX_RECIPES_PER_USER,
        current: recipeCount
      });
    }

    next();
  } catch (error) {
    console.error('Quota check error:', error);
    res.status(500).json({ error: 'Failed to check quota' });
  }
}

export function validateCanvasSize(req: Request, res: Response, next: NextFunction) {
  try {
    const { canvas_data } = req.body;

    if (canvas_data) {
      const canvasSize = JSON.stringify(canvas_data).length;

      if (canvasSize > MAX_CANVAS_SIZE_BYTES) {
        const sizeKB = (canvasSize / 1024).toFixed(2);
        const maxSizeKB = (MAX_CANVAS_SIZE_BYTES / 1024).toFixed(2);

        return res.status(400).json({
          error: `Canvas data too large (${sizeKB}KB). Maximum allowed is ${maxSizeKB}KB.`,
          currentSize: canvasSize,
          maxSize: MAX_CANVAS_SIZE_BYTES
        });
      }
    }

    next();
  } catch (error) {
    console.error('Canvas size validation error:', error);
    return res.status(400).json({
      error: 'Canvas data validation failed. Data may be too large or malformed.'
    });
  }
}

export async function checkTotalUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const MAX_TOTAL_USERS = parseInt(process.env.MAX_TOTAL_USERS || '100');

    const result = await pool.query('SELECT COUNT(*) FROM rcb_users');
    const userCount = parseInt(result.rows[0].count);

    if (userCount >= MAX_TOTAL_USERS) {
      return res.status(403).json({
        error: `Registration limit reached. This is a demo application with a maximum of ${MAX_TOTAL_USERS} users.`,
        limit: MAX_TOTAL_USERS
      });
    }

    next();
  } catch (error) {
    console.error('User count check error:', error);
    next();
  }
}
