import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  function login(email) {
    // Pas de vraie vérification de compte pour l'instant — on "connecte"
    // simplement avec l'email saisi. Le vrai contrôle (mot de passe,
    // backend) sera branché à une prochaine étape.
    const name = email.split("@")[0];
    setUser({ name, email });
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}