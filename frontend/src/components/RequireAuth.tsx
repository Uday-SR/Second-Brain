import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { isSignedIn } from "../lib/api";

export default function RequireAuth({ children }: { children: ReactNode }) {
  if (!isSignedIn()) return <Navigate to="/" replace />;
  return <>{children}</>;
}
