import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CategoriesPage from "./pages/CategoriesPage";
import ArticlesPage from "./pages/ArticlesPage";
import ArticleDetailPage from "./pages/ArticleDetailPage";
import MovementsPage from "./pages/MovementsPage";
import ReportsPage from "./pages/ReportsPage";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
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
              <Route index element={<DashboardPage />} handle={{ title: "Tableau de bord" }} />
              <Route
                path="categories"
                element={<CategoriesPage />}
                handle={{ title: "Catégories", subtitle: "Gérez les familles d'articles" }}
              />
              <Route
                path="articles"
                element={<ArticlesPage />}
                handle={{ title: "Articles", subtitle: "Fiches produits et niveaux de stock" }}
              />
              <Route
                path="articles/:id"
                element={<ArticleDetailPage />}
                handle={{ title: "Détail de l'article" }}
              />
              <Route
                path="mouvements"
                element={<MovementsPage />}
                handle={{ title: "Mouvements", subtitle: "Entrées et sorties de stock" }}
              />
              <Route
                path="rapports"
                element={<ReportsPage />}
                handle={{ title: "Rapports", subtitle: "Consultez et imprimez vos rapports" }}
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
