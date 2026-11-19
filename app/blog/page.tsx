export const metadata = {
  title: 'Blog | Lexi Explorer',
  description: 'Language learning tips and updates.',
};

export default function BlogPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Blog</h1>

      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <article key={i} className="border-b border-slate-200 pb-8 last:border-0">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              German Learning Tip {i}
            </h3>
            <p className="text-slate-600">
              Practical advice for improving your German skills through
              interactive practice.
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
