import { useState, useEffect } from 'react';
import { Plus, Flame, Award, Calendar, Target, TrendingUp, Download } from 'lucide-react';
import { CircularProgress } from './CircularProgress';
import { LogSessionDrawer } from './LogSessionDrawer';
import { MilestoneCelebration } from './MilestoneCelebration';
import { RecentSessions } from './RecentSessions';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorAlert } from './ErrorAlert';
import { dashboardAPI, trainingSessionsAPI } from '../lib/api';

export interface Session {
  id: string;
  date: string;
  petId?: number;
  dogName: string;
  duration: number; // in minutes
  focus: string[];
}

interface DashboardData {
  progress: {
    total_hours: number;
    target_hours: number;
    hours_remaining: number;
    percentage: number;
  };
  streaks: {
    current: number;
    longest: number;
  };
  this_week: {
    hours: number;
    goal: number;
    percentage: number;
  };
  projected_completion: string;
  recent_sessions: any[];
  uncelebrated_milestones: any[];
}

export function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMilestone, setCelebrationMilestone] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await dashboardAPI.get();
      setDashboardData(data);

      // Check for uncelebrated milestones
      if (data.uncelebrated_milestones && data.uncelebrated_milestones.length > 0) {
        setCelebrationMilestone(data.uncelebrated_milestones[0]);
        setShowCelebration(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogSession = async (session: Session | Omit<Session, 'id'>) => {
    try {
      setError(null);

      // Convert to API format
      const apiSession = {
        pet_id: session.petId,
        session_date: new Date(session.date).toISOString(),
        duration_minutes: session.duration,
        session_type: 'solo_walk', // Default, could be made dynamic
        notes: `Training with ${session.dogName}`,
        training_focus: session.focus,
      };

      if ('id' in session && session.id) {
        // Update existing session
        await trainingSessionsAPI.update(Number(session.id), apiSession);
      } else {
        // Create new session
        const result = await trainingSessionsAPI.create(apiSession);

        // Check if a new milestone was reached
        if (result.new_milestone) {
          setCelebrationMilestone(result.new_milestone);
          setShowCelebration(true);
        }
      }

      // Refresh dashboard data
      await fetchDashboardData();
      setIsLogDrawerOpen(false);
      setEditingSession(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save session');
    }
  };

  const handleEditSession = (session: Session) => {
    setEditingSession(session);
    setIsLogDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsLogDrawerOpen(false);
    setEditingSession(null);
  };

  const handleSyncFromInvoices = async () => {
    try {
      setIsSyncing(true);
      setError(null);
      const result = await trainingSessionsAPI.syncFromInvoices();

      // Show success message or milestones
      if (result.new_milestones && result.new_milestones.length > 0) {
        setCelebrationMilestone(result.new_milestones[0]);
        setShowCelebration(true);
      }

      // Refresh dashboard to show new data
      await fetchDashboardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync from invoices');
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !dashboardData) {
    return (
      <div className="px-6 pt-8">
        <ErrorAlert
          message={error || 'Failed to load dashboard'}
          onClose={() => setError(null)}
        />
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const { progress, streaks, this_week, projected_completion, recent_sessions } = dashboardData;

  // Transform API sessions to component format
  const transformedSessions: Session[] = recent_sessions.map((session: any) => ({
    id: session.id.toString(),
    date: session.session_date,
    dogName: session.pet?.name || 'Unknown',
    duration: session.duration_minutes,
    focus: session.training_focus || [],
  }));

  return (
    <>
      <div className="px-6 pt-8 pb-6">
        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent mb-1">
                Trainer Log
              </h1>
              <p className="text-sm text-gray-500">by Pocket Walks</p>
            </div>
          </div>
          <p className="text-gray-600 text-lg">Your journey to certification</p>
        </div>

        {/* Circular Progress */}
        <div className="mb-8">
          <CircularProgress hours={progress.total_hours} total={progress.target_hours} />

          <div className="text-center mt-6">
            {progress.hours_remaining > 0 ? (
              <>
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-100 to-pink-100 px-5 py-3 rounded-full mb-3">
                  <Target className="w-5 h-5 text-purple-600" />
                  <span className="text-xl font-bold text-gray-900">
                    {progress.hours_remaining.toFixed(1)} hours remaining
                  </span>
                </div>
                {projected_completion && (
                  <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Projected completion: {new Date(projected_completion).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-100 to-pink-100 px-6 py-4 rounded-full">
                <Award className="w-6 h-6 text-purple-600" />
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Certification Complete
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Streak & Weekly Goal */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          {/* Streak */}
          <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                <Flame className="w-8 h-8" />
              </div>
              <div>
                <div className="text-3xl font-bold">{streaks.current} day streak</div>
                <p className="text-white/90 text-sm">Keep up the momentum</p>
              </div>
            </div>
          </div>

          {/* Weekly Goal */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-5 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="text-gray-800 font-semibold">This Week's Progress</span>
              </div>
              <span className="text-purple-700 font-bold text-lg">
                {this_week.hours.toFixed(1)} / {this_week.goal} hrs
              </span>
            </div>
            <div className="w-full bg-white/60 rounded-full h-4 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 h-full rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${Math.min(this_week.percentage, 100)}%` }}
              />
            </div>
            <p className="text-gray-600 text-sm mt-3 font-medium">
              {this_week.percentage >= 100
                ? 'Weekly goal achieved'
                : `${Math.round(this_week.percentage)}% complete`}
            </p>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="mb-6">
          <h3 className="text-gray-900 text-xl font-bold mb-4">Recent Training Sessions</h3>
          <RecentSessions sessions={transformedSessions} onEdit={handleEditSession} />
        </div>
      </div>

      {/* Sync Button - Only show if no sessions yet */}
      {progress.total_hours === 0 && (
        <button
          onClick={handleSyncFromInvoices}
          disabled={isSyncing}
          className="fixed bottom-44 right-6 w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center z-10 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Import from invoices"
        >
          {isSyncing ? (
            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download className="w-8 h-8" />
          )}
        </button>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsLogDrawerOpen(true)}
        className="fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center z-10"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Log Session Drawer */}
      <LogSessionDrawer
        isOpen={isLogDrawerOpen}
        onClose={handleCloseDrawer}
        onSave={handleLogSession}
        editSession={editingSession}
      />

      {/* Milestone Celebration */}
      {showCelebration && celebrationMilestone && (
        <MilestoneCelebration
          hours={celebrationMilestone.hours_reached}
          onClose={() => setShowCelebration(false)}
        />
      )}
    </>
  );
}
