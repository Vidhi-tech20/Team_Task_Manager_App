import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { socket } from "../socket";

export default function Topbar({ title, onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // FIXED: Initial state ab 0 aur empty array hai taaki refresh par faltu notification na dikhe
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user?.role !== "Member") return;

    const handleNewNotification = (data) => {
      setUnreadCount((prev) => prev + 1);

      const newNotif = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title: data?.title || "New Task",
        message:
          data?.message?.length > 50
            ? data.message.substring(0, 50) + "..."
            : data?.message || "A task was assigned to you.",
        time: "Just now",
        taskId: data?.taskId,
      };

      setNotifications((prev) => [newNotif, ...prev]);
      toast(newNotif.title, { icon: "🚀" });
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [user]);

  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleNotificationAction = () => {
    setUnreadCount(0); // FIXED: Click karte hi saare count gayab
    setShowNotifications(false);
    navigate("/tasks"); // Seedha Tasks page par bhej dega
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between bg-white/80 backdrop-blur-md px-4 sm:px-8 border-b border-slate-200">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 relative">
        {/* Notification Bell Container */}
        {user?.role === "Member" && (
          <div className="relative">
            <button
              onClick={handleBellClick}
              className={`relative p-2 rounded-xl transition-all ${
                showNotifications
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>

            {/* NEW: Bindi ki jagah ab Number wala Badge dikhega */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white ring-2 ring-white shadow-lg animate-in zoom-in">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-900">
                  Notifications
                </h3>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center text-xs font-bold text-slate-400">
                    No new tasks assigned yet.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={handleNotificationAction}
                      className="group p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3"
                    >
                      <div className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {notif.title}
                        </h4>
                        {/* Snippet logic applied here */}
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <button
                  onClick={() => setNotifications([])}
                  className="w-full py-3 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                >
                  Clear History
                </button>
              )}
            </div>
          )}
        </div>
        )}

        {/* User Profile */}
        <div className="flex items-center gap-3 ml-2 pl-4 border-l border-slate-200">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white shadow-sm ring-2 ring-slate-50">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-bold text-slate-900 truncate max-w-[80px]">
              {user?.name}
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase">
              {user?.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
