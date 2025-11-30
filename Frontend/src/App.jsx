// client/src/App.jsx
import React, { useState, useEffect, useContext, createContext } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown'; 

// --- Configuration ---
const API_BASE_URL = 'http://localhost:5000/api';

// --- Context Setup ---
const AuthContext = createContext(null);

// Custom Hook for Authentication
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
      setUser({ username: "User" });
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser({ username: data.username, email: data.email, id: data._id });
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Login Error:', error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || 'Login failed.' };
    }
  };

  const register = async (username, email, password) => {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/register`, { username, email, password });
      
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser({ username: data.username, email: data.email, id: data._id });
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Registration Error:', error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || 'Registration failed.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return { user, isAuthenticated, token, login, register, logout };
};

// --- Component Helpers ---

const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
    <span className="ml-3 text-gray-400">Processing request...</span>
  </div>
);

const Nav = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);

  return (
    <nav className="bg-gray-900 shadow-xl border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-cyan-400 hover:text-cyan-300 transition duration-150">
            AI Code Reviewer
          </Link>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/history" className="text-gray-300 hover:bg-gray-800 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-150">
                  History
                </Link>
                <button
                  onClick={logout}
                  className="bg-red-600 text-white hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium transition duration-150"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:bg-gray-800 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-150">
                  Login
                </Link>
                <Link to="/register" className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium transition duration-150">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// --- Auth Pages ---

const AuthForm = ({ type }) => {
  const { login, register, isAuthenticated } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/review');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    let result;
    if (type === 'login') {
      result = await login(email, password);
    } else {
      result = await register(username, email, password);
    }

    if (!result.success) {
      setError(result.message);
    }
  };

  const isLogin = type === 'login';
  const title = isLogin ? 'Sign In' : 'Create Account';
  const buttonText = isLogin ? 'Login' : 'Register';
  const toggleText = isLogin ? 'Need an account?' : 'Already have an account?';
  const toggleLink = isLogin ? '/register' : '/login';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="bg-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-800/50">
        <h2 className="text-3xl font-bold mb-6 text-white text-center">{title}</h2>
        {error && (
          <div className="bg-red-800 text-white p-3 rounded mb-4 text-sm" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1" htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={!isLogin}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-150 shadow-md shadow-indigo-900/50"
          >
            {buttonText}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-400">
          {toggleText}
          <Link to={toggleLink} className="text-indigo-400 hover:text-indigo-300 font-medium ml-1">
            {isLogin ? 'Register Here' : 'Login Here'}
          </Link>
        </p>
      </div>
    </div>
  );
};

// --- Review Submission Component (Step 3.3) ---

// Component for a single category's findings 
const ReviewCategory = ({ category, findings }) => {
  const [isOpen, setIsOpen] = useState(true);

  const severityClasses = {
    // Adjusted severity colors for better contrast on dark theme
    Critical: 'bg-red-900 text-red-300 border-red-600',
    High: 'bg-orange-800 text-orange-300 border-orange-600',
    Medium: 'bg-yellow-800 text-yellow-300 border-yellow-600',
    Low: 'bg-indigo-900 text-indigo-300 border-indigo-600',
    Informational: 'bg-gray-700 text-gray-400 border-gray-600',
  };
  
  const icon = isOpen ? '▲' : '▼';

  return (
    <div className="border border-gray-800 rounded-lg mb-4">
      <button
        className="w-full p-4 text-left font-semibold text-lg text-white bg-gray-800 hover:bg-gray-700 rounded-t-lg transition duration-150 flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {category} ({findings.length})
        <span className="text-sm">{icon}</span>
      </button>
      {isOpen && (
        <div className="p-4 bg-gray-900 rounded-b-lg">
          {findings.length === 0 ? (
            <p className="text-gray-400">No issues found in this category.</p>
          ) : (
            <ul className="space-y-4">
              {findings.map((finding, index) => (
                <li key={index} className="p-3 border-l-4 border-gray-700 bg-gray-800/50 rounded-md">
                  <div className={`inline-block px-3 py-1 text-xs font-bold rounded-full mb-2 ${severityClasses[finding.severity]}`}>
                    {finding.severity}
                  </div>
                  {finding.line > 0 && (
                    <span className="text-sm text-gray-400 ml-3">Line: {finding.line}</span>
                  )}
                  <p className="text-gray-200 mt-1 whitespace-pre-wrap">{finding.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

// Main component to display the structured review
const ReviewResult = ({ report, rawCode, language }) => {
  return (
    <div className="p-6 bg-gray-950 min-h-full">
      <h1 className="text-4xl font-extrabold text-white mb-6 border-b border-cyan-600/50 pb-2">AI Review Complete</h1>
      
      {/* Summary Section - Highlighted with Cyan accent */}
      <div className="bg-gray-900 p-6 rounded-lg mb-8 shadow-xl border border-cyan-800">
        <h2 className="text-2xl font-semibold text-cyan-400 mb-3">Overall Summary</h2>
        <p className="text-gray-300 whitespace-pre-wrap">{report.overall_summary}</p>
      </div>

      {/* Issues Section */}
      <h2 className="text-3xl font-semibold text-white mb-4">Detailed Findings</h2>
      {report.issues_by_category.map((cat, index) => (
        <ReviewCategory key={index} category={cat.category} findings={cat.findings} />
      ))}

      {/* Code Snippet (Optional - for comparison) */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-400 mb-3 border-t border-gray-800 pt-6">Submitted Code ({language})</h2>
        <pre className="bg-gray-900 p-4 rounded-md overflow-x-auto text-gray-200 text-sm whitespace-pre-wrap border border-gray-800">
          {rawCode}
        </pre>
      </div>
    </div>
  );
};


const CodeReview = () => {
  const { token } = useContext(AuthContext);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');

  // Review State
  const [review, setReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  // New LLM Feature States
  const [explanation, setExplanation] = useState(null);
  const [refactoredCode, setRefactoredCode] = useState(null);
  const [llmFeatureLoading, setLlmFeatureLoading] = useState(null); 

  const clearOutputs = () => {
    setReview(null);
    setExplanation(null);
    setRefactoredCode(null);
  };
  
  const handleApiCall = async (endpoint, featureKey, setter, setLoading) => {
    setReviewError(null);
    clearOutputs(); 
    setLoading(endpoint);

    if (!code.trim() || !language) {
        setReviewError("Code and language cannot be empty.");
        setLoading(null);
        return;
    }

    try {
        const response = await axios.post(
            `${API_BASE_URL}/review/${endpoint}`,
            { code, language },
            {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            }
        );
        setter(response.data[featureKey]);

    } catch (err) {
        console.error(`${endpoint} Error:`, err.response?.data?.message || err.message);
        setReviewError(err.response?.data?.message || `Failed to run ${endpoint}. Check server.`);
    } finally {
        setLoading(null);
    }
  }


  // --- Handlers for Core Review and New Features ---

  const handleSubmission = (e) => {
    e.preventDefault();
    handleApiCall('submit', 'reviewReport', setReview, setReviewLoading);
  };
  
  const handleExplain = () => {
    handleApiCall('explain', 'explanation', setExplanation, setLlmFeatureLoading);
  };

  const handleRefactor = () => {
    handleApiCall('refactor', 'refactoredCode', setRefactoredCode, setLlmFeatureLoading);
  };
  
  const isLlmLoading = llmFeatureLoading !== null;
  const currentOutputTitle = 
    (explanation && "Code Explanation") || 
    (refactoredCode && "Refactored Code Suggestion") || 
    (review && "AI Review Results") || 
    "Output";


  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-white mb-6">AI Code Workbench</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Pane: Submission Form and Code Editor */}
        <div className="bg-gray-900 p-6 rounded-xl shadow-xl border border-gray-800 h-full">
          <form onSubmit={handleSubmission} className="flex flex-col h-full">
            <div className="mb-4">
              <label htmlFor="language" className="block text-sm font-medium text-gray-400 mb-1">Language</label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="c++">C++</option>
                <option value="typescript">TypeScript</option>
                <option value="html">HTML</option>
              </select>
            </div>

            <div className="flex-grow mb-4 flex flex-col">
              <label htmlFor="code" className="block text-sm font-medium text-gray-400 mb-1">Code Input</label>
              <textarea
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows="15"
                className="w-full flex-grow px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg text-gray-100 font-mono text-sm resize-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                placeholder="Paste your code here..."
                required
              />
            </div>

            {reviewError && (
              <div className="bg-red-800 text-white p-3 rounded mb-4 text-sm text-center" role="alert">
                {reviewError}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex space-x-3 mt-4">
              <button
                type="submit"
                disabled={reviewLoading || isLlmLoading}
                className={`py-3 rounded-lg font-semibold flex-1 transition duration-150 ${
                  reviewLoading ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-900/50'
                }`}
              >
                {reviewLoading ? 'Reviewing...' : 'Submit for AI Review'}
              </button>

              <button
                type="button"
                onClick={handleExplain}
                disabled={reviewLoading || isLlmLoading}
                className={`py-3 rounded-lg font-semibold w-1/4 transition duration-150 flex items-center justify-center ${
                  llmFeatureLoading === 'explain' ? 'bg-sky-800 text-white cursor-not-allowed' : 'bg-sky-600 text-white hover:bg-sky-700 shadow-md shadow-sky-900/50'
                }`}
              >
                {llmFeatureLoading === 'explain' ? 'Loading...' : '✨ Docs'}
              </button>

              <button
                type="button"
                onClick={handleRefactor}
                disabled={reviewLoading || isLlmLoading}
                className={`py-3 rounded-lg font-semibold w-1/4 transition duration-150 flex items-center justify-center ${
                  llmFeatureLoading === 'refactor' ? 'bg-purple-800 text-white cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-900/50'
                }`}
              >
                {llmFeatureLoading === 'refactor' ? 'Loading...' : '✨ Refactor'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Pane: Review Result Display */}
        <div className="lg:max-h-[80vh] lg:overflow-y-auto">
          {/* Loading States for all features */}
          {(reviewLoading || isLlmLoading) && <LoadingSpinner />}
          
          {/* Main Structured Review Output */}
          {review && (
            <ReviewResult 
              report={review} 
              rawCode={code} 
              language={language}
            />
          )}

          {/* New LLM Feature Output (Markdown Display) */}
          {(explanation || refactoredCode) && (
             <div className="bg-gray-900 p-6 rounded-xl shadow-xl border border-gray-800">
                <h2 className="text-2xl font-bold text-cyan-400 mb-4 border-b border-gray-700 pb-2">{currentOutputTitle}</h2>
                <div className="markdown-body text-gray-300">
                    <ReactMarkdown 
                        children={explanation || refactoredCode} 
                        className="prose prose-invert max-w-none text-gray-300"
                        components={{
                            code({node, inline, className, children, ...props}) {
                                const match = /language-(\w+)/.exec(className || '')
                                return !inline && match ? (
                                    <pre className="bg-gray-950 p-3 rounded-md overflow-x-auto my-3 text-sm border border-gray-700" {...props}>
                                        {String(children).replace(/\n$/, '')}
                                    </pre>
                                ) : (
                                    <code className="bg-gray-700 text-cyan-400 px-1 py-0.5 rounded text-sm" {...props}>
                                        {children}
                                    </code>
                                )
                            }
                        }}
                    />
                </div>
             </div>
          )}

          {!review && !explanation && !refactoredCode && !reviewLoading && !isLlmLoading && (
            <div className="bg-gray-900 p-6 rounded-xl shadow-xl border border-gray-800 text-center flex items-center justify-center h-full min-h-64">
                <p className="text-gray-400 text-lg">Use the workbench on the left to get code reviews, documentation, and refactoring suggestions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- History Page (Step 3.5 - Placeholder structure for now) ---
const HistoryPage = () => {
    const { token, isAuthenticated } = useContext(AuthContext);
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedReview, setSelectedReview] = useState(null);
    
    // We will store the full review details here when user clicks view
    const [fullReviewDetail, setFullReviewDetail] = useState(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    // Fetch history data on load
    useEffect(() => {
        const fetchHistory = async () => {
            if (!isAuthenticated || !token) {
                setIsLoading(false);
                return;
            }
            try {
                const response = await axios.get(`${API_BASE_URL}/review/history`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
                setHistory(response.data);
            } catch (err) {
                console.error('History Fetch Error:', err.response?.data?.message || err.message);
                setError('Failed to load history. Please ensure the backend is running and you are logged in.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [isAuthenticated, token]);
    
    
    // Placeholder function for getting full review details (since we only fetch summary in the list)
    const handleViewReview = async (review) => {
        setSelectedReview(review);
        setFullReviewDetail(null);
        setIsDetailLoading(true);

        // NOTE: Our current history API (Step 2.6) returns ALL the necessary data (including the full reviewReport object).
        // It only excludes the original, long 'code' string for performance.
        // Therefore, we can display the ReviewReport directly from the history item, 
        // and just show a placeholder for the original code.

        try {
             // Mock API delay for realism
             await new Promise(resolve => setTimeout(resolve, 300)); 

             setFullReviewDetail({
                 ...review,
                 reviewReport: review.reviewReport, 
                 // Mocking the raw code placeholder
                 rawCode: `// Original code is not stored in the history list for performance reasons.\n// Please implement a dedicated GET /api/review/:id backend route to fetch the full code.`,
                 // We will update the ReviewResult component to accept this placeholder
             });
        } catch(error) {
            setError("Could not load full review detail.");
        } finally {
            setIsDetailLoading(false);
        }
    };


    const formatSubmissionDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };


    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-white mb-6 border-b border-gray-800 pb-2">Review History</h1>

            {error && (
                <div className="bg-red-800 text-white p-4 rounded mb-4">{error}</div>
            )}

            {isLoading ? (
                <LoadingSpinner />
            ) : history.length === 0 ? (
                <div className="text-center p-8 bg-gray-900 rounded-xl text-gray-400 border border-gray-800">
                    You have no previous review submissions. Start reviewing code!
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Pane: History List */}
                    <div className="lg:col-span-1 bg-gray-900 p-4 rounded-xl shadow-xl border border-gray-800 max-h-[80vh] overflow-y-auto">
                        <h2 className="text-xl font-semibold text-white mb-4">All Submissions ({history.length})</h2>
                        <ul className="space-y-3">
                            {history.map((review) => (
                                <li key={review._id}>
                                    <button 
                                        onClick={() => handleViewReview(review)}
                                        className={`w-full text-left p-3 rounded-lg transition duration-150 border ${
                                            selectedReview?._id === review._id 
                                            ? 'bg-indigo-700 border-indigo-500' 
                                            : 'bg-gray-800 hover:bg-gray-700 border-gray-700'
                                        }`}
                                    >
                                        <p className="font-semibold text-gray-100">{review.language.toUpperCase()} Review</p>
                                        <p className="text-xs text-gray-400 mt-1">{review.reviewReport.overall_summary.substring(0, 70)}...</p>
                                        <p className="text-xs text-gray-500 mt-1">Submitted: {formatSubmissionDate(review.submissionDate)}</p>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right Pane: Review Detail */}
                    <div className="lg:col-span-2">
                        {isDetailLoading && <LoadingSpinner />}
                        {fullReviewDetail && fullReviewDetail.reviewReport ? (
                            <ReviewResult 
                                report={fullReviewDetail.reviewReport} 
                                rawCode={fullReviewDetail.rawCode} 
                                language={fullReviewDetail.language}
                            />
                        ) : (
                            <div className="bg-gray-900 p-6 rounded-xl shadow-xl border border-gray-800 h-full flex items-center justify-center min-h-64">
                                <p className="text-gray-400 text-lg">Select a submission from the list to view the full report.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


// --- App Structure ---
const AppLayout = () => {
    return (
        // Apply main background color to body/wrapper
        <div className="min-h-screen bg-gray-950">
            <Nav />
            <main>
                <Routes>
                    <Route path="/login" element={<AuthForm type="login" />} />
                    <Route path="/register" element={<AuthForm type="register" />} />
                    
                    {/* Protected Routes */}
                    <Route path="/" element={<ProtectedRoute component={CodeReview} />} />
                    <Route path="/review" element={<ProtectedRoute component={CodeReview} />} />
                    <Route path="/history" element={<ProtectedRoute component={HistoryPage} />} />

                    {/* Fallback */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
        </div>
    );
};

// --- Route Protection ---
const ProtectedRoute = ({ component: Component }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? <Component /> : null;
};

const NotFound = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <h1 className="text-4xl text-red-500">404 - Page Not Found</h1>
    </div>
);

// --- Main App Component ---
export default function App() {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthContext.Provider>
  );
}