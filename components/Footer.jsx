export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white py-12 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          <div className="text-xs uppercase tracking-widest text-gray-400">
            © 2026 Minimal Blog. Crafted for clarity.
          </div>
          <div className="flex space-x-6 text-xs uppercase tracking-widest text-gray-500 font-medium">
            <a href="/privacy" className="hover:text-black transition-colors">
              Privacy
            </a>
            <a href="/terms" className="hover:text-black transition-colors">
              Terms
            </a>
            <a href="/about" className="hover:text-black transition-colors">
              About
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}



