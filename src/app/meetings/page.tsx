'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('upcoming');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeetings();
  }, [filter]);

  async function loadMeetings() {
    setLoading(true);
    try {
      let url = '/api/meetings';
      if (filter === 'upcoming') {
        url += '?upcoming=true';
      } else if (filter === 'completed') {
        url += '?status=completed';
      }

      const response = await fetch(url);
      const data = await response.json();
      setMeetings(data);
    } catch (error) {
      console.error('Error loading meetings:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meetings</h1>
          <p className="mt-2 text-gray-600">Manage and track all your entity meetings</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex space-x-2 border-b border-gray-200">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              filter === 'upcoming'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              filter === 'all'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            All Meetings
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              filter === 'completed'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Completed
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading meetings...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {meetings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No meetings found</p>
                <Link
                  href="/meetings/new"
                  className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700"
                >
                  Schedule a Meeting
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {meetings.map((meeting) => (
                  <Link
                    key={meeting.id}
                    href={`/meetings/${meeting.id}`}
                    className="block p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {meeting.entity?.name || 'Unknown Entity'}
                          </h3>
                          <span className={`status-badge status-${meeting.status}`}>
                            {meeting.status}
                          </span>
                          {!meeting.updatesEntered && meeting.status === 'scheduled' && (
                            <span className="status-badge bg-orange-100 text-orange-800">
                              Updates Pending
                            </span>
                          )}
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">Contact:</span>{' '}
                            {meeting.contact?.name || 'No contact'}
                          </p>
                          <p>
                            <span className="font-medium">Sector:</span>{' '}
                            {meeting.entity?.sector?.name || 'N/A'}
                          </p>
                          <p>
                            <span className="font-medium">Type:</span> {meeting.type}
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          {format(new Date(meeting.scheduledAt), 'PPp')}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(meeting.scheduledAt), {
                            addSuffix: true,
                          })}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {meeting.duration} minutes
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
