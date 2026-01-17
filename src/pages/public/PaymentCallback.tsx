import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import confetti from "canvas-confetti";

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    async function verify() {
      try {
        const res = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
        });
        
        const data = await res.json();

        if (res.ok) {
            setStatus('success');
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            // Redirect to Ticket Page after 2 seconds
            setTimeout(() => {
                navigate(`/tickets/${data.registrationId}`);
            }, 2000);
        } else {
            setStatus('error');
        }
      } catch (e) {
        setStatus('error');
      }
    }
    verify();
  }, [sessionId, navigate]);

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center text-center p-6">
      {status === 'verifying' && (
        <>
            <Loader2 className="w-16 h-16 animate-spin text-orange mb-4" />
            <h2 className="text-3xl font-display">Finalizing your ticket...</h2>
            <p className="text-black/50">Please do not close this window.</p>
        </>
      )}
      
      {status === 'success' && (
        <>
            <CheckCircle className="w-20 h-20 text-green-500 mb-4 animate-bounce" />
            <h2 className="text-4xl font-display">Payment Successful!</h2>
            <p className="text-black/50">Redirecting to your pass...</p>
        </>
      )}

      {status === 'error' && (
        <>
             <XCircle className="w-20 h-20 text-red-500 mb-4" />
            <h2 className="text-3xl font-display">Something went wrong.</h2>
            <p className="text-black/50 mb-6">We couldn't verify the payment.</p>
            <button onClick={() => navigate('/explore')} className="underline">Go to Home</button>
        </>
      )}
    </div>
  );
}