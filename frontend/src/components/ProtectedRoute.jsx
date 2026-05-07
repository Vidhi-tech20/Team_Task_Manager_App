import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="flex flex-col items-center gap-5 p-8 bg-white border border-gray-100 rounded-xl shadow-sm animate-pulse">
          <div className="h-6 w-6 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Initializing Session...
          </span>
        </div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
