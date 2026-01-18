import { Link } from "react-router-dom";
import { XCircle, ArrowLeft } from "lucide-react";
import MarketingNav from "../../components/layout/MarketingNav";

export default function PaymentFailure() {
  return (
    <div className="min-h-screen bg-cream font-sans">
      <MarketingNav />
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        
        <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 animate-shake">
            <XCircle className="w-12 h-12" />
        </div>

        <h1 className="text-4xl md:text-5xl font-display mb-4">Payment Failed</h1>
        <p className="text-xl opacity-60 max-w-md mb-8">
            We couldn't process your payment. You haven't been charged.
        </p>

        <div className="flex flex-col md:flex-row gap-4">
            <Link to="/explore" className="bg-black text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-orange transition-colors flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Browse Events
            </Link>
        </div>

        <p className="mt-8 text-sm opacity-40 font-mono">
            Error Code: PAYU_TXN_FAILED
        </p>
      </div>
    </div>
  );
}