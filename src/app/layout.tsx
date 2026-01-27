import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Gov Platform Consolidation Tracker',
  description: 'Track government entity platform consolidation projects',
};

const nav = [
  { href: '/', label: 'Dashboard' },
  { href: '/entities', label: 'Entities' },
  { href: '/contacts', label: 'Contacts' },
  { href: '/platforms', label: 'Platforms' },
  { href: '/meetings', label: 'Meetings' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <nav className="bg-indigo-700 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-bold text-lg">GovTracker</Link>
            <div className="flex gap-4 text-sm">
              {nav.map(n => (
                <Link key={n.href} href={n.href} className="hover:text-indigo-200">{n.label}</Link>
              ))}
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
