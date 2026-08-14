import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/Layout/AppShell";
import MapPage from "./pages/MapPage";
import CookPage from "./pages/CookPage";
import RepairPage from "./pages/RepairPage";

export default function App() {
    return (
        <Routes>
            <Route element={<AppShell />}>
                <Route path="/" element={<MapPage />} />
                <Route path="/cook" element={<CookPage />} />
                <Route path="/repair" element={<RepairPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
