export type UserRole = 'guest' | 'home_cook' | 'chef';

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface Recipe {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  is_public: boolean;
  canvas_data: CanvasData;
  thumbnail_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Template {
  id: number;
  name: string;
  description: string | null;
  canvas_data: CanvasData;
  thumbnail_url: string | null;
  created_at: Date;
}

export interface Session {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  created_at: Date;
}

export interface CanvasData {
  version: string;
  dimensions: {
    width: number;
    height: number;
  };
  background: {
    color: string;
    image: string | null;
  };
  elements: CanvasElement[];
}

export interface CanvasElement {
  id: string;
  type: 'text' | 'ingredient' | 'step' | 'image' | 'svg-icon' | 'drawing';
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  zIndex: number;
  data: Record<string, any>;
}

export interface AuthRequest extends Express.Request {
  user?: {
    id: number;
    role: UserRole;
  };
}
