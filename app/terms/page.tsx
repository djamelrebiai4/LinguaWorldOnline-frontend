export const metadata = {
  title: 'Terms of Service | Lexi Explorer',
  description: 'Lexi Explorer terms of service.',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Terms of Service</h1>

      <div className="prose prose-slate max-w-none">
        <p className="mb-4">
          Welcome to Lexi Explorer. By using our website, you agree to these
          terms.
        </p>
        <h2 className="text-lg font-semibold text-slate-900 mt-6 mb-2">
          Intellectual Property
        </h2>
        <p className="mb-4 text-slate-600">
          All content, code, and design on this site are the property of Lexi
          Explorer and are protected by copyright. Unauthorized copying or
          reproduction is prohibited.
        </p>
        <h2 className="text-lg font-semibold text-slate-900 mt-6 mb-2">
          Acceptable Use
        </h2>
        <p className="mb-4 text-slate-600">
          You may use this site for personal language learning. Automated
          scraping or attempts to extract backend logic are not permitted.
        </p>
        <h2 className="text-lg font-semibold text-slate-900 mt-6 mb-2">
          Contact
        </h2>
        <p className="mb-4 text-slate-600">
          legal@lexiexplorer.com
        </p>
      </div>
    </div>
  );
}
