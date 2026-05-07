import { useState } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import ProjectsPage from "./pages/Projects";
import TasksPage from "./pages/Tasks";
import EmployeesPage from "./pages/Employees";

function App() {
  const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
      <div className="mx-auto flex h-screen w-full max-w-[1700px] overflow-hidden bg-[#FAFAFA]">
        {/* Sidebar Overlay & Sliding Logic */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* YAHAN SE WOH PURANA TOOTA HUA MOBILE HEADER HATA DIYA HAI! */}
          <main className="flex-1 overflow-y-auto">
            <Routes>
              {/* Sabhi pages ko onMenuClick pass kiya hai taaki Topbar ka hamburger kaam kare */}
              <Route
                path="/dashboard"
                element={
                  <DashboardPage onMenuClick={() => setSidebarOpen(true)} />
                }
              />
              <Route
                path="/projects"
                element={
                  <ProjectsPage onMenuClick={() => setSidebarOpen(true)} />
                }
              />
              <Route
                path="/tasks"
                element={<TasksPage onMenuClick={() => setSidebarOpen(true)} />}
              />
              <Route
                path="/employees"
                element={
                  <EmployeesPage onMenuClick={() => setSidebarOpen(true)} />
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    );
  };

  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-[#FAFAFA] text-slate-900">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/*" element={<Layout />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
