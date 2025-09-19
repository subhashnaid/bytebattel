@echo off
echo 🚀 Byte Battle - Quick Deploy to GitHub Pages + Railway
echo.

REM Check if git is initialized
if not exist ".git" (
    echo 📝 Initializing Git repository...
    git init
)

REM Create .gitignore if it doesn't exist
if not exist ".gitignore" (
    echo 📝 Creating .gitignore...
    (
        echo node_modules/
        echo .env
        echo *.log
        echo .DS_Store
        echo dist/
        echo build/
        echo .env.local
        echo .env.production
        echo .env.development
    ) > .gitignore
)

REM Add all files
echo 📦 Adding files to Git...
git add .

REM Commit changes
echo 💾 Committing changes...
git commit -m "Deploy Byte Battle to GitHub Pages + Railway"

REM Check if remote exists
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔗 Please add your GitHub repository as origin:
    echo    git remote add origin https://github.com/yourusername/byte-battle.git
    echo    git push -u origin main
    pause
    exit /b
)

REM Push to GitHub
echo 🚀 Pushing to GitHub...
git push origin main

echo.
echo ✅ GitHub deployment initiated!
echo.
echo 📋 Next steps:
echo 1. Go to your GitHub repository
echo 2. Go to Settings → Pages
echo 3. Select 'Deploy from a branch' → main
echo 4. Your frontend will be at: https://yourusername.github.io/byte-battle
echo.
echo 🔧 For Railway backend:
echo 1. Go to https://railway.app
echo 2. Connect your GitHub repository
echo 3. Select the 'backend' folder
echo 4. Add environment variables:
echo    - MONGODB_URI=your-mongodb-atlas-url
echo    - JWT_SECRET=your-jwt-secret
echo    - FRONTEND_URL=https://yourusername.github.io/byte-battle
echo.
echo 🎉 Deployment complete!
pause
