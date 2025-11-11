import { Clock, Calendar as CalendarIcon, Pencil, MessageSquare } from 'lucide-react';
import type { Session } from './Dashboard';
import type { Blog } from '../lib/api';

interface RecentSessionsProps {
  sessions: Session[];
  blogs?: Blog[];
  onEdit?: (session: Session) => void;
}

type TimelineEntry =
  | { type: 'session'; data: Session }
  | { type: 'blog'; data: Blog };

export function RecentSessions({ sessions, blogs = [], onEdit }: RecentSessionsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Merge sessions and blogs into a chronological timeline
  const timeline: TimelineEntry[] = [
    ...sessions.map((s): TimelineEntry => ({ type: 'session', data: s })),
    ...blogs.map((b): TimelineEntry => ({ type: 'blog', data: b })),
  ].sort((a, b) => {
    const dateA = a.type === 'session' ? new Date(a.data.date) : new Date(a.data.created_at);
    const dateB = b.type === 'session' ? new Date(b.data.date) : new Date(b.data.created_at);
    return dateB.getTime() - dateA.getTime(); // Sort descending (newest first)
  });

  return (
    <div>
      {timeline.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
            <CalendarIcon className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600">No entries yet</p>
          <p className="text-gray-500 text-sm mt-1">Tap the + button to log your first session or blog</p>
        </div>
      ) : (
        <div className="space-y-3">
          {timeline.map((entry, index) => {
            if (entry.type === 'session') {
              const session = entry.data;
              return (
                <div
                  key={`session-${session.id}`}
                  className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-gray-900">{session.dogName}</div>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Training Log</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{formatDate(session.date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{session.duration} min</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-purple-600 text-sm bg-purple-50 px-3 py-1 rounded-full">
                        +{(session.duration / 60).toFixed(1)}h
                      </div>
                      {onEdit && (
                        <button
                          onClick={() => onEdit(session)}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Pencil className="w-4 h-4 text-gray-600" />
                        </button>
                      )}
                    </div>
                  </div>

                  {session.focus.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {session.focus.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            } else {
              // Blog entry
              const blog = entry.data;
              return (
                <div
                  key={`blog-${blog.id}`}
                  className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-gray-900">{blog.pet?.name || 'General'}</div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          Blog Note
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{formatDate(blog.created_at)}</span>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm mt-2">{blog.content}</p>
                    </div>
                  </div>

                  {blog.training_focus && blog.training_focus.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {blog.training_focus.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
}
