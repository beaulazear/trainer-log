import { useState, useEffect } from 'react';
import { TrendingUp, Clock, Users, Target, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { statsAPI } from '../lib/api';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorAlert } from './ErrorAlert';

export function StatsView() {
  const [statsData, setStatsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await statsAPI.get();
      setStatsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !statsData) {
    return (
      <div className="px-6 pt-8">
        <ErrorAlert message={error || 'Failed to load stats'} onClose={() => setError(null)} />
        <button
          onClick={fetchStats}
          className="mt-4 px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const { total_stats, breakdown_by_type, monthly_comparison, weekly_trend } = statsData;

  // Calculate focus breakdown percentages
  const totalTypeHours = Object.values(breakdown_by_type).reduce((a: any, b: any) => a + b, 0) as number;
  const focusBreakdown = Object.entries(breakdown_by_type).map(([name, hours]: any, index) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: totalTypeHours > 0 ? Math.round((hours / totalTypeHours) * 100) : 0,
    color: ['#FF6B35', '#F59E0B', '#3B82F6', '#9333EA', '#10B981'][index % 5],
  }));

  return (
    <div className="px-6 pt-8 pb-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Training Statistics
          </h1>
        </div>
        <p className="text-gray-600 text-lg">Track your progress over time</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white">
          <Clock className="w-6 h-6 mb-2 opacity-90" />
          <div className="text-2xl mb-1">{total_stats.total_hours.toFixed(1)}</div>
          <div className="text-purple-100 text-sm">Total Hours</div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-5 text-white">
          <Target className="w-6 h-6 mb-2 opacity-90" />
          <div className="text-2xl mb-1">{total_stats.total_sessions}</div>
          <div className="text-pink-100 text-sm">Total Sessions</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
          <Users className="w-6 h-6 mb-2 opacity-90" />
          <div className="text-2xl mb-1">{total_stats.unique_dogs}</div>
          <div className="text-blue-100 text-sm">Dogs Trained</div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl p-5 text-white">
          <TrendingUp className="w-6 h-6 mb-2 opacity-90" />
          <div className="text-2xl mb-1">{total_stats.average_session_duration}</div>
          <div className="text-cyan-100 text-sm">Avg. Min/Session</div>
        </div>
      </div>

      {/* Hours Over Time Chart */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
        <h3 className="text-gray-900 mb-4">Hours Over Time</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={weekly_trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="week"
              tick={{ fill: '#6B7280', fontSize: 12 }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis
              tick={{ fill: '#6B7280', fontSize: 12 }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            <Line
              type="monotone"
              dataKey="hours"
              stroke="#9333EA"
              strokeWidth={3}
              dot={{ fill: '#9333EA', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Training Focus Breakdown */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
        <h3 className="text-gray-900 mb-4">Training Focus Breakdown</h3>
        <div className="space-y-3">
          {focusBreakdown.map((item) => (
            <div key={item.name}>
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="text-gray-700">{item.name}</span>
                <span className="text-gray-900">{item.value}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.value}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Streak Stats */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h3 className="text-gray-900 mb-4">Streak Stats</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Current Streak</span>
            <span className="text-purple-600">🔥 12 days</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Longest Streak</span>
            <span className="text-gray-900">14 days</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">This Month</span>
            <span className={monthly_comparison.change_percentage >= 0 ? "text-green-600" : "text-red-600"}>
              {monthly_comparison.change_percentage >= 0 ? '↑' : '↓'} {Math.abs(monthly_comparison.change_percentage).toFixed(1)}% vs last month
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
