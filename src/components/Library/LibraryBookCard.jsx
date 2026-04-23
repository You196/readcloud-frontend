// components/library/LibraryBookCard.jsx
// Single book card for the personal library grid.

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const STATUSES = [
  { value: 'to-read',  label: 'To Read'  },
  { value: 'reading',  label: 'Reading'  },
  { value: 'paused',   label: 'Paused'   },
  { value: 'finished', label: 'Finished' },
];

const STATUS_CLASS = {
  'to-read':  'status-to-read',
  'reading':  'status-reading',
  'paused':   'status-paused',
  'finished': 'status-finished',
};

const STATUS_LABEL = {
  'to-read':  'To Read',
  'reading':  'Reading',
  'paused':   'Paused',
  'finished': 'Finished',
};

const LibraryBookCard = ({ book, onStatusChange, onRemove }) => {
  return (
    <motion.div
      className="library-card"
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5, boxShadow: '0 10px 32px rgba(59,50,41,0.15)' }}
      transition={{ duration: 0.2 }}
    >
      {/* Cover */}
      <Link to={`/library/${book._id}`} className="library-card-image-link">
        <img
          src={book.thumbnail || 'https://via.placeholder.com/128x192?text=No+Cover'}
          alt={book.title}
        />
      </Link>

      <div className="library-card-content">
        <div className="library-card-text">
          {/* Title */}
          <Link to={`/library/${book._id}`} className="library-book-title">
            {book.title}
          </Link>

          {/* Author */}
          <p className="library-book-author">
            {book.authors?.join(', ') || 'Unknown Author'}
          </p>

          {/* Status badge */}
          <span className={`status-badge ${STATUS_CLASS[book.status] || ''}`}>
            {STATUS_LABEL[book.status] || book.status}
          </span>
        </div>

        {/* Actions */}
        <div className="library-actions">
          <select
            className="status-select"
            value={book.status}
            onChange={(e) => onStatusChange(book._id, e.target.value)}
          >
            {STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <button className="remove-btn" onClick={() => onRemove(book._id)}>
            Remove
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default LibraryBookCard;
