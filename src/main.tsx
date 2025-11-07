import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import App from "./App.tsx";
import AdminRoute from "./admin/AdminRoute.tsx";
import ProjectPage from "./routes/ProjectPage.tsx";
import ProjectModal from "./components/ProjectModal.tsx";
import "./index.css";  // <- make sure this line exists

function RoutesWithModal() {
  const location = useLocation();
  const backgroundLocation = (location.state as any)?.backgroundLocation;
  return (
    <>
      <Routes location={backgroundLocation || location}>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<AdminRoute />} />
        {/* Full page when navigated directly */}
        <Route path="/projects/:slug" element={<ProjectPage />} />
      </Routes>
      {backgroundLocation && (
        <Routes>
          {/* Modal overlay when navigated from gallery */}
          <Route path="/projects/:slug" element={<ProjectModal />} />
        </Routes>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <RoutesWithModal />
    </BrowserRouter>
  </React.StrictMode>
);

