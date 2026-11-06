import { Link } from "react-router-dom";
import Backdrop from "../components/Backdrop";
import { isSignedIn } from "../lib/api";

export default function NotFound() {
  return (
    <div className="relative isolate min-h-dvh w-full overflow-hidden">
      <Backdrop />
      <div className="flex min-h-dvh flex-col items-center justify-center p-5 text-center text-white">
        <h1 className="mb-2 text-5xl font-bold drop-shadow-lg">404</h1>
        <p className="mb-6 drop-shadow-md">That page doesn't exist.</p>
        <Link
          to={isSignedIn() ? "/home" : "/"}
          className="rounded-lg bg-purple-600 px-6 py-3 font-medium transition-colors duration-300 hover:bg-purple-700"
        >
          {isSignedIn() ? "Back to your brain" : "Back to start"}
        </Link>
      </div>
    </div>
  );
}
