// components/library/LibraryFilters.jsx
// Status filter pill tabs.

import { motion } from 'framer-motion';

const TABS = [
  { key: 'all',      label: 'All'      },
  { key: 'reading',  label: 'Reading'  },
  { key: 'to-read',  label: 'To Read'  },
  { key: 'paused',   label: 'Paused'   },
  { key: 'finished', label: 'Finished' },
];

const LibraryFilters = ({ activeStatus, onStatusChange }) => {
  return (
    <motion.div className="filter-tabs" layout>
      {TABS.map((tab) => (
        <motion.button
          key={tab.key}
          className={`filter-pill ${activeStatus === tab.key ? 'active' : ''}`}
          onClick={() => onStatusChange(tab.key)}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          layout
        >
          <span className="filter-label">{tab.label}</span>
        </motion.button>
      ))}
    </motion.div>
  );
};

export default LibraryFilters;
