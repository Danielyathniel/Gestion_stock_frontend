import { createContext, useContext, useState } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Récupérer l'utilisateur depuis localStorage au chargement
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  function login(userData) {
   
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }

 async function logout() {
  try {
    await authService.logout(); // appel API AVANT de retirer le token
  } catch (error) {
    console.error(error);
  } finally {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
}

  // Vérifier si l'utilisateur est connecté
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
}