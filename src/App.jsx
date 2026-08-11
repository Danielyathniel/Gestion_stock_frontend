import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CategoriesPage from "./pages/CategoriesPage";
import ArticlesPage from "./pages/ArticlesPage";
import MovementsInPage from "./pages/MovementsInPage";
import MovementsOutPage from "./pages/MovementsOutPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/connexion" element={<LoginPage />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="articles" element={<ArticlesPage />} />
            <Route path="mouvements/entrees" element={<MovementsInPage />} />
            <Route path="mouvements/sorties" element={<MovementsOutPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}