/**
 * API utility functions for TrainerPath app
 * Base URL points to the dog-walking-app backend on Render
 */

import { TOKEN_KEY } from './constants';

const BASE_URL = 'https://dog-walking-app.onrender.com';

interface FetchOptions extends RequestInit {
  timeout?: number;
}

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { timeout = 8000, ...fetchOptions } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  // Get JWT token from localStorage
  const token = localStorage.getItem(TOKEN_KEY);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...fetchOptions.headers,
      },
    });

    clearTimeout(id);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.errors?.join(', ') || error.error || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
    throw new Error('Unknown error occurred');
  }
}

/**
 * Training Sessions API
 */
export const trainingSessionsAPI = {
  // Get all training sessions
  getAll: () => apiFetch<any[]>('/training_sessions'),

  // Get summary statistics
  getSummary: () =>
    apiFetch<{
      total_hours: number;
      total_sessions: number;
      hours_remaining: number;
      progress_percentage: number;
      current_streak: number;
      longest_streak: number;
    }>('/training_sessions/summary'),

  // Get this week's training
  getThisWeek: () =>
    apiFetch<{
      sessions: any[];
      total_hours: number;
      goal_hours: number;
      progress_percentage: number;
    }>('/training_sessions/this_week'),

  // Get this month's training
  getThisMonth: () =>
    apiFetch<{
      sessions: any[];
      total_hours: number;
      session_count: number;
    }>('/training_sessions/this_month'),

  // Create a new training session
  create: (session: {
    pet_id?: number;
    session_date: string;
    duration_minutes: number;
    session_type: string;
    notes?: string;
    training_focus?: string[];
  }) =>
    apiFetch<{
      session: any;
      new_milestone: any | null;
    }>('/training_sessions', {
      method: 'POST',
      body: JSON.stringify({ training_session: session }),
    }),

  // Update a training session
  update: (id: number, session: any) =>
    apiFetch<any>(`/training_sessions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ training_session: session }),
    }),

  // Delete a training session
  delete: (id: number) =>
    apiFetch<void>(`/training_sessions/${id}`, {
      method: 'DELETE',
    }),

  // Export training hours as CSV
  exportCSV: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${BASE_URL}/training_sessions/export`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    if (!response.ok) throw new Error('Export failed');
    return await response.blob();
  },

  // Sync from invoices
  syncFromInvoices: () =>
    apiFetch<{
      synced_count: number;
      sessions: any[];
      errors: any[];
      new_milestones: any[];
    }>('/training_sessions/sync_from_invoices', {
      method: 'POST',
    }),
};

/**
 * Certification Goal API
 */
export const certificationGoalAPI = {
  // Get certification goal
  get: () =>
    apiFetch<{
      goal: any;
      hours_per_week_needed: number;
      projected_completion: string;
    }>('/certification_goal'),

  // Create certification goal
  create: (goal: {
    certification_type: string;
    target_hours: number;
    weekly_goal_hours: number;
    target_completion_date?: string;
  }) =>
    apiFetch<any>('/certification_goal', {
      method: 'POST',
      body: JSON.stringify({ certification_goal: goal }),
    }),

  // Update certification goal
  update: (goal: any) =>
    apiFetch<any>('/certification_goal', {
      method: 'PATCH',
      body: JSON.stringify({ certification_goal: goal }),
    }),
};

/**
 * Milestones API
 */
export const milestonesAPI = {
  // Get all milestones
  getAll: () => apiFetch<any[]>('/milestones'),

  // Mark milestone as celebrated
  markCelebrated: (id: number) =>
    apiFetch<any>(`/milestones/${id}/mark_celebrated`, {
      method: 'PATCH',
    }),
};

/**
 * Dashboard API
 */
export const dashboardAPI = {
  // Get dashboard data
  get: () =>
    apiFetch<{
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
    }>('/training/dashboard'),
};

/**
 * Statistics API
 */
export const statsAPI = {
  // Get detailed statistics
  get: () =>
    apiFetch<{
      total_stats: {
        total_hours: number;
        total_sessions: number;
        unique_dogs: number;
        average_session_duration: number;
      };
      breakdown_by_type: Record<string, number>;
      monthly_comparison: {
        this_month: number;
        last_month: number;
        change_percentage: number;
      };
      weekly_trend: Array<{ week: string; hours: number }>;
    }>('/training/stats'),
};

/**
 * Pets API
 */
export const petsAPI = {
  // Get all pets for current user
  getAll: () => apiFetch<any[]>('/pets'),

  // Create a new pet
  create: (pet: {
    name: string;
    birthdate: string;
    sex: string;
    spayed_neutered: boolean;
    address: string;
    behavioral_notes: string;
    supplies_location: string;
    allergies?: string;
  }) =>
    apiFetch<any>('/pets', {
      method: 'POST',
      body: JSON.stringify({ pet }),
    }),

  // Update a pet
  update: (id: number, pet: any) =>
    apiFetch<any>(`/pets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(pet),
    }),

  // Delete a pet
  delete: (id: number) =>
    apiFetch<void>(`/pets/${id}`, {
      method: 'DELETE',
    }),

  // Update active status
  updateActiveStatus: (id: number, active: boolean) =>
    apiFetch<any>(`/pets/${id}/active`, {
      method: 'PATCH',
      body: JSON.stringify({ active }),
    }),
};

/**
 * Books API
 */
export interface Book {
  id: number;
  user_id: number | null;
  title: string;
  author: string;
  category: string;
  is_default: boolean;
  status: 'not_started' | 'in_progress' | 'read';
  progress_percentage: number;
  notes?: string;
  rating?: number;
  description?: string;
  pages?: number;
  publisher?: string;
  year?: number;
  isbn?: string;
  price_range?: string;
  format?: string;
  why_you_need_it?: string;
  best_for?: string;
  completed_date?: string;
  purchase_url?: string;
  audible_url?: string;
}

export const booksAPI = {
  // Get all default books (for browsing)
  getDefaults: () => apiFetch<Book[]>('/books'),

  // Get user's tracked books (my reading list)
  getMyList: () => apiFetch<Book[]>('/books/my_list'),

  // Add a default book to user's list
  addToList: (bookId: number) =>
    apiFetch<Book>(`/books/${bookId}/add_to_list`, {
      method: 'POST',
    }),

  // Create a custom user book
  createCustom: (book: {
    title: string;
    author: string;
    description?: string;
    notes?: string;
    status?: string;
    progress_percentage?: number;
  }) =>
    apiFetch<Book>('/books/custom', {
      method: 'POST',
      body: JSON.stringify(book),
    }),

  // Update a book (progress, status, notes, rating)
  update: (
    id: number,
    updates: {
      status?: string;
      progress_percentage?: number;
      notes?: string;
      rating?: number;
      completed_date?: string;
    }
  ) =>
    apiFetch<Book>(`/books/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  // Delete a user's book
  delete: (id: number) =>
    apiFetch<void>(`/books/${id}`, {
      method: 'DELETE',
    }),
};

/**
 * Auth API
 */
export const authAPI = {
  // Login
  login: (username: string, password: string) =>
    apiFetch<any>('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  // Logout
  logout: () =>
    apiFetch<void>('/logout', {
      method: 'DELETE',
    }),
};
