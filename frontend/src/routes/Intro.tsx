import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Button } from "../components/Buttons";
import AuthModal from "../components/AuthModal";

export default function Intro() {
  
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <div onClick={() => setShowAuthModal(true)}>
        <Sidebar expanded={false} toggleSidebar={() => {}} />
      </div>    

      <div className="flex flex-col items-center justify-center min-h-screen bg-blue-200 text-white p-5">
        <h1 className="text-4xl font-bold mb-4">Welcome to ReMind</h1>

        <p className="text-lg mb-8 text-center max-w-xl">
          Your personal content management system. Organize, share, and access
          your favorite content all in one place.
        </p>

        <button
          className="bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 transition-colors duration-300"
          onClick={() => setShowAuthModal(true)}
        >Get Started</button>
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}
