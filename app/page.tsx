import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Lexi Explorer | Learn German Online',
  description:
    'Learn German through interactive worlds, vocabulary, pronunciation, and games.',
};

export default function HomePage() {
  redirect('/index.html');
}
