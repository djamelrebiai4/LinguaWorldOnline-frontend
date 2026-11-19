import { contentApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';

export const metadata = {
  title: 'Words | Lexi Explorer',
  description: 'German vocabulary with articles, gender, and examples.',
};

export default async function WordsPage() {
  // Fetch vocab from backend — no content hardcoded in frontend
  let vocab: any[] = [];
  let error: string | null = null;

  try {
    vocab = await contentApi.getVocab();
  } catch (err: any) {
    error = err.message || 'Failed to load vocabulary from backend.';
    vocab = [];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Vocabulary</h1>

      {error && (
        <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 mb-6">
          {error}
        </div>
      )}

      {vocab.length === 0 && !error ? (
        <div className="p-6 rounded-lg border border-slate-200 bg-slate-50 text-center">
          <p className="text-slate-600">No vocabulary available. Backend may not be configured.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-3 text-left text-sm font-semibold text-slate-600">
                  German
                </th>
                <th className="pb-3 text-left text-sm font-semibold text-slate-600">
                  Article
                </th>
                <th className="pb-3 text-left text-sm font-semibold text-slate-600">
                  English
                </th>
                <th className="pb-3 text-left text-sm font-semibold text-slate-600">
                  Arabic
                </th>
                <th className="pb-3 text-left text-sm font-semibold text-slate-600">
                  World
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vocab.map((item) => (
                <tr key={item.key} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 text-slate-900 font-medium">
                    {item.de}
                  </td>
                  <td className="py-3 text-slate-600">
                    {item.article || '—'}
                  </td>
                  <td className="py-3 text-slate-600">
                    {item.en || '—'}
                  </td>
                  <td className="py-3 text-slate-600">
                    {item.ar || '—'}
                  </td>
                  <td className="py-3 text-slate-600 text-xs">
                    {item.world || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
