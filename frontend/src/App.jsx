import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import EventPage from "./pages/EventPage";
import PublicGallery from "./pages/PublicGallery";
import Header from "./components/Header";
import "./App.css";

// A simple guard: if there's no token, bounce back to login.
// This is the FRONTEND version of protection -- the REAL security
// check always happens on the backend (frontend checks are just for UX).
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
}

function App() {
  return (
    <>
      {/* Header is placed once here, outside Routes, so it shows on
          every page automatically without repeating it in each one. */}
      <Header />
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:eventId"
          element={
            <ProtectedRoute>
              <EventPage />
            </ProtectedRoute>
          }
        />
        {/* This route is intentionally NOT protected -- customers access it
            with no login, just the link + PIN, per the requirement doc. */}
        <Route path="/gallery/:slug" element={<PublicGallery />} />
      </Routes>
    </>
  );
}

export default App;
