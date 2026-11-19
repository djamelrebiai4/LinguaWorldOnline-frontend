import { DerDieDasGame } from '@/components/games/DerDieDasGame';

export default function DerDieDasPage() {
  return (
    <div className="max-w-lg mx-auto py-12">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Der, Die, Das</h1>
      <p className="text-slate-600 mb-8">
        Choose the correct article for each German word.
      </p>
      <DerDieDasGame />
    </div>
  );
}
