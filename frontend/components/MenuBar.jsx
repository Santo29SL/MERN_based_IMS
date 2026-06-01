import { NavLink } from "react-router-dom";

function MenuBar() {
  const role = localStorage.getItem("role");

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "15px",
        background: "linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
      }}
    >
      <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
        Dashboard
      </NavLink>

      <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
        Products
      </NavLink>

      <NavLink to="/orders" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
        Orders
      </NavLink>

      {role === "admin" && (
        <>
          <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            Reports
          </NavLink>

          <NavLink to="/notifications" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            Notifications
          </NavLink>
        </>
      )}

      {role === "warehouse" && (
        <>
          <NavLink to="/restocks" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            Restocks
          </NavLink>
          
          <NavLink to="/notifications" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            Notifications
          </NavLink>
        </>
      )}

      {role === "delivery" && (
        <NavLink to="/deliveries" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          Deliveries
        </NavLink>
      )}
    </div>
  );
}

export default MenuBar;