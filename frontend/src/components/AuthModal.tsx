import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { backend } from "../lib/api";

interface AuthResponse {
  msg: string;
  token?: string;
}

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [isSignIn, setIsSignIn] = useState(true);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      // Uses the shared `backend` client from lib/api.ts instead of a
      // hardcoded URL, so this stays in sync with signin and every other call.
      const res = await backend.post<AuthResponse>("/user/signup", {
        username,
        email,
        password,
      });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        navigate("/home");
      } else {
        setMessage(res.data.msg);
      }
    } catch (error: any) {
      // The old version assumed error.response.data.error always exists,
      // which throws a second error (and shows nothing) on a network failure.
      setMessage(error?.response?.data?.error || "Something went wrong signing up. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const res = await backend.post<AuthResponse>("/user/signin", {
        email,
        password,
      });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        navigate("/home");
      } else {
        setMessage("Sign in failed. Please try again.");
      }
    } catch (error: any) {
      setMessage(error?.response?.data?.error || "Error signing in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md z-[9999]">
      <div className="bg-white text-black rounded-2xl shadow-2xl w-[90%] max-w-md p-6 relative animate-fadeIn">
        <button onClick={onClose} className="absolute top-2 right-3 text-gray-500 hover:text-black">
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center mb-4">{isSignIn ? "Sign In" : "Sign Up"}</h2>

        <form
          className="flex flex-col space-y-4"
          onSubmit={async (e) => {
            if (isSignIn) {
              await handleSignIn(e);
            } else {
              await handleSignUp(e);
            }
          }}
        >
          {!isSignIn && (
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              placeholder="Username"
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          )}

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            type="submit"
            disabled={submitting}
            className="bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 transition-colors duration-300 disabled:opacity-50"
          >
            {submitting ? "Please wait..." : "Submit"}
          </button>
        </form>

        {message && <p className="mt-3 text-sm text-red-600">{message}</p>}

        <p className="text-sm text-center mt-4">
          {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={() => setIsSignIn(!isSignIn)} className="text-blue-600 font-medium hover:underline">
            {isSignIn ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}
