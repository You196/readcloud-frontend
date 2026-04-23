// services/libraryAPI.js
// All fetch calls for /api/my-library
// Import this in any component that needs library data.

/*const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  || 'https://readcloud-bue-crgcb6ffbxghfhfy.germanywestcentral-01.azurewebsites.net';
*/
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  || 'http://localhost:5000';
const authHeader = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

// 1. Fetch paginated library
// params: { page, limit, status, searchTitle, searchAuthor }
export const fetchMyLibrary = async (params = {}) => {
  const qs = new URLSearchParams();
  if (params.page)         qs.set('page',        params.page);
  if (params.limit)        qs.set('limit',        params.limit);
  if (params.status && params.status !== 'all') qs.set('status', params.status);
  if (params.searchTitle?.trim())  qs.set('searchTitle',  params.searchTitle.trim());
  if (params.searchAuthor?.trim()) qs.set('searchAuthor', params.searchAuthor.trim());

  const res = await fetch(`${API_BASE_URL}/api/my-library?${qs.toString()}`, {
    headers: authHeader(),
  });
  if (!res.ok) throw new Error('Failed to fetch library');
  return res.json(); // { books, currentPage, totalPages, totalBooks }
};

// 2. Add a book
export const addBookToMyLibrary = async (bookData) => {
  const res = await fetch(`${API_BASE_URL}/api/my-library`, {
    method:  'POST',
    headers: authHeader(),
    body:    JSON.stringify(bookData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add book');
  return data;
};

// 3. Update reading status
export const updateMyBookStatus = async (bookId, status) => {
  const res = await fetch(`${API_BASE_URL}/api/my-library/${bookId}`, {
    method:  'PUT',
    headers: authHeader(),
    body:    JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update status');
  return data;
};

// 4. Remove a book
export const removeMyBook = async (bookId) => {
  const res = await fetch(`${API_BASE_URL}/api/my-library/${bookId}`, {
    method:  'DELETE',
    headers: authHeader(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Failed to remove book');
  }
};

// 5. Fetch status counts
export const fetchMyLibraryStats = async () => {
  const res = await fetch(`${API_BASE_URL}/api/my-library/stats`, {
    headers: authHeader(),
  });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json(); // { totalBooks, booksFinished, currentlyReading, toRead, paused }
};
