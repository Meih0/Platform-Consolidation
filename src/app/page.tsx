'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [d, setD] = useState<any>(null);
  const [seeded, setSeeded] = useState(false);

  async function seed() {
    await fetch('/api/seed', { method: 'POST' });
    setSeeded(true); load();
  }
  async function load() {
    const [sectors, orgs, platforms, meetings, leads, reminders] = await Promise.all([
      fetch('/api/sectors').then(r => r.json()),
      fetch('/api/organizations').then(r => r.json()),
      fetch('/api/platforms').then(r => r.json()),
      fetch('/api/meetings').then(r => r.json()),
      fetch('/api/sector-leads').then(r => r.json()),
      fetch('/api/reminders').then(r => r.json()),
    ]);
    setD({ sectors, orgs, platforms, meetings, leads, reminders });
  }
  useEffect(() => { load(); }, []);

  if (!d) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  const upcoming = d.meetings.filter((m: any) => m.status === 'scheduled');
  const now = Date.now();
  const urgent = d.platforms.filter((p: any) => p.expected_completion && new Date(p.expected_completion).getTime() - now < 90 * 86400000 && p.implementation_status !== 'Production');

  const statusCounts: Record<string, number> = {};
  d.platforms.forEach((p: any) => { statusCounts[p.implementation_status] = (statusCounts[p.implementation_status] || 0) + 1; });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Platform Consolidation Dashboard</h1>
          <p className="text-sm text-gray-500">Digital Government Authority - Sector Consolidation Tracking</p>
        </div>
        <button onClick={seed} className="bg-emerald-700 text-white px-4 py-2 rounded text-sm hover:bg-emerald-800">
          {seeded ? 'Seeded' : 'Seed Sample Data'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Sectors', value: d.sectors.length, color: 'text-emerald-600', href: '/sectors' },
          { label: 'Organizations', value: d.orgs.length, color: 'text-blue-600', href: '/organizations' },
          { label: 'Platforms', value: d.platforms.length, color: 'text-purple-600', href: '/platforms' },
          { label: 'Sector Leads', value: d.leads.length, color: 'text-orange-600', href: '/sector-leads' },
          { label: 'Upcoming Meetings', value: upcoming.length, color: 'text-indigo-600', href: '/meetings' },
          { label: 'Urgent Deadlines', value: urgent.length, color: 'text-red-600', href: '/platforms' },
        ].map(s => (
          <Link key={s.label} href={s.href} className="bg-white rounded-lg shadow p-4 hover:ring-2 hover:ring-emerald-300 transition">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold text-lg mb-3">Platform Implementation Status</h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(statusCounts).sort((a,b) => b[1]-a[1]).map(([status, count]) => {
            const colors: Record<string,string> = { 'Planning': 'bg-gray-200 text-gray-700', 'In Progress': 'bg-blue-100 text-blue-700', 'UAT': 'bg-yellow-100 text-yellow-700', 'Ready for Production': 'bg-emerald-100 text-emerald-700', 'Production': 'bg-green-200 text-green-800' };
            return <span key={status} className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status] || 'bg-gray-100'}`}>{status}: {count}</span>;
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold text-lg mb-3">Upcoming Meetings</h2>
          {upcoming.length === 0 ? <p className="text-gray-400">None scheduled</p> : (
            <div className="space-y-2">
              {upcoming.slice(0, 5).map((m: any) => (
                <Link key={m.id} href={`/meetings/${m.id}`} className="block p-3 border rounded hover:bg-emerald-50 transition">
                  <div className="flex justify-between">
                    <span className="font-medium text-sm">{m.title}</span>
                    <span className="text-xs text-gray-500">{m.date}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{m.lead_name} | {m.org_name} | {m.type}</div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold text-lg mb-3">Urgent Deadlines (90 Days)</h2>
          {urgent.length === 0 ? <p className="text-gray-400">No urgent deadlines</p> : (
            <div className="space-y-2">
              {urgent.slice(0, 5).map((p: any) => {
                const days = Math.ceil((new Date(p.expected_completion).getTime() - now) / 86400000);
                return (
                  <div key={p.id} className="p-3 border rounded">
                    <div className="flex justify-between">
                      <span className="font-medium text-sm">{p.target_platform_name}</span>
                      <span className={`text-xs font-bold ${days < 30 ? 'text-red-600' : 'text-yellow-600'}`}>{days}d left</span>
                    </div>
                    <div className="text-xs text-gray-500">{p.org_name} | {p.implementation_status} | {p.progress}%</div>
                    <div className="mt-1 bg-gray-200 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full" style={{width:`${p.progress}%`}}/></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {d.reminders.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="font-semibold text-lg mb-2 text-yellow-800">Post-Meeting Updates Needed</h2>
          {d.reminders.map((r: any) => (
            <Link key={r.id} href={`/meetings/${r.meeting_id}`} className="block p-2 hover:bg-yellow-100 rounded text-sm">
              <span className="font-medium">{r.meeting_title || 'Meeting'}</span>
              <span className="text-yellow-600 ml-2">- needs update notes</span>
            </Link>
          ))}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold text-lg mb-3">Sector Lead Workload</h2>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-3">
          {d.leads.map((l: any) => (
            <Link key={l.id} href="/sector-leads" className="border rounded p-3 hover:bg-emerald-50 transition">
              <div className="font-medium text-sm">{l.name_en}</div>
              <div className="text-xs text-gray-400">{l.name_ar}</div>
              <div className="text-xs text-gray-500 mt-1">{l.sector_count} sectors assigned</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
