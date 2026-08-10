import { getDb, delay } from "./mockDb";

const SESSION_KEY = "stockflow_session_v1";

// --- Quand le backend Laravel sera branché, remplacer par : ---
// export async function login(email, password) {
//   const { data } = await http.post("/api/login", { email, password });
//   localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
//   return data.user;
// }

export async function login(email, password) {
  await delay(400);
  const db = getDb();
  const user = db.users.find((u) => u.email === email && u.password === password);
  if (!user) {
    throw new Error("Identifiants invalides. Vérifiez votre email et votre mot de passe.");
  }
  const safeUser = { id: user.id, name: user.name, email: user.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
  return safeUser;
}

export async function logout() {
  await delay(150);
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
