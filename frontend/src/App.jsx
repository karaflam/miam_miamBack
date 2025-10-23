import { Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import Layout from "./components/Layout"
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import StudentDashboard from "./pages/StudentDashboard"
import EmployeeDashboard from "./pages/EmployeeDashboard"
import ManagerDashboard from "./pages/ManagerDashboard"
import AdminDashboard from "./pages/AdminDashboard"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          <Route
            path="student"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="employee"
            element={
              <ProtectedRoute allowedRoles={["employee"]}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="manager"
            element={
              <ProtectedRoute allowedRoles={["manager"]}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
