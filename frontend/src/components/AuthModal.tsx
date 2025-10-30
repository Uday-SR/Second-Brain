import { useState } from "react";
import { Button } from "./Buttons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface AuthResponse {
  msg: string;
  token?: string;
}

interface AuthModalProps {
  onClose: () => void;
}

const navigate = useNavigate();

export default function AuthModal({ onClose }: AuthModalProps) {
  const [isSignIn, setIsSignIn] = useState(true);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

  const handleSignUp = () => {

    const handleSubmit = async (e: React.FormEvent) => {

      e.preventDefault(); 

      try {

        const res = await axios.post<AuthResponse>("localhost:3000/api/v1/user/signup", {
          username,
          email,
          password
        });

        setMessage(res.data.msg);

        if(res.data.token) {
          localStorage.setItem("token", res.data.token);
          navigate("/home")
        } else {
          setMessage("token failure. Please try again.");
        }

      } catch (error) {

        console.error("Error signing up:", error);
        
      }  
    }  
  }  

  const handleSignIn = () => {

    const handleSubmit = async (e: React.FormEvent) => {

      e.preventDefault(); 

      try {

        const res = await axios.post<AuthResponse>("localhost:3000/api/v1/user/signin", {
          email,
          password
        });

        setMessage(res.data.msg);

        if(res.data.token) {
          localStorage.setItem("token", res.data.token);
          //navigate to dashboard
        } else {
          setMessage("token failure. Please try again.");
        }

      } catch (error) {

        console.error("Error signing in:", error);
        
      }  
    }  
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md z-[9999]">
      <div className="bg-white text-black rounded-2xl shadow-2xl w-[90%] max-w-md p-6 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center mb-4">
          {isSignIn ? "Sign In" : "Sign Up"}
        </h2>

        <form className="flex flex-col space-y-4">
          {!isSignIn && (
            <input
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              placeholder="Username"
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          )}
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <Button
            variant="primary"
            size="sm"
            text={isSignIn ? "Sign In" : "Sign Up"}
            onClick={() => {
              if (!isSignIn) {
                handleSignUp();
              } else {
                handleSignIn();
              }
            }}
          />
        </form>

        <p className="text-sm text-center mt-4">
          {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsSignIn(!isSignIn)}
            className="text-blue-600 font-medium hover:underline"
          >
            {isSignIn ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}
