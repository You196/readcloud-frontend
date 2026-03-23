import React, { useState, useEffect, useContext, createContext, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import './index.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://readcloud-bue-crgcb6ffbxghfhfy.germanywestcentral-01.azurewebsites.net';

const AuthModalContext = createContext();

const AuthModal = ({ isOpen, onClose, mode = 'login', showWelcome = false }) => {
  const [formData, setFormData] = useState({ email: '', password: '', displayName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGuestWelcome, setShowGuestWelcome] = useState(showWelcome);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = mode === 'login' ? { email: formData.email, password: formData.password } : formData;

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();

      if (response.ok) {
        login(data, data.token);
        onClose();
        navigate('/library');
        toast.success('Welcome to ReadCloud! 🎉');
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      className="modal-overlay" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="auth-modal guest-welcome-modal" 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>✕</button>
        
        {showGuestWelcome ? (
          <div className="guest-welcome-content">
            <div className="guest-icon">📚</div>
            <h2>Start Your Personal Library!</h2>
            <p>Create a free account to save your favorite books, track your reading progress, and access your cloud library from anywhere in the world.</p>
            <button 
              className="auth-btn guest-cta-btn"
              onClick={() => {
                onClose();
                navigate('/register');
              }}
            >
              Take me to create an account and enjoy all services
            </button>
            <div className="guest-login-link">
              <span>Already have an account? </span>
              <button type="button" onClick={() => setShowGuestWelcome(false)}>Sign in</button>
            </div>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <h2>Start Your Personal Library!</h2>
              <p>Create a free account to save books, track your reading progress, and access your cloud library from anywhere.</p>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {error && <div className="auth-error">{error}</div>}
              
              {mode === 'register' && (
                <div className="form-group">
                  <label>Display Name</label>
                  <input type="text" value={formData.displayName} onChange={(e) => setFormData({...formData, displayName: e.target.value})} placeholder="Your name" required />
                </div>
              )}
              
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="your@email.com" required />
              </div>
              
              <div className="form-group">
                <label>Password</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••••••" required minLength={6} />
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="modal-footer">
              {mode === 'login' ? (
                <span>Don't have an account? <button type="button" onClick={() => { setFormData({email: '', password: '', displayName: ''}); setError(''); navigate('/register'); }}>Sign up</button></span>
              ) : (
                <span>Already have an account? <button type="button" onClick={() => { setFormData({email: '', password: '', displayName: ''}); setError(''); navigate('/login'); }}>Sign in</button></span>
              )}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="loading">Loading...</div>;
  return user ? children : <Navigate to="/" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="loading">Loading...</div>;
  return user ? <Navigate to="/library" /> : children;
}

const Sidebar = ({ isOpen, onToggle }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    onToggle?.();
    navigate('/');
  };

  const handleNavClick = (path) => {
    navigate(path);
    onToggle?.();
  };

  const guestNavItems = [
    { icon: '🏠', label: 'Home', path: '/' },
    { icon: '🔑', label: 'Sign In', path: '/login' },
    { icon: '✨', label: 'Get Started', path: '/register' },
  ];

  const userNavItems = [
    { icon: '📊', label: 'Dashboard', path: '/dashboard' },
    { icon: '📚', label: 'My Library', path: '/library' },
    { icon: '🔍', label: 'Search Books', path: '/' },
  ];

  const navItems = user ? userNavItems : guestNavItems;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            className="sidebar-backdrop-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
          />
          <motion.aside 
            className="unified-sidebar open"
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="unified-sidebar-header">
              <span className="unified-sidebar-logo">ReadCloud</span>
              <button className="unified-sidebar-close" onClick={onToggle} aria-label="Close menu">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <nav className="unified-sidebar-nav">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  className={`unified-sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleNavClick(item.path)}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="unified-sidebar-icon">{item.icon}</span>
                  <span className="unified-sidebar-label">{item.label}</span>
                </motion.div>
              ))}
            </nav>

            {user && (
              <div className="unified-sidebar-footer">
                <div className="unified-sidebar-user">
                  <div className="unified-sidebar-avatar">👤</div>
                  <div className="unified-sidebar-user-info">
                    <span className="user-name">{user?.displayName}</span>
                    <span className="user-email">{user?.email}</span>
                  </div>
                </div>
                <motion.button 
                  className="unified-sidebar-logout"
                  onClick={handleLogout}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>🚪</span>
                  <span>Sign Out</span>
                </motion.button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

const Navbar = ({ onMenuClick, sidebarOpen }) => {
  return (
    <nav className="navbar">
      <button className="navbar-hamburger" onClick={onMenuClick} aria-label="Toggle menu">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      
      <div className="nav-brand"><Link to="/">ReadCloud</Link></div>
    </nav>
  );
};

const AuthModalProvider = ({ children }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('login');
  const [showWelcome, setShowWelcome] = useState(false);

  const openAuthModal = (mode = 'login', welcome = false) => {
    setModalMode(mode);
    setShowWelcome(welcome);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setShowWelcome(false);
  };

  return (
    <AuthModalContext.Provider value={{ openAuthModal }}>
      {children}
      <AnimatePresence>
        {modalOpen && <AuthModal isOpen={modalOpen} onClose={closeModal} mode={modalMode} showWelcome={showWelcome} />}
      </AnimatePresence>
    </AuthModalContext.Provider>
  );
};

const useAuthModal = () => useContext(AuthModalContext);

const HeroSection = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <motion.div 
      className="hero"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="hero-content">
        <motion.h1 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Your Personal Cloud Library
        </motion.h1>
        <motion.p 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Discover, track, and organize your reading journey in one beautiful space
        </motion.p>
        <motion.form 
          onSubmit={handleSubmit} 
          className="search-form"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <input type="text" placeholder="Search by title, author, or ISBN..." value={query} onChange={(e) => setQuery(e.target.value)} className="search-input" />
          <button type="submit" className="search-btn">Search Books</button>
        </motion.form>
      </div>
      <motion.div 
        className="hero-decoration"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        <div className="book-stack">📚</div>
      </motion.div>
    </motion.div>
  );
};

const FeaturesSection = () => {
  const features = [
    { icon: '🔍', title: 'Discover Books', desc: 'Search millions of titles with Google Books API' },
    { icon: '📖', title: 'Track Progress', desc: 'Monitor your reading journey page by page' },
    { icon: '📝', title: 'Take Notes', desc: 'Save quotes and thoughts for every book' },
    { icon: '🎯', title: 'Set Goals', desc: 'Achieve your annual reading targets' }
  ];

  return (
    <motion.div 
      className="features-section"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
    >
      <h2>Everything You Need to Love Reading</h2>
      <div className="features-grid">
        {features.map((feature, index) => (
          <motion.div 
            key={index} 
            className="feature-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <span className="feature-icon">{feature.icon}</span>
            <h3>{feature.title}</h3>
            <p>{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const TrendingBooksCarousel = () => {
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [constraints, setConstraints] = useState({ left: 0, right: 0 });
  const containerRef = useRef(null);
  const { user } = useContext(AuthContext);
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    fetchTrendingBooks();
  }, []);

  useEffect(() => {
    if (!loading && trendingBooks.length > 0 && containerRef.current) {
      const updateConstraints = () => {
        const container = containerRef.current;
        if (container) {
          const carouselWidth = container.scrollWidth;
          const viewportWidth = container.parentElement?.offsetWidth || 800;
          const scrollableDistance = carouselWidth - viewportWidth + 32;
          setConstraints({ left: -Math.max(0, scrollableDistance), right: 0 });
        }
      };
      updateConstraints();
      window.addEventListener('resize', updateConstraints);
      return () => window.removeEventListener('resize', updateConstraints);
    }
  }, [loading, trendingBooks]);

  const fetchTrendingBooks = async () => {
    setLoading(true);
    const subjects = ['fiction', 'technology', 'science', 'history', 'biography'];
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/books/search?q=${randomSubject}&maxResults=12`);
      const data = await response.json();
      const books = Array.isArray(data) ? data.slice(0, 10) : [];
      setTrendingBooks(books);
    } catch (error) {
      console.error('Trending books error:', error);
      setTrendingBooks([]);
    }
    setLoading(false);
  };

  const addToLibrary = async (book) => {
    if (!user || !localStorage.getItem('token')) {
      if (openAuthModal) openAuthModal('login', true);
      return;
    }
    if (!book.id) {
      toast.error('Invalid book data');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/library`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          googleBooksId: book.id,
          title: book.volumeInfo?.title || 'Unknown Title',
          authors: book.volumeInfo?.authors || ['Unknown Author'],
          description: book.volumeInfo?.description || '',
          thumbnail: book.volumeInfo?.imageLinks?.thumbnail || '',
          pageCount: book.volumeInfo?.pageCount || 0
        })
      });
      if (res.ok) {
        toast.success('Added to library! ✅');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to add book');
      }
    } catch (error) { 
      console.error('Error adding book:', error);
      toast.error('Failed to add book');
    }
  };

  if (loading) {
    return (
      <div className="trending-section">
        <div className="trending-header">
          <h2>Trending Books</h2>
        </div>
        <div className="trending-carousel-container">
          <div className="trending-carousel">
            {[1,2,3,4,5].map(i => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (trendingBooks.length === 0) return null;

  return (
    <div className="trending-section">
      <div className="trending-header">
        <h2>Trending Now</h2>
        <p>Discover popular books everyone's reading</p>
      </div>
      <div className="trending-carousel-container">
        <motion.div 
          ref={containerRef}
          className="trending-carousel"
          drag="x"
          dragConstraints={constraints}
          dragElastic={0.1}
          whileDrag={{ cursor: "grabbing" }}
        >
          {trendingBooks.map((book, index) => (
            <motion.div
              key={book.id}
              className="trending-card"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -8, boxShadow: '0 12px 40px rgba(59, 50, 41, 0.18)' }}
            >
              <Link to={`/book/${book.id}`}>
                <img 
                  src={book.volumeInfo?.imageLinks?.thumbnail || 'https://via.placeholder.com/128x192?text=No+Cover'} 
                  alt={book.volumeInfo?.title} 
                />
              </Link>
              <div className="trending-card-info">
                <h4 className="trending-title">{book.volumeInfo?.title}</h4>
                <p className="trending-author">{book.volumeInfo?.authors?.join(', ')}</p>
                {book.volumeInfo?.averageRating && (
                  <span className="trending-rating">⭐ {book.volumeInfo.averageRating}</span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton skeleton-image"></div>
    <div className="skeleton-content">
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-author"></div>
    </div>
  </div>
);

const SkeletonLibraryCard = () => (
  <div className="skeleton-library-card">
    <div className="skeleton skeleton-cover"></div>
    <div className="skeleton-card-body">
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text-short"></div>
      <div className="skeleton skeleton-badge"></div>
    </div>
  </div>
);

const SkeletonStatCard = () => (
  <div className="skeleton-stat-card">
    <div className="skeleton skeleton-icon"></div>
    <div className="skeleton skeleton-value"></div>
    <div className="skeleton skeleton-label"></div>
  </div>
);

const CircularProgress = ({ percentage, current, target }) => {
  const radius = 54;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="circular-progress">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle
          className="progress-bg"
          cx="70"
          cy="70"
          r={radius}
          strokeWidth={stroke}
        />
        <motion.circle
          className="progress-fill"
          cx="70"
          cy="70"
          r={radius}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ strokeLinecap: "round" }}
        />
      </svg>
      <div className="circular-progress-text">
        <span className="progress-fraction">{current} of {target}</span>
        <span className="progress-percent">{percentage}%</span>
      </div>
    </div>
  );
};

const BookCard = ({ book, onAdd, showDetailsLink = true }) => {
  return (
    <motion.div 
      className="book-card"
      whileHover={{ y: -8, boxShadow: '0 12px 40px rgba(59, 50, 41, 0.18)' }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      {showDetailsLink ? (
        <Link to={`/book/${book.id}`} className="book-cover-link">
          <img src={book.volumeInfo?.imageLinks?.thumbnail || 'https://via.placeholder.com/128x192?text=No+Cover'} alt={book.volumeInfo?.title} />
        </Link>
      ) : (
        <img src={book.thumbnail || 'https://via.placeholder.com/128x192?text=No+Cover'} alt={book.title} />
      )}
      <div className="book-info">
        <h4 className="book-title">{showDetailsLink ? book.volumeInfo?.title : book.title}</h4>
        <p className="book-author">{showDetailsLink ? book.volumeInfo?.authors?.join(', ') : book.authors?.join(', ')}</p>
            {showDetailsLink && (
              <div className="book-meta">
                {book.volumeInfo?.pageCount && <span>📄 {book.volumeInfo.pageCount} pages</span>}
                {book.volumeInfo?.averageRating && <span>⭐ {book.volumeInfo.averageRating}</span>}
              </div>
            )}
            <button className="add-btn" onClick={onAdd}><span>+</span> Add to Library</button>
      </div>
    </motion.div>
  );
};

const LibraryBookCard = React.forwardRef(({ book, onStatusChange, onRemove }, ref) => {
  const progress = book.percentComplete || Math.round((book.currentPage / (book.pageCount || 1)) * 100) || 0;
  const showProgress = book.status === 'reading' || (book.currentPage > 0 && book.status !== 'finished');
  
  return (
    <motion.div 
      ref={ref}
      className="library-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03, rotateY: 3, rotateX: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      layout
    >
      <Link to={`/library/${book._id}`} className="library-card-image-link">
        <img src={book.thumbnail || 'https://via.placeholder.com/100x150?text=No+Cover'} alt={book.title} />
      </Link>
      <div className="library-card-content">
        <div className="library-card-text">
          <Link to={`/library/${book._id}`} className="library-book-title">{book.title}</Link>
          <p className="library-book-author">{book.authors?.join(', ')}</p>
        </div>
        <span className={`status-badge status-${book.status}`}>
          {book.status === 'to-read' ? 'To Read' : book.status === 'reading' ? 'Reading' : book.status === 'finished' ? 'Finished' : 'Paused'}
        </span>
        {showProgress && progress > 0 && (
          <div className="library-progress">
            <div className="progress-bar-mini">
              <div className="progress-fill-mini" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="progress-text">{progress}% complete</span>
          </div>
        )}
        <div className="library-actions">
          <select value={book.status} onChange={(e) => onStatusChange(book._id, e.target.value)} className="status-select">
            <option value="to-read">To Read</option>
            <option value="reading">Reading</option>
            <option value="paused">Paused</option>
            <option value="finished">Finished</option>
          </select>
          <button className="remove-btn" onClick={() => onRemove(book._id)}>Remove</button>
        </div>
      </div>
    </motion.div>
  );
});

const SearchPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [query, setQuery] = useState('');
  const { user } = useContext(AuthContext);
  const { openAuthModal } = useAuthModal();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('search');
    if (q) {
      setSearchQuery(q);
      performSearch(q);
    }
  }, []);

  const performSearch = async (searchTerm) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/books/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      const results = Array.isArray(data) ? data : [];
      setResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    }
    setLoading(false);
  };

  const handleSearch = (searchTerm) => {
    if (searchTerm && searchTerm.trim()) {
      setSearchQuery(searchTerm);
      navigate(`/?search=${encodeURIComponent(searchTerm)}`);
      performSearch(searchTerm);
    }
  };

  const addToLibrary = async (book) => {
    if (!user || !localStorage.getItem('token')) {
      if (openAuthModal) {
        openAuthModal('login', true);
      }
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/library`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          googleBooksId: book.id,
          title: book.volumeInfo?.title || 'Unknown Title',
          authors: book.volumeInfo?.authors || ['Unknown Author'],
          description: book.volumeInfo?.description || '',
          thumbnail: book.volumeInfo?.imageLinks?.thumbnail || '',
          pageCount: book.volumeInfo?.pageCount || 0
        })
      });
      if (response.ok) {
        toast.success('Book added to your library! ✅');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to add book');
      }
    } catch (error) {
      toast.error('Error adding book');
    }
  };

  return (
    <div className="page">
      <HeroSection onSearch={handleSearch} />
      {!hasSearched && <TrendingBooksCarousel />}
      <FeaturesSection />
      {hasSearched && (
        <motion.div 
          id="search-results"
          className="search-results"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2>Search Results for "{searchQuery}"</h2>
          {loading ? (
            <div className="results-grid">
              {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : results.length > 0 ? (
            <div className="results-grid">
              {results.map((book) => (
                <BookCard key={book.id} book={book} onAdd={() => addToLibrary(book)} />
              ))}
            </div>
          ) : (
            <p className="no-results">No books found. Try a different search.</p>
          )}
        </motion.div>
      )}
    </div>
  );
};

const StarRating = ({ rating, onRatingChange, readonly = false }) => {
  const [hover, setHover] = useState(0);
  
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.span
          key={star}
          className={`star ${star <= (hover || rating) ? 'filled' : ''}`}
          onClick={() => !readonly && onRatingChange(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          whileHover={!readonly ? { scale: 1.2 } : {}}
          whileTap={!readonly ? { scale: 0.9 } : {}}
        >
          ★
        </motion.span>
      ))}
    </div>
  );
};

