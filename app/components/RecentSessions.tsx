import { Clock, Calendar as CalendarIcon, Pencil } from 'lucide-react';
import type { Session } from './Dashboard';

interface RecentSessionsProps {
  sessions: Session[];
  onEdit?: (session: Session) => void;
}

export function RecentSessions({ sessions, onEdit }: RecentSessionsProps) {
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

  return (
    <div>
      {sessions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
            <CalendarIcon className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600">No sessions yet</p>
          <p className="text-gray-500 text-sm mt-1">Tap the + button to log your first session</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="text-gray-900 mb-1">{session.dogName}</div>
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
          ))}
        </div>
      )}
    </div>
  );
}
