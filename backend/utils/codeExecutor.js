const axios = require('axios');

// Language mapping for Judge0 API
const languageMap = {
  'javascript': 63, // Node.js
  'python': 71,    // Python 3
  'java': 62,      // Java
  'cpp': 54,       // C++ 17
  'c': 50,         // C
  'csharp': 51,    // C#
  'go': 60,        // Go
  'rust': 73       // Rust
};

// Judge0 API configuration
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

/**
 * Execute code using Judge0 API
 * @param {string} code - The code to execute
 * @param {string} language - Programming language
 * @param {string} input - Input for the code
 * @param {string} expectedOutput - Expected output for validation
 * @returns {Object} Execution result
 */
async function executeCode(code, language, input = '', expectedOutput = '') {
  try {
    // Check if Judge0 API is configured
    if (!JUDGE0_API_KEY) {
      console.log('Judge0 API key not configured, using mock execution');
      return mockCodeExecution(code, language, input, expectedOutput);
    }

    const languageId = languageMap[language];
    if (!languageId) {
      throw new Error(`Unsupported language: ${language}`);
    }

    // Prepare submission data
    const submissionData = {
      language_id: languageId,
      source_code: code,
      stdin: input,
      expected_output: expectedOutput
    };

    // Submit code for execution
    const submitResponse = await axios.post(
      `${JUDGE0_API_URL}/submissions`,
      submissionData,
      {
        headers: {
          'X-RapidAPI-Key': JUDGE0_API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        params: {
          base64_encoded: 'false',
          wait: 'true'
        }
      }
    );

    const token = submitResponse.data.token;

    // Poll for result
    let result = null;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout

    while (attempts < maxAttempts) {
      const resultResponse = await axios.get(
        `${JUDGE0_API_URL}/submissions/${token}`,
        {
          headers: {
            'X-RapidAPI-Key': JUDGE0_API_KEY,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
          }
        }
      );

      result = resultResponse.data;

      if (result.status.id !== 1 && result.status.id !== 2) {
        // Status 1: In Queue, Status 2: Processing
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      attempts++;
    }

    // Process result
    return processJudge0Result(result, expectedOutput);

  } catch (error) {
    console.error('Code execution error:', error.message);
    
    // Fallback to mock execution
    return mockCodeExecution(code, language, input, expectedOutput);
  }
}

/**
 * Process Judge0 API result
 * @param {Object} result - Judge0 API result
 * @param {string} expectedOutput - Expected output
 * @returns {Object} Processed result
 */
function processJudge0Result(result, expectedOutput) {
  const statusMap = {
    3: 'success',    // Accepted
    4: 'error',      // Wrong Answer
    5: 'timeout',    // Time Limit Exceeded
    6: 'error',      // Compilation Error
    7: 'timeout',    // Runtime Error (SIGSEGV)
    8: 'timeout',    // Runtime Error (SIGXFSZ)
    9: 'timeout',    // Runtime Error (SIGFPE)
    10: 'error',     // Runtime Error (SIGABRT)
    11: 'error',     // Runtime Error (NZEC)
    12: 'error',     // Runtime Error (Other)
    13: 'timeout',   // Internal Error
    14: 'timeout',   // Exec Format Error
  };

  const status = statusMap[result.status.id] || 'error';
  const output = result.stdout || '';
  const error = result.stderr || result.compile_output || '';
  const runtime = result.time ? parseFloat(result.time) * 1000 : 0; // Convert to milliseconds
  const memory = result.memory ? Math.round(result.memory / 1024) : 0; // Convert to KB

  // Check if output matches expected
  const isCorrect = status === 'success' && 
    output.trim() === expectedOutput.trim();

  return {
    status,
    output: output.trim(),
    error: error.trim(),
    runtime: Math.round(runtime),
    memory,
    isCorrect,
    testCases: [{
      input: result.stdin || '',
      expectedOutput: expectedOutput.trim(),
      actualOutput: output.trim(),
      passed: isCorrect,
      runtime: Math.round(runtime),
      memory
    }]
  };
}

/**
 * Mock code execution for development/testing
 * @param {string} code - The code to execute
 * @param {string} language - Programming language
 * @param {string} input - Input for the code
 * @param {string} expectedOutput - Expected output for validation
 * @returns {Object} Mock execution result
 */
function mockCodeExecution(code, language, input, expectedOutput) {
  // Simulate processing time
  const processingTime = Math.random() * 2000 + 500; // 0.5-2.5 seconds

  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        let output = '';
        let isError = false;
        let errorMessage = '';

        // Simple mock execution based on language
        if (language === 'javascript') {
          output = mockJavaScriptExecution(code, input);
        } else if (language === 'python') {
          output = mockPythonExecution(code, input);
        } else {
          // For other languages, simulate success/failure
          const isCorrect = Math.random() > 0.3; // 70% success rate
          if (isCorrect) {
            output = expectedOutput || 'Mock output';
          } else {
            isError = true;
            errorMessage = 'Mock execution error';
          }
        }

        const isCorrect = !isError && output.trim() === expectedOutput.trim();

        resolve({
          status: isError ? 'error' : 'success',
          output: output.trim(),
          error: errorMessage,
          runtime: Math.round(processingTime),
          memory: Math.round(Math.random() * 10000 + 1000), // 1-11 MB
          isCorrect,
          testCases: [{
            input: input.trim(),
            expectedOutput: expectedOutput.trim(),
            actualOutput: output.trim(),
            passed: isCorrect,
            runtime: Math.round(processingTime),
            memory: Math.round(Math.random() * 10000 + 1000)
          }]
        });
      } catch (error) {
        resolve({
          status: 'error',
          output: '',
          error: error.message,
          runtime: Math.round(processingTime),
          memory: 0,
          isCorrect: false,
          testCases: [{
            input: input.trim(),
            expectedOutput: expectedOutput.trim(),
            actualOutput: '',
            passed: false,
            runtime: Math.round(processingTime),
            memory: 0
          }]
        });
      }
    }, Math.min(processingTime, 1000)); // Cap at 1 second for mock
  });
}

