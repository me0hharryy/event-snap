import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-cream border-t-2 border-black py-16">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        
        {/* Logo */}
        <div className="flex items-center gap-2 font-display text-2xl text-black">
          <div className="bg-black p-1">
             <Zap className="w-6 h-6 fill-orange text-orange" />
          </div>
          EventSnap
        </div>

        {/* Links */}
        <div className="flex gap-8 font-accent text-lg uppercase tracking-wider text-black/70">
          <a href="#" className="hover:text-orange hover:underline decoration-2 underline-offset-4">Terms of the Show</a>
          <a href="#" className="hover:text-orange hover:underline decoration-2 underline-offset-4">Privacy Vault</a>
          <a href="#" className="hover:text-orange hover:underline decoration-2 underline-offset-4">Support Tent</a>
        </div>

        {/* Copyright */}
        <p className="font-body italic text-black/50">
          © {new Date().getFullYear()} EventSnap Inc. Est. 2024
        </p>
      </div>
    </footer>
  );
}