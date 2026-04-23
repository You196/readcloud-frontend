// components/library/LibraryStats.jsx
// Small stats bar at top of library: total, reading, finished, paused, to-read.

import { motion } from 'framer-motion';

const Stat = ({ label, value, emoji, delay }) => (
  <motion.div
    className="lib-stat-card"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <span className="lib-stat-emoji">{emoji}</span>
    <span className="lib-stat-value">{value}</span>
    <span className="lib-stat-label">{label}</span>
  </motion.div>
);

const LibraryStats = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="lib-stats-row">
      <Stat emoji="📚" label="Total"    value={stats.totalBooks}       delay={0}    />
      <Stat emoji="📖" label="Reading"  value={stats.currentlyReading} delay={0.05} />
      <Stat emoji="✅" label="Finished" value={stats.booksFinished}    delay={0.1}  />
      <Stat emoji="⏸️" label="Paused"   value={stats.paused}           delay={0.15} />
      <Stat emoji="🔖" label="To Read"  value={stats.toRead}           delay={0.2}  />
    </div>
  );
};

export default LibraryStats;
