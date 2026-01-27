'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function MeetingPrepPage() {
  const { id } = useParams();
  const [meeting, setMeeting] = useState<any>(null);
  const [brief, setBrief] = useState<any>(null);
  const [updateForm, setUpdateForm] = useState({ notes: '', outcomes: '', next_steps: '' });
  const [saving, setSaving] = useState(false);

  async function load() {
    const [m, b] = await Promise.all([
      fetch(`/api/meetings/${id}`).then(r => r.json()),
      fetch(`/api/meetings/${id}/brief`).then(r => r.json()),
    ]);
    setMeeting(m); setBrief(b);
    if (m.notes) setUpdateForm({ notes: m.notes || '', outcomes: m.outcomes || '', next_steps: m.next_steps || '' });
  }
  useEffect(() => { load(); }, [id]);

  async function saveUpdates(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await fetch(`/api/meetings/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updateForm, status: 'completed', updates_entered: 1 }),
    });
    setSaving(false); load();
  }

  async function downloadPdf() {
    const jsPDF = (await import('jspdf')).default;
    await import('jspdf-autotable');
    const doc = new jsPDF();
    const b = brief;

    doc.setFontSize(18);
    doc.text('Meeting Brief', 14, 20);
    doc.setFontSize(14);
    doc.text(meeting.title || '', 14, 30);

    doc.setFontSize(10);
    let y = 40;
    doc.text(`Date: ${meeting.date} ${meeting.time || ''}  |  Location: ${meeting.location || 'TBD'}`, 14, y); y += 6;
    doc.text(`Type: ${meeting.type}  |  Status: ${meeting.status}`, 14, y); y += 6;
    doc.text(`Sector Lead: ${b.lead?.name_en || 'N/A'} (${b.lead?.name_ar || ''})`, 14, y); y += 6;
    doc.text(`Organization: ${b.org?.name_en || 'N/A'}  |  Sector: ${b.sector?.name_en || 'N/A'}`, 14, y); y += 10;

    if (b.lead?.personality_notes) {
      doc.setFontSize(12); doc.text('Personality & Communication Notes', 14, y); y += 6;
      doc.setFontSize(9);
      const lines = doc.splitTextToSize(b.lead.personality_notes, 180);
      doc.text(lines, 14, y); y += lines.length * 4 + 8;
    }

    if (b.platforms?.length) {
      doc.setFontSize(12); doc.text('Platform Deadlines (Next 4 Months)', 14, y); y += 4;
      (doc as any).autoTable({
        startY: y,
        head: [['Platform', 'Status', 'Progress', 'Deadline', 'Challenges']],
        body: b.platforms.map((p: any) => [p.target_platform_name, p.implementation_status, `${p.progress}%`, p.expected_completion || 'N/A', p.current_challenges || '-']),
        theme: 'grid', headStyles: { fillColor: [5, 102, 68] }, styles: { fontSize: 7 },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    }

    if (b.lastMeeting) {
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFontSize(12); doc.text('Previous Meeting Summary', 14, y); y += 6;
      doc.setFontSize(9);
      doc.text(`Date: ${b.lastMeeting.date} | Type: ${b.lastMeeting.type}`, 14, y); y += 5;
      if (b.lastMeeting.outcomes) { const ol = doc.splitTextToSize(`Outcomes: ${b.lastMeeting.outcomes}`, 180); doc.text(ol, 14, y); y += ol.length * 4 + 3; }
      if (b.lastMeeting.next_steps) { const nl = doc.splitTextToSize(`Next Steps: ${b.lastMeeting.next_steps}`, 180); doc.text(nl, 14, y); y += nl.length * 4 + 6; }
    }

    if (b.talkingPoints?.length) {
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFontSize(12); doc.text('Suggested Talking Points', 14, y); y += 6;
      doc.setFontSize(9);
      b.talkingPoints.forEach((tp: string) => {
        if (y > 275) { doc.addPage(); y = 20; }
        const tl = doc.splitTextToSize(`• ${tp}`, 175);
        doc.text(tl, 18, y); y += tl.length * 4 + 2;
      });
    }

    doc.save(`meeting-brief-${id}.pdf`);
  }

  if (!meeting) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <Link href="/meetings" className="text-sm text-emerald-700 hover:underline">Back to Meetings</Link>
          <h1 className="text-2xl font-bold mt-1">{meeting.title}</h1>
        </div>
        <button onClick={downloadPdf} className="bg-emerald-700 text-white px-4 py-2 rounded text-sm hover:bg-emerald-800">
          Download PDF Brief
        </button>
      </div>

      {/* Meeting Info */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold text-lg mb-2">Meeting Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><span className="text-gray-500">Date/Time:</span><br/>{meeting.date} {meeting.time}</div>
          <div><span className="text-gray-500">Location:</span><br/>{meeting.location || 'TBD'}</div>
          <div><span className="text-gray-500">Type:</span><br/>{meeting.type}</div>
          <div><span className="text-gray-500">Status:</span><br/>
            <span className={`px-2 py-0.5 rounded text-xs ${meeting.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{meeting.status}</span>
          </div>
        </div>
        {meeting.purpose && <p className="text-sm text-gray-500 mt-3"><span className="font-medium">Purpose:</span> {meeting.purpose}</p>}
      </div>

      {/* Sector Lead + Personality */}
      {brief?.lead && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold text-lg mb-2">Sector Lead: {brief.lead.name_en} <span className="text-gray-400 font-normal text-sm" dir="rtl">{brief.lead.name_ar}</span></h2>
          <div className="text-sm space-y-1">
            <p><span className="text-gray-500">Email:</span> {brief.lead.email}</p>
            <p><span className="text-gray-500">Phone:</span> {brief.lead.phone}</p>
            <p><span className="text-gray-500">Status:</span> {brief.lead.status}</p>
          </div>
          {brief.lead.personality_notes && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded">
              <span className="font-medium text-amber-800">Personality & Communication Notes:</span>
              <p className="mt-1 text-gray-700 text-sm">{brief.lead.personality_notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Organization & Sector Context */}
      {brief?.org && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-1">Organization</h3>
              <p className="text-sm">{brief.org.name_en} <span className="text-gray-400" dir="rtl">{brief.org.name_ar}</span></p>
              <p className="text-xs text-gray-500">{brief.org.org_type} | {brief.org.contact_email}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Sector</h3>
              <p className="text-sm">{brief.sector?.name_en} <span className="text-gray-400" dir="rtl">{brief.sector?.name_ar}</span></p>
              <p className="text-xs text-gray-500">Torch Bearer: {brief.sector?.torch_bearer_en}</p>
            </div>
          </div>
        </div>
      )}

      {/* Platforms with upcoming deadlines */}
      {brief?.platforms?.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold text-lg mb-2">Platforms — Deadlines Next 4 Months</h2>
          <div className="space-y-2">
            {brief.platforms.map((p: any) => (
              <div key={p.id} className="border rounded p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium text-sm">{p.target_platform_name}</span>
                    <span className="ml-2 text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">{p.implementation_status}</span>
                  </div>
                  <div className="text-right text-xs">
                    <div className="text-red-600 font-medium">{p.expected_completion}</div>
                    <div className="text-gray-500">{p.current_domain} → {p.new_domain}</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full" style={{width:`${p.progress}%`}}/></div>
                  <span className="text-xs text-gray-500">{p.progress}%</span>
                </div>
                {p.current_challenges && <p className="text-xs text-orange-600 mt-1">Challenges: {p.current_challenges}</p>}
                {p.dga_support_required && <p className="text-xs text-blue-600">DGA Support: {p.dga_support_required}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Meeting Summary */}
      {brief?.lastMeeting && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold text-lg mb-2">Previous Meeting Summary</h2>
          <p className="text-xs text-gray-500 mb-2">{brief.lastMeeting.date} — {brief.lastMeeting.title}</p>
          {brief.lastMeeting.outcomes && <p className="text-sm"><span className="font-medium">Outcomes:</span> {brief.lastMeeting.outcomes}</p>}
          {brief.lastMeeting.next_steps && <p className="text-sm mt-1"><span className="font-medium">Next Steps:</span> {brief.lastMeeting.next_steps}</p>}
          {brief.lastMeeting.notes && <p className="text-sm mt-1 text-gray-500"><span className="font-medium">Notes:</span> {brief.lastMeeting.notes}</p>}
        </div>
      )}

      {/* Talking Points */}
      {brief?.talkingPoints?.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold text-lg mb-2">Suggested Talking Points</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {brief.talkingPoints.map((tp: string, i: number) => <li key={i}>{tp}</li>)}
          </ul>
        </div>
      )}

      {/* Post-Meeting Update Form */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold text-lg mb-3">
          {meeting.updates_entered ? 'Post-Meeting Notes (Entered)' : 'Post-Meeting Update Form'}
        </h2>
        <form onSubmit={saveUpdates} className="space-y-3">
          <textarea placeholder="Meeting notes — what was discussed..." value={updateForm.notes} onChange={e => setUpdateForm({...updateForm, notes: e.target.value})} className="w-full border rounded px-3 py-2" rows={4} />
          <textarea placeholder="Key outcomes and decisions..." value={updateForm.outcomes} onChange={e => setUpdateForm({...updateForm, outcomes: e.target.value})} className="w-full border rounded px-3 py-2" rows={3} />
          <textarea placeholder="Next steps and action items..." value={updateForm.next_steps} onChange={e => setUpdateForm({...updateForm, next_steps: e.target.value})} className="w-full border rounded px-3 py-2" rows={3} />
          <button type="submit" disabled={saving} className="bg-emerald-700 text-white px-4 py-2 rounded text-sm hover:bg-emerald-800 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Updates & Mark Complete'}
          </button>
        </form>
      </div>
    </div>
  );
}
