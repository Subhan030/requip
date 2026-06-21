# User Management System

A full-stack User management application built with TypeScript, featuring a REST API backend and React frontend.

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MySQL with TypeORM
- **Validation**: class-validator
- **Testing**: Jest with Supertest
- **Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **UI Library**: Material-UI (MUI)
- **Form Management**: React Hook Form
- **State Management**: React Query

## Project Structure

```
requip/
├── backend/          # Express.js API server
│   ├── src/
│   │   ├── entities/      # TypeORM entities
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   ├── config/        # Configuration files
│   │   └── utils/         # Utility functions
│   └── tests/        # Unit and integration tests
├── frontend/         # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
└── docs/            # Documentation
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with database configuration:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=user_management
PORT=3000
NODE_ENV=development
```

4. Run migrations:
```bash
npm run migration:run
```

5. Start the development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### User Management

- `POST /api/users` - Create a new user
- `GET /api/users` - Get all users (with pagination)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Soft delete user

### Query Parameters for Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sortBy` - Sort field (default: createdAt)
- `order` - Sort order (ASC/DESC, default: DESC)

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Best Practices Implemented

See [BEST_PRACTICES.md](./docs/BEST_PRACTICES.md) for detailed documentation.

## Pain Points and Learnings

See [LEARNINGS.md](./docs/LEARNINGS.md) for detailed documentation.

## License

MIT
