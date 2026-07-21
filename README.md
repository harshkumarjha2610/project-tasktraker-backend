# DailyTask – Node.js Backend

REST API built with **Express.js + Mongoose + MongoDB Atlas**

## Quick Start

```bash
cd daily-task-backend
npm run dev        # starts on http://localhost:5000 with nodemon
```

## Environment Variables

Create a `.env` file (already done):
```
MONGODB_URI=mongodb+srv://...
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Server health check |
| `GET` | `/api/tasks` | List all tasks (with filter/search/pagination) |
| `GET` | `/api/tasks/stats` | Aggregated stats (counts by status/priority/category) |
| `GET` | `/api/tasks/:id` | Get single task |
| `POST` | `/api/tasks` | Create a new task |
| `PUT` | `/api/tasks/:id` | Update a task |
| `PATCH` | `/api/tasks/:id/toggle` | Toggle done ↔ todo |
| `DELETE` | `/api/tasks/:id` | Delete a task |
| `DELETE` | `/api/tasks` | Bulk delete `{ ids: [...] }` |

## Query Parameters for GET /api/tasks

```
?status=todo|inprogress|done
?priority=high|medium|low
?category=work|personal|health|learning|other
?search=keyword
?sort=-createdAt (default)
?page=1&limit=50
```

## Task Schema

```js
{
  title:             String (required, max 200)
  description:       String (optional, max 1000)
  priority:          'high' | 'medium' | 'low'   (default: 'medium')
  status:            'todo' | 'inprogress' | 'done' (default: 'todo')
  category:          'work' | 'personal' | 'health' | 'learning' | 'other'
  dueDate:           Date (optional)
  completedAt:       Date (auto-set when status → 'done')
  tags:              [String]
  estimatedMinutes:  Number (optional)
  createdAt:         Date (auto)
  updatedAt:         Date (auto)
}
```

## Project Structure

```
daily-task-backend/
├── server.js                  ← Entry point
├── .env                       ← Environment vars (gitignored)
├── package.json
└── src/
    ├── config/
    │   └── db.js              ← MongoDB connection
    ├── models/
    │   └── Task.js            ← Mongoose schema + model
    ├── controllers/
    │   └── taskController.js  ← Business logic
    ├── routes/
    │   └── tasks.js           ← Express router
    └── middleware/
        └── errorHandler.js    ← Global error handler
```
