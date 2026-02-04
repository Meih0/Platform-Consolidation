'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [leadFilter, setLeadFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ sector_lead_id: '', org_id: '', sector_id: '', title: '', date: '', time: '', location: '', type: 'check-in', purpose: '' });

  async function load() {
    const [m, l, o, s] = await Promise.all([
      fetch('/api/meetings').then(r => r.json()),
      fetch('/api/sector-leads').then(r => r.json()),
      fetch('/api/organizations').then(r => r.json()),
      fetch('/api/sectors').then(r => r.json()),
    ]);
    setMeetings(m); setLeads(l); setOrgs(o); setSectors(s);
  }
  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/meetings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowForm(false); load();
  }

  const filtered = meetings.filter(m => {
    if (filter !== 'all' && m.status !== filter) return false;
    if (leadFilter && m.sector_lead_id !== leadFilter) return false;
    return true;
  });

  const typeColors: Record<string,string> = {
    'check-in': 'bg-blue-100 text-blue-700',
    'review': 'bg-purple-100 text-purple-700',
    'planning': 'bg-emerald-100 text-emerald-700',
    'escalation': 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Meetings</h1>
          <p className="text-sm text-gray-500">Schedule and track consolidation meetings</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-emerald-700 text-white px-4 py-2 rounded text-sm">
          {showForm ? 'Cancel' : '+ Schedule Meeting'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-gray-500">Status:</span>
        {['all', 'scheduled', 'completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded text-sm ${filter === f ? 'bg-emerald-700 text-white' : 'bg-white border'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <span className="text-sm text-gray-500 ml-4">Lead:</span>
        <select value={leadFilter} onChange={e => setLeadFilter(e.target.value)} className="border rounded px-2 py-1 text-sm">
          <option value="">All Leads</option>
          {leads.map(l => <option key={l.id} value={l.id}>{l.name_en}</option>)}
        </select>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white p-4 rounded shadow space-y-3">
          <input placeholder="Meeting title" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border rounded px-3 py-2" />
          <div className="grid grid-cols-3 gap-3">
            <select required value={form.sector_lead_id} onChange={e => setForm({...form, sector_lead_id: e.target.value})} className="border rounded px-3 py-2">
              <option value="">Sector Lead</option>
              {leads.map(l => <option key={l.id} value={l.id}>{l.name_en}</option>)}
            </select>
            <select value={form.sector_id} onChange={e => setForm({...form, sector_id: e.target.value})} className="border rounded px-3 py-2">
              <option value="">Sector</option>
              {sectors.map(s => <option key={s.id} value={s.id}>{s.name_en}</option>)}
            </select>
            <select value={form.org_id} onChange={e => setForm({...form, org_id: e.target.value})} className="border rounded px-3 py-2">
              <option value="">Organization</option>
              {orgs.filter(o => !form.sector_id || o.sector_id === form.sector_id).map(o => <option key={o.id} value={o.id}>{o.name_en}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="border rounded px-3 py-2" />
            <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="border rounded px-3 py-2" />
            <input placeholder="Location" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="border rounded px-3 py-2" />
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="border rounded px-3 py-2">
              <option value="check-in">Check-in</option><option value="review">Review</option>
              <option value="planning">Planning</option><option value="escalation">Escalation</option>
            </select>
          </div>
          <textarea placeholder="Purpose / Agenda" value={form.purpose} onChange={e => setForm({...form, purpose: e.target.value})} className="w-full border rounded px-3 py-2" />
          <button type="submit" className="bg-emerald-700 text-white px-4 py-2 rounded text-sm">Schedule Meeting</button>
        </form>
      )}

      <div className="space-y-3">
        {filtered.length === 0 && <p className="text-gray-400 p-4">No meetings found</p>}
        {filtered.map(m => (
          <Link key={m.id} href={`/meetings/${m.id}`} className="block bg-white p-4 rounded shadow hover:ring-2 hover:ring-emerald-300 transition">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{m.title}</h3>
                <div className="text-sm text-gray-500 mt-1">
                  {m.lead_name} | {m.org_name} | {m.sector_name}
                </div>
              </div>
              <div className="text-right flex flex-col gap-1 items-end">
                <div className="flex gap-1">
                  <span className={`text-xs px-2 py-0.5 rounded ${m.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{m.status}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${typeColors[m.type] || 'bg-gray-100'}`}>{m.type}</span>
                </div>
                <span className="text-sm text-gray-500">{m.date} {m.time}</span>
                {m.location && <span className="text-xs text-gray-400">{m.location}</span>}
              </div>
            </div>
            {m.purpose && <p className="text-sm text-gray-400 mt-2">{m.purpose}</p>}
            {m.status === 'completed' && !m.updates_entered && (
              <div className="mt-2 text-sm text-yellow-600 bg-yellow-50 rounded px-2 py-1">Updates not yet entered</div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
