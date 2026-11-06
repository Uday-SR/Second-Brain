import { useState } from "react";
import { Navigate } from "react-router-dom";
import { isSignedIn } from "../lib/api";
import { Sidebar } from "../components/Sidebar";
import AuthModal from "../components/AuthModal";
import Backdrop from "../components/Backdrop";

export default function Intro() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (isSignedIn()) return <Navigate to="/home" replace />;

  return (
    <div className="relative isolate min-h-dvh w-full overflow-hidden">
      <Backdrop />

      <div onClick={() => setShowAuthModal(true)}>
        <Sidebar expanded={false} toggleSidebar={() => {}} interactive={false} />
      </div>

      <main className="flex min-h-dvh flex-col items-center justify-center px-5 pl-[4.75rem] text-center text-white sm:px-8 sm:pl-28">
        <h1 className="mb-4 text-3xl font-bold leading-tight drop-shadow-lg sm:text-4xl md:text-5xl">
          Welcome to ReMind
        </h1>

        <p className="mb-8 max-w-xl text-base drop-shadow-md sm:text-lg">
          Your personal content management system. Organize, share, and access
          your favorite content all in one place.
        </p>

        <button
          className="w-full max-w-xs rounded-lg bg-purple-600 px-6 py-3 font-medium text-white transition-colors duration-300 hover:bg-purple-700 sm:w-auto"
          onClick={() => setShowAuthModal(true)}
        >
          Get Started
        </button>
      </main>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}
