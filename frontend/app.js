// Global state
let currentUser = null;
let problems = [];
let currentProblem = null;
let monacoEditor = null;
let solutions = [];

// API instance (loaded from api.js)
let api = null;

// Language configurations for Monaco Editor
const languageConfigs = {
    javascript: {
        language: 'javascript',
        template: `function solution(a, b) {
    // Your code here
    return a + b;
}`
    },
    python: {
        language: 'python',
        template: `def solution(a, b):
    # Your code here
    return a + b`
    },
    java: {
        language: 'java',
        template: `public class Solution {
    public static String solution(String input) {
        // Your code here
        return "";
    }
}`
    },
    cpp: {
        language: 'cpp',
        template: `#include <iostream>
#include <string>
using namespace std;

string solution(string input) {
    // Your code here
    return "";
}`
    }
};

// Initialize Monaco Editor
function initializeMonacoEditor() {
    require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs' } });
    require(['vs/editor/editor.main'], function () {
        monacoEditor = monaco.editor.create(document.getElementById('code-editor'), {
            value: languageConfigs.javascript.template,
            language: 'javascript',
            theme: 'vs-dark',
            automaticLayout: true,
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false
        });
    });
}

// Change programming language
function changeLanguage() {
    const language = document.getElementById('language-select').value;
    const config = languageConfigs[language];
    
    if (monacoEditor && config) {
        monaco.editor.setModelLanguage(monacoEditor.getModel(), config.language);
        monacoEditor.setValue(config.template);
    }
}

// Navigation functions
function showLogin() {
    hideAllPages();
    document.getElementById('login-page').classList.remove('hidden');
    toggleHero(true);
}

function showSignup() {
    hideAllPages();
    document.getElementById('signup-page').classList.remove('hidden');
    toggleHero(true);
}

function showFeed() {
    if (!currentUser) {
        showLogin();
        return;
    }
    hideAllPages();
    document.getElementById('feed-page').classList.remove('hidden');
    loadProblems();
    toggleHero(false);
}

function showProfile() {
    if (!currentUser) {
        showLogin();
        return;
    }
    hideAllPages();
    document.getElementById('profile-page').classList.remove('hidden');
    loadProfile();
    toggleHero(false);
}

function showCreateProblem() {
    hideAllPages();
    document.getElementById('create-problem-page').classList.remove('hidden');
    toggleHero(false);
}

function showProblem(problemId) {
    hideAllPages();
    document.getElementById('problem-page').classList.remove('hidden');
    loadProblem(problemId);
    if (!monacoEditor) {
        setTimeout(initializeMonacoEditor, 100);
    }
    toggleHero(false);
}

function showEditProfile() {
    hideAllPages();
    document.getElementById('edit-profile-page').classList.remove('hidden');
    loadEditProfile();
    toggleHero(false);
}

function hideAllPages() {
    const pages = ['login-page', 'signup-page', 'feed-page', 'create-problem-page', 'problem-page', 'profile-page', 'edit-profile-page'];
    pages.forEach(page => {
        document.getElementById(page).classList.add('hidden');
    });
}

function toggleHero(show) {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    if (show) hero.classList.remove('hidden');
    else hero.classList.add('hidden');
}

// Authentication functions
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await api.login(email, password);
        currentUser = response.user;
        showFeed();
        showNotification('Login successful!', 'success');
    } catch (error) {
        showNotification(error.message || 'Login failed', 'error');
    }
}

async function handleSignup(event) {
    event.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    try {
        const response = await api.register({ name, email, password });
        currentUser = response.user;
        showFeed();
        showNotification('Account created successfully!', 'success');
    } catch (error) {
        showNotification(error.message || 'Registration failed', 'error');
    }
}

function loginWithGoogle() {
    // Simulate Google OAuth
    const mockGoogleUser = {
        id: 'google_' + Date.now(),
        name: 'Google User',
        email: 'user@gmail.com',
        bio: 'Signed up with Google',
        skills: ['JavaScript', 'Web Development'],
        score: 0,
        problemsSolved: 0,
        likedProblems: [],
        likedSolutions: []
    };
    
    persistCurrentUser(mockGoogleUser);
    showFeed();
    showNotification('Signed in with Google!', 'success');
}

function signupWithGoogle() {
    loginWithGoogle();
}

async function logout() {
    try {
        await api.logout();
        currentUser = null;
        updateAuthUI();
        showLogin();
        showNotification('Logged out successfully', 'success');
    } catch (error) {
        console.error('Logout error:', error);
        // Still logout locally even if API call fails
        currentUser = null;
        updateAuthUI();
        showLogin();
        showNotification('Logged out successfully', 'success');
    }
}

