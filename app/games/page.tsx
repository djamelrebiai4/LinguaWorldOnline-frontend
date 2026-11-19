export const metadata = {
  title: 'Games | Lexi Explorer',
  description: 'Interactive German learning games.',
};

export default function GamesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Games</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a
          href="/games/der-die-das"
          className="p-6 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-all group"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
            Der, Die, Das
          </h3>
          <p className="text-slate-600 text-sm">
            Practice German articles with interactive quiz.
          </p>
        </a>
        <a
          href="/games/vocabulary"
          className="p-6 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-all group"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
            Vocabulary Game
          </h3>
          <p className="text-slate-600 text-sm">
            Match German words with translations.
          </p>
        </a>
        <a
          href="/games/dialogue"
          className="p-6 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-all group"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
            Dialogue Simulator
          </h3>
          <p className="text-slate-600 text-sm">
            Practice German conversations with NPCs.
          </p>
        </a>
      </div>
    </div>
  );
}
