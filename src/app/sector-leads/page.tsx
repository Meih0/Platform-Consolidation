'use client';
import { useEffect, useState } from 'react';

export default function SectorLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ id: '', name_en: '', name_ar: '', email: '', phone: '', personality_notes: '' });
  const [detail, setDetail] = useState<any>(null);

  async function load() {
    const r = await fetch('/api/sector-leads').then(r => r.json());
    setLeads(r);
  }
  useEffect(() => { load(); }, []);

  async function loadDetail(id: string) {
    const r = await fetch(`/api/sector-leads/${id}`).then(r => r.json());
    setDetail(r);
  }

  async function createLead(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/sector-leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newForm) });
    setNewForm({ id: '', name_en: '', name_ar: '', email: '', phone: '', personality_notes: '' });
    setShowNew(false); load();
  }

  async function updateLead(id: string) {
    await fetch(`/api/sector-leads/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setEditing(null); load();
    if (detail?.id === id) loadDetail(id);
  }

  function startEdit(lead: any) {
    setEditing(lead.id);
    setForm({ name_en: lead.name_en, name_ar: lead.name_ar || '', email: lead.email || '', phone: lead.phone || '', personality_notes: lead.personality_notes || '', status: lead.status });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Sector Leads</h1>
          <p className="text-sm text-gray-500">DGA project managers overseeing platform consolidation</p>
        </div>
        <button onClick={() => setShowNew(!showNew)} className="bg-emerald-700 text-white px-4 py-2 rounded text-sm">
          {showNew ? 'Cancel' : '+ New Sector Lead'}
        </button>
      </div>

      {showNew && (
        <form onSubmit={createLead} className="bg-white p-4 rounded shadow space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="ID (e.g. SL-006)" required value={newForm.id} onChange={e => setNewForm({...newForm, id: e.target.value})} className="border rounded px-3 py-2" />
            <input placeholder="Status" value="Active" disabled className="border rounded px-3 py-2 bg-gray-50" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Name (English)" required value={newForm.name_en} onChange={e => setNewForm({...newForm, name_en: e.target.value})} className="border rounded px-3 py-2" />
            <input placeholder="Name (Arabic)" dir="rtl" value={newForm.name_ar} onChange={e => setNewForm({...newForm, name_ar: e.target.value})} className="border rounded px-3 py-2" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Email" value={newForm.email} onChange={e => setNewForm({...newForm, email: e.target.value})} className="border rounded px-3 py-2" />
            <input placeholder="Phone" value={newForm.phone} onChange={e => setNewForm({...newForm, phone: e.target.value})} className="border rounded px-3 py-2" />
          </div>
          <textarea placeholder="Personality & communication notes..." rows={3} value={newForm.personality_notes} onChange={e => setNewForm({...newForm, personality_notes: e.target.value})} className="w-full border rounded px-3 py-2" />
          <button type="submit" className="bg-emerald-700 text-white px-4 py-2 rounded text-sm">Create Sector Lead</button>
        </form>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leads.map(l => (
          <div key={l.id} className={`bg-white rounded-lg shadow p-4 ${detail?.id === l.id ? 'ring-2 ring-emerald-400' : ''}`}>
            {editing === l.id ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input value={form.name_en} onChange={e => setForm({...form, name_en: e.target.value})} className="border rounded px-2 py-1 text-sm" />
                  <input dir="rtl" value={form.name_ar} onChange={e => setForm({...form, name_ar: e.target.value})} className="border rounded px-2 py-1 text-sm" />
                </div>
                <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border rounded px-2 py-1 text-sm" placeholder="Email" />
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border rounded px-2 py-1 text-sm" placeholder="Phone" />
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border rounded px-2 py-1 text-sm">
                  <option value="Active">Active</option><option value="On Leave">On Leave</option><option value="Transitioning">Transitioning</option>
                </select>
                <textarea value={form.personality_notes} onChange={e => setForm({...form, personality_notes: e.target.value})} rows={3} className="w-full border rounded px-2 py-1 text-sm" placeholder="Personality notes..." />
                <div className="flex gap-2">
                  <button onClick={() => updateLead(l.id)} className="bg-emerald-700 text-white px-3 py-1 rounded text-sm">Save</button>
                  <button onClick={() => setEditing(null)} className="border px-3 py-1 rounded text-sm">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{l.name_en}</h3>
                    <p className="text-sm text-gray-400" dir="rtl">{l.name_ar}</p>
                  </div>
                  <div className="flex gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${l.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{l.status}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">{l.id}</span>
                  </div>
                </div>
                <div className="text-sm mt-2 space-y-1 text-gray-600">
                  {l.email && <div>{l.email}</div>}
                  {l.phone && <div>{l.phone}</div>}
                  <div className="text-emerald-700 font-medium">{l.sector_count} sectors assigned</div>
                </div>
                {l.personality_notes && (
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded text-sm">
                    <span className="font-medium text-amber-700">Personality Notes:</span>
                    <p className="text-gray-600 mt-1 text-xs">{l.personality_notes}</p>
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  <button onClick={() => startEdit(l)} className="text-sm text-emerald-700 hover:underline">Edit</button>
                  <button onClick={() => loadDetail(l.id)} className="text-sm text-blue-600 hover:underline">View Sectors</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {detail && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold text-lg mb-3">Assigned Sectors - {detail.name_en}</h2>
          {detail.sectors?.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-2">
              {detail.sectors.map((s: any) => (
                <div key={s.sector_id} className="border rounded p-3">
                  <div className="flex justify-between">
                    <span className="font-medium">{s.name_en}</span>
                    <span className="text-xs text-gray-400">{s.sector_id}</span>
                  </div>
                  <div className="text-xs text-gray-500" dir="rtl">{s.name_ar}</div>
                  <div className="text-xs text-gray-400 mt-1">Torch Bearer: {s.torch_bearer_en}</div>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400">No sectors assigned</p>}
        </div>
      )}
    </div>
  );
}
