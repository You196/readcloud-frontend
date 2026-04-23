// pages/MyLibraryPage.jsx
// Personal Library Page — Youssef 226447
// Composes all library sub-components.
// Route: /my-library (protected)

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import './MyLibrary.css';

import LibraryBookCard   from '../components/library/LibraryBookCard';
import LibrarySearchBar  from '../components/library/LibrarySearchBar';
import LibraryFilters    from '../components/library/LibraryFilters';
import LibraryPagination from '../components/library/LibraryPagination';
import LibraryStats      from '../components/library/LibraryStats';

import {
  fetchMyLibrary,
  fetchMyLibraryStats,
  updateMyBookStatus,
  removeMyBook,
} from '../services/libraryAPI';

const LIMIT = 10;

// Skeleton card — reuses existing CSS classes
const SkeletonCard = () => (
  <div className="skeleton-library-card">
    <div className="skeleton skeleton-cover" />
    <div className="skeleton-card-body">
      <div className="skeleton skeleton-text" />
      <div className="skeleton skeleton-text-short" />
      <div className="skeleton skeleton-badge" />
    </div>
  </div>
);

const MyLibraryPage = () => {
  // ── Server data ────────────────────────────────────────────────────────────
  const [books, setBooks]           = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ── Filter / search / pagination ───────────────────────────────────────────
  const [currentPage, setCurrentPage]   = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTitle, setSearchTitle]   = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');

  // Debounced values — we only fire a fetch after the user stops typing 400ms
  const [debouncedTitle, setDebouncedTitle]   = useState('');
  const [debouncedAuthor, setDebouncedAuthor] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedTitle(searchTitle);  setCurrentPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchTitle]);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedAuthor(searchAuthor); setCurrentPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchAuthor]);

  // ── Fetch books ────────────────────────────────────────────────────────────
  const loadBooks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMyLibrary({
        page:        currentPage,
        limit:       LIMIT,
        status:      statusFilter,
        searchTitle: debouncedTitle,
        searchAuthor: debouncedAuthor,
      });
      setBooks(data.books      || []);
      setTotalBooks(data.totalBooks || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('MyLibraryPage loadBooks:', err);
      toast.error('Failed to load your library');
    }
    setLoading(false);
  }, [currentPage, statusFilter, debouncedTitle, debouncedAuthor]);

  useEffect(() => { loadBooks(); }, [loadBooks]);

  // ── Fetch stats (once on mount, refresh after mutations) ──────────────────
  const loadStats = async () => {
    try {
      const data = await fetchMyLibraryStats();
      setStats(data);
    } catch (err) {
      console.error('MyLibraryPage loadStats:', err);
    }
  };

  useEffect(() => { loadStats(); }, []);

  // ── Status change ──────────────────────────────────────────────────────────
  const handleStatusChange = async (bookId, status) => {
    try {
      await updateMyBookStatus(bookId, status);
      if (status === 'finished') {
        toast.success('Congratulations on finishing the book! 🎉');
        // Refresh the stored user profile so the reading goal counter is fresh
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
          || 'https://readcloud-bue-crgcb6ffbxghfhfy.germanywestcentral-01.azurewebsites.net';
        const profileRes  = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        const profileData = await profileRes.json();
        localStorage.setItem('user', JSON.stringify(profileData));
      } else {
        toast.success('Status updated');
      }
      loadBooks();
      loadStats();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  // ── Remove book ────────────────────────────────────────────────────────────
  const handleRemove = (bookId) => {
    toast.info(
      <div>
        <p style={{ marginBottom: '10px' }}>Remove this book from your library?</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={async () => {
              toast.dismiss();
              try {
                await removeMyBook(bookId);
                // Step back a page if we just removed the last card on this page
                if (books.length === 1 && currentPage > 1) {
                  setCurrentPage(p => p - 1);
                } else {
                  loadBooks();
                }
                loadStats();
                toast.success('Book removed');
              } catch (err) {
                toast.error(err.message || 'Failed to remove book');
              }
            }}
            style={{ padding: '6px 14px', background: '#B85C5C', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Yes, Remove
          </button>
          <button
            onClick={() => toast.dismiss()}
            style={{ padding: '6px 14px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Cancel
          </button>
        </div>
      </div>,
      { autoClose: false }
    );
  };

  // ── Filter helpers ─────────────────────────────────────────────────────────
  const handleStatusFilter = (key) => {
    setStatusFilter(key);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTitle('');
    setSearchAuthor('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTitle || searchAuthor || statusFilter !== 'all';

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="page">

      {/* ── Header ── */}
      <div className="lib-page-header">
        <div>
          <h2 className="lib-page-title">My Library</h2>
          {!loading && (
            <p className="lib-page-subtitle">
              {totalBooks} book{totalBooks !== 1 ? 's' : ''}
              {hasActiveFilters ? ' found' : ' in your collection'}
            </p>
          )}
        </div>
      </div>

      {/* ── Stats bar ── */}
      <LibraryStats stats={stats} />

      {/* ── Search ── */}
      <LibrarySearchBar
        searchTitle={searchTitle}
        searchAuthor={searchAuthor}
        onTitleChange={(v) => setSearchTitle(v)}
        onAuthorChange={(v) => setSearchAuthor(v)}
      />

      {/* ── Status filter tabs + clear ── */}
      <div className="lib-filter-row">
        <LibraryFilters activeStatus={statusFilter} onStatusChange={handleStatusFilter} />
        {hasActiveFilters && (
          <button className="lib-clear-btn" onClick={clearFilters}>
            Clear all
          </button>
        )}
      </div>

      {/* ── Book grid ── */}
      {loading ? (
        <div className="library-grid">
          {[...Array(LIMIT)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : books.length === 0 ? (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="empty-icon">📚</div>
          <h3>{hasActiveFilters ? 'No books match your search' : 'Your Library is Empty'}</h3>
          <p>
            {hasActiveFilters
              ? 'Try a different title, author, or status'
              : 'Search for books on the home page and add them to your collection'}
          </p>
          {hasActiveFilters
            ? <button className="empty-cta" style={{ border: 'none', cursor: 'pointer' }} onClick={clearFilters}>Clear filters</button>
            : <Link to="/" className="empty-cta">Discover Books</Link>
          }
        </motion.div>
      ) : (
        <motion.div className="library-grid" layout>
          <AnimatePresence mode="popLayout">
            {books.map((book) => (
              <LibraryBookCard
                key={book._id}
                book={book}
                onStatusChange={handleStatusChange}
                onRemove={handleRemove}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Pagination ── */}
      {!loading && (
        <LibraryPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => setCurrentPage(p)}
        />
      )}

      {/* ── Page counter ── */}
      {!loading && totalPages > 1 && (
        <p className="lib-page-counter">
          Page {currentPage} of {totalPages} · {totalBooks} total books
        </p>
      )}

    </div>
  );
};

export default MyLibraryPage;
