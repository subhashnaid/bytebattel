// Sample data for Byte Battle platform
function initializeSampleData() {
    // Check if sample data already exists
    if (localStorage.getItem('bytebattle_problems') && JSON.parse(localStorage.getItem('bytebattle_problems')).length > 0) {
        return; // Sample data already exists
    }

    // Sample problems
    const sampleProblems = [
        {
            id: '1',
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
            author: 'Alice Johnson',
            authorId: 'user1',
            likes: 15,
            createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        },
        {
            id: '2',
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
            author: 'Bob Smith',
            authorId: 'user2',
            likes: 8,
            createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
        },
        {
            id: '3',
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
            author: 'Charlie Brown',
            authorId: 'user3',
            likes: 23,
            createdAt: new Date(Date.now() - 259200000).toISOString() // 3 days ago
        },
        {
            id: '4',
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
            author: 'Diana Prince',
            authorId: 'user4',
            likes: 12,
            createdAt: new Date(Date.now() - 345600000).toISOString() // 4 days ago
        },
        {
            id: '5',
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
            author: 'Eve Wilson',
            authorId: 'user5',
            likes: 19,
            createdAt: new Date(Date.now() - 432000000).toISOString() // 5 days ago
        },
        {
            id: '6',
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
            author: 'Frank Miller',
            authorId: 'user6',
            likes: 7,
            createdAt: new Date(Date.now() - 518400000).toISOString() // 6 days ago
        }
    ];

    // Sample users
    const sampleUsers = [
        {
            id: 'user1',
            name: 'Alice Johnson',
            email: 'alice@example.com',
            password: 'password123',
            bio: 'Software engineer passionate about algorithms and data structures',
            skills: ['JavaScript', 'Python', 'Algorithms', 'Data Structures'],
            score: 150,
            problemsSolved: 8,
            likedProblems: ['1', '3', '5'],
            likedSolutions: []
        },
        {
            id: 'user2',
            name: 'Bob Smith',
            email: 'bob@example.com',
            password: 'password123',
            bio: 'Full-stack developer with expertise in web technologies',
            skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
            score: 120,
            problemsSolved: 6,
            likedProblems: ['2', '4'],
            likedSolutions: []
        },
        {
            id: 'user3',
            name: 'Charlie Brown',
            email: 'charlie@example.com',
            password: 'password123',
            bio: 'Competitive programmer and algorithm enthusiast',
            skills: ['C++', 'Python', 'Competitive Programming', 'Math'],
            score: 200,
            problemsSolved: 12,
            likedProblems: ['1', '3', '5', '6'],
            likedSolutions: []
        },
        {
            id: 'user4',
            name: 'Diana Prince',
            email: 'diana@example.com',
            password: 'password123',
            bio: 'Computer science student focusing on AI and machine learning',
            skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Science'],
            score: 80,
            problemsSolved: 4,
            likedProblems: ['2', '4'],
            likedSolutions: []
        },
        {
            id: 'user5',
            name: 'Eve Wilson',
            email: 'eve@example.com',
            password: 'password123',
            bio: 'Senior software architect with 10+ years experience',
            skills: ['Java', 'Spring Boot', 'Microservices', 'AWS'],
            score: 180,
            problemsSolved: 10,
            likedProblems: ['1', '3', '5'],
            likedSolutions: []
        },
        {
            id: 'user6',
            name: 'Frank Miller',
            email: 'frank@example.com',
            password: 'password123',
            bio: 'Mobile app developer and UI/UX enthusiast',
            skills: ['React Native', 'Flutter', 'iOS', 'Android'],
            score: 90,
            problemsSolved: 5,
            likedProblems: ['2', '6'],
            likedSolutions: []
        }
    ];

    // Sample solutions
    const sampleSolutions = [
        {
            id: 'sol1',
            problemId: '1',
            userId: 'user1',
            userName: 'Alice Johnson',
            code: `function solution(input) {
    const lines = input.split('\\n');
    const nums = lines[0].split(' ').map(Number);
    const target = parseInt(lines[1]);
    
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
            submittedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            likes: 3
        },
        {
            id: 'sol2',
            problemId: '1',
            userId: 'user3',
            userName: 'Charlie Brown',
            code: `def solution(input_str):
    lines = input_str.strip().split('\\n')
    nums = list(map(int, lines[0].split()))
    target = int(lines[1])
    
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
            submittedAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
            likes: 1
        },
        {
            id: 'sol3',
            problemId: '2',
            userId: 'user2',
            userName: 'Bob Smith',
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
            submittedAt: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
            likes: 2
        }
    ];

    // Store sample data
    localStorage.setItem('bytebattle_problems', JSON.stringify(sampleProblems));
    localStorage.setItem('bytebattle_users', JSON.stringify(sampleUsers));
    localStorage.setItem('bytebattle_solutions', JSON.stringify(sampleSolutions));
    
    console.log('Sample data initialized successfully!');
}

// Initialize sample data when the script loads
initializeSampleData();