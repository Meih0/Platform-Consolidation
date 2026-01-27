'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function MeetingPrepPage() {
  const { id } = useParams();
  const [meeting, setMeeting] = useState<any>(null);
  const [brief, setBrief] = useState<any>(null);
  const [updateForm, setUpdateForm] = useState({ notes: '', summary: '' });
  const [saving, setSaving] = useState(false);

  async function load() {
    const [m, b] = await Promise.all([
      fetch(`/api/meetings/${id}`).then(r => r.json()),
      fetch(`/api/meetings/${id}/brief`).then(r => r.json()),
    ]);
    setMeeting(m);
    setBrief(b);
    if (m.notes) setUpdateForm({ notes: m.notes || '', summary: m.summary || '' });
  }
  useEffect(() => { load(); }, [id]);

  async function saveUpdates(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/meetings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updateForm, status: 'completed' }),
    });
    setSaving(false);
    load();
  }

  async function downloadPdf() {
    const jsPDF = (await import('jspdf')).default;
    await import('jspdf-autotable');
    const doc = new jsPDF();
    const b = brief;

    doc.setFontSize(18);
    doc.text('Meeting Brief', 14, 20);
    doc.setFontSize(12);
    doc.text(`${meeting.title || 'Meeting'}`, 14, 30);
    doc.setFontSize(10);
    doc.text(`Entity: ${b.entity?.name || 'N/A'} (${b.entity?.acronym || ''}) - ${b.entity?.sector || ''}`, 14, 38);
    doc.text(`Contact: ${b.contact?.name || 'N/A'} - ${b.contact?.role || ''}`, 14, 45);
    doc.text(`Date: ${meeting.date} ${meeting.time || ''} | Location: ${meeting.location || 'TBD'}`, 14, 52);

    let y = 62;
    if (b.contact?.personality) {
      doc.setFontSize(12);
      doc.text('Personality Notes', 14, y); y += 6;
      doc.setFontSize(9);
      const lines = doc.splitTextToSize(b.contact.personality, 180);
      doc.text(lines, 14, y); y += lines.length * 4 + 8;
    }

    if (b.platforms?.length) {
      doc.setFontSize(12);
      doc.text('Platform Deadlines (Next 3-4 Months)', 14, y); y += 4;
      (doc as any).autoTable({
        startY: y,
        head: [['Platform', 'Action', 'Status', 'Progress', 'Deadline']],
        body: b.platforms.map((p: any) => [p.name, p.action, p.status, `${p.progress}%`, p.deadline || 'N/A']),
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 8 },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    }

    if (b.lastMeeting) {
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFontSize(12);
      doc.text('Last Meeting Summary', 14, y); y += 6;
      doc.setFontSize(9);
      doc.text(`Date: ${b.lastMeeting.date}`, 14, y); y += 5;
      if (b.lastMeeting.summary) {
        const sl = doc.splitTextToSize(`Summary: ${b.lastMeeting.summary}`, 180);
        doc.text(sl, 14, y); y += sl.length * 4 + 6;
      }
    }

    if (b.talkingPoints?.length) {
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFontSize(12);
      doc.text('Suggested Talking Points', 14, y); y += 6;
      doc.setFontSize(9);
      b.talkingPoints.forEach((tp: string) => {
        if (y > 275) { doc.addPage(); y = 20; }
        const tl = doc.splitTextToSize(`- ${tp}`, 175);
        doc.text(tl, 18, y); y += tl.length * 4 + 2;
      });
    }

    doc.save(`meeting-brief-${id}.pdf`);
  }

  if (!meeting) return <p className="p-8 text-gray-500">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <Link href="/meetings" className="text-sm text-indigo-600 hover:underline">Back to Meetings</Link>
          <h1 className="text-2xl font-bold mt-1">{meeting.title || 'Meeting Prep'}</h1>
        </div>
        <button onClick={downloadPdf} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700">
          Download PDF Brief
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold text-lg mb-2">Meeting Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><span className="text-gray-500">Date:</span><br/>{meeting.date} {meeting.time}</div>
          <div><span className="text-gray-500">Location:</span><br/>{meeting.location || 'TBD'}</div>
          <div><span className="text-gray-500">Purpose:</span><br/>{meeting.purpose || 'N/A'}</div>
          <div><span className="text-gray-500">Status:</span><br/>
            <span className={`px-2 py-0.5 rounded text-xs ${meeting.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{meeting.status}</span>
          </div>
        </div>
      </div>

      {brief?.contact && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold text-lg mb-2">Contact: {brief.contact.name}</h2>
          <div className="text-sm space-y-1">
            <p><span className="text-gray-500">Role:</span> {brief.contact.role}</p>
            <p><span className="text-gray-500">Email:</span> {brief.contact.email}</p>
          </div>
          {brief.contact.personality && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <span className="font-medium text-yellow-800">Personality Notes:</span>
              <p className="mt-1 text-gray-700">{brief.contact.personality}</p>
            </div>
          )}
        </div>
      )}

      {brief?.platforms?.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold text-lg mb-2">Platforms (Deadlines Next 3-4 Months)</h2>
          <div className="space-y-2">
            {brief.platforms.map((p: any) => (
              <div key={p.id} className="border rounded p-3 flex justify-between items-center">
                <div>
                  <span className="font-medium">{p.name}</span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded ${p.action === 'delete' ? 'bg-red-100 text-red-700' : p.action === 'merge' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{p.action}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm">{p.progress}%</div>
                  <div className="text-xs text-red-600">{p.deadline}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {brief?.lastMeeting && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold text-lg mb-2">Last Meeting Summary</h2>
          <p className="text-sm text-gray-500 mb-2">{brief.lastMeeting.date}</p>
          {brief.lastMeeting.summary && <p className="text-sm"><span className="font-medium">Summary:</span> {brief.lastMeeting.summary}</p>}
          {brief.lastMeeting.notes && <p className="text-sm mt-1"><span className="font-medium">Notes:</span> {brief.lastMeeting.notes}</p>}
        </div>
      )}

      {brief?.talkingPoints?.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold text-lg mb-2">Suggested Talking Points</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {brief.talkingPoints.map((tp: string, i: number) => <li key={i}>{tp}</li>)}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold text-lg mb-3">
          {meeting.status === 'completed' && meeting.notes ? 'Post-Meeting Notes (Entered)' : 'Post-Meeting Update Form'}
        </h2>
        <form onSubmit={saveUpdates} className="space-y-3">
          <textarea placeholder="Meeting notes..." value={updateForm.notes} onChange={e => setUpdateForm({ ...updateForm, notes: e.target.value })} className="w-full border rounded px-3 py-2" rows={4} />
          <textarea placeholder="Summary / outcomes / next steps..." value={updateForm.summary} onChange={e => setUpdateForm({ ...updateForm, summary: e.target.value })} className="w-full border rounded px-3 py-2" rows={3} />
          <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Updates & Mark Complete'}
          </button>
        </form>
      </div>
    </div>
  );
}
