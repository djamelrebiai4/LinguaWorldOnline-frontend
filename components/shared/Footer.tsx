export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 mt-auto py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Lexi Explorer. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <a href="/privacy" className="hover:text-slate-700 transition-colors">
              Privacy
            </a>
            <a href="/terms" className="hover:text-slate-700 transition-colors">
              Terms
            </a>
            <a href="/contact" className="hover:text-slate-700 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
