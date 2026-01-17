export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} EventSnap Inc. All rights reserved.</p>
      </div>
    </footer>
  );
}