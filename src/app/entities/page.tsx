'use client';
import { useEffect, useState } from 'react';

export default function EntitiesPage() {
  const [entities, setEntities] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', sector_id: '', acronym: '', tier: '', notes: '' });
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const [e, s] = await Promise.all([
      fetch('/api/entities').then(r => r.json()),
      fetch('/api/sectors').then(r => r.json()),
    ]);
    setEntities(e); setSectors(s);
  }
  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/entities', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, sector_id: Number(form.sector_id) }),
    });
    setForm({ name: '', sector_id: '', acronym: '', tier: '', notes: '' }); setShowForm(false); load();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Entities</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm">{showForm ? 'Cancel' : '+ New Entity'}</button>
      </div>
      {showForm && (
        <form onSubmit={submit} className="bg-white p-4 rounded shadow space-y-3">
          <input placeholder="Entity name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded px-3 py-2" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.sector_id} onChange={e => setForm({ ...form, sector_id: e.target.value })} className="border rounded px-3 py-2" required>
              <option value="">Select sector</option>
              {sectors.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input placeholder="Acronym" value={form.acronym} onChange={e => setForm({ ...form, acronym: e.target.value })} className="border rounded px-3 py-2" />
          </div>
          <textarea placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full border rounded px-3 py-2" />
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded text-sm">Save</button>
        </form>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        {entities.map((ent: any) => (
          <div key={ent.id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between">
              <h3 className="font-semibold">{ent.name} {ent.acronym && <span className="text-gray-400 text-sm">({ent.acronym})</span>}</h3>
              <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded">{ent.sector_name}</span>
            </div>
            {ent.tier && <div className="text-xs text-gray-400 mt-1">{ent.tier}</div>}
            <p className="text-sm text-gray-500 mt-1">{ent.notes || 'No notes'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
