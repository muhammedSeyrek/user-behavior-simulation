import { NavLink, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import SimulationPage from "./pages/SimulationPage";
import SurveyPage from "./pages/SurveyPage";
import AwarenessPage from "./pages/AwarenessPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  return (
    <>
      <nav className="nav">
        <span className="nav-brand">PhishSim</span>
        <NavLink
          to="/"
          className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
        >
          Simülasyon
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
        >
          Dashboard
        </NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/simulation" element={<SimulationPage />} />
        <Route path="/survey" element={<SurveyPage />} />
        <Route path="/awareness" element={<AwarenessPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </>
  );
}
