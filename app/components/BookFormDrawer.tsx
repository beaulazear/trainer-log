import { useState, useEffect } from 'react';
import { X, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BookFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (book: { title: string; author: string; description?: string; notes?: string }) => void;
}

export function BookFormDrawer({ isOpen, onClose, onSave }: BookFormDrawerProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset form when opening
      setTitle('');
      setAuthor('');
      setDescription('');
      setNotes('');
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!title.trim() || !author.trim()) {
      alert('Please enter both title and author');
      return;
    }

    onSave({
      title: title.trim(),
      author: author.trim(),
      description: description.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    // Reset form
    setTitle('');
    setAuthor('');
    setDescription('');
    setNotes('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[90vh] overflow-y-auto"
          >
            <div className="max-w-md mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-gray-900">Add Custom Book</h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <p className="text-sm text-orange-800">
                    <strong>User Recommendation:</strong> This book will be added as a personal
                    recommendation and will appear in your Reading List.
                  </p>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Book Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., The Power of Positive Dog Training"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Author */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Author <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g., Pat Miller"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-700 mb-2">Description (optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the book..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-gray-700 mb-2">Personal Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Why do you want to read this? Who recommended it?"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  className="w-full py-4 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-[1.02] transition-all"
                >
                  Add Book to My List
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