const CelebrationOverlay = ({ isOpen, onClose, onLeaveReview }) => {
  if (!isOpen) return null;
  
  return (
    <motion.div 
      className="celebration-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="celebration-modal"
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <div className="celebration-icon">🎉</div>
        <h2>Congratulations!</h2>
        <p>You've finished this book! Would you like to leave a review?</p>
        <div className="celebration-buttons">
          <motion.button 
            className="review-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLeaveReview}
          >
            Leave a Review
          </motion.button>
          <button className="skip-btn" onClick={onClose}>Maybe Later</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const NotePanel = ({ notes, onAddNote, onDeleteNote, isOpen, onToggle }) => {
  const [newNote, setNewNote] = useState('');
  const [pageNumber, setPageNumber] = useState('');
  const [isQuote, setIsQuote] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newNote.trim()) {
      onAddNote({ content: newNote, pageNumber: pageNumber || null, isQuote });
      setNewNote('');
      setPageNumber('');
      setIsQuote(false);
    }
  };

  return (
    <>
      <motion.button 
        className="note-panel-toggle"
        onClick={onToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        📝 Notes ({notes.length})
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="note-panel"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="note-panel-header">
              <h3>Your Notes</h3>
              <button className="close-panel" onClick={onToggle}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="note-form">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write your thoughts..."
                rows={3}
              />
              <div className="note-options">
                <input
                  type="number"
                  placeholder="Page #"
                  value={pageNumber}
                  onChange={(e) => setPageNumber(e.target.value)}
                  className="page-input"
                />
                <label className="quote-checkbox">
                  <input
                    type="checkbox"
                    checked={isQuote}
                    onChange={(e) => setIsQuote(e.target.checked)}
                  />
                  It's a quote
                </label>
              </div>
              <motion.button 
                type="submit"
                className="add-note-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!newNote.trim()}
              >
                Add Note
              </motion.button>
            </form>
            
            <div className="notes-list">
              {notes.length === 0 ? (
                <p className="no-notes">No notes yet. Start writing!</p>
              ) : (
                notes.map((note) => (
                  <motion.div 
                    key={note._id} 
                    className={`note-card ${note.isQuote ? 'quote-note' : ''}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {note.pageNumber && <span className="note-page">Page {note.pageNumber}</span>}
                    <p>{note.content}</p>
                    <span className="note-date">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                    <button 
                      className="delete-note"
                      onClick={() => onDeleteNote(note._id)}
                    >
                      🗑️
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const BookDetailsPage = () => {
  const { id } = useParams();
  const [libraryBook, setLibraryBook] = useState(null);
  const [googleBook, setGoogleBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [review, setReview] = useState(null);
  const [notePanelOpen, setNotePanelOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  
  const { user } = useContext(AuthContext);
  const { openAuthModal } = useAuthModal();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookData();
  }, [id]);

  const fetchBookData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Check if this is a MongoDB ObjectId (24 chars) - private library route
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
      
      if (isMongoId && token) {
        // Private route: /library/:id - fetch from user's library
        const libraryRes = await fetch(`${API_BASE_URL}/api/library/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (libraryRes.ok) {
          const libraryData = await libraryRes.json();
          setLibraryBook(libraryData);
          setCurrentPage(libraryData.currentPage || 0);
          
          const [notesRes, reviewRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/notes/book/${id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_BASE_URL}/api/reviews/book/${id}`, { headers: { 'Authorization': `Bearer ${token}` } })
          ]);
          
          const notesData = await notesRes.json();
          const reviewData = await reviewRes.json();
          setNotes(notesData || []);
          setReview(reviewData);
          if (reviewData) {
            setReviewRating(reviewData.rating);
            setReviewText(reviewData.reviewText || '');
          }
        }
      } else {
        // Public route: /book/:googleBooksId - fetch from Google Books API by ID
        const googleRes = await fetch(`${API_BASE_URL}/api/books/${id}`);
        const googleData = await googleRes.json();
        if (googleData && googleData.id) {
          setGoogleBook(googleData);
        }
      }
    } catch (error) {
      console.error('Error fetching book:', error);
    }
    setLoading(false);
  };

  const updateProgress = async (newPage) => {
    if (!libraryBook) return;
    
    const validPageCount = libraryBook.pageCount || 1;
    if (newPage < 0) {
      toast.error('Page number cannot be negative');
      return;
    }
    if (newPage > validPageCount) {
      toast.error(`Current page cannot exceed total pages (${validPageCount})`);
      setCurrentPage(validPageCount);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const status = newPage >= validPageCount ? 'finished' : 
                     newPage > 0 ? 'reading' : libraryBook.status;
      
      const response = await fetch(`${API_BASE_URL}/api/library/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status, currentPage: newPage })
      });
      
      if (response.ok) {
        const updated = await response.json();
        setLibraryBook(updated);
        
        if (status === 'finished' && libraryBook.status !== 'finished') {
          setShowCelebration(true);
        }
        
        const userRes = await fetch(`${API_BASE_URL}/api/auth/profile`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        const userData = await userRes.json();
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update progress');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update reading progress');
    }
  };

  const handlePageChange = (e) => {
    const newPage = parseInt(e.target.value) || 0;
    setCurrentPage(newPage);
  };

  const handlePageBlur = () => {
    if (!libraryBook) return;
    const maxPage = libraryBook.pageCount || 999;
    const validPage = Math.max(0, Math.min(currentPage, maxPage));
    setCurrentPage(validPage);
    updateProgress(validPage);
  };

  const addNote = async (noteData) => {
    if (!noteData.content || !noteData.content.trim()) {
      toast.error('Please enter note content');
      return;
    }
    if (noteData.content.length > 2000) {
      toast.error('Note cannot exceed 2000 characters');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/notes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ libraryBookId: id, ...noteData })
      });
      
      if (response.ok) {
        const newNote = await response.json();
        setNotes([newNote, ...notes]);
        toast.success('Note added!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to add note');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  const deleteNote = async (noteId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setNotes(notes.filter(n => n._id !== noteId));
        toast.info('Note deleted');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const submitReview = async () => {
    if (reviewRating < 1 || reviewRating > 5) {
      toast.error('Please select a rating between 1 and 5 stars');
      return;
    }
    if (reviewText && reviewText.length > 2000) {
      toast.error('Review cannot exceed 2000 characters');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ libraryBookId: id, rating: reviewRating, reviewText })
      });
      
      if (response.ok) {
        const newReview = await response.json();
        setReview(newReview);
        setShowReviewForm(false);
        toast.success('Review saved!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to save review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Error saving review');
    }
  };

  const addToLibrary = async () => {
    if (!user || !localStorage.getItem('token')) {
      if (openAuthModal) openAuthModal('login', true);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const bookToAdd = googleBook;
      const response = await fetch(`${API_BASE_URL}/api/library`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          googleBooksId: bookToAdd.id,
          title: bookToAdd.volumeInfo?.title,
          authors: bookToAdd.volumeInfo?.authors,
          description: bookToAdd.volumeInfo?.description,
          thumbnail: bookToAdd.volumeInfo?.imageLinks?.thumbnail,
          pageCount: bookToAdd.volumeInfo?.pageCount || 0
        })
      });
      
      if (response.ok) {
        toast.success('Book added to library!');
        fetchBookData();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to add book');
      }
    } catch (error) {
      toast.error('Error adding book');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!libraryBook && !googleBook) return <div className="loading">Book not found</div>;

  const isInLibrary = !!libraryBook;
  const displayBook = libraryBook || googleBook;
  // Google Books API returns { volumeInfo: {...} }, library returns flat object
  const info = displayBook?.volumeInfo || {};
  const progress = libraryBook ? Math.round((libraryBook.currentPage / (libraryBook.pageCount || 1)) * 100) || 0 : 0;

  return (
    <motion.div 
      className="book-details-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <CelebrationOverlay 
        isOpen={showCelebration} 
        onClose={() => setShowCelebration(false)}
        onLeaveReview={() => {
          setShowCelebration(false);
          setShowReviewForm(true);
        }}
      />
      
      <div className="book-details-container">
        <div className="book-details-nav">
          <Link to={isInLibrary ? "/library" : "/"} className="back-link">← Back to {isInLibrary ? "Library" : "Search"}</Link>
        </div>
        
        <div className="book-details-content">
          <motion.div 
            className="book-details-left"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.img 
              src={displayBook?.thumbnail || info?.imageLinks?.thumbnail?.replace('http:', 'https:') || 'https://via.placeholder.com/200x300?text=No+Cover'} 
              alt={displayBook?.title || info?.title}
              whileHover={{ scale: 1.05 }}
              className="book-cover-large"
            />
          </motion.div>

          <motion.div 
            className="book-details-right"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h1>{displayBook?.title || info?.title}</h1>
            <h3>{(displayBook?.authors || info?.authors)?.join(', ')}</h3>
            
            {libraryBook && (
              <div className="progress-hub">
                <div className="progress-header">
                  <span className={`status-badge status-${libraryBook.status}`}>
                    {libraryBook.status === 'to-read' ? 'To Read' : 
                     libraryBook.status === 'reading' ? 'Reading' : 
                     libraryBook.status === 'finished' ? 'Finished' : 'Paused'}
                  </span>
                  <span className="progress-percent">{progress}%</span>
                </div>
                <div className="progress-bar-large">
                  <motion.div 
                    className="progress-fill-large"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="progress-controls">
                  <input
                    type="range"
                    min="0"
                    max={libraryBook.pageCount || 100}
                    value={currentPage}
                    onChange={handlePageChange}
                    onMouseUp={handlePageBlur}
                    onTouchEnd={handlePageBlur}
                    className="progress-slider"
                  />
                  <div className="page-input-group">
                    <input
                      type="number"
                      value={currentPage}
                      onChange={handlePageChange}
                      onBlur={handlePageBlur}
                      min="0"
                      max={libraryBook.pageCount}
                      className="page-number-input"
                    />
                    <span>/ {libraryBook.pageCount || '?'} pages</span>
                  </div>
                </div>
              </div>
            )}
            
            {(libraryBook?.description || info?.description) && (
              <p className="book-description">{libraryBook?.description || info?.description}</p>
            )}

            {!libraryBook ? (
              <motion.button 
                className="add-btn-large"
                onClick={addToLibrary}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>+</span> Add to Library
              </motion.button>
            ) : (
              <div className="library-actions-detail">
                <select 
                  value={libraryBook.status} 
                  onChange={(e) => updateProgress(e.target.value === 'finished' ? libraryBook.pageCount : currentPage)}
                  className="status-select-large"
                >
                  <option value="to-read">To Read</option>
                  <option value="reading">Reading</option>
                  <option value="paused">Paused</option>
                  <option value="finished">Finished</option>
                </select>
              </div>
            )}
          </motion.div>
        </div>

        {libraryBook && (
          <div className="book-details-sections">
            <div className="review-section">
              <h3>Your Review</h3>
              {showReviewForm || !review ? (
                <div className="review-form">
                  <StarRating rating={reviewRating} onRatingChange={setReviewRating} />
                  <textarea
                    placeholder="Write your review..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={4}
                  />
                  <motion.button 
                    className="submit-review-btn"
                    onClick={submitReview}
                    disabled={reviewRating === 0}
                    whileHover={{ scale: 1.02 }}
                  >
                    Save Review
                  </motion.button>
                </div>
              ) : (
                <div className="review-display">
                  <StarRating rating={review.rating} readonly />
                  <p>{review.reviewText || 'No written review.'}</p>
                  <button 
                    className="edit-review-btn"
                    onClick={() => setShowReviewForm(true)}
                  >
                    Edit Review
                  </button>
                </div>
              )}
            </div>
            
            <NotePanel
              notes={notes}
              onAddNote={addNote}
              onDeleteNote={deleteNote}
              isOpen={notePanelOpen}
              onToggle={() => setNotePanelOpen(!notePanelOpen)}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

const LibraryPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchLibrary();
  }, [location.pathname]);

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/library`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      setBooks(data || []);
    } catch (error) { console.error('Fetch library error:', error); }
    setLoading(false);
  };

  const updateStatus = async (bookId, status) => {
    const validStatuses = ['to-read', 'reading', 'paused', 'finished'];
    if (!validStatuses.includes(status)) {
      toast.error('Invalid status. Must be: To-Read, Reading, Paused, or Finished');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/library/${bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update status');
        return;
      }
      
      const updatedBook = await response.json();
      fetchLibrary();
      
      if (status === 'finished') {
        toast.success('Congratulations on finishing the book! 🎉');
        const userResponse = await fetch(`${API_BASE_URL}/api/auth/profile`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        const userData = await userResponse.json();
        localStorage.setItem('user', JSON.stringify(userData));
        navigate('/dashboard');
      }
    } catch (error) { 
      console.error('Update status error:', error);
      toast.error('Failed to update book status');
    }
  };

  const removeBook = async (bookId) => {
    toast.info(
      <div>
        <p>Remove this book from your library?</p>
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
          <button 
            onClick={async () => {
              toast.dismiss();
              try {
                const token = localStorage.getItem('token');
                await fetch(`${API_BASE_URL}/api/library/${bookId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                fetchLibrary();
                toast.success('Book removed from library');
              } catch (error) { console.error('Remove book error:', error); }
            }}
            style={{ padding: '5px 15px', background: '#B85C5C', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Yes, Remove
          </button>
          <button 
            onClick={() => toast.dismiss()}
            style={{ padding: '5px 15px', background: '#ccc', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      </div>,
      { autoClose: false }
    );
  };

  const filteredBooks = filter === 'all' ? books : books.filter(book => book.status === filter);

  const filterOptions = [
    { key: 'all', label: 'All', count: books.length },
    { key: 'reading', label: 'Reading', count: books.filter(b => b.status === 'reading').length },
    { key: 'to-read', label: 'To Read', count: books.filter(b => b.status === 'to-read').length },
    { key: 'finished', label: 'Finished', count: books.filter(b => b.status === 'finished').length },
  ];

  return (
    <div className="page">
      <div className="library-header">
        <h2>My Library</h2>
        <motion.div className="filter-tabs" layout>
          {filterOptions.map((f) => (
            <motion.button
              key={f.key}
              className={`filter-pill ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              layout
            >
              <span className="filter-label">{f.label}</span>
              <span className="filter-count">{f.count}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {loading ? (
        <div className="library-grid">
          {[1,2,3,4,5,6].map(i => <SkeletonLibraryCard key={i} />)}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>Your Library is Empty</h3>
          <p>Start by searching for books and adding them to your collection</p>
          <Link to="/" className="empty-cta">Discover Books</Link>
        </div>
      ) : (
        <motion.div 
          className="library-grid"
          layout
        >
          <AnimatePresence mode="popLayout">
            {filteredBooks.map((book) => (
              <LibraryBookCard key={book._id} book={book} onStatusChange={updateStatus} onRemove={removeBook} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

const DashboardPage = () => {
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalTarget, setGoalTarget] = useState(0);
  const [isSavingGoal, setIsSavingGoal] = useState(false);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/library/dashboard-stats`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      setStats(data);
    } catch (error) { console.error('Fetch dashboard error:', error); }
    setLoading(false);
  };

  const updateGoal = async () => {
    if (!Number.isInteger(goalTarget)) {
      toast.error('Reading goal must be a whole number');
      return;
    }
    if (goalTarget < 1) {
      toast.error('Reading goal must be at least 1 book');
      return;
    }
    if (goalTarget > 999) {
      toast.error('Reading goal cannot exceed 999 books');
      return;
    }
    
    const previousGoal = user?.readingGoal;
    const optimisticGoal = { ...previousGoal, target: goalTarget };
    
    setIsSavingGoal(true);
    
    updateUser({ ...user, readingGoal: optimisticGoal });
    setIsEditingGoal(false);
    
    try {
      const token = localStorage.getItem('token');
      const startTime = performance.now();
      const response = await fetch(`${API_BASE_URL}/api/auth/goal`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ target: goalTarget })
      });
      const endTime = performance.now();
      console.log(`[Frontend] Goal update took ${Math.round(endTime - startTime)}ms`);
      
      const data = await response.json();
      
      if (response.ok) {
        updateUser({ ...user, readingGoal: data });
        fetchDashboard();
        toast.success('Reading goal updated! 🎯');
      } else {
        updateUser({ ...user, readingGoal: previousGoal });
        toast.error(data.message || 'Failed to update goal');
      }
    } catch (error) { 
      console.error('Update goal error:', error);
      updateUser({ ...user, readingGoal: previousGoal });
      toast.error('Failed to update goal. Please try again.');
    }
    setIsSavingGoal(false);
  };

  const startEditingGoal = () => {
    setGoalTarget(goal.target);
    setIsEditingGoal(true);
  };

  if (loading) {
    return (
      <motion.div className="dashboard-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="parallax-bg"></div>
        <div className="dashboard-content">
          <div className="skeleton skeleton-title-large"></div>
          <div className="skeleton skeleton-continue-card"></div>
          <div className="skeleton skeleton-goal-card"></div>
          <div className="stats-row">
            {[1,2,3,4].map(i => <SkeletonStatCard key={i} />)}
          </div>
          <div className="skeleton skeleton-charts"></div>
        </div>
      </motion.div>
    );
  }
  if (!stats) return <div className="loading">Failed to load dashboard</div>;

  const goal = user?.readingGoal || { target: 12, current: 0, year: new Date().getFullYear() };
  const progress = goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0;

  return (
    <motion.div 
      className="dashboard-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="parallax-bg"></div>
      
      <div className="dashboard-content">
        <motion.h2 
          className="dashboard-title"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          Your Reading Dashboard
        </motion.h2>

        {stats.continueReading && (
          <motion.div 
            className="continue-card"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate(`/library/${stats.continueReading.id}`)}
          >
            <div className="continue-card-content">
              <span className="continue-label">Continue Reading</span>
              <h3>{stats.continueReading.title}</h3>
              <div className="continue-progress">
                <div className="continue-progress-bar">
                  <motion.div 
                    className="continue-progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.continueReading.percentComplete}%` }}
                    transition={{ delay: 0.5, duration: 1 }}
                  />
                </div>
                <span>{stats.continueReading.percentComplete}% complete</span>
              </div>
              <button className="resume-btn">Resume Reading →</button>
            </div>
            {stats.continueReading.thumbnail && (
              <img src={stats.continueReading.thumbnail} alt={stats.continueReading.title} className="continue-thumb" />
            )}
          </motion.div>
        )}

        <motion.div 
          className="goal-card"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <div className="goal-card-layout">
            <div className="goal-card-info">
              <div className="goal-card-header">
                <h3>📖 {goal.year} Reading Goal</h3>
                {!isEditingGoal && (
                  <button className="goal-edit-btn" onClick={startEditingGoal}>✏️ Edit</button>
                )}
              </div>
              {isEditingGoal ? (
                <div className="goal-edit-form">
                  <input 
                    type="number" 
                    value={goalTarget} 
                    onChange={(e) => setGoalTarget(Number(e.target.value))}
                    min="1"
                    max="365"
                    disabled={isSavingGoal}
                  />
                  <span>books</span>
                  <motion.button 
                    className="goal-save-btn"
                    onClick={updateGoal}
                    disabled={isSavingGoal}
                    whileHover={!isSavingGoal ? { scale: 1.05 } : {}}
                    whileTap={!isSavingGoal ? { scale: 0.95 } : {}}
                  >
                    {isSavingGoal ? '...' : 'Save'}
                  </motion.button>
                  <motion.button 
                    className="goal-cancel-btn"
                    onClick={() => setIsEditingGoal(false)}
                    disabled={isSavingGoal}
                    whileHover={!isSavingGoal ? { scale: 1.05 } : {}}
                    whileTap={!isSavingGoal ? { scale: 0.95 } : {}}
                  >
                    Cancel
                  </motion.button>
                </div>
              ) : (
                <p className="goal-subtitle">Keep up the great work!</p>
              )}
            </div>
            <CircularProgress 
              percentage={progress} 
              current={goal.current} 
              target={goal.target} 
            />
          </div>
        </motion.div>

        <div className="stats-row">
          {[
            { icon: '📚', value: stats.totalBooks, label: 'Total Books', color: '#4A90A4' },
            { icon: '✅', value: stats.booksFinished, label: 'Finished', color: '#5D9B84' },
            { icon: '📖', value: stats.currentlyReading, label: 'Reading', color: '#E8A87C' },
            { icon: '🔥', value: stats.currentStreak, label: 'Day Streak', color: '#D64550' }
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              className="stat-tilt-card"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              whileHover={{ scale: 1.05, rotateY: 5, rotateX: -5 }}
            >
              <div className="stat-glow" style={{ background: stat.color }}></div>
              <span className="stat-icon">{stat.icon}</span>
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="charts-section">
          <motion.div 
            className="chart-card"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h3>Monthly Activity</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.monthlyActivity}>
                <Bar dataKey="count" fill="#8B7355" radius={[8, 8, 0, 0]} />
                <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 12 }} />
                <YAxis tick={{ fill: '#666', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div 
            className="chart-card"
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <h3>Genre Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.genreDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.genreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#8B7355', '#5D9B84', '#4A90A4', '#E8A87C', '#D64550'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <motion.div 
          className="activity-feed"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h3>Recent Activity</h3>
          <div className="timeline">
            {stats.recentActivity.length === 0 ? (
              <p className="no-activity">No recent activity. Start reading!</p>
            ) : (
              stats.recentActivity.map((activity, i) => (
                <motion.div 
                  key={i} 
                  className="timeline-item"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                >
                  <div className={`timeline-icon ${activity.type}`}>
                    {activity.type === 'finished' ? '🎉' : '📖'}
                  </div>
                  <div className="timeline-content">
                    <p>
                      {activity.type === 'finished' 
                        ? `Finished "${activity.title}"` 
                        : `Updated progress on "${activity.title}"`}
                    </p>
                    <span>{new Date(activity.date).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const Auth = ({ type }) => {
  const [formData, setFormData] = useState({ email: '', password: '', displayName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const validateForm = () => {
    if (type === 'register') {
      if (!formData.displayName || !formData.displayName.trim()) {
        setError('Please enter your display name');
        return false;
      }
      if (formData.displayName.length > 50) {
        setError('Display name cannot exceed 50 characters');
        return false;
      }
    }
    if (!formData.email || !formData.email.trim()) {
      setError('Please enter your email');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setLoading(true);
    const endpoint = type === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = type === 'login' ? { email: formData.email.trim(), password: formData.password } : { email: formData.email.trim(), password: formData.password, displayName: formData.displayName.trim() };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await response.json();
      if (response.ok) { 
        login(data, data.token); 
        toast.success(type === 'login' ? 'Welcome back!' : 'Account created successfully! 🎉');
        navigate('/library'); 
      } else { 
        setError(data.message || 'Authentication failed'); 
        toast.error(data.message || 'Authentication failed');
      }
    } catch (err) { 
      setError('Server error. Please try again.'); 
      toast.error('Server error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <motion.div className="auth-container" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <div className="auth-header"><h1>ReadCloud</h1><p>{type === 'login' ? 'Welcome back!' : 'Create your account'}</p></div>
        <form onSubmit={onSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          {type === 'register' && (
            <div className="form-group">
              <label>Display Name</label>
              <input 
                type="text" 
                value={formData.displayName} 
                onChange={(e) => setFormData({...formData, displayName: e.target.value})} 
                placeholder="Your name" 
                maxLength={50}
                required 
              />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              placeholder="your@email.com" 
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
              placeholder="••••••••" 
              minLength={6}
              required 
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>{loading ? 'Please wait...' : type === 'login' ? 'Sign In' : 'Create Account'}</button>
        </form>
        <div className="auth-footer">
          {type === 'login' ? <p>Don't have an account? <Link to="/register">Sign up</Link></p> : <p>Already have an account? <Link to="/login">Sign in</Link></p>}
        </div>
      </motion.div>
    </div>
  );
};

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useContext(AuthContext);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="app">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover style={{ zIndex: 99999 }} />
      <Navbar onMenuClick={toggleSidebar} sidebarOpen={sidebarOpen} />
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <div className="app-content-wrapper">
        <div className="main-content">
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/book/:id" element={<BookDetailsPage />} />
            <Route path="/login" element={<PublicRoute><Auth type="login" /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Auth type="register" /></PublicRoute>} />
            <Route path="/library" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
            <Route path="/library/:id" element={<ProtectedRoute><BookDetailsPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AuthModalProvider>
          <AppContent />
        </AuthModalProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
