export type UserRole = 'guest' | 'home_cook' | 'chef';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Recipe {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  is_public: boolean;
  canvas_data: CanvasData;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: number;
  name: string;
  description: string | null;
  canvas_data: CanvasData;
  thumbnail_url: string | null;
  created_at: string;
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
  data: {
    text?: string;
    fontSize?: number;
    color?: string;
    icon?: string;
    svgPath?: string;
    imageUrl?: string;
    drawingPaths?: any[];
    [key: string]: any;
  };
}
