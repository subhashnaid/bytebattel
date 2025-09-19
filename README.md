# Byte Battle - Full-Stack Coding Platform

A modern, full-featured coding platform built with Node.js, Express, MongoDB, and vanilla JavaScript, featuring problem solving, real code execution, and community features.

## 🚀 MVP Features

### ✅ User Authentication
- **Email/Password Signup & Login** - Traditional authentication with form validation
- **Google OAuth Integration** - One-click signup/login with Google (simulated)
- **User Session Management** - Persistent login with localStorage
- **Profile Management** - Edit name, bio, and skill tags

### ✅ User Profiles
- **Personal Information** - Name, bio, and skill tags
- **Statistics Tracking** - Problems solved count and total score
- **Score System** - Points awarded based on problem difficulty (Easy: 10, Medium: 20, Hard: 50)
- **Avatar Generation** - Auto-generated avatars with user initials

### ✅ Problem Management
- **Problem Feed** - Browse all available coding problems
- **Search & Filter** - Search by title, tags, or author; filter by difficulty
- **Sorting Options** - Sort by newest, oldest, most liked, or alphabetical
- **Problem Creation** - Create new problems with title, difficulty, tags, statement, and sample I/O
- **Problem Details** - View full problem statement with sample input/output

### ✅ Code Editor & Execution
- **Monaco Editor Integration** - Professional code editor with syntax highlighting
- **Multi-language Support** - JavaScript, Python, Java, and C++
- **Code Templates** - Language-specific starter templates
- **Run Code** - Test your solution with sample input
- **Submit Solution** - Submit for evaluation and scoring

### ✅ Solution Management
- **Solution Evaluation** - Automatic code execution and result checking
- **Accepted Solutions** - View other users' accepted solutions
- **Solution Likes** - Like/unlike solutions from other users
- **Submission History** - Track all your submissions

### ✅ Community Features
- **Problem Likes** - Like/unlike problems
- **Solution Likes** - Like/unlike solutions
- **User Interaction** - View other users' profiles and solutions
- **Real-time Notifications** - Success/error feedback for all actions

## 🛠️ Technical Stack

### Frontend
- **HTML5, CSS3, JavaScript (ES6+)**: Modern vanilla web technologies
- **Monaco Editor**: Professional code editor with syntax highlighting
- **Responsive Design**: Mobile-first approach with custom CSS

### Backend
- **Node.js & Express**: Server-side JavaScript runtime and web framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT Authentication**: Secure token-based authentication
- **Judge0 API**: Real code execution for multiple languages

### DevOps & Deployment
- **Docker**: Containerized deployment
- **Docker Compose**: Multi-service orchestration
- **Nginx**: Production web server and reverse proxy

## 📁 Project Structure

```
byte-battle/
├── frontend/               # Frontend application
│   ├── index.html         # Main HTML structure
│   ├── style.css          # All styling and responsive design
│   ├── app.js             # Core application logic
│   ├── api.js             # API service layer
│   ├── Dockerfile         # Frontend container config
│   └── nginx.conf         # Nginx configuration
├── backend/               # Backend API server
│   ├── models/            # Database models
│   │   ├── User.js        # User model
│   │   ├── Problem.js     # Problem model
│   │   └── Solution.js    # Solution model
│   ├── routes/            # API routes
│   │   ├── auth.js        # Authentication routes
│   │   ├── users.js       # User management routes
│   │   ├── problems.js    # Problem management routes
│   │   └── solutions.js   # Solution management routes
│   ├── middleware/        # Custom middleware
│   │   ├── auth.js        # Authentication middleware
│   │   └── errorHandler.js # Error handling
│   ├── utils/             # Utility functions
│   │   ├── codeExecutor.js # Code execution logic
│   │   └── seedDatabase.js # Database seeding
│   ├── server.js          # Main server file
│   ├── package.json       # Dependencies
│   ├── Dockerfile         # Backend container config
│   └── init-mongo.js      # MongoDB initialization
├── docker-compose.yml     # Multi-service orchestration
└── README.md              # This file
```

## 🚀 Getting Started

### Option 1: Free Hosting (GitHub Pages + Railway) - **RECOMMENDED**

1. **Prerequisites**
   - GitHub account
   - Railway account (free)
   - MongoDB Atlas account (free)

2. **Quick Deploy**
   ```bash
   # Windows
   quick-deploy.bat
   
   # Linux/Mac
   chmod +x deploy-github.sh
   ./deploy-github.sh
   ```

3. **Manual Setup**
   ```bash
   # 1. Create GitHub repository
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/byte-battle.git
   git push -u origin main
   
   # 2. Enable GitHub Pages
   # Go to Settings → Pages → Deploy from branch → main
   
   # 3. Deploy Backend to Railway
   # Go to railway.app → Connect GitHub → Select backend folder
   ```

