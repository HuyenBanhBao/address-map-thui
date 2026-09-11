import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/Layout/AppShell";
import MapPage from "./pages/MapPage";
import CookPage from "./pages/CookPage";
import RepairPage from "./pages/RepairPage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import ToshibaPage from "./pages/ToshibaPage";
import FamilyHealthPage from "./pages/FamilyHealthPage";
import HomePage from "./pages/HomePage";

export default function App() {
    return (
        <Routes>
            <Route element={<AppShell />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/cook" element={<CookPage />} />
                <Route path="/cook/:recipeId" element={<RecipeDetailPage />} />
                <Route path="/repair" element={<RepairPage />} />
                <Route path="/toshiba" element={<ToshibaPage />} />
                <Route path="/health" element={<FamilyHealthPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
