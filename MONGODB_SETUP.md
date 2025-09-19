# MongoDB Atlas Setup Guide

## 🗄️ Setting up MongoDB Atlas (Free Tier)

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Choose the **FREE** tier (M0 Sandbox)

### Step 2: Create a Cluster
1. Click "Build a Database"
2. Choose "FREE" tier
3. Select a cloud provider (AWS, Google Cloud, or Azure)
4. Choose a region close to you
5. Click "Create Cluster"

### Step 3: Create Database User
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and password (save these!)
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### Step 4: Whitelist IP Addresses
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Clusters" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" as driver
5. Copy the connection string
6. Replace `<password>` with your database user password
7. Replace `<dbname>` with `bytebattle`

### Step 6: Update Environment Variables

**For Railway:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bytebattle?retryWrites=true&w=majority
```

**For local development:**
```bash
# In backend/.env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bytebattle?retryWrites=true&w=majority
```

### Step 7: Test Connection
```bash
# In your backend directory
cd backend
npm run seed
```

If successful, you should see:
```
✅ Connected to MongoDB
🌱 Starting database seeding...
✅ Database seeding completed successfully!
```

## 🔧 Troubleshooting

### Connection Issues
- Make sure your IP is whitelisted
- Check username/password are correct
- Ensure cluster is running (not paused)

### Authentication Errors
- Verify database user has correct permissions
- Check connection string format
- Make sure password doesn't contain special characters

### Network Issues
- Try connecting from different IP
- Check if your firewall blocks MongoDB ports
- Verify cluster is in the same region as your app

## 📊 Database Management

### View Data
1. Go to MongoDB Atlas dashboard
2. Click "Browse Collections"
3. Select your database
4. View collections: users, problems, solutions

### Seed Sample Data
```bash
# After setting up connection
cd backend
npm run seed
```

### Reset Database
```bash
# Clear all data (be careful!)
# In MongoDB Atlas, go to Collections
# Delete all documents in each collection
```

## 🎯 Production Tips

1. **Use Environment Variables** - Never hardcode connection strings
2. **Enable Monitoring** - Use Atlas monitoring features
3. **Set Up Alerts** - Get notified of issues
4. **Regular Backups** - Enable automatic backups
5. **Index Optimization** - Monitor query performance

## 📞 Support

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Community Forum](https://community.mongodb.com/)
- [Railway MongoDB Guide](https://docs.railway.app/databases/mongodb)
