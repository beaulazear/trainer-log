import { useState, useEffect } from 'react';
import { Award, Target, Calendar, Download, Settings, ChevronRight, LogOut, Pencil, X, Check, User, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { certificationGoalAPI, milestonesAPI, trainingSessionsAPI, booksAPI } from '../lib/api';
import { useAuth } from '../lib/auth-context';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorAlert } from './ErrorAlert';
import { useNavigate } from 'react-router';

export function ProfileView() {
  const [goalData, setGoalData] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditGoalOpen, setIsEditGoalOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [goal, milestonesData, summaryData, booksData] = await Promise.all([
        certificationGoalAPI.get().catch(() => null),
        milestonesAPI.getAll().catch(() => []),
        trainingSessionsAPI.getSummary().catch(() => null),
        booksAPI.getMyList().catch(() => []),
      ]);
      setGoalData(goal);
      setMilestones(milestonesData);
      setSummary(summaryData);
      setBooks(booksData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await trainingSessionsAPI.exportCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `training-hours-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to export report');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const milestoneConfig = [
    { hours: 50, name: '50 Hours', emoji: '🏆' },
    { hours: 100, name: '100 Hours', emoji: '🎯' },
    { hours: 150, name: '150 Hours', emoji: '⭐' },
    { hours: 200, name: '200 Hours', emoji: '💎' },
    { hours: 250, name: '250 Hours', emoji: '🚀' },
    { hours: 300, name: '300 Hours', emoji: '👑' },
  ];

  const achievements = milestoneConfig.map(config => ({
    ...config,
    id: config.hours,
    unlocked: milestones.some(m => m.hours_reached === config.hours),
  }));

  // Book achievements
  const booksRead = books.filter(b => b.status === 'read').length;
  const bookMilestoneConfig = [
    { books: 5, name: '5 Books', emoji: '📚' },
    { books: 10, name: '10 Books', emoji: '📖' },
    { books: 15, name: '15 Books', emoji: '🎓' },
    { books: 25, name: '25 Books', emoji: '🧠' },
    { books: 50, name: '50 Books', emoji: '🏅' },
  ];

  const bookAchievements = bookMilestoneConfig.map(config => ({
    ...config,
    id: config.books,
    unlocked: booksRead >= config.books,
  }));

  return (
    <div className="px-6 pt-8 pb-6">
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
            Profile
          </h1>
        </div>
        <p className="text-gray-600 text-lg">Your trainer journey</p>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl">
            👤
          </div>
          <div>
            <div className="text-xl">Aspiring Trainer</div>
            <div className="text-purple-100 text-sm">
              Level: {summary?.total_hours < 50 ? 'Novice' : summary?.total_hours < 150 ? 'Apprentice' : summary?.total_hours < 250 ? 'Advanced' : 'Master'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/20">
          <div>
            <div className="text-2xl mb-1">{summary?.total_hours?.toFixed(1) || '0'}</div>
            <div className="text-purple-100 text-xs">Hours</div>
          </div>
          <div>
            <div className="text-2xl mb-1">{summary?.total_sessions || '0'}</div>
            <div className="text-purple-100 text-xs">Sessions</div>
          </div>
          <div>
            <div className="text-2xl mb-1">{booksRead}</div>
            <div className="text-purple-100 text-xs">Books</div>
          </div>
          <div>
            <div className="text-2xl mb-1">{summary?.current_streak || '0'}</div>
            <div className="text-purple-100 text-xs">Streak</div>
          </div>
        </div>
      </div>

      {/* Goal Settings */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-purple-600" />
            <h3 className="text-gray-900">Your Goals</h3>
          </div>
          <button
            onClick={() => setIsEditGoalOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <Pencil className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Weekly Goal</span>
            <span className="text-purple-600">
              {goalData?.goal?.weekly_goal_hours || 12} hours
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Target Date</span>
            <span className="text-purple-600">
              {goalData?.goal?.target_completion_date
                ? new Date(goalData.goal.target_completion_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                : 'Not set'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Certification</span>
            <span className="text-purple-600">
              {goalData?.goal?.certification_type || 'CPDT-KA'}
            </span>
          </div>
        </div>
      </div>

      {/* Training Hours Achievements */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Award className="w-5 h-5 text-purple-600" />
          <h3 className="text-gray-900">Training Hours</h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-purple-100 to-pink-50 border-2 border-purple-300'
                  : 'bg-gray-100 border-2 border-gray-200'
              }`}
            >
              <div className={`text-3xl mb-1 ${!achievement.unlocked && 'opacity-30'}`}>
                {achievement.emoji}
              </div>
              <div className={`text-xs text-center ${achievement.unlocked ? 'text-purple-700' : 'text-gray-400'}`}>
                {achievement.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Book Reading Achievements */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-5 h-5 text-orange-600" />
          <h3 className="text-gray-900">Books Read</h3>
          <span className="ml-auto text-sm text-gray-600">{booksRead} completed</span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {bookAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-orange-100 to-amber-50 border-2 border-orange-300'
                  : 'bg-gray-100 border-2 border-gray-200'
              }`}
            >
              <div className={`text-2xl mb-1 ${!achievement.unlocked && 'opacity-30'}`}>
                {achievement.emoji}
              </div>
              <div className={`text-xs text-center ${achievement.unlocked ? 'text-orange-700' : 'text-gray-400'}`}>
                {achievement.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Report */}
      <button
        onClick={handleExport}
        className="w-full bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl p-5 mb-4 flex items-center justify-between hover:shadow-lg transition-shadow"
      >
        <div className="flex items-center gap-3">
          <Download className="w-6 h-6" />
          <div className="text-left">
            <div>Generate CPDT-KA Report</div>
            <div className="text-purple-100 text-sm">Export your hours for certification</div>
          </div>
        </div>
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-3">
          <LogOut className="w-6 h-6 text-gray-600" />
          <div className="text-left">
            <div className="text-gray-900">Logout</div>
            <div className="text-gray-500 text-sm">Sign out of your account</div>
          </div>
        </div>
        <ChevronRight className="w-6 h-6 text-gray-400" />
      </button>

      {/* Edit Goal Drawer */}
      <EditGoalDrawer
        isOpen={isEditGoalOpen}
        onClose={() => setIsEditGoalOpen(false)}
        currentGoal={goalData?.goal}
        onSave={async (updatedGoal) => {
          try {
            // Check if goal exists, if not create it, otherwise update
            if (!goalData?.goal || !goalData.goal.id) {
              await certificationGoalAPI.create({
                ...updatedGoal,
                target_hours: 300, // Default CPDT-KA requirement
              });
            } else {
              await certificationGoalAPI.update(updatedGoal);
            }
            await fetchProfileData();
            setIsEditGoalOpen(false);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save goal');
          }
        }}
      />
    </div>
  );
}

function EditGoalDrawer({
  isOpen,
  onClose,
  currentGoal,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentGoal: any;
  onSave: (goal: any) => void;
}) {
  const [weeklyGoal, setWeeklyGoal] = useState(12);
  const [targetDate, setTargetDate] = useState('');
  const [certificationType, setCertificationType] = useState('CPDT-KA');
  const [targetHours, setTargetHours] = useState(300);

  // Default hours for each certification type
  const certificationHours: Record<string, number> = {
    'CPDT-KA': 300,
    'CPDT-KSA': 300,
    'CBCC-KA': 500,
    'Other': 300,
  };

  useEffect(() => {
    if (isOpen && currentGoal) {
      setWeeklyGoal(currentGoal.weekly_goal_hours || 12);
      setTargetDate(currentGoal.target_completion_date || '');
      setCertificationType(currentGoal.certification_type || 'CPDT-KA');
      setTargetHours(currentGoal.target_hours || 300);
    }
  }, [isOpen, currentGoal]);

  // Update target hours when certification type changes
  const handleCertificationChange = (newType: string) => {
    setCertificationType(newType);
    setTargetHours(certificationHours[newType] || 300);
  };

  const handleSave = () => {
    onSave({
      weekly_goal_hours: weeklyGoal,
      target_completion_date: targetDate,
      certification_type: certificationType,
      target_hours: targetHours,
    });
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
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[90vh] overflow-y-auto overflow-x-hidden"
            style={{
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)',
            }}
          >
            <div className="max-w-md mx-auto w-full px-2">
              {/* Header */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
                <h2 className="text-gray-900">Edit Training Goals</h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Form */}
              <div className="p-4 md:p-6 pb-12 space-y-6">
                {/* Weekly Goal */}
                <div>
                  <label className="block text-gray-700 mb-2">Weekly Goal (hours)</label>
                  <div className="grid grid-cols-4 gap-3 mb-3">
                    {[8, 10, 12, 15].map((hours) => (
                      <button
                        key={hours}
                        onClick={() => setWeeklyGoal(hours)}
                        className={`py-3 rounded-xl transition-all ${
                          weeklyGoal === hours
                            ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <div className="text-lg font-medium">{hours}</div>
                        <div className="text-xs opacity-80">hrs</div>
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={weeklyGoal}
                    onChange={(e) => setWeeklyGoal(Number(e.target.value))}
                    placeholder="Custom hours"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Target Completion Date */}
                <div>
                  <label className="block text-gray-700 mb-2">Target Completion Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Certification Type */}
                <div>
                  <label className="block text-gray-700 mb-2">Certification Type</label>
                  <select
                    value={certificationType}
                    onChange={(e) => handleCertificationChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="CPDT-KA">CPDT-KA (300 hours)</option>
                    <option value="CPDT-KSA">CPDT-KSA (300 hours)</option>
                    <option value="CBCC-KA">CBCC-KA (500 hours)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Target Hours */}
                <div>
                  <label className="block text-gray-700 mb-2">Target Hours Required</label>
                  <input
                    type="number"
                    value={targetHours}
                    onChange={(e) => setTargetHours(Number(e.target.value))}
                    placeholder="Total hours needed"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-gray-500 text-sm mt-2">
                    Total hours required for {certificationType} certification
                  </p>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  className="w-full py-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  <span>Update Goals</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