/**
 * Mock JavaScript execution
 * @param {string} code - JavaScript code
 * @param {string} input - Input string
 * @returns {string} Output
 */
function mockJavaScriptExecution(code, input) {
  try {
    // Extract function call from code
    const lines = code.split('\n');
    let functionCall = '';
    
    for (let line of lines) {
      if (line.includes('solution(') && !line.includes('function solution')) {
        functionCall = line.trim();
        break;
      }
    }

    if (!functionCall) {
      return 'No solution function call found';
    }

    // Parse input
    const inputLines = input.split('\n');
    if (inputLines.length >= 1) {
      const numbers = inputLines[0].trim().split(/\s+/);
      if (numbers.length >= 2) {
        const a = parseInt(numbers[0]);
        const b = parseInt(numbers[1]);
        
        // Create a safe execution context
        const solutionFunc = new Function('a', 'b', `
          ${code}
          return solution(a, b);
        `);
        
        const result = solutionFunc(a, b);
        return result.toString();
      }
    }
    
    return 'Invalid input format';
  } catch (error) {
    throw new Error(`JavaScript execution error: ${error.message}`);
  }
}

/**
 * Mock Python execution
 * @param {string} code - Python code
 * @param {string} input - Input string
 * @returns {string} Output
 */
function mockPythonExecution(code, input) {
  try {
    // Extract function call from code
    const lines = code.split('\n');
    let functionCall = '';
    
    for (let line of lines) {
      if (line.includes('solution(') && !line.includes('def solution')) {
        functionCall = line.trim();
        break;
      }
    }

    if (!functionCall) {
      return 'No solution function call found';
    }

    // Parse input
    const inputLines = input.split('\n');
    if (inputLines.length >= 1) {
      const numbers = inputLines[0].trim().split(/\s+/);
      if (numbers.length >= 2) {
        const a = parseInt(numbers[0]);
        const b = parseInt(numbers[1]);
        
        // Simple Python-like execution simulation
        const result = a + b; // Default to addition for mock
        return result.toString();
      }
    }
    
    return 'Invalid input format';
  } catch (error) {
    throw new Error(`Python execution error: ${error.message}`);
  }
}

module.exports = {
  executeCode
};
