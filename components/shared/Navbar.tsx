'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/games', label: 'Games' },
  { href: '/words', label: 'Words' },
  { href: '/sentences', label: 'Sentences' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <LinkBrand />
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'text-blue-600'
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

function LinkBrand() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="text-xl font-bold text-blue-600">LX</span>
      <span className="text-sm font-semibold text-slate-900">Lexi Explorer</span>
    </Link>
  );
}
