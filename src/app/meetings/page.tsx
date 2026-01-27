'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [entities, setEntities] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ entity_id: '', contact_id: '', title: '', date: '', time: '', location: '', purpose: '' });

  async function load() {
    const [m, e, c] = await Promise.all([fetch('/api/meetings').then(r => r.json()), fetch('/api/entities').then(r => r.json()), fetch('/api/contacts').then(r => r.json())]);
    setMeetings(m); setEntities(e); setContacts(c);
  }
  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/meetings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, entity_id: Number(form.entity_id), contact_id: Number(form.contact_id) }) });
    setShowForm(false); load();
  }

  const filtered = filter === 'all' ? meetings : filter === 'upcoming' ? meetings.filter(m => m.status === 'scheduled') : meetings.filter(m => m.status === 'completed');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Meetings</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm">{showForm ? 'Cancel' : '+ Schedule Meeting'}</button>
      </div>
      <div className="flex gap-2">
        {['all', 'upcoming', 'completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded text-sm ${filter === f ? 'bg-indigo-600 text-white' : 'bg-white border'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      {showForm && (
        <form onSubmit={submit} className="bg-white p-4 rounded shadow space-y-3">
          <input placeholder="Meeting title" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border rounded px-3 py-2" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.entity_id} onChange={e => setForm({ ...form, entity_id: e.target.value })} className="border rounded px-3 py-2" required>
              <option value="">Select entity</option>
              {entities.map((ent: any) => <option key={ent.id} value={ent.id}>{ent.name}</option>)}
            </select>
            <select value={form.contact_id} onChange={e => setForm({ ...form, contact_id: e.target.value })} className="border rounded px-3 py-2" required>
              <option value="">Select contact</option>
              {contacts.filter((c: any) => !form.entity_id || c.entity_id === Number(form.entity_id)).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="border rounded px-3 py-2" required />
            <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="border rounded px-3 py-2" />
            <input placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="border rounded px-3 py-2" />
          </div>
          <textarea placeholder="Purpose" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} className="w-full border rounded px-3 py-2" />
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded text-sm">Schedule</button>
        </form>
      )}
      <div className="space-y-3">
        {filtered.map((m: any) => (
          <Link key={m.id} href={`/meetings/${m.id}`} className="block bg-white p-4 rounded shadow hover:ring-2 hover:ring-indigo-300 transition">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{m.title || m.entity_name}</h3>
                <p className="text-sm text-gray-500">{m.entity_name} - with {m.contact_name}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-0.5 rounded ${m.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{m.status}</span>
                <div className="text-sm text-gray-500 mt-1">{m.date} {m.time}</div>
              </div>
            </div>
            {m.purpose && <p className="text-sm text-gray-400 mt-2">{m.purpose}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
