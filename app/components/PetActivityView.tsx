import { useState, useEffect } from 'react';
import { ArrowLeft, Activity } from 'lucide-react';
import { trainingSessionsAPI, blogsAPI } from '../lib/api';
import type { Blog } from '../lib/api';
import type { Session } from './Dashboard';
import { RecentSessions } from './RecentSessions';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorAlert } from './ErrorAlert';

interface PetActivityViewProps {
  petId: number;
  petName: string;
  onBack: () => void;
}

export function PetActivityView({ petId, petName, onBack }: PetActivityViewProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPetActivity();
  }, [petId]);

  const fetchPetActivity = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all sessions and blogs
      const [allSessionsResponse, allBlogs] = await Promise.all([
        trainingSessionsAPI.getAll(),
        blogsAPI.getAll(),
      ]);

      // Filter sessions by petId
      const petSessions = allSessionsResponse.filter((s: any) => s.pet_id === petId);

      // Transform sessions to match the Session interface
      const transformedSessions: Session[] = petSessions.map((session: any) => ({
        id: session.id.toString(),
        date: session.session_date,
        petId: session.pet_id,
        dogName: session.pet?.name || petName,
        duration: session.duration_minutes,
        focus: session.training_focus || [],
      }));

      // Filter blogs by petId
      const petBlogs = allBlogs.filter((b: Blog) => b.pet_id === petId);

      setSessions(transformedSessions);
      setBlogs(petBlogs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pet activity');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const totalSessions = sessions.length;
  const totalBlogs = blogs.length;
  const totalHours = sessions.reduce((sum, s) => sum + s.duration, 0) / 60;

  return (
    <div className="px-6 pt-8 pb-6">
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      {/* Header with back button */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Pets</span>
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            {petName}'s Activity
          </h1>
        </div>
        <p className="text-gray-600 text-lg">All training sessions and notes</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-4 text-white">
          <div className="text-2xl font-bold">{totalSessions}</div>
          <div className="text-sm opacity-90">Sessions</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-4 text-white">
          <div className="text-2xl font-bold">{totalBlogs}</div>
          <div className="text-sm opacity-90">Notes</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl p-4 text-white">
          <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
          <div className="text-sm opacity-90">Hours</div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div>
        <h3 className="text-gray-700 mb-3 px-2">Activity Timeline</h3>
        <RecentSessions sessions={sessions} blogs={blogs} />
      </div>
    </div>
  );
}
