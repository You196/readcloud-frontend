// components/library/LibraryPagination.jsx
// Pagination controls with a sliding page window.

const LibraryPagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Build a window of up to 5 pages around the current one
  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end   = Math.min(totalPages, currentPage + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="lib-pagination">

      {/* Prev */}
      <button
        className="lib-page-btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ← Prev
      </button>

      {/* Leading ellipsis */}
      {start > 1 && (
        <>
          <button className="lib-page-btn" onClick={() => onPageChange(1)}>1</button>
          {start > 2 && <span className="lib-page-ellipsis">…</span>}
        </>
      )}

      {/* Page numbers */}
      {pages.map(p => (
        <button
          key={p}
          className={`lib-page-btn ${p === currentPage ? 'active' : ''}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      {/* Trailing ellipsis */}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="lib-page-ellipsis">…</span>}
          <button className="lib-page-btn" onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </button>
        </>
      )}

      {/* Next */}
      <button
        className="lib-page-btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next →
      </button>

    </div>
  );
};

export default LibraryPagination;
