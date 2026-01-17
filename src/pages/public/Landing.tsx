import MarketingNav from "../../components/layout/MarketingNav";
import Footer from "../../components/layout/Footer";
import Hero from "../../components/marketing/Hero"; // Import the new file

export default function Landing() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <MarketingNav />
      <Hero />
      <Footer />
    </div>
  );
}