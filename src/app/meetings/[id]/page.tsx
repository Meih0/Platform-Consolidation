'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { format } from 'date-fns';

export default function MeetingPrep() {
  const params = useParams();
  const router = useRouter();
  const [meeting, setMeeting] = useState<any>(null);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [lastMeeting, setLastMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updates, setUpdates] = useState({
    notes: '',
    outcomes: '',
    nextSteps: '',
  });

  const loadMeetingData = useCallback(async () => {
    try {
      const meetingRes = await fetch(`/api/meetings/${params.id}`);
      const meetingData = await meetingRes.json();
      setMeeting(meetingData);

      if (meetingData.notes) {
        setUpdates({
          notes: meetingData.notes,
          outcomes: meetingData.outcomes || '',
          nextSteps: meetingData.nextSteps || '',
        });
      }

      // Load platforms with upcoming deadlines
      const platformsRes = await fetch(
        `/api/platforms?entityId=${meetingData.entityId}&upcoming=true`
      );
      const platformsData = await platformsRes.json();
      setPlatforms(platformsData);

      // Load last completed meeting
      const allMeetingsRes = await fetch(
        `/api/meetings?entityId=${meetingData.entityId}&status=completed`
      );
      const allMeetings = await allMeetingsRes.json();

      if (allMeetings.length > 0) {
        const lastCompleted = allMeetings.filter(
          (m: any) =>
            new Date(m.scheduledAt) < new Date(meetingData.scheduledAt) &&
            m.id !== meetingData.id
        )[0];
        setLastMeeting(lastCompleted);
      }
    } catch (error) {
      console.error('Error loading meeting data:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      loadMeetingData();
    }
  }, [params.id, loadMeetingData]);

  async function handleDownloadBrief() {
    try {
      const response = await fetch(`/api/meetings/${params.id}/brief`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meeting-brief-${params.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading brief:', error);
      alert('Failed to generate meeting brief');
    }
  }

  async function handleSaveUpdates() {
    try {
      await fetch(`/api/meetings/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          status: 'completed',
          updatesEntered: true,
        }),
      });
      alert('Meeting updates saved successfully!');
      setShowUpdateForm(false);
      loadMeetingData();
    } catch (error) {
      console.error('Error saving updates:', error);
      alert('Failed to save updates');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading meeting details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p>Meeting not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-primary hover:underline mb-4 flex items-center"
          >
            ← Back
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meeting Preparation</h1>
              <p className="mt-2 text-gray-600">
                {meeting.entity?.name} • {format(new Date(meeting.scheduledAt), 'PPp')}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
              <button
                onClick={handleDownloadBrief}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                📄 Download Meeting Brief PDF
              </button>
              {meeting.status === 'scheduled' && (
                <button
                  onClick={() => setShowUpdateForm(!showUpdateForm)}
                  className="px-4 py-2 bg-success text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {showUpdateForm ? 'Cancel' : '✏️ Enter Post-Meeting Updates'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Post-Meeting Update Form */}
        {showUpdateForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Post-Meeting Updates
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Notes
                </label>
                <textarea
                  value={updates.notes}
                  onChange={(e) => setUpdates({ ...updates, notes: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="What was discussed in the meeting?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Outcomes & Decisions
                </label>
                <textarea
                  value={updates.outcomes}
                  onChange={(e) => setUpdates({ ...updates, outcomes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="What decisions were made?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Next Steps & Action Items
                </label>
                <textarea
                  value={updates.nextSteps}
                  onChange={(e) => setUpdates({ ...updates, nextSteps: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="What are the next steps?"
                />
              </div>
              <button
                onClick={handleSaveUpdates}
                className="w-full md:w-auto px-6 py-2 bg-success text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Updates
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Entity & Contact Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Entity Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Entity</p>
                <p className="text-lg font-medium text-gray-900">{meeting.entity?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Sector</p>
                <p className="text-lg font-medium text-gray-900">
                  {meeting.entity?.sector?.name || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`status-badge status-${meeting.entity?.status}`}>
                  {meeting.entity?.status}
                </span>
              </div>
              {meeting.entity?.description && (
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="text-sm text-gray-800">{meeting.entity.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact "Personality Hat" */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Contact Information 🎩
            </h2>
            {meeting.contact ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-lg font-medium text-gray-900">{meeting.contact.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="text-sm text-gray-800">{meeting.contact.role || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contact Info</p>
                  <p className="text-sm text-gray-800">
                    {meeting.contact.email || 'No email'} • {meeting.contact.phone || 'No phone'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Preferred Contact Method</p>
                  <p className="text-sm text-gray-800">{meeting.contact.preferredContactMethod}</p>
                </div>
                {meeting.contact.personality && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-semibold text-green-800 mb-2">
                      Personality Notes:
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {meeting.contact.personality}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No contact assigned</p>
            )}
          </div>

          {/* Upcoming Platform Deadlines */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Platform Deadlines (Next 4 Months)
            </h2>
            <div className="space-y-3">
              {platforms.length === 0 ? (
                <p className="text-gray-500 text-sm">No upcoming deadlines</p>
              ) : (
                platforms.map((platform) => (
                  <div
                    key={platform.id}
                    className="p-3 border border-gray-200 rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{platform.name}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {platform.action} → {platform.targetPlatform || 'TBD'}
                        </p>
                        <div className="mt-2 flex items-center space-x-2">
                          <span className={`status-badge status-${platform.status}`}>
                            {platform.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {platform.progress}% complete
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          {format(new Date(platform.deadline), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Last Meeting Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Last Meeting Summary</h2>
            {lastMeeting ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="text-sm text-gray-900">
                    {format(new Date(lastMeeting.scheduledAt), 'PPp')}
                  </p>
                </div>
                {lastMeeting.notes && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Notes</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                      {lastMeeting.notes}
                    </p>
                  </div>
                )}
                {lastMeeting.outcomes && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Outcomes</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                      {lastMeeting.outcomes}
                    </p>
                  </div>
                )}
                {lastMeeting.nextSteps && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Next Steps</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                      {lastMeeting.nextSteps}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No previous meetings found</p>
            )}
          </div>
        </div>

        {/* Talking Points */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">
            💡 Suggested Talking Points
          </h2>
          <ul className="space-y-2">
            {platforms.filter((p) => p.status === 'blocked').length > 0 && (
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span className="text-blue-900">
                  Address blockers for:{' '}
                  {platforms
                    .filter((p) => p.status === 'blocked')
                    .map((p) => p.name)
                    .join(', ')}
                </span>
              </li>
            )}
            {lastMeeting?.nextSteps && (
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span className="text-blue-900">Follow up on previous action items</span>
              </li>
            )}
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span className="text-blue-900">
                Get status update on {meeting.entity?.name} consolidation progress
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span className="text-blue-900">Discuss any new challenges or roadblocks</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span className="text-blue-900">Confirm upcoming milestones and timelines</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
