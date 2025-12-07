import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import GrooveBoxMain from "./pages/GrooveBoxMain";
import Home from "./pages/Home";
import Help from "./pages/Help";
import "./style.css";

ReactDOM.createRoot(document.getElementById("app")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/groove" element={<GrooveBoxMain />} />
        <Route path="/help" element={<Help />} />
        <Route path="*" element={<Navigate to="/groove" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
