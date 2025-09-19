#!/bin/bash

echo "🚀 Deploying Byte Battle to GitHub Pages + Railway..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📝 Initializing Git repository..."
    git init
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << EOF
node_modules/
.env
*.log
.DS_Store
dist/
build/
.env.local
.env.production
.env.development
EOF
fi

# Add all files
echo "📦 Adding files to Git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy Byte Battle to GitHub Pages + Railway"

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Please add your GitHub repository as origin:"
    echo "   git remote add origin https://github.com/yourusername/byte-battle.git"
    echo "   git push -u origin main"
else
    echo "🚀 Pushing to GitHub..."
    git push origin main
fi

echo ""
echo "✅ GitHub deployment initiated!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your GitHub repository"
echo "2. Go to Settings → Pages"
echo "3. Select 'Deploy from a branch' → main"
echo "4. Your frontend will be at: https://yourusername.github.io/byte-battle"
echo ""
echo "🔧 For Railway backend:"
echo "1. Go to https://railway.app"
echo "2. Connect your GitHub repository"
echo "3. Select the 'backend' folder"
echo "4. Add environment variables:"
echo "   - MONGODB_URI=your-mongodb-atlas-url"
echo "   - JWT_SECRET=your-jwt-secret"
echo "   - FRONTEND_URL=https://yourusername.github.io/byte-battle"
echo ""
echo "🎉 Deployment complete!"
