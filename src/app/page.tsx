'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { format, formatDistanceToNow, isWithinInterval, addMonths } from 'date-fns';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEntities: 0,
    upcomingMeetings: 0,
    platformsWithDeadlines: 0,
    completedMeetings: 0,
  });
  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);
  const [urgentPlatforms, setUrgentPlatforms] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const [entitiesRes, meetingsRes, platformsRes] = await Promise.all([
        fetch('/api/entities'),
        fetch('/api/meetings?upcoming=true'),
        fetch('/api/platforms?upcoming=true'),
      ]);

      const entities = await entitiesRes.json();
      const meetings = await meetingsRes.json();
      const platforms = await platformsRes.json();

      const completedMeetingsRes = await fetch('/api/meetings?status=completed');
      const completedMeetings = await completedMeetingsRes.json();

      setStats({
        totalEntities: entities.length,
        upcomingMeetings: meetings.length,
        platformsWithDeadlines: platforms.length,
        completedMeetings: completedMeetings.length,
      });

      setUpcomingMeetings(meetings.slice(0, 5));
      setUrgentPlatforms(platforms.slice(0, 5));

      // Combine recent activity
      const activity = [
        ...meetings.slice(0, 3).map((m: any) => ({
          type: 'meeting',
          ...m,
        })),
        ...platforms.slice(0, 2).map((p: any) => ({
          type: 'platform',
          ...p,
        })),
      ].sort((a, b) => {
        const dateA = new Date(a.scheduledAt || a.deadline);
        const dateB = new Date(b.scheduledAt || b.deadline);
        return dateA.getTime() - dateB.getTime();
      });

      setRecentActivity(activity);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Overview of government entity platform consolidation tracking
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Entities"
            value={stats.totalEntities}
            icon="🏛️"
            color="blue"
          />
          <StatCard
            title="Upcoming Meetings"
            value={stats.upcomingMeetings}
            icon="📅"
            color="green"
          />
          <StatCard
            title="Platform Deadlines"
            value={stats.platformsWithDeadlines}
            icon="⏰"
            color="yellow"
          />
          <StatCard
            title="Completed Meetings"
            value={stats.completedMeetings}
            icon="✅"
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Meetings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Meetings</h2>
              <Link href="/meetings" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingMeetings.length === 0 ? (
                <p className="text-gray-500 text-sm">No upcoming meetings scheduled</p>
              ) : (
                upcomingMeetings.map((meeting) => (
                  <Link
                    key={meeting.id}
                    href={`/meetings/${meeting.id}`}
                    className="block p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {meeting.entity?.name || 'Unknown Entity'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {meeting.contact?.name || 'No contact'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(meeting.scheduledAt), 'PPp')}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(meeting.scheduledAt), { addSuffix: true })}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Urgent Platform Deadlines */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Urgent Platform Deadlines</h2>
              <Link href="/platforms" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {urgentPlatforms.length === 0 ? (
                <p className="text-gray-500 text-sm">No upcoming platform deadlines</p>
              ) : (
                urgentPlatforms.map((platform) => (
                  <div
                    key={platform.id}
                    className="p-3 rounded-lg border border-gray-200 hover:border-warning hover:bg-yellow-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{platform.name}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Action: {platform.action} • Progress: {platform.progress}%
                        </p>
                        <div className="flex items-center mt-2">
                          <span className={`status-badge status-${platform.status}`}>
                            {platform.status}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            Due {formatDistanceToNow(new Date(platform.deadline), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/meetings/new"
              className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary hover:bg-blue-50 transition-colors"
            >
              <span className="text-3xl mb-2">➕</span>
              <span className="text-sm font-medium text-gray-700">Schedule Meeting</span>
            </Link>
            <Link
              href="/entities/new"
              className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary hover:bg-blue-50 transition-colors"
            >
              <span className="text-3xl mb-2">🏛️</span>
              <span className="text-sm font-medium text-gray-700">Add Entity</span>
            </Link>
            <Link
              href="/platforms/new"
              className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary hover:bg-blue-50 transition-colors"
            >
              <span className="text-3xl mb-2">💻</span>
              <span className="text-sm font-medium text-gray-700">Add Platform</span>
            </Link>
            <Link
              href="/contacts/new"
              className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary hover:bg-blue-50 transition-colors"
            >
              <span className="text-3xl mb-2">👤</span>
              <span className="text-sm font-medium text-gray-700">Add Contact</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`text-4xl p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
