import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ShellLayout } from '@/components/shared/ShellLayout';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Lexi Explorer | Learn German Online',
  description: 'Learn German through interactive worlds, vocabulary, pronunciation, and games.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-white text-slate-900 antialiased">
        <ShellLayout>{children}</ShellLayout>
      </body>
    </html>
  );
}
