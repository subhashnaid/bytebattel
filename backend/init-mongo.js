// MongoDB initialization script
db = db.getSiblingDB('bytebattle');

// Create collections
db.createCollection('users');
db.createCollection('problems');
db.createCollection('solutions');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "score": -1 });
db.users.createIndex({ "problemsSolved": -1 });

db.problems.createIndex({ "title": "text", "statement": "text", "tags": "text" });
db.problems.createIndex({ "difficulty": 1 });
db.problems.createIndex({ "author": 1 });
db.problems.createIndex({ "createdAt": -1 });
db.problems.createIndex({ "likes": -1 });

db.solutions.createIndex({ "problem": 1, "user": 1 });
db.solutions.createIndex({ "user": 1, "createdAt": -1 });
db.solutions.createIndex({ "problem": 1, "isAccepted": 1, "createdAt": -1 });
db.solutions.createIndex({ "language": 1 });
db.solutions.createIndex({ "isAccepted": 1 });

print('Database initialized successfully!');
