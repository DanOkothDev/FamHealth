import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Members from "./pages/Members";
import Reminders from "./pages/Reminders";
import ProfilePage from "./pages/ProfilePage";
import { Navigate } from "react-router-dom";
import AnalyticsPage from "./pages/AnalyticsPage";
import Emergency from "./pages/Emergency";
import SettingsPage from "./pages/SettingsPage";


function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/members" element={<Members />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/emergency" element={<Emergency />} />
       
        <Route path="/settings" element={<SettingsPage />} />

        


      </Routes>
    </Router>
  );
}
