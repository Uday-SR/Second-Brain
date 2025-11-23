import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {

    e.preventDefault(); 

    try {

      const res = await axios.post<AuthResponse>("https://second-brain-backend-alpha.vercel.app/api/v1/user/signup", {
        username,
        email,
        password
      });

      setMessage(res.data.msg);

      if(res.data.token) {
        localStorage.setItem("token", res.data.token);
        navigate("/home")
      }

    } catch (error: any) {

      setMessage(`${error.response.data.error}`);
        
    }  
  }  

  const handleSignIn = async (e: React.FormEvent) => {

    e.preventDefault(); 

    try {

      const res = await axios.post<AuthResponse>("https://second-brain-backend-alpha.vercel.app/api/v1/user/signin", {
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

      setMessage(res.data.msg);

    } catch (error) {

      setMessage(`Error signing in!`);
        
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

        <form className="flex flex-col space-y-4" onSubmit={async (e) => {
            if(isSignIn) {
              await handleSignIn(e);
            } else {
              await handleSignUp(e);
            }
          }}>

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

          <button type="submit" className="bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 transition-colors duration-300" 
>Submit</button>

        </form>

        {message && <p>{message}</p>}

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
