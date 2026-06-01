import { useState, useEffect } from "react";
import AppRoutes from "./routes/AppRoutes.jsx";
import Header from "./components/Header.jsx";
import MenuBar from "./components/MenuBar.jsx";
import Footer from "./components/Footer.jsx";
import "./App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const handleAuthChange = () => {
      setToken(localStorage.getItem("token"));
    };

    // Listen to storage changes from other tabs and auth-change events from this tab
    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("auth-change", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, []);

  return (
    <div className="app">
      {token ? (
        <>
          <header className="header">
            <Header />
          </header>
          <nav className="menu">
            <MenuBar />
          </nav>
          <main className="content">
            <AppRoutes />
          </main>
          <footer className="footer">
            <Footer />
          </footer>
        </>
      ) : (
        <main className="auth-wrapper">
          <AppRoutes />
        </main>
      )}
    </div>
  );
}

export default App;
