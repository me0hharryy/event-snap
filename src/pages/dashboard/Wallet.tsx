import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../../lib/supabase";
import DashboardNav from "../../components/layout/DashboardNav";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Clock, Wallet as WalletIcon, CheckCircle, AlertCircle, TrendingUp, ShieldCheck } from "lucide-react";
import { formatCurrency } from "../../lib/utils";

export default function Wallet() {
  const { user } = useUser();
  
  // Financial State
  const [totalSales, setTotalSales] = useState(0);    // Gross amount collected
  const [netEarnings, setNetEarnings] = useState(0);  // Organizer's share (85%)
  const [platformFee, setPlatformFee] = useState(0);  // Your share (15%)
  const [withdrawn, setWithdrawn] = useState(0);      // Money already paid out
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Withdrawal Form State
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");

  const COMMISSION_RATE = 0.15; // 15% Commission

  useEffect(() => {
    if (!user) return;
    fetchFinancials();
  }, [user]);

  async function fetchFinancials() {
    // 1. Calculate Gross Ticket Sales
    const { data: tickets } = await supabase
      .from('registrations')
      .select('amount_paid, events!inner(organizer_id)')
      .eq('events.organizer_id', user?.id)
      .eq('payment_status', 'paid');

    const gross = tickets?.reduce((sum, t) => sum + (t.amount_paid || 0), 0) || 0;
    
    // 2. Apply 15% Commission Logic
    const fee = gross * COMMISSION_RATE;
    const net = gross - fee;

    setTotalSales(gross);
    setPlatformFee(fee);
    setNetEarnings(net);

    // 3. Fetch Payout History (Withdrawn Amount)
    const { data: payoutHistory } = await supabase
      .from('payout_requests')
      .select('*')
      .eq('organizer_id', user?.id)
      .order('created_at', { ascending: false });

    if (payoutHistory) {
        setPayouts(payoutHistory);
        // Sum of Paid + Pending requests counts as "Withdrawn/Locked"
        const withdrawnTotal = payoutHistory
            .filter(p => p.status === 'paid' || p.status === 'pending') 
            .reduce((sum, p) => sum + p.amount, 0);
        setWithdrawn(withdrawnTotal);
    }
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = parseFloat(amount);
    const availableBalance = netEarnings - withdrawn;

    if (withdrawAmount <= 0) {
        alert("Enter a valid amount");
        return;
    }

    if (withdrawAmount > availableBalance) {
        alert("Insufficient balance.");
        return;
    }

    setLoading(true);
    const { error } = await supabase.from('payout_requests').insert({
        organizer_id: user?.id,
        amount: withdrawAmount,
        payment_method: `UPI: ${upiId}`,
        status: 'pending'
    });

    if (error) alert("Error: " + error.message);
    else {
        alert("Withdrawal request sent!");
        setAmount("");
        fetchFinancials(); // Refresh numbers immediately
    }
    setLoading(false);
  };

  const availableBalance = netEarnings - withdrawn;

  return (
    <div className="flex min-h-screen bg-cream font-sans text-black">
      <DashboardNav />
      <div className="flex-1 p-8 md:p-12 md:ml-64">
        
        {/* Header */}
        <h1 className="text-4xl font-display mb-8 flex items-center gap-3">
            <WalletIcon className="w-8 h-8" /> Wallet & Payouts
        </h1>

        {/* --- MAIN BALANCE CARD --- */}
        <div className="bg-black text-white p-8 rounded-3xl shadow-xl mb-12 flex flex-col md:flex-row justify-between items-center gap-8 border-2 border-white/10">
            <div>
                <p className="opacity-60 uppercase text-xs font-bold tracking-widest mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" /> Available to Withdraw
                </p>
                <div className="text-6xl font-display text-green-400 tracking-tight">
                    {formatCurrency(availableBalance)}
                </div>
            </div>
            <div className="bg-white/10 p-6 rounded-2xl w-full md:w-auto min-w-[300px]">
                <div className="flex justify-between items-center mb-3 text-sm opacity-80">
                    <span>Total Sales (Gross)</span>
                    <span className="font-bold">{formatCurrency(totalSales)}</span>
                </div>
                <div className="flex justify-between items-center mb-3 text-sm text-red-300">
                    <span>Platform Fee (15%)</span>
                    <span className="font-bold">-{formatCurrency(platformFee)}</span>
                </div>
                <div className="h-[1px] bg-white/20 my-3"></div>
                <div className="flex justify-between items-center text-lg font-bold">
                    <span>Your Net Earnings</span>
                    <span>{formatCurrency(netEarnings)}</span>
                </div>
            </div>
        </div>

        {/* --- WITHDRAWAL & HISTORY SECTION --- */}
        <div className="grid lg:grid-cols-2 gap-8">
            
            {/* Withdrawal Form */}
            <div className="bg-white p-8 border-2 border-black shadow-[8px_8px_0px_0px_#000] h-fit">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-display">Request Payout</h2>
                    <ShieldCheck className="w-6 h-6 opacity-30" />
                </div>
                
                <form onSubmit={handleWithdraw} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-60">Withdraw Amount (INR)</label>
                        <Input 
                            type="number" 
                            max={availableBalance} // Prevents entering more than balance
                            value={amount} 
                            onChange={e => setAmount(e.target.value)} 
                            required 
                            placeholder="0.00"
                            className="text-lg font-bold"
                        />
                        <p className="text-[10px] mt-2 opacity-50 text-right">
                            Max: {formatCurrency(availableBalance)}
                        </p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-60">UPI ID / GPay Number</label>
                        <Input 
                            value={upiId} 
                            onChange={e => setUpiId(e.target.value)} 
                            required 
                            placeholder="e.g. username@okicici"
                        />
                    </div>
                    <Button type="submit" disabled={loading || availableBalance <= 0} size="lg" className="w-full h-14 text-lg">
                        {loading ? "Processing..." : "Submit Request"}
                    </Button>
                    <p className="text-xs text-center opacity-50 flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3" /> Payouts are processed within 24 hours.
                    </p>
                </form>
            </div>

            {/* History Table */}
            <div className="bg-white border-2 border-black flex flex-col h-[500px]">
                <div className="p-5 border-b-2 border-black bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Transaction History
                    </h3>
                </div>
                <div className="divide-y divide-black/10 overflow-y-auto flex-1 custom-scrollbar">
                    {payouts.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-40">
                            <WalletIcon className="w-12 h-12 mb-4" />
                            <p>No transactions yet.</p>
                        </div>
                    ) : (
                        payouts.map(p => (
                            <div key={p.id} className="p-5 flex justify-between items-center hover:bg-orange/5 transition-colors">
                                <div>
                                    <div className="font-bold text-xl mb-1">{formatCurrency(p.amount)}</div>
                                    <div className="text-xs opacity-50 flex items-center gap-2 font-medium">
                                        {new Date(p.created_at).toLocaleDateString()} 
                                        <span className="w-1 h-1 bg-black rounded-full"></span>
                                        {p.payment_method}
                                    </div>
                                </div>
                                <div>
                                    {p.status === 'paid' && (
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-green-100 text-green-700 px-3 py-1.5 rounded-full">
                                            <CheckCircle className="w-3 h-3" /> Paid
                                        </span>
                                    )}
                                    {p.status === 'pending' && (
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full">
                                            <Clock className="w-3 h-3" /> Pending
                                        </span>
                                    )}
                                    {p.status === 'rejected' && (
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-red-100 text-red-700 px-3 py-1.5 rounded-full">
                                            <AlertCircle className="w-3 h-3" /> Rejected
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}