function updateAuthUI() {
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const profileLink = document.getElementById('profile-link');
    
    if (currentUser) {
        loginBtn.classList.add('hidden');
        signupBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        profileLink.classList.remove('hidden');
    } else {
        loginBtn.classList.remove('hidden');
        signupBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        profileLink.classList.add('hidden');
    }
}

// Data persistence functions
function getStoredUsers() {
    const users = localStorage.getItem('bytebattle_users');
    return users ? JSON.parse(users) : [];
}

function storeUsers(users) {
    localStorage.setItem('bytebattle_users', JSON.stringify(users));
}

function getStoredProblems() {
    const problems = localStorage.getItem('bytebattle_problems');
    return problems ? JSON.parse(problems) : [];
}

function storeProblems(problems) {
    localStorage.setItem('bytebattle_problems', JSON.stringify(problems));
}

function getStoredSolutions() {
    const solutions = localStorage.getItem('bytebattle_solutions');
    return solutions ? JSON.parse(solutions) : [];
}

function storeSolutions(solutions) {
    localStorage.setItem('bytebattle_solutions', JSON.stringify(solutions));
}

// Problem management functions
async function loadProblems() {
    try {
        const response = await api.getProblems();
        problems = response.data;
        filterProblems();
    } catch (error) {
        console.error('Error loading problems:', error);
        showNotification('Failed to load problems', 'error');
        problems = [];
        filterProblems();
    }
}

function filterProblems() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const difficultyFilter = document.getElementById('difficulty-filter')?.value || '';
    const sortFilter = document.getElementById('sort-filter')?.value || 'newest';
    
    let filteredProblems = problems.filter(problem => {
        const matchesSearch = problem.title.toLowerCase().includes(searchTerm) ||
                            problem.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
                            problem.author.toLowerCase().includes(searchTerm);
        const matchesDifficulty = !difficultyFilter || problem.difficulty === difficultyFilter;
        
        return matchesSearch && matchesDifficulty;
    });
    
    // Sort problems
    switch (sortFilter) {
        case 'newest':
            filteredProblems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'oldest':
            filteredProblems.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'most-liked':
            filteredProblems.sort((a, b) => (b.likes || 0) - (a.likes || 0));
            break;
        case 'alphabetical':
            filteredProblems.sort((a, b) => a.title.localeCompare(b.title));
            break;
    }
    
    const problemsGrid = document.getElementById('problems-grid');
    
    if (filteredProblems.length === 0) {
        problemsGrid.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">No problems found matching your criteria.</p>';
        return;
    }
    
    problemsGrid.innerHTML = filteredProblems.map(problem => `
        <div class="problem-card" onclick="showProblem('${problem.id}')">
            <div class="problem-title">${problem.title}</div>
            <div class="problem-meta">
                <span class="difficulty ${problem.difficulty}">${problem.difficulty}</span>
                <span>by ${problem.author}</span>
            </div>
            <div class="tags">
                ${problem.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div class="problem-actions">
                <button class="like-btn ${currentUser && currentUser.likedProblems.includes(problem.id) ? 'liked' : ''}" 
                        onclick="event.stopPropagation(); toggleProblemLike('${problem.id}')">
                    ❤️ <span>${problem.likes || 0}</span>
                </button>
            </div>
        </div>
    `).join('');
}

