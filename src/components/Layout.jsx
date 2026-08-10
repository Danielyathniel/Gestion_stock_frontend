import { Outlet, useMatches } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout() {
  const matches = useMatches();
  const current = [...matches].reverse().find((m) => m.handle?.title);
  const title = current?.handle?.title || "StockFlow";
  const subtitle = current?.handle?.subtitle;

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-col">
        <Header title={title} subtitle={subtitle} />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
