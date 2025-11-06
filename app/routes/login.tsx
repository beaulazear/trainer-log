import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { Route } from "./+types/login";
import { useAuth } from '../lib/auth-context';
import { ErrorAlert } from '../components/ErrorAlert';
import { LogIn } from 'lucide-react';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login - TrainerPath" },
    { name: "description", content: "Login to TrainerPath" },
  ];
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4">
            <span className="text-3xl">🐕</span>
          </div>
          <h1 className="text-gray-900 mb-2">Welcome to TrainerPath</h1>
          <p className="text-gray-600">Track your journey to CPDT-KA certification</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

            <div>
              <label htmlFor="username" className="block text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Login</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Demo credentials available in your backend</p>
          </div>
        </div>
      </div>
    </div>
  );
}
