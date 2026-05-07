import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { DashboardProvider } from "./context/DashboardContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <ThemeProvider>
        <DashboardProvider>
          <App />
        </DashboardProvider>
      </ThemeProvider>
    </AuthProvider>
  </BrowserRouter>
);