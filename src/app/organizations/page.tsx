"use client";

import { useEffect, useState } from "react";

const orgTypeBadge = (type: string) => {
  if (type === "Torch Bearer + Org") return "bg-emerald-100 text-emerald-700";
  if (type === "Regulatory") return "bg-blue-100 text-blue-700";
  if (type === "Service Provider") return "bg-purple-100 text-purple-700";
  return "bg-gray-100 text-gray-600";
};

export default function OrganizationsPage() {
  const [data, setData] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [sectorFilter, setSectorFilter] = useState("");

  useEffect(() => {
    fetch("/api/organizations").then(r => r.json()).then(setData);
    fetch("/api/sectors").then(r => r.json()).then(setSectors);
  }, []);

  const filtered = sectorFilter
    ? data.filter((o) => String(o.sector_id) === sectorFilter)
    : data;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-emerald-700">Organizations</h1>
      <p className="text-gray-500 mt-1 mb-6">Government organizations and their consolidation roles</p>

      <div className="mb-8">
        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
        >
          <option value="">All Sectors</option>
          {sectors.map((s) => (
            <option key={s.id} value={s.id}>{s.name_en}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((org) => (
          <div key={org.id} className="bg-white rounded-lg shadow p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{org.name_en}</h2>
              <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                {org.id}
              </span>
            </div>
            <p className="text-sm text-gray-600" dir="rtl">{org.name_ar}</p>
            <div className="flex flex-wrap gap-2">
              <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${orgTypeBadge(org.org_type)}`}>
                {org.org_type}
              </span>
              <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${org.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                {org.status}
              </span>
            </div>
            <div className="space-y-1 text-sm text-gray-700">
              <p><span className="font-medium">Sector:</span> {org.sector_name_en}</p>
              {org.contact_email && (
                <p><span className="font-medium">Contact:</span> {org.contact_email}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
