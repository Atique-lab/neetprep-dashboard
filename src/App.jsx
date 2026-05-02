import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import { useAuth } from "./context/AuthContext";

import Dashboard from "./pages/Dashboard";
import Revenue from "./pages/Revenue";
import Managers from "./pages/Managers";
import ManagerDetail from "./pages/ManagerDetail";
import Centres from "./pages/Centres";
import CentreDetail from "./pages/CentreDetail";
import Payments from "./pages/Payments";
import Students from "./pages/Students";
import Courses from "./pages/Courses";

function AppRoutes() {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="revenue" element={<Revenue />} />
        <Route path="managers" element={<Managers />} />
        <Route path="managers/:id" element={<ManagerDetail />} />
        <Route path="centres" element={<Centres />} />
        <Route path="centres/:id" element={<CentreDetail />} />
        <Route path="payments" element={<Payments />} />
        <Route path="students" element={<Students />} />
        <Route path="courses" element={<Courses />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}