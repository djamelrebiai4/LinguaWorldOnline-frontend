export const metadata = {
  title: 'Sentences | Lexi Explorer',
  description: 'Practice German sentence construction.',
};

export default function SentencesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Sentences</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 rounded-xl border border-slate-200 bg-white">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Practice</h3>
          <p className="text-slate-600 mb-4">
            Build German sentences from word blocks.
          </p>
          <button className="btn-primary">Start Practice</button>
        </div>
        <div className="p-6 rounded-xl border border-slate-200 bg-white">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Examples</h3>
          <p className="text-slate-600 mb-4">
            Common German sentence patterns with translations.
          </p>
          <button className="btn-primary">View Examples</button>
        </div>
      </div>
    </div>
  );
}
