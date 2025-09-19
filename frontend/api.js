// API service for Byte Battle frontend
class ByteBattleAPI {
  constructor() {
    // Auto-detect environment
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    this.baseURL = isProduction 
      ? 'https://byte-battle-backend.railway.app/api'  // Replace with your Railway URL
      : 'http://localhost:5000/api';
    this.token = localStorage.getItem('bytebattle_token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('bytebattle_token', token);
    } else {
      localStorage.removeItem('bytebattle_token');
    }
  }

  // Get authorization headers
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Make API request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication API
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout() {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });
    
    this.setToken(null);
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async updatePassword(currentPassword, newPassword) {
    return this.request('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Users API
  async getUserProfile(userId) {
    return this.request(`/users/${userId}`);
  }

  async updateUserProfile(userId, userData) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async getUserProblems(userId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/users/${userId}/problems?${queryString}`);
  }

  async getUserSolutions(userId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/users/${userId}/solutions?${queryString}`);
  }

  async getLeaderboard(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/users/leaderboard?${queryString}`);
  }

  async getUserStats(userId) {
    return this.request(`/users/${userId}/stats`);
  }

  async searchUsers(query, params = {}) {
    const searchParams = { q: query, ...params };
    const queryString = new URLSearchParams(searchParams).toString();
    return this.request(`/users/search?${queryString}`);
  }

  // Problems API
  async getProblems(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/problems?${queryString}`);
  }

  async getProblem(problemId) {
    return this.request(`/problems/${problemId}`);
  }

  async createProblem(problemData) {
    return this.request('/problems', {
      method: 'POST',
      body: JSON.stringify(problemData),
    });
  }

  async updateProblem(problemId, problemData) {
    return this.request(`/problems/${problemId}`, {
      method: 'PUT',
      body: JSON.stringify(problemData),
    });
  }

  async deleteProblem(problemId) {
    return this.request(`/problems/${problemId}`, {
      method: 'DELETE',
    });
  }

  async toggleProblemLike(problemId) {
    return this.request(`/problems/${problemId}/like`, {
      method: 'POST',
    });
  }

  async getProblemStats(problemId) {
    return this.request(`/problems/${problemId}/stats`);
  }

  // Solutions API
  async getProblemSolutions(problemId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/solutions/problem/${problemId}?${queryString}`);
  }

  async getUserSolutions(userId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/solutions/user/${userId}?${queryString}`);
  }

  async submitSolution(solutionData) {
    return this.request('/solutions', {
      method: 'POST',
      body: JSON.stringify(solutionData),
    });
  }

  async getSolution(solutionId) {
    return this.request(`/solutions/${solutionId}`);
  }

  async toggleSolutionLike(solutionId) {
    return this.request(`/solutions/${solutionId}/like`, {
      method: 'POST',
    });
  }

  async updateSolution(solutionId, solutionData) {
    return this.request(`/solutions/${solutionId}`, {
      method: 'PUT',
      body: JSON.stringify(solutionData),
    });
  }

  async deleteSolution(solutionId) {
    return this.request(`/solutions/${solutionId}`, {
      method: 'DELETE',
    });
  }
}

// Create global API instance
window.api = new ByteBattleAPI();