4. **Access the Application**
   - Frontend: `https://yourusername.github.io/byte-battle`
   - Backend API: `https://your-backend.railway.app/api`
   - Database: MongoDB Atlas (cloud)

### Option 2: Local Development

1. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Edit .env with your MongoDB Atlas URI
   npm run seed  # Optional: seed sample data
   npm run dev
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   # Open index.html in a web browser
   # Or serve with a local server:
   python -m http.server 3000
   ```

3. **MongoDB Setup**
   - Use MongoDB Atlas (free cloud database)
   - Follow the [MongoDB Setup Guide](MONGODB_SETUP.md)

### Option 3: Docker (Advanced)

```bash
docker-compose up -d
```

### Sample Accounts
- Email: `alice@example.com`, Password: `password123`
- Email: `bob@example.com`, Password: `password123`
- Email: `charlie@example.com`, Password: `password123`

## 🎯 Sample Data

The platform comes pre-loaded with:
- **6 Sample Problems** - Various difficulties and topics (arrays, strings, dynamic programming, etc.)
- **6 Sample Users** - Different skill levels and profiles with realistic data
- **3 Sample Solutions** - Accepted solutions to demonstrate functionality
- **User Statistics** - Pre-calculated scores, problem counts, and achievements

## 🔧 Key Features in Detail

### Authentication System
- Form validation for email/password
- Password confirmation
- Duplicate email prevention
- Session persistence across browser refreshes
- Google OAuth simulation

### Problem Feed
- Real-time search across titles, tags, and authors
- Difficulty filtering (Easy, Medium, Hard)
- Multiple sorting options
- Responsive grid layout
- Interactive problem cards

### Code Editor
- Full Monaco Editor integration
- Syntax highlighting for 4 languages
- Language switching with template updates
- Dark theme for better coding experience
- Auto-layout and responsive design

### Solution System
- Automatic code execution simulation
- Result validation against expected output
- Score calculation based on difficulty
- Solution storage and retrieval
- Like/unlike functionality

### Profile Management
- Editable user information
- Skill tag management
- Statistics tracking
- Avatar generation
- Score and problem count display

## 🎨 UI/UX Features

- **Modern Design** - Clean, professional interface
- **Responsive Layout** - Works on desktop, tablet, and mobile
- **Smooth Animations** - Hover effects and transitions
- **Toast Notifications** - Real-time feedback for user actions
- **Loading States** - Visual feedback during operations
- **Form Validation** - Real-time input validation
- **Accessibility** - Keyboard navigation and screen reader support

## 🔮 Future Enhancements

- **Real-time Battles** - Live coding competitions with WebSockets
- **Plagiarism Detection** - Solution similarity checking
- **Badge System** - Achievement tracking and gamification
- **Moderation Tools** - Content management and admin panel
- **Real-time Notifications** - WebSocket integration for live updates
- **Advanced Analytics** - User performance tracking and insights
- **Code Review System** - Peer review of solutions
- **Contest Mode** - Timed coding competitions
- **Social Features** - Following users, activity feeds
- **Mobile App** - React Native or Flutter mobile application

## 🐛 Known Limitations

- **Mock Code Execution** - Uses simulated execution for development (Judge0 API integration available)
- **No Real Google OAuth** - Simulated authentication (can be easily integrated)
- **Basic Input Validation** - Limited input sanitization (can be enhanced)
- **No Real-time Features** - No WebSocket integration yet
- **Single Language Support** - Limited to JavaScript, Python, Java, C++ (easily extensible)

## 📱 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🤝 Contributing

This is a full-stack application ready for development and production use. To contribute:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Add tests** if applicable
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and patterns
- Add proper error handling and validation
- Update documentation for new features
- Test both frontend and backend changes
- Ensure Docker containers build successfully

## 📄 License

This project is for demonstration purposes. Feel free to use as a starting point for your own coding platform.

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   # Set production environment variables
   export NODE_ENV=production
   export MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bytebattle
   export JWT_SECRET=your-super-secure-jwt-secret
   export JUDGE0_API_KEY=your-judge0-api-key
   ```

2. **Docker Production Build**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Cloud Deployment**
   - **Frontend**: Deploy to Vercel, Netlify, or AWS S3
   - **Backend**: Deploy to Heroku, AWS EC2, or Google Cloud Run
   - **Database**: Use MongoDB Atlas or AWS DocumentDB

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port | No (default: 5000) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_EXPIRE` | JWT expiration time | No (default: 7d) |
| `JUDGE0_API_KEY` | Judge0 API key for code execution | No |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |

---

**Byte Battle** - Full-stack coding platform ready for production! 🎉#   b y t e b a t t e l  
 