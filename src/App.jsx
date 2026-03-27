import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import Revenue from "./pages/Revenue";
import Managers from "./pages/Managers";
import Centres from "./pages/Centres";
import Payments from "./pages/Payments";
import Students from "./pages/Students";

export default function App() {
  return (
    <Routes>

      {/* Layout Wrapper */}
      <Route path="/" element={<Layout />}>

        <Route index element={<Dashboard />} />
        <Route path="revenue" element={<Revenue />} />
        <Route path="managers" element={<Managers />} />
        <Route path="centres" element={<Centres />} />
        <Route path="payments" element={<Payments />} />
        <Route path="students" element={<Students />} />

      </Route>

    </Routes>
  );
}