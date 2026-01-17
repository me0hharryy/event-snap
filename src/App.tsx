import { Routes, Route } from "react-router-dom";
import Landing from "./pages/public/Landing";
import Explore from "./pages/public/Explore";
import Pricing from "./pages/public/Pricing";
import Register from "./pages/public/Register";
import TicketView from "./pages/public/TicketView";
import PaymentCallback from "./pages/public/PaymentCallback"; // NEW
import Overview from "./pages/dashboard/Overview";
import CreateEvent from "./pages/dashboard/CreateEvent";
import EditEvent from "./pages/dashboard/EditEvent";
import Attendees from "./pages/dashboard/Attendees";
import MyTickets from "./pages/dashboard/MyTickets";
import SignInPage from "./pages/auth/SignIn";
import SignUpPage from "./pages/auth/SignUp";
import ScannerPage from "./pages/dashboard/Scanner";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/register/:id" element={<Register />} />
      <Route path="/tickets/:id" element={<TicketView />} />
      <Route path="/payment/callback" element={<PaymentCallback />} /> {/* NEW ROUTE */}
      
      {/* Auth Routes */}
      <Route path="/sign-in/*" element={<SignInPage />} />
      <Route path="/sign-up/*" element={<SignUpPage />} />

      {/* Protected Dashboard Routes */}
      <Route path="/dashboard/overview" element={<SignedIn><Overview /></SignedIn>} />
      <Route path="/dashboard/tickets" element={<SignedIn><MyTickets /></SignedIn>} />
      <Route path="/dashboard/events/new" element={<SignedIn><CreateEvent /></SignedIn>} />
      <Route path="/dashboard/events/edit/:id" element={<SignedIn><EditEvent /></SignedIn>} />
      <Route path="/dashboard/attendees" element={<SignedIn><Attendees /></SignedIn>} />
      <Route path="/dashboard/scan" element={<SignedIn><ScannerPage /></SignedIn>} />
      {/* Redirect unknown protected routes */}
      <Route path="/dashboard/*" element={<SignedOut><RedirectToSignIn /></SignedOut>} />
    </Routes>
  );
}