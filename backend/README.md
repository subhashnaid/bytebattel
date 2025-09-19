# Byte Battle Backend API

A robust Node.js/Express backend API for the Byte Battle coding platform, featuring user authentication, problem management, code execution, and community features.

## 🚀 Features

### Authentication & Users
- JWT-based authentication
- User registration and login
- Password hashing with bcrypt
- User profile management
- Leaderboard and user statistics

### Problem Management
- CRUD operations for coding problems
- Advanced search and filtering
- Problem categorization by difficulty and tags
- Like/unlike functionality
- Problem statistics and analytics

### Code Execution
- Integration with Judge0 API for real code execution
- Support for multiple programming languages
- Mock execution for development/testing
- Runtime and memory usage tracking
- Test case validation

### Solutions & Community
- Solution submission and storage
- Code execution and validation
- Solution likes and comments
- User solution history
- Public solution sharing

## 🛠️ Tech Stack

- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Code Execution**: Judge0 API
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator

## 📁 Project Structure

```
backend/
├── models/              # Database models
│   ├── User.js         # User model
│   ├── Problem.js      # Problem model
│   └── Solution.js     # Solution model
├── routes/             # API routes
│   ├── auth.js         # Authentication routes
│   ├── users.js        # User management routes
│   ├── problems.js     # Problem management routes
│   └── solutions.js    # Solution management routes
├── middleware/          # Custom middleware
│   ├── auth.js         # Authentication middleware
│   └── errorHandler.js # Error handling middleware
├── utils/              # Utility functions
│   ├── codeExecutor.js # Code execution logic
│   └── seedDatabase.js # Database seeding
├── server.js           # Main server file
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16 or higher
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd byte-battle/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/bytebattle
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
   JUDGE0_API_KEY=your-judge0-api-key-here
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env
   ```

5. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

The API will be available at `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | Login user | Public |
| GET | `/auth/me` | Get current user | Private |
| POST | `/auth/logout` | Logout user | Private |
| PUT | `/auth/password` | Update password | Private |

### User Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/users/:id` | Get user profile | Public |
| PUT | `/users/:id` | Update user profile | Private (Owner) |
| GET | `/users/:id/problems` | Get user's problems | Public |
| GET | `/users/:id/solutions` | Get user's solutions | Public |
| GET | `/users/leaderboard` | Get leaderboard | Public |
| GET | `/users/:id/stats` | Get user statistics | Public |
| GET | `/users/search` | Search users | Public |

### Problem Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/problems` | Get all problems | Public |
| GET | `/problems/:id` | Get single problem | Public |
| POST | `/problems` | Create problem | Private |
| PUT | `/problems/:id` | Update problem | Private (Author) |
| DELETE | `/problems/:id` | Delete problem | Private (Author) |
| POST | `/problems/:id/like` | Toggle like | Private |
| GET | `/problems/:id/stats` | Get problem stats | Public |

### Solution Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/solutions/problem/:problemId` | Get problem solutions | Public |
| GET | `/solutions/user/:userId` | Get user solutions | Public |
| POST | `/solutions` | Submit solution | Private |
| GET | `/solutions/:id` | Get single solution | Public |
| POST | `/solutions/:id/like` | Toggle like | Private |
| PUT | `/solutions/:id` | Update solution | Private (Owner) |
| DELETE | `/solutions/:id` | Delete solution | Private (Owner) |

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/bytebattle |
| `JWT_SECRET` | JWT secret key | Required |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `JUDGE0_API_URL` | Judge0 API URL | https://judge0-ce.p.rapidapi.com |
| `JUDGE0_API_KEY` | Judge0 API key | Optional |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |

### Judge0 API Setup (Optional)

For real code execution, you can set up Judge0 API:

1. Sign up at [RapidAPI Judge0](https://rapidapi.com/judge0-official/api/judge0-ce)
2. Get your API key
3. Add it to your `.env` file

Without Judge0 API, the system will use mock execution for development.

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📊 Database Seeding

The database seeder creates sample data for development:

```bash
# Seed the database
npm run seed
```

This creates:
- 6 sample users
- 6 sample problems
- 3 sample solutions
- User statistics and relationships

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Prevent API abuse
- **CORS Protection**: Configured for frontend
- **Input Validation**: Express Validator
- **Helmet**: Security headers
- **Error Handling**: Secure error responses

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set secure JWT secret
4. Configure Judge0 API key
5. Set proper CORS origins

### Docker (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the API documentation
- Review the error logs

---

**Byte Battle Backend** - Ready for production! 🎉
