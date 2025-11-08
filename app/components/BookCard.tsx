import { BookOpen, Plus, Star, Trash2, ShoppingCart, Headphones } from 'lucide-react';
import type { Book } from '../lib/api';

interface BookCardProps {
  book: Book;
  isUserBook: boolean;
  onAddToList?: (bookId: number) => void;
  onUpdateStatus?: (bookId: number, status: string) => void;
  onDelete?: (bookId: number) => void;
  isAdded?: boolean;
}

export function BookCard({
  book,
  isUserBook,
  onAddToList,
  onUpdateStatus,
  onDelete,
  isAdded,
}: BookCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-purple-100 text-purple-700';
      case 'read':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'In Progress';
      case 'read':
        return 'Read';
      default:
        return 'Not Started';
    }
  };

  const getCategoryColor = (category: string) => {
    if (category === 'User Recommendation') {
      return 'bg-orange-100 text-orange-700';
    }
    if (category.includes('CPDT-KA')) {
      return 'bg-blue-100 text-blue-700';
    }
    if (category.includes('Psychology') || category.includes('Cognition')) {
      return 'bg-pink-100 text-pink-700';
    }
    return 'bg-purple-100 text-purple-700';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-purple-500 flex-shrink-0" />
            <h3 className="text-gray-900 font-medium line-clamp-2">{book.title}</h3>
          </div>
          <p className="text-gray-600 text-sm mb-2">{book.author}</p>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-2">
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(
                book.category
              )}`}
            >
              {book.category}
            </span>
            {isUserBook && (
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(book.status)}`}>
                {getStatusLabel(book.status)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Reading Animation (for user books in progress) */}
      {isUserBook && book.status === 'in_progress' && (
        <div className="mb-3 flex items-center gap-2 text-sm text-purple-600">
          <div className="flex gap-1 animate-pulse">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="font-medium">Currently Reading...</span>
        </div>
      )}

      {/* Rating (for completed books) */}
      {isUserBook && book.status === 'read' && book.rating && (
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < book.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      )}

      {/* Description */}
      {book.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{book.description}</p>
      )}

      {/* Metadata */}
      <div className="text-xs text-gray-500 space-y-1 mb-3">
        {book.pages && <div>Pages: {book.pages}</div>}
        {book.year && book.publisher && (
          <div>
            {book.publisher}, {book.year}
          </div>
        )}
        {book.price_range && <div className="text-purple-600 font-medium">{book.price_range}</div>}
      </div>

      {/* Purchase Links */}
      {(book.purchase_url || book.audible_url) && (
        <div className="flex gap-2 mb-3">
          {book.purchase_url && (
            <a
              href={book.purchase_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 rounded-xl text-xs font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 transition-all flex items-center justify-center gap-1.5"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Buy on Amazon
            </a>
          )}
          {book.audible_url && (
            <a
              href={book.audible_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 rounded-xl text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all flex items-center justify-center gap-1.5"
            >
              <Headphones className="w-3.5 h-3.5" />
              Listen on Audible
            </a>
          )}
        </div>
      )}

      {/* Actions */}
      {!isUserBook ? (
        // Default book - show "Add to My List" button
        <button
          onClick={() => onAddToList?.(book.id)}
          disabled={isAdded}
          className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            isAdded
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white hover:shadow-lg'
          }`}
        >
          {isAdded ? (
            <>
              <BookOpen className="w-4 h-4" />
              Already in Your List
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add to My List
            </>
          )}
        </button>
      ) : (
        // User book - show status controls and delete
        <div className="flex gap-2">
          {book.status === 'not_started' && (
            <button
              onClick={() => onUpdateStatus?.(book.id, 'in_progress')}
              className="flex-1 py-2 rounded-xl text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all"
            >
              Start Reading
            </button>
          )}
          {book.status === 'in_progress' && (
            <button
              onClick={() => onUpdateStatus?.(book.id, 'read')}
              className="flex-1 py-2 rounded-xl text-sm bg-green-100 text-green-700 hover:bg-green-200 transition-all"
            >
              Mark as Read
            </button>
          )}
          {book.category === 'User Recommendation' && (
            <button
              onClick={() => onDelete?.(book.id)}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
