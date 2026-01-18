import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import DashboardNav from "../../components/layout/DashboardNav";
//import { Button } from "../../components/ui/Button";
import { CheckCircle, XCircle, Clock, ShieldAlert, Copy } from "lucide-react";
import { formatCurrency } from "../../lib/utils";

// REPLACE THIS WITH YOUR EXACT CLERK USER ID
const ADMIN_ID = "user_38NzlLcVtKKXdUsNLwb8Qd0wKNN"; 

export default function AdminPayouts() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  //const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    // Security Check: Redirect if not Admin
    if (user?.id !== ADMIN_ID) {
        alert("Access Denied: Admins only.");
        navigate('/dashboard/overview');
        return;
    }

    fetchRequests();
  }, [user, isLoaded, navigate]);

  async function fetchRequests() {
    // Fetch all requests (Pending first)
    const { data } = await supabase
      .from('payout_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setRequests(data);
    setLoading(false);
  }

  const handleStatusUpdate = async (id: string, newStatus: 'paid' | 'rejected') => {
    if (!window.confirm(`Mark this request as ${newStatus.toUpperCase()}?`)) return;

    setProcessingId(id);
    const { error } = await supabase
      .from('payout_requests')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
        alert("Error: " + error.message);
    } else {
        fetchRequests(); // Refresh UI
    }
    setProcessingId(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text.replace('UPI: ', ''));
    alert("UPI ID copied!");
  };

  if (!isLoaded) return null;

  const pendingTotal = requests
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="flex min-h-screen bg-cream font-sans text-black">
      <DashboardNav />
      <div className="flex-1 p-8 md:p-12 md:ml-64">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
            <div>
                <h1 className="text-4xl font-display flex items-center gap-3 text-red-600">
                    <ShieldAlert className="w-8 h-8" /> Admin Payouts
                </h1>
                <p className="opacity-60 mt-2">Manage withdrawals and organizer payments.</p>
            </div>
            <div className="bg-black text-white px-6 py-4 rounded-xl text-right">
                <p className="text-xs uppercase font-bold tracking-widest opacity-60">Pending Payouts</p>
                <p className="text-3xl font-display text-orange">{formatCurrency(pendingTotal)}</p>
            </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b-2 border-black font-bold uppercase tracking-widest text-xs opacity-60">
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-4">Payment Details</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-2 text-right">Actions</div>
            </div>

            <div className="divide-y divide-black/10">
                {requests.length === 0 ? (
                    <div className="p-12 text-center opacity-50">No payout requests found.</div>
                ) : (
                    requests.map((req) => (
                        <div key={req.id} className="grid grid-cols-12 gap-4 p-5 items-center hover:bg-orange/5 transition-colors">
                            
                            {/* Date */}
                            <div className="col-span-2 text-sm font-medium opacity-70">
                                {new Date(req.created_at).toLocaleDateString()}
                                <div className="text-xs opacity-50">{new Date(req.created_at).toLocaleTimeString()}</div>
                            </div>

                            {/* Amount */}
                            <div className="col-span-2 font-bold text-xl">
                                {formatCurrency(req.amount)}
                            </div>

                            {/* Payment Method (UPI) */}
                            <div className="col-span-4">
                                <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded border border-black/10 w-fit">
                                    <span className="font-mono text-sm">{req.payment_method}</span>
                                    <button onClick={() => copyToClipboard(req.payment_method)} className="opacity-50 hover:opacity-100 hover:text-orange">
                                        <Copy className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="text-[10px] uppercase font-bold tracking-widest opacity-40 mt-1">
                                    Organizer ID: {req.organizer_id.slice(0, 8)}...
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="col-span-2 flex justify-center">
                                {req.status === 'pending' && (
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full animate-pulse">
                                        <Clock className="w-3 h-3" /> Pending
                                    </span>
                                )}
                                {req.status === 'paid' && (
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                        <CheckCircle className="w-3 h-3" /> Paid
                                    </span>
                                )}
                                {req.status === 'rejected' && (
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-red-100 text-red-700 px-3 py-1 rounded-full">
                                        <XCircle className="w-3 h-3" /> Rejected
                                    </span>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="col-span-2 flex justify-end gap-2">
                                {req.status === 'pending' && (
                                    <>
                                        <button 
                                            onClick={() => handleStatusUpdate(req.id, 'paid')}
                                            disabled={!!processingId}
                                            className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors shadow-sm disabled:opacity-50"
                                            title="Mark as Paid"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => handleStatusUpdate(req.id, 'rejected')}
                                            disabled={!!processingId}
                                            className="bg-red-50 text-red-500 p-2 rounded hover:bg-red-100 transition-colors border border-red-200 disabled:opacity-50"
                                            title="Reject"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    </>
                                )}
                                {req.status !== 'pending' && (
                                    <span className="text-xs font-bold opacity-30 uppercase tracking-widest">
                                        {req.status === 'paid' ? 'Completed' : 'Closed'}
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
  );
}