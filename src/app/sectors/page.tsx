'use client';

import { useEffect, useState } from 'react';

export default function SectorsPage() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/sectors').then(r => r.json()).then(setData);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-emerald-700">Sectors</h1>
      <p className="text-gray-500 mt-1 mb-8">Government sectors participating in the platform consolidation initiative</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((sector) => (
          <div key={sector.id} className="bg-white rounded-lg shadow p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{sector.name_en}</h2>
              <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                {sector.id}
              </span>
            </div>
            <p className="text-sm text-gray-600" dir="rtl">{sector.name_ar}</p>
            <div className="space-y-1 text-sm text-gray-700">
              <p><span className="font-medium">Torch Bearer:</span> {sector.torch_bearer_en}</p>
              <p><span className="font-medium">Lead:</span> {sector.lead_name}</p>
              <p><span className="font-medium">Organizations:</span> {sector.org_count}</p>
            </div>
            <div>
              <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${sector.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                {sector.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
