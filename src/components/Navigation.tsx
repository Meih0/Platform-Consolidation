'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/entities', label: 'Entities', icon: '🏛️' },
    { href: '/meetings', label: 'Meetings', icon: '📅' },
    { href: '/platforms', label: 'Platforms', icon: '💻' },
    { href: '/contacts', label: 'Contacts', icon: '👥' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-primary">Gov Entity Tracker</h1>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    pathname === link.href
                      ? 'text-primary bg-blue-50'
                      : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden border-t border-gray-200">
        <div className="flex overflow-x-auto pb-2 pt-2 px-2 space-x-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-shrink-0 px-3 py-2 text-sm font-medium rounded-md ${
                pathname === link.href
                  ? 'text-primary bg-blue-50'
                  : 'text-gray-700 hover:text-primary hover:bg-gray-50'
              }`}
            >
              <span className="mr-1">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
