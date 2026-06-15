import "./App.css";
import Header from "./components/Header";
import MenuBar from "./components/MenuBar";
import Footer from "./components/Footer";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <div className="app">

      <div className="header">
        <Header />
      </div>

      <div className="menu">
        <MenuBar />
      </div>

      <div className="content">
        <AppRoutes />
      </div>

      <div className="footer">
        <Footer />
      </div>

    </div>
  );
}

export default App;