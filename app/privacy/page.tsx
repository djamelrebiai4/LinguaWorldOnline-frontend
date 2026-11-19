export const metadata = {
  title: 'Privacy Policy | Lexi Explorer',
  description: 'Lexi Explorer privacy policy.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Privacy Policy</h1>

      <div className="prose prose-slate max-w-none">
        <p className="mb-4">
          Lexi Explorer respects your privacy. This policy explains what
          information we collect and how we use it.
        </p>
        <h2 className="text-lg font-semibold text-slate-900 mt-6 mb-2">
          Information We Collect
        </h2>
        <p className="mb-4 text-slate-600">
          We may collect account information you provide when you sign up,
          including your email address and language preferences.
        </p>
        <h2 className="text-lg font-semibold text-slate-900 mt-6 mb-2">
          Data Storage
        </h2>
        <p className="mb-4 text-slate-600">
          User progress and account data are stored securely in our backend
          database. We do not sell your personal information.
        </p>
        <h2 className="text-lg font-semibold text-slate-900 mt-6 mb-2">
          Contact
        </h2>
        <p className="mb-4 text-slate-600">
          Questions about this policy? Contact us at
          privacy@lexiexplorer.com.
        </p>
      </div>
    </div>
  );
}
