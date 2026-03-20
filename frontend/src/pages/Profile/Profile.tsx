import { useEffect, useState } from 'react';
import { userAPI } from '@/services/api';
import type { UserResponse } from '@/types';
import toast from 'react-hot-toast';

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card text-center">
      <p className="text-3xl font-extrabold text-indigo-600">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

export default function Profile() {
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI
      .getMe()
      .then(setProfile)
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-lg">Loading profile…</div>
      </div>
    );
  }

  if (!profile) return null;

  const winRate =
    profile.totalGames > 0
      ? Math.round((profile.wins / profile.totalGames) * 100)
      : 0;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Avatar + name */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-4xl font-bold text-indigo-600 uppercase">
          {profile.username.charAt(0)}
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-gray-800">
          {profile.username}
        </h1>
        <p className="text-sm text-gray-500">{profile.email}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <StatCard label="Total Games" value={profile.totalGames} />
        <StatCard label="Wins" value={profile.wins} />
        <StatCard label="Losses" value={profile.losses} />
        <StatCard label="Draws" value={profile.draws} />
      </div>

      {/* Win rate bar */}
      <div className="card">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-semibold text-gray-700">Win Rate</span>
          <span className="font-bold text-indigo-600">{winRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-indigo-500 h-3 rounded-full transition-all duration-700"
            style={{ width: `${winRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}
