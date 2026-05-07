import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: "◒" },
  { label: "Projects", path: "/projects", icon: "❖" },
  { label: "Tasks", path: "/tasks", icon: "⌘" },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col gap-6 border-r border-gray-200 bg-white p-6 shadow-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:flex lg:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between lg:hidden">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Team Task Manager
            </p>
            <h1 className="text-lg font-bold text-gray-900">Workspace</h1>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-lg"
          >
            ✕
          </button>
        </div>

        <div className="hidden lg:block">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Team Task Manager
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mt-1">
            Workspace
          </h1>
        </div>

        <nav className="space-y-1 flex-1 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              <span className="text-lg opacity-80">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
          {user?.role === "Admin" && (
            <div className="pt-4 mt-4 border-t border-gray-100">
              <NavLink
                to="/employees"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <span className="text-lg opacity-80">⊞</span> Employees
              </NavLink>
            </div>
          )}
        </nav>

        <div className="mt-auto border border-gray-100 bg-gray-50 rounded-2xl p-4">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900 truncate">
              {user?.name}
            </span>
            <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>{" "}
              {user?.role}
            </span>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="mt-4 w-full rounded-xl bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm border border-gray-200 hover:bg-slate-900 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {open && (
        <button
          onClick={onClose}
          className="fixed inset-0 z-30 bg-gray-900/20 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl animate-in zoom-in-95">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Confirm Logout</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to log out of your workspace?
            </p>
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-bold text-gray-600 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  logout();
                }}
                className="flex-1 rounded-xl bg-rose-600 py-3 text-sm font-bold text-white hover:bg-rose-700 shadow-md"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
