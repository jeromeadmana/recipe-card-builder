# Recipe Card Builder

A full-stack web application for creating, managing, and sharing beautiful recipe cards with drag-and-drop design capabilities.

## Features

- **Role-Based Access Control**: Three user roles with different permissions (Guest, Home Cook, Chef)
- **Demo Mode**: Easy role switching to test different permission levels
- **Drag-and-Drop Designer**: Create recipe cards by dragging text, ingredients, steps, and SVG icons
- **Canvas Manipulation**: Position, resize, and layer elements on a visual canvas
- **PNG Export**: Export your recipe cards as high-quality PNG images
- **Authentication**: Secure JWT-based authentication
- **PostgreSQL Database**: Persistent storage with Aiven cloud database

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL (Aiven)
- JWT authentication
- bcrypt for password hashing

### Frontend
- Next.js 14 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- html2canvas for PNG export

## Project Structure

```
recipe-card-builder/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── pool.ts          # PostgreSQL connection
│   │   │   └── migrate.ts       # Database migrations
│   │   ├── middleware/
│   │   │   └── auth.ts          # Authentication & authorization
│   │   ├── routes/
│   │   │   ├── auth.ts          # Auth endpoints
│   │   │   ├── recipes.ts       # Recipe CRUD
│   │   │   └── templates.ts     # Template management
│   │   ├── types/
│   │   │   └── index.ts         # TypeScript types
│   │   ├── utils/
│   │   │   └── jwt.ts           # JWT utilities
│   │   └── index.ts             # Express app entry
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                     # Environment variables
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx             # Home page
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── recipes/
│   │   │   ├── new/
│   │   │   └── [id]/
│   │   └── templates/
│   ├── components/
│   │   ├── auth/                # Auth components
│   │   ├── designer/            # Canvas & drag-drop
│   │   └── recipe/
│   ├── lib/
│   │   ├── api.ts               # API client
│   │   └── types.ts             # TypeScript types
│   ├── package.json
│   └── .env.local               # Environment variables
│
├── DESIGN.md                    # Technical design document
├── TEST_RESULTS.md              # Test results
└── README.md                    # This file
```

## Database Schema

All tables use the `rcb_` prefix to avoid conflicts:

- **rcb_users**: User accounts with roles
- **rcb_recipes**: Recipe cards with canvas data
- **rcb_templates**: Reusable recipe templates
- **rcb_sessions**: User sessions (unused, for future)

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (Aiven account or local)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
PORT=3001
DATABASE_URL=postgres://username:password@host:port/database
JWT_SECRET=your-secret-key-change-this
NODE_ENV=development
```

4. Run database migrations:
```bash
npm run migrate
```

5. Start the server:
```bash
npm run dev
```

Backend will run on http://localhost:3001

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. Start the development server:
```bash
npm run dev
```

Frontend will run on http://localhost:3000

## Usage

### User Roles

**Guest**
- View public recipes only
- Cannot create, edit, or delete recipes

**Home Cook**
- View public recipes and own recipes
- Create, edit, and delete own recipes
- Export own recipes as PNG

**Chef**
- Full access to all recipes
- Create, edit, and delete any recipe
- Create and manage templates
- Export any recipe as PNG

### Creating a Recipe

1. Register or login to the application
2. Navigate to Dashboard
3. Click "Create Recipe"
4. Enter title and description
5. Use the Element Palette to add:
   - Text elements
   - Ingredient lists
   - Step-by-step instructions
   - SVG food icons
6. Drag elements to position them
7. Double-click text elements to edit
8. Click "Save Recipe"

### Demo Mode - Role Switching

1. Login with any account
2. Go to Dashboard
3. Use the "Switch Role" panel on the right
4. Select a different role to test permissions
5. Page will reload with new role permissions

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/switch-role` - Switch role (demo)
- `GET /api/auth/me` - Get current user

### Recipes
- `GET /api/recipes` - List recipes (filtered by role)
- `GET /api/recipes/:id` - Get recipe
- `POST /api/recipes` - Create recipe
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe

### Templates
- `GET /api/templates` - List templates
- `GET /api/templates/:id` - Get template
- `POST /api/templates` - Create template (chef only)
- `PUT /api/templates/:id` - Update template (chef only)
- `DELETE /api/templates/:id` - Delete template (chef only)

## Testing

Comprehensive end-to-end tests have been performed. See [TEST_RESULTS.md](TEST_RESULTS.md) for details.

### Run Tests Manually

1. Start both backend and frontend servers
2. Open http://localhost:3000
3. Follow the test scenarios in TEST_RESULTS.md

## Canvas Data Structure

Recipes store canvas data as JSONB in PostgreSQL:

```typescript
{
  version: "1.0",
  dimensions: { width: 800, height: 1000 },
  background: { color: "#ffffff", image: null },
  elements: [
    {
      id: "element-123",
      type: "text" | "ingredient" | "step" | "svg-icon",
      position: { x: 50, y: 50 },
      size: { width: 200, height: 30 },
      zIndex: 1,
      data: {
        text: "Recipe Title",
        fontSize: 24,
        color: "#000000"
      }
    }
  ]
}
```

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based authorization middleware
- SQL injection prevention (parameterized queries)
- CORS configuration
- SSL/TLS for database connections

## Future Enhancements

- Image upload for recipe cards
- Custom drawing tools
- More SVG icon options
- Template marketplace
- Recipe sharing via URL
- Social features (likes, comments)
- Recipe search and filtering
- Responsive mobile design
- Dark mode

## License

MIT
