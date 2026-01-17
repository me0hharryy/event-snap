import { Routes, Route } from "react-router-dom";
import Landing from "./pages/public/Landing";
import Explore from "./pages/public/Explore";
import Pricing from "./pages/public/Pricing";
import Overview from "./pages/dashboard/Overview";
import CreateEvent from "./pages/dashboard/CreateEvent";
import Attendees from "./pages/dashboard/Attendees";
import SignInPage from "./pages/auth/SignIn";
import SignUpPage from "./pages/auth/SignUp";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/pricing" element={<Pricing />} />
      
      {/* Auth Routes */}
      <Route path="/sign-in/*" element={<SignInPage />} />
      <Route path="/sign-up/*" element={<SignUpPage />} />

      {/* Protected Dashboard Routes */}
      <Route path="/dashboard/overview" element={<SignedIn><Overview /></SignedIn>} />
      <Route path="/dashboard/events/new" element={<SignedIn><CreateEvent /></SignedIn>} />
      <Route path="/dashboard/attendees" element={<SignedIn><Attendees /></SignedIn>} />
      
      {/* Redirect unknown protected routes */}
      <Route path="/dashboard/*" element={<SignedOut><RedirectToSignIn /></SignedOut>} />
    </Routes>
  );
}