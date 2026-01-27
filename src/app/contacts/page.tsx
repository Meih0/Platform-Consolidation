'use client';
import { useEffect, useState } from 'react';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [entities, setEntities] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', entity_id: '', role: '', email: '', phone: '', personality_notes: '' });
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const [c, e] = await Promise.all([fetch('/api/contacts').then(r => r.json()), fetch('/api/entities').then(r => r.json())]);
    setContacts(c); setEntities(e);
  }
  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/contacts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, entity_id: Number(form.entity_id) }) });
    setForm({ name: '', entity_id: '', role: '', email: '', phone: '', personality_notes: '' }); setShowForm(false); load();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm">{showForm ? 'Cancel' : '+ New Contact'}</button>
      </div>
      {showForm && (
        <form onSubmit={submit} className="bg-white p-4 rounded shadow space-y-3">
          <input placeholder="Full name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded px-3 py-2" />
          <select value={form.entity_id} onChange={e => setForm({ ...form, entity_id: e.target.value })} className="w-full border rounded px-3 py-2" required>
            <option value="">Select entity</option>
            {entities.map((ent: any) => <option key={ent.id} value={ent.id}>{ent.name}</option>)}
          </select>
          <input placeholder="Role / Title" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full border rounded px-3 py-2" />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="border rounded px-3 py-2" />
            <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="border rounded px-3 py-2" />
          </div>
          <textarea placeholder="Personality notes (communication style, preferences...)" value={form.personality_notes} onChange={e => setForm({ ...form, personality_notes: e.target.value })} className="w-full border rounded px-3 py-2" rows={3} />
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded text-sm">Save</button>
        </form>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        {contacts.map((c: any) => (
          <div key={c.id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-start">
              <div><h3 className="font-semibold">{c.name}</h3><p className="text-sm text-gray-500">{c.role}</p></div>
              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">{c.entity_name}</span>
            </div>
            <div className="text-sm mt-2 space-y-1">
              {c.email && <div>{c.email}</div>}
              {c.phone && <div>{c.phone}</div>}
            </div>
            {c.personality_notes && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-100 rounded text-sm">
                <span className="font-medium text-yellow-700">Personality Notes:</span>
                <p className="text-gray-600 mt-1">{c.personality_notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
