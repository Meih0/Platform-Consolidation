import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Gov Platform Consolidation Tracker',
  description: 'Saudi Government Platform Consolidation Management System',
};

const nav = [
  { href: '/', label: 'Dashboard' },
  { href: '/sector-leads', label: 'Sector Leads' },
  { href: '/sectors', label: 'Sectors' },
  { href: '/organizations', label: 'Organizations' },
  { href: '/platforms', label: 'Platforms' },
  { href: '/meetings', label: 'Meetings' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <nav className="bg-emerald-800 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
            <Link href="/" className="font-bold text-lg tracking-tight">DGA Platform Tracker</Link>
            <div className="flex gap-1 sm:gap-3 text-sm flex-wrap">
              {nav.map(n => (
                <Link key={n.href} href={n.href} className="hover:text-emerald-200 px-2 py-1 rounded hover:bg-emerald-700 transition">{n.label}</Link>
              ))}
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
