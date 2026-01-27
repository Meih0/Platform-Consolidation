'use client';
import { useEffect, useState } from 'react';

const actionColors: Record<string, string> = { merge: 'bg-blue-100 text-blue-700', delete: 'bg-red-100 text-red-700', consolidate: 'bg-green-100 text-green-700' };
const statusColors: Record<string, string> = { active: 'bg-yellow-100 text-yellow-700', completed: 'bg-green-100 text-green-700', blocked: 'bg-red-100 text-red-700' };

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [entities, setEntities] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', entity_id: '', action: 'consolidate', deadline: '', target_platform: '', notes: '' });
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const [p, e] = await Promise.all([fetch('/api/platforms').then(r => r.json()), fetch('/api/entities').then(r => r.json())]);
    setPlatforms(p); setEntities(e);
  }
  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/platforms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, entity_id: Number(form.entity_id) }) });
    setForm({ name: '', entity_id: '', action: 'consolidate', deadline: '', target_platform: '', notes: '' }); setShowForm(false); load();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Platforms</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm">{showForm ? 'Cancel' : '+ New Platform'}</button>
      </div>
      {showForm && (
        <form onSubmit={submit} className="bg-white p-4 rounded shadow space-y-3">
          <input placeholder="Platform name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded px-3 py-2" />
          <select value={form.entity_id} onChange={e => setForm({ ...form, entity_id: e.target.value })} className="w-full border rounded px-3 py-2" required>
            <option value="">Select entity</option>
            {entities.map((ent: any) => <option key={ent.id} value={ent.id}>{ent.name}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.action} onChange={e => setForm({ ...form, action: e.target.value })} className="border rounded px-3 py-2">
              <option value="merge">Merge</option><option value="delete">Delete</option><option value="consolidate">Consolidate</option>
            </select>
            <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="border rounded px-3 py-2" />
          </div>
          <input placeholder="Target platform (if merging)" value={form.target_platform} onChange={e => setForm({ ...form, target_platform: e.target.value })} className="w-full border rounded px-3 py-2" />
          <textarea placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full border rounded px-3 py-2" />
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded text-sm">Save</button>
        </form>
      )}
      <div className="space-y-3">
        {platforms.map((p: any) => {
          const daysLeft = p.deadline ? Math.ceil((new Date(p.deadline).getTime() - Date.now()) / 86400000) : null;
          return (
            <div key={p.id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-start">
                <div><h3 className="font-semibold">{p.name}</h3><p className="text-sm text-gray-500">{p.entity_name}</p></div>
                <div className="flex gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${actionColors[p.action] || ''}`}>{p.action}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${statusColors[p.status] || ''}`}>{p.status}</span>
                </div>
              </div>
              {p.notes && <p className="text-sm text-gray-500 mt-2">{p.notes}</p>}
              <div className="mt-3 flex items-center gap-4">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${p.progress}%` }} />
                </div>
                <span className="text-sm text-gray-500">{p.progress}%</span>
                {daysLeft !== null && (
                  <span className={`text-sm font-medium ${daysLeft < 30 ? 'text-red-600' : daysLeft < 60 ? 'text-yellow-600' : 'text-gray-500'}`}>
                    {daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}
                  </span>
                )}
              </div>
              {p.target_platform && <p className="text-xs text-gray-400 mt-1">Target: {p.target_platform}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
