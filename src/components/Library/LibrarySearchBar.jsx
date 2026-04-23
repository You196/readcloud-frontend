// components/library/LibrarySearchBar.jsx
// Search inputs: title and author, with clear buttons.

const LibrarySearchBar = ({ searchTitle, searchAuthor, onTitleChange, onAuthorChange }) => {
  return (
    <div className="lib-search-row">

      {/* Search by title */}
      <div className="lib-search-field">
        <span className="lib-search-icon">🔍</span>
        <input
          type="text"
          className="lib-search-input"
          placeholder="Search by title..."
          value={searchTitle}
          onChange={(e) => onTitleChange(e.target.value)}
        />
        {searchTitle && (
          <button className="lib-search-clear" onClick={() => onTitleChange('')} title="Clear">✕</button>
        )}
      </div>

      {/* Search by author */}
      <div className="lib-search-field">
        <span className="lib-search-icon">✍️</span>
        <input
          type="text"
          className="lib-search-input"
          placeholder="Search by author..."
          value={searchAuthor}
          onChange={(e) => onAuthorChange(e.target.value)}
        />
        {searchAuthor && (
          <button className="lib-search-clear" onClick={() => onAuthorChange('')} title="Clear">✕</button>
        )}
      </div>

    </div>
  );
};

export default LibrarySearchBar;
