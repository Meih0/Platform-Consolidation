'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [seeded, setSeeded] = useState(false);

  async function seed() {
    await fetch('/api/seed', { method: 'POST' });
    setSeeded(true);
    load();
  }

  async function load() {
    const [entities, platforms, meetings, reminders] = await Promise.all([
      fetch('/api/entities').then(r => r.json()),
      fetch('/api/platforms').then(r => r.json()),
      fetch('/api/meetings').then(r => r.json()),
      fetch('/api/reminders').then(r => r.json()),
    ]);
    setData({ entities, platforms, meetings, reminders });
  }

  useEffect(() => { load(); }, []);

  if (!data) return <p className="p-8 text-gray-500">Loading...</p>;

  const upcoming = data.meetings.filter((m: any) => m.status === 'scheduled');
  const now = new Date();
  const soon = new Date(now.getTime() + 90 * 86400000);
  const urgentPlatforms = data.platforms.filter((p: any) =>
    p.deadline && new Date(p.deadline) <= soon && p.status !== 'completed'
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <button onClick={seed} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700">
          {seeded ? 'Seeded' : 'Seed Sample Data'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Entities', value: data.entities.length, color: 'text-blue-500' },
          { label: 'Platforms', value: data.platforms.length, color: 'text-green-500' },
          { label: 'Upcoming Meetings', value: upcoming.length, color: 'text-yellow-600' },
          { label: 'Pending Reminders', value: data.reminders.length, color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-lg shadow p-4">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold text-lg mb-3">Upcoming Meetings</h2>
        {upcoming.length === 0 ? <p className="text-gray-400">None scheduled</p> : (
          <div className="space-y-2">
            {upcoming.map((m: any) => (
              <Link key={m.id} href={`/meetings/${m.id}`} className="block p-3 border rounded hover:bg-indigo-50 transition">
                <div className="flex justify-between">
                  <span className="font-medium">{m.entity_name}</span>
                  <span className="text-sm text-gray-500">{m.date} {m.time}</span>
                </div>
                <div className="text-sm text-gray-500">with {m.contact_name} - {m.title}</div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold text-lg mb-3">Platform Deadlines (Next 90 Days)</h2>
        {urgentPlatforms.length === 0 ? <p className="text-gray-400">No urgent deadlines</p> : (
          <div className="space-y-2">
            {urgentPlatforms.map((p: any) => {
              const daysLeft = Math.ceil((new Date(p.deadline).getTime() - Date.now()) / 86400000);
              return (
                <div key={p.id} className="p-3 border rounded flex justify-between items-center">
                  <div>
                    <span className="font-medium">{p.name}</span>
                    <span className="ml-2 text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-700">{p.action}</span>
                    <div className="text-sm text-gray-500">{p.entity_name}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${daysLeft < 30 ? 'text-red-600' : 'text-yellow-600'}`}>{p.deadline}</div>
                    <div className="text-xs text-gray-400">{p.progress}% done</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {data.reminders.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="font-semibold text-lg mb-3 text-yellow-800">Post-Meeting Updates Needed</h2>
          {data.reminders.map((r: any) => (
            <Link key={r.id} href={`/meetings/${r.meeting_id}`} className="block p-2 hover:bg-yellow-100 rounded">
              <span className="font-medium">{r.entity_name}</span> - {r.meeting_title}
              <span className="text-sm text-yellow-600 ml-2">needs update</span>
            </Link>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {[
          { href: '/entities', label: 'Manage Entities' },
          { href: '/meetings', label: 'View All Meetings' },
          { href: '/platforms', label: 'Platform Status' },
          { href: '/contacts', label: 'View Contacts' },
        ].map(a => (
          <Link key={a.href} href={a.href} className="bg-white border px-4 py-2 rounded shadow-sm hover:bg-gray-50 text-sm">
            {a.label} →
          </Link>
        ))}
      </div>
    </div>
  );
}
