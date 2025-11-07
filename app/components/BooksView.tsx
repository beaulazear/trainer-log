import { useState, useEffect } from 'react';
import { BookOpen, Plus, Filter } from 'lucide-react';
import { booksAPI, Book } from '../lib/api';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorAlert } from './ErrorAlert';
import { BookCard } from './BookCard';
import { BookFormDrawer } from './BookFormDrawer';

type ViewTab = 'recommended' | 'my-list';

export function BooksView() {
  const [activeTab, setActiveTab] = useState<ViewTab>('recommended');
  const [defaultBooks, setDefaultBooks] = useState<Book[]>([]);
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [defaults, userBooks] = await Promise.all([
        booksAPI.getDefaults(),
        booksAPI.getMyList(),
      ]);
      setDefaultBooks(defaults);
      setMyBooks(userBooks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load books');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToList = async (bookId: number) => {
    try {
      await booksAPI.addToList(bookId);
      await fetchBooks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add book to your list');
    }
  };

  const handleUpdateStatus = async (bookId: number, status: string) => {
    try {
      await booksAPI.update(bookId, { status });
      await fetchBooks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update book status');
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    if (!confirm('Are you sure you want to remove this book from your list?')) return;

    try {
      await booksAPI.delete(bookId);
      await fetchBooks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete book');
    }
  };

  const handleSaveCustomBook = async (bookData: {
    title: string;
    author: string;
    description?: string;
    notes?: string;
  }) => {
    try {
      await booksAPI.createCustom(bookData);
      await fetchBooks();
      setIsDrawerOpen(false);
      setActiveTab('my-list'); // Switch to My List tab to show the new book
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save custom book');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Get unique categories from default books
  const categories = ['all', ...new Set(defaultBooks.map((b) => b.category))];

  // Filter books by category
  const filteredDefaultBooks =
    selectedCategory === 'all'
      ? defaultBooks
      : defaultBooks.filter((b) => b.category === selectedCategory);

  // Check which default books are already in user's list
  const myBookTitles = new Set(myBooks.map((b) => b.title));

  // Separate user books by status
  const notStartedBooks = myBooks.filter((b) => b.status === 'not_started');
  const inProgressBooks = myBooks.filter((b) => b.status === 'in_progress');
  const readBooks = myBooks.filter((b) => b.status === 'read');

  return (
    <div className="px-6 pt-8 pb-6">
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              Books
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Your dog training resource library</p>
        </div>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="w-14 h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('recommended')}
          className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
            activeTab === 'recommended'
              ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
          }`}
        >
          Recommended Resources ({defaultBooks.length})
        </button>
        <button
          onClick={() => setActiveTab('my-list')}
          className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
            activeTab === 'my-list'
              ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
          }`}
        >
          My Reading List ({myBooks.length})
        </button>
      </div>

      {/* Recommended Resources Tab */}
      {activeTab === 'recommended' && (
        <div>
          {/* Category Filter */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Filter by Category:</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'All Categories' : category}
                </button>
              ))}
            </div>
          </div>

          {/* Books Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDefaultBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isUserBook={false}
                onAddToList={handleAddToList}
                isAdded={myBookTitles.has(book.title)}
              />
            ))}
          </div>

          {filteredDefaultBooks.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No books found in this category</p>
            </div>
          )}
        </div>
      )}

      {/* My Reading List Tab */}
      {activeTab === 'my-list' && (
        <div>
          {myBooks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-gray-900 mb-2">Your reading list is empty</h3>
              <p className="text-gray-600 mb-6">
                Add books from Recommended Resources or create your own
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setActiveTab('recommended')}
                  className="px-6 py-3 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Browse Resources
                </button>
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="px-6 py-3 bg-white border border-purple-300 text-purple-600 rounded-xl hover:bg-purple-50 transition-all"
                >
                  Add Custom Book
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* In Progress */}
              {inProgressBooks.length > 0 && (
                <div>
                  <h3 className="text-gray-700 mb-3 px-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Currently Reading ({inProgressBooks.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inProgressBooks.map((book) => (
                      <BookCard
                        key={book.id}
                        book={book}
                        isUserBook={true}
                        onUpdateStatus={handleUpdateStatus}
                        onDelete={handleDeleteBook}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Not Started */}
              {notStartedBooks.length > 0 && (
                <div>
                  <h3 className="text-gray-700 mb-3 px-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    Want to Read ({notStartedBooks.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {notStartedBooks.map((book) => (
                      <BookCard
                        key={book.id}
                        book={book}
                        isUserBook={true}
                        onUpdateStatus={handleUpdateStatus}
                        onDelete={handleDeleteBook}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Completed */}
              {readBooks.length > 0 && (
                <div>
                  <h3 className="text-gray-700 mb-3 px-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Completed ({readBooks.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {readBooks.map((book) => (
                      <BookCard
                        key={book.id}
                        book={book}
                        isUserBook={true}
                        onUpdateStatus={handleUpdateStatus}
                        onDelete={handleDeleteBook}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add Custom Book Drawer */}
      <BookFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSaveCustomBook}
      />
    </div>
  );
}