async function handleCreateProblem(event) {
    event.preventDefault();
    
    if (!currentUser) {
        showNotification('Please login to create problems', 'error');
        return;
    }
    
    const title = document.getElementById('problem-title').value;
    const difficulty = document.getElementById('problem-difficulty').value;
    const tags = document.getElementById('problem-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
    const statement = document.getElementById('problem-statement').value;
    const sampleInput = document.getElementById('sample-input').value;
    const sampleOutput = document.getElementById('sample-output').value;
    
    try {
        await api.createProblem({
            title,
            difficulty,
            tags,
            statement,
            sampleInput,
            sampleOutput
        });
        
        // Clear form
        document.getElementById('problem-title').value = '';
        document.getElementById('problem-difficulty').value = 'easy';
        document.getElementById('problem-tags').value = '';
        document.getElementById('problem-statement').value = '';
        document.getElementById('sample-input').value = '';
        document.getElementById('sample-output').value = '';
        
        showNotification('Problem created successfully!', 'success');
        showFeed();
    } catch (error) {
        showNotification(error.message || 'Failed to create problem', 'error');
    }
}

async function loadProblem(problemId) {
    try {
        const response = await api.getProblem(problemId);
        currentProblem = response.data;
        
        document.getElementById('problem-detail-title').textContent = currentProblem.title;
        document.getElementById('problem-detail-meta').innerHTML = `
            <span class="difficulty ${currentProblem.difficulty}">${currentProblem.difficulty}</span>
            <span>by ${currentProblem.authorName}</span>
            <span>•</span>
            <span>${new Date(currentProblem.createdAt).toLocaleDateString()}</span>
        `;
        document.getElementById('problem-detail-statement').innerHTML = currentProblem.statement.replace(/\n/g, '<br>');
        document.getElementById('sample-input-display').textContent = currentProblem.sampleInput;
        document.getElementById('sample-output-display').textContent = currentProblem.sampleOutput;
        document.getElementById('problem-likes').textContent = currentProblem.likes || 0;
        
        // Update like button state
        const likeBtn = document.getElementById('problem-like-btn');
        if (currentUser && currentUser.likedProblems && currentUser.likedProblems.includes(currentProblem._id)) {
            likeBtn.classList.add('liked');
        } else {
            likeBtn.classList.remove('liked');
        }
        
        loadSolutions();
    } catch (error) {
        console.error('Error loading problem:', error);
        showNotification('Problem not found', 'error');
        showFeed();
    }
}

async function toggleProblemLike(problemId) {
    if (!currentUser) {
        showNotification('Please login to like problems', 'error');
        return;
    }
    
    try {
        const response = await api.toggleProblemLike(problemId);
        
        // Update current user's liked problems
        if (currentUser.likedProblems) {
            if (response.isLiked) {
                currentUser.likedProblems.push(problemId);
            } else {
                currentUser.likedProblems = currentUser.likedProblems.filter(id => id !== problemId);
            }
        }
        
        // Update UI
        if (problemId === currentProblem?._id) {
            document.getElementById('problem-likes').textContent = response.likes;
            const likeBtn = document.getElementById('problem-like-btn');
            if (response.isLiked) {
                likeBtn.classList.add('liked');
            } else {
                likeBtn.classList.remove('liked');
            }
        } else {
            loadProblems(); // Refresh the feed
        }
    } catch (error) {
        showNotification(error.message || 'Failed to toggle like', 'error');
    }
}

// Code execution functions
async function runCode() {
    if (!monacoEditor) {
        showNotification('Editor not initialized', 'error');
        return;
    }
    
    const code = monacoEditor.getValue();
    const language = document.getElementById('language-select').value;
    
    if (!code.trim()) {
        showNotification('Please write some code first', 'error');
        return;
    }
    
    showNotification('Running code...', 'info');
    
    try {
        const result = await executeCode(code, language, currentProblem?.sampleInput || '');
        displayResult(result, false);
    } catch (error) {
        displayResult({ error: error.message }, false);
    }
}

async function submitSolution() {
    if (!monacoEditor) {
        showNotification('Editor not initialized', 'error');
        return;
    }
    
    if (!currentUser) {
        showNotification('Please login to submit solutions', 'error');
        return;
    }
    
    if (!currentProblem) {
        showNotification('No problem selected', 'error');
        return;
    }
    
    const code = monacoEditor.getValue();
    const language = document.getElementById('language-select').value;
    
    if (!code.trim()) {
        showNotification('Please write some code first', 'error');
        return;
    }
    
    showNotification('Submitting solution...', 'info');
    
    try {
        const response = await api.submitSolution({
            problemId: currentProblem._id,
            code,
            language
        });
        
        const solution = response.data;
        displayResult(solution.result, true);
        
        if (solution.isAccepted) {
            showNotification('Solution accepted! 🎉', 'success');
            // Update user stats
            currentUser.problemsSolved += 1;
            currentUser.score += getDifficultyScore(currentProblem.difficulty);
        } else {
            showNotification('Solution rejected. Try again!', 'error');
        }
        
        loadSolutions();
    } catch (error) {
        displayResult({ error: error.message }, true);
    }
}

async function executeCode(code, language, input) {
    // For demo purposes, we'll simulate code execution
    // In production, this would integrate with Judge0 API
    return new Promise((resolve) => {
        setTimeout(() => {
            try {
                let output = '';
                let isError = false;
                let errorMessage = '';

                if (language === 'python') {
                    // Simulate Python execution
                    try {
                        // Extract the actual solution function call
                        const lines = code.split('\n');
                        let solutionCall = '';
                        
                        // Look for the solution function and extract the call
                        for (let line of lines) {
                            if (line.includes('solution(') && !line.includes('def solution')) {
                                solutionCall = line.trim();
                                break;
                            }
                        }
                        
                        // For your specific case, let's handle the input format
                        const inputLines = input.split('\n');
                        if (inputLines.length >= 1) {
                            const numbers = inputLines[0].trim().split(/\s+/);
                            if (numbers.length >= 2) {
                                const a = parseInt(numbers[0]);
                                const b = parseInt(numbers[1]);
                                
                                // Execute the solution function
                                const solutionFunc = new Function('a', 'b', `
                                    ${code}
                                    return solution(a, b);
                                `);
                                output = solutionFunc(a, b);
                            } else {
                                isError = true;
                                errorMessage = 'Invalid input format. Expected two numbers.';
                            }
                        } else {
                            isError = true;
                            errorMessage = 'No input provided.';
                        }
                    } catch (e) {
                        isError = true;
                        errorMessage = e.message;
                    }
                } else if (language === 'javascript') {
                    // Simulate JavaScript execution
                    try {
                        const inputLines = input.split('\n');
                        if (inputLines.length >= 1) {
                            const numbers = inputLines[0].trim().split(/\s+/);
                            if (numbers.length >= 2) {
                                const a = parseInt(numbers[0]);
                                const b = parseInt(numbers[1]);
                                
                                const solutionFunc = new Function('a', 'b', `
                                    ${code}
                                    return solution(a, b);
                                `);
                                output = solutionFunc(a, b);
                            } else {
                                isError = true;
                                errorMessage = 'Invalid input format. Expected two numbers.';
                            }
                        } else {
                            isError = true;
                            errorMessage = 'No input provided.';
                        }
                    } catch (e) {
                        isError = true;
                        errorMessage = e.message;
                    }
                } else {
                    // For other languages, use simple simulation
                    const isCorrect = Math.random() > 0.3;
                    if (isCorrect) {
                        output = 'Sample output from your code';
                    } else {
                        isError = true;
                        errorMessage = 'Runtime error or wrong output';
                    }
                }

                if (isError) {
                    resolve({
                        status: 'error',
                        error: errorMessage
                    });
                } else {
                    resolve({
                        status: 'success',
                        output: output.toString(),
                        runtime: Math.random() * 1000,
                        memory: Math.random() * 10000
                    });
                }
            } catch (error) {
                resolve({
                    status: 'error',
                    error: error.message
                });
            }
        }, 1000);
    });
}

function displayResult(result, isSubmission) {
    const resultPanel = document.getElementById('result-panel');
    const resultTitle = document.getElementById('result-title');
    const resultContent = document.getElementById('result-content');
    
    resultPanel.classList.remove('hidden');
    
    if (result.error) {
        resultTitle.textContent = isSubmission ? 'Submission Failed' : 'Runtime Error';
        resultContent.innerHTML = `
            <div class="result-error">
                <strong>Error:</strong> ${result.error}
            </div>
        `;
    } else if (result.status === 'success') {
        resultTitle.textContent = isSubmission ? 'Submission Result' : 'Execution Result';
        resultContent.innerHTML = `
            <div class="result-success">
                <strong>Output:</strong><br>
                <pre style="margin-top: 0.5rem; white-space: pre-wrap;">${result.output}</pre>
                <div style="margin-top: 1rem; font-size: 0.9rem; color: #666;">
                    Runtime: ${result.runtime}ms | Memory: ${result.memory}KB
                </div>
            </div>
        `;
    } else {
        resultTitle.textContent = isSubmission ? 'Submission Failed' : 'Execution Failed';
        resultContent.innerHTML = `
            <div class="result-error">
                <strong>Failed:</strong> ${result.error || 'Unknown error'}
            </div>
        `;
    }
}

function getDifficultyScore(difficulty) {
    const scores = { easy: 10, medium: 20, hard: 50 };
    return scores[difficulty] || 10;
}

// Solution management functions
async function loadSolutions() {
    if (!currentProblem) return;
    
    try {
        const response = await api.getProblemSolutions(currentProblem._id);
        const problemSolutions = response.data;
        
        const solutionsList = document.getElementById('solutions-list');
        
        if (problemSolutions.length === 0) {
            solutionsList.innerHTML = '<p style="text-align: center; color: #666;">No accepted solutions yet.</p>';
            return;
        }
        
        solutionsList.innerHTML = problemSolutions.map(solution => `
            <div class="solution-card">
                <div class="solution-header">
                    <div>
                        <strong>${solution.userName}</strong>
                        <span style="color: #666; margin-left: 1rem;">${solution.language}</span>
                    </div>
                    <button class="like-btn ${currentUser && currentUser.likedSolutions && currentUser.likedSolutions.includes(solution._id) ? 'liked' : ''}" 
                            onclick="toggleSolutionLike('${solution._id}')">
                        ❤️ <span>${solution.likes || 0}</span>
                    </button>
                </div>
                <div class="solution-code">
                    <pre>${solution.code}</pre>
                </div>
                <div style="margin-top: 1rem; font-size: 0.9rem; color: #666;">
                    Submitted: ${new Date(solution.createdAt).toLocaleString()}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading solutions:', error);
        const solutionsList = document.getElementById('solutions-list');
        solutionsList.innerHTML = '<p style="text-align: center; color: #666;">Error loading solutions.</p>';
    }
}

async function toggleSolutionLike(solutionId) {
    if (!currentUser) {
        showNotification('Please login to like solutions', 'error');
        return;
    }
    
    try {
        const response = await api.toggleSolutionLike(solutionId);
        
        // Update current user's liked solutions
        if (currentUser.likedSolutions) {
            if (response.isLiked) {
                currentUser.likedSolutions.push(solutionId);
            } else {
                currentUser.likedSolutions = currentUser.likedSolutions.filter(id => id !== solutionId);
            }
        }
        
        loadSolutions();
    } catch (error) {
        showNotification(error.message || 'Failed to toggle like', 'error');
    }
}

// Profile management functions
async function loadProfile() {
    if (!currentUser) return;
    
    try {
        const response = await api.getUserProfile(currentUser.id);
        const userData = response.data;
        
        document.getElementById('profile-name').textContent = userData.name;
        document.getElementById('profile-bio').textContent = userData.bio || 'No bio provided';
        document.getElementById('profile-avatar').textContent = userData.name.charAt(0).toUpperCase();
        document.getElementById('problems-solved').textContent = userData.stats.problemsSolved || 0;
        document.getElementById('total-score').textContent = userData.stats.score || 0;
        
        const skillsContainer = document.getElementById('profile-skills');
        if (userData.skills && userData.skills.length > 0) {
            skillsContainer.innerHTML = userData.skills.map(skill => `<span class="tag">${skill}</span>`).join('');
        } else {
            skillsContainer.innerHTML = '<span style="color: #666;">No skills added yet</span>';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        // Fallback to current user data
        document.getElementById('profile-name').textContent = currentUser.name;
        document.getElementById('profile-bio').textContent = currentUser.bio || 'No bio provided';
        document.getElementById('profile-avatar').textContent = currentUser.name.charAt(0).toUpperCase();
        document.getElementById('problems-solved').textContent = currentUser.problemsSolved || 0;
        document.getElementById('total-score').textContent = currentUser.score || 0;
    }
}

function loadEditProfile() {
    if (!currentUser) return;
    
    document.getElementById('edit-name').value = currentUser.name;
    document.getElementById('edit-bio').value = currentUser.bio || '';
    document.getElementById('edit-skills').value = currentUser.skills ? currentUser.skills.join(', ') : '';
}

async function handleUpdateProfile(event) {
    event.preventDefault();
    
    if (!currentUser) return;
    
    const name = document.getElementById('edit-name').value;
    const bio = document.getElementById('edit-bio').value;
    const skills = document.getElementById('edit-skills').value.split(',').map(skill => skill.trim()).filter(skill => skill);
    
    try {
        await api.updateUserProfile(currentUser.id, {
            name,
            bio,
            skills
        });
        
        // Update current user data
        currentUser.name = name;
        currentUser.bio = bio;
        currentUser.skills = skills;
        
        showNotification('Profile updated successfully!', 'success');
        showProfile();
    } catch (error) {
        showNotification(error.message || 'Failed to update profile', 'error');
    }
}

function updateUserStats() {
    const allUsers = getStoredUsers();
    const userIndex = allUsers.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        allUsers[userIndex] = currentUser;
        storeUsers(allUsers);
    }
}

// Utility functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8',
        warning: '#ffc107'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', async function() {
    // Wait for API to be loaded
    if (typeof window.api === 'undefined') {
        console.error('API not loaded. Make sure api.js is included before app.js');
        showLogin();
        return;
    }
    
    api = window.api;
    
    // Check if user is already logged in
    const token = localStorage.getItem('bytebattle_token');
    if (token) {
        try {
            const response = await api.getCurrentUser();
            currentUser = response.user;
            updateAuthUI();
            showFeed();
        } catch (error) {
            console.error('Token validation failed:', error);
            localStorage.removeItem('bytebattle_token');
            showLogin();
        }
    } else {
        showLogin();
    }
    
    // Persist current user on changes safely
    window.persistCurrentUser = function(user) {
        currentUser = user;
        updateAuthUI();
    };
});