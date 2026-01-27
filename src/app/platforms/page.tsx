"use client";

import { useEffect, useState } from "react";

const statusBadge = (status: string) => {
  switch (status) {
    case "Completed": return "bg-emerald-100 text-emerald-700";
    case "In Progress": return "bg-yellow-100 text-yellow-700";
    case "Planning": return "bg-blue-100 text-blue-700";
    case "Not Started": return "bg-gray-100 text-gray-600";
    case "Blocked": return "bg-red-100 text-red-700";
    default: return "bg-gray-100 text-gray-600";
  }
};

const daysLeft = (dateStr: string) => {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
};

export default function PlatformsPage() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/platforms")
      .then(r => r.json())
      .then((items: any[]) => {
        const sorted = [...items].sort((a, b) => {
          if (!a.expected_completion) return 1;
          if (!b.expected_completion) return -1;
          return new Date(a.expected_completion).getTime() - new Date(b.expected_completion).getTime();
        });
        setData(sorted);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-emerald-700">Platforms</h1>
      <p className="text-gray-500 mt-1 mb-8">Platform migration and consolidation tracking</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.map((p) => {
          const days = daysLeft(p.expected_completion);
          const progress = typeof p.progress === "number" ? p.progress : 0;

          return (
            <div key={p.id} className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{p.target_platform_name}</h2>
                  <p className="text-sm text-gray-500">{p.org_name}</p>
                </div>
                <span className={`shrink-0 inline-block text-xs font-medium px-2.5 py-1 rounded-full ${statusBadge(p.implementation_status)}`}>
                  {p.implementation_status}
                </span>
              </div>

              {p.main_platform && (
                <p className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded inline-block">
                  Main Platform
                </p>
              )}

              <div className="text-sm text-gray-700 space-y-1">
                {(p.current_domain || p.new_domain) && (
                  <p>
                    <span className="font-medium">Domain:</span>{" "}
                    <span className="text-gray-400 line-through">{p.current_domain}</span>
                    {p.new_domain && <span> → <span className="text-emerald-700 font-medium">{p.new_domain}</span></span>}
                  </p>
                )}
                {p.expected_completion && (
                  <p>
                    <span className="font-medium">Expected:</span> {p.expected_completion}
                    {days !== null && (
                      <span className={`ml-2 text-xs font-medium ${days < 0 ? "text-red-600" : days < 30 ? "text-yellow-600" : "text-gray-500"}`}>
                        ({days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`})
                      </span>
                    )}
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {p.current_challenges && (
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Challenges:</span>
                  <p className="text-gray-500 mt-0.5">{p.current_challenges}</p>
                </div>
              )}

              {p.dga_support_required && (
                <p className="text-xs text-orange-600 font-medium">DGA Support Required</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
