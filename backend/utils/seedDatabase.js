const mongoose = require('mongoose');
const User = require('../models/User');
const Problem = require('../models/Problem');
const Solution = require('../models/Solution');

// Sample data
const sampleUsers = [
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'password123',
    bio: 'Software engineer passionate about algorithms and data structures',
    skills: ['JavaScript', 'Python', 'Algorithms', 'Data Structures'],
    score: 150,
    problemsSolved: 8
  },
  {
    name: 'Bob Smith',
    email: 'bob@example.com',
    password: 'password123',
    bio: 'Full-stack developer with expertise in web technologies',
    skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
    score: 120,
    problemsSolved: 6
  },
  {
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    password: 'password123',
    bio: 'Competitive programmer and algorithm enthusiast',
    skills: ['C++', 'Python', 'Competitive Programming', 'Math'],
    score: 200,
    problemsSolved: 12
  },
  {
    name: 'Diana Prince',
    email: 'diana@example.com',
    password: 'password123',
    bio: 'Computer science student focusing on AI and machine learning',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Science'],
    score: 80,
    problemsSolved: 4
  },
  {
    name: 'Eve Wilson',
    email: 'eve@example.com',
    password: 'password123',
    bio: 'Senior software architect with 10+ years experience',
    skills: ['Java', 'Spring Boot', 'Microservices', 'AWS'],
    score: 180,
    problemsSolved: 10
  },
  {
    name: 'Frank Miller',
    email: 'frank@example.com',
    password: 'password123',
    bio: 'Mobile app developer and UI/UX enthusiast',
    skills: ['React Native', 'Flutter', 'iOS', 'Android'],
    score: 90,
    problemsSolved: 5
  }
];

const sampleProblems = [
  {
    title: 'Two Sum',
    difficulty: 'easy',
    tags: ['arrays', 'hash-table'],
    statement: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].`,
    sampleInput: '2 7 11 15\n9',
    sampleOutput: '0 1',
    timeLimit: 1000,
    memoryLimit: 256
  },
  {
    title: 'Valid Parentheses',
    difficulty: 'easy',
    tags: ['string', 'stack'],
    statement: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

Example 1:
Input: s = "()"
Output: true

Example 2:
Input: s = "()[]{}"
Output: true

Example 3:
Input: s = "(]"
Output: false`,
    sampleInput: '()[]{}',
    sampleOutput: 'true',
    timeLimit: 1000,
    memoryLimit: 256
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'medium',
    tags: ['string', 'sliding-window', 'hash-table'],
    statement: `Given a string s, find the length of the longest substring without repeating characters.

Example 1:
Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.

Example 2:
Input: s = "bbbbb"
Output: 1
Explanation: The answer is "b", with the length of 1.

Example 3:
Input: s = "pwwkew"
Output: 3
Explanation: The answer is "wke", with the length of 3.
Notice that the answer must be a substring, "pwke" is a subsequence and not a substring.`,
    sampleInput: 'abcabcbb',
    sampleOutput: '3',
    timeLimit: 2000,
    memoryLimit: 512
  },
  {
    title: 'Binary Tree Inorder Traversal',
    difficulty: 'easy',
    tags: ['tree', 'stack', 'recursion'],
    statement: `Given the root of a binary tree, return the inorder traversal of its nodes' values.

Example 1:
Input: root = [1,null,2,3]
Output: [1,3,2]

Example 2:
Input: root = []
Output: []

Example 3:
Input: root = [1]
Output: [1]`,
    sampleInput: '1 null 2 3',
    sampleOutput: '1 3 2',
    timeLimit: 1000,
    memoryLimit: 256
  },
  {
    title: 'Maximum Subarray',
    difficulty: 'medium',
    tags: ['array', 'dynamic-programming'],
    statement: `Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.

A subarray is a contiguous part of an array.

Example 1:
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: [4,-1,2,1] has the largest sum = 6.

Example 2:
Input: nums = [1]
Output: 1

Example 3:
Input: nums = [5,4,-1,7,8]
Output: 23`,
    sampleInput: '-2 1 -3 4 -1 2 1 -5 4',
    sampleOutput: '6',
    timeLimit: 2000,
    memoryLimit: 512
  },
  {
    title: 'Merge Two Sorted Lists',
    difficulty: 'easy',
    tags: ['linked-list', 'recursion'],
    statement: `You are given the heads of two sorted linked lists list1 and list2.

Merge the two lists in a one sorted list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.

Example 1:
Input: list1 = [1,2,4], list2 = [1,3,4]
Output: [1,1,2,3,4,4]

Example 2:
Input: list1 = [], list2 = []
Output: []

Example 3:
Input: list1 = [], list2 = [0]
Output: [0]`,
    sampleInput: '1 2 4\n1 3 4',
    sampleOutput: '1 1 2 3 4 4',
    timeLimit: 1000,
    memoryLimit: 256
  }
];

const sampleSolutions = [
  {
    code: `function solution(a, b) {
    const nums = [a, b];
    const target = a + b;
    
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i].join(' ');
        }
        map.set(nums[i], i);
    }
    return [];
}`,
    language: 'javascript',
    result: {
      status: 'success',
      output: '0 1',
      runtime: 45,
      memory: 2048
    },
    isAccepted: true,
    executionTime: 45,
    memoryUsed: 2048,
    codeLength: 200
  },
  {
    code: `def solution(a, b):
    nums = [a, b]
    target = a + b
    
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return f"{i} {j}"
    return ""`,
    language: 'python',
    result: {
      status: 'success',
      output: '0 1',
      runtime: 120,
      memory: 1536
    },
    isAccepted: true,
    executionTime: 120,
    memoryUsed: 1536,
    codeLength: 150
  },
  {
    code: `function solution(input) {
    const s = input.trim();
    const stack = [];
    const mapping = { ')': '(', '}': '{', ']': '[' };
    
    for (let char of s) {
        if (char in mapping) {
            if (stack.length === 0 || stack.pop() !== mapping[char]) {
                return 'false';
            }
        } else {
            stack.push(char);
        }
    }
    
    return stack.length === 0 ? 'true' : 'false';
}`,
    language: 'javascript',
    result: {
      status: 'success',
      output: 'true',
      runtime: 38,
      memory: 1024
    },
    isAccepted: true,
    executionTime: 38,
    memoryUsed: 1024,
    codeLength: 180
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Problem.deleteMany({});
    await Solution.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create users
    const users = await User.create(sampleUsers);
    console.log(`👥 Created ${users.length} users`);

    // Create problems
    const problems = [];
    for (let i = 0; i < sampleProblems.length; i++) {
      const problemData = sampleProblems[i];
      const author = users[i % users.length]; // Distribute problems among users
      
      const problem = await Problem.create({
        ...problemData,
        author: author._id,
        authorName: author.name,
        likes: Math.floor(Math.random() * 20),
        views: Math.floor(Math.random() * 100),
        submissions: Math.floor(Math.random() * 50),
        acceptedSubmissions: Math.floor(Math.random() * 30)
      });
      
      problems.push(problem);
    }
    console.log(`📝 Created ${problems.length} problems`);

    // Create solutions
    const solutions = [];
    for (let i = 0; i < sampleSolutions.length; i++) {
      const solutionData = sampleSolutions[i];
      const problem = problems[i % problems.length];
      const user = users[i % users.length];
      
      const solution = await Solution.create({
        ...solutionData,
        problem: problem._id,
        user: user._id,
        userName: user.name,
        likes: Math.floor(Math.random() * 10)
      });
      
      solutions.push(solution);
    }
    console.log(`💻 Created ${solutions.length} solutions`);

    // Update user statistics
    for (const user of users) {
      const userSolutions = await Solution.find({ user: user._id, isAccepted: true });
      const userProblems = await Problem.find({ author: user._id, isActive: true });
      
      user.problemsSolved = userSolutions.length;
      user.score = userSolutions.reduce((total, sol) => {
        const problem = problems.find(p => p._id.toString() === sol.problem.toString());
        const difficultyScores = { easy: 10, medium: 20, hard: 50 };
        return total + (difficultyScores[problem?.difficulty] || 10);
      }, 0);
      
      await user.save();
    }

    console.log('📊 Updated user statistics');

    console.log('✅ Database seeding completed successfully!');
    console.log(`📈 Summary:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Problems: ${problems.length}`);
    console.log(`   - Solutions: ${solutions.length}`);

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Run seeding if called directly
if (require.main === module) {
  require('dotenv').config();
  
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bytebattle', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('🔌 Connected to MongoDB');
    return seedDatabase();
  })
  .then(() => {
    console.log('🎉 Seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });
}

module.exports = { seedDatabase };
