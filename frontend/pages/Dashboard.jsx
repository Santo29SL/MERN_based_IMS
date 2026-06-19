import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/axios.js";

function Dashboard() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("role") || "customer";
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, [role]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/dashboard/${role}`);
      setData(res.data);
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderAdminDashboard = () => (
    <>
      <div className="dashboard-grid">
        <div className="card card-info">
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{data.totalProducts ?? 0}</div>
        </div>
        <div className="card card-success">
          <div className="stat-label">Delivered Orders</div>
          <div className="stat-value">{data.deliveredOrders ?? 0}</div>
        </div>
        <div className="card card-warning">
          <div className="stat-label">Pending Restocks</div>
          <div className="stat-value">{data.pendingRestocks ?? 0}</div>
        </div>
        <div className="card card-danger">
          <div className="stat-label">Low Stock Products</div>
          <div className="stat-value">{data.lowStockProducts ?? 0}</div>
        </div>
      </div>

      <div className="interactive-panel">
        <h3 style={{ marginBottom: "15px" }}>Quick Management Shortcuts</h3>
        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginBottom: "25px" }}>
          <button className="btn-primary" style={{ width: "auto" }} onClick={() => navigate("/products")}>
            Manage Products Catalogue
          </button>
          <button className="btn-success" style={{ width: "auto" }} onClick={() => navigate("/reports")}>
            View Inventory Reports
          </button>
          <button className="btn-secondary" style={{ width: "auto" }} onClick={() => navigate("/orders")}>
            Review All Orders
          </button>
        </div>

        <h4 style={{ marginBottom: "12px", fontSize: "1.05rem", fontWeight: "600", color: "#374151" }}>
          Operations & Fulfillment Status
        </h4>
        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px", padding: "15px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600", display: "block", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Warehouse Operations
            </span>
            <strong style={{ fontSize: "1.15rem", color: "#1e293b" }}>
              {data.pendingOrders ?? 0} Pending Packing
            </strong>
          </div>
          <div style={{ flex: "1 1 200px", padding: "15px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600", display: "block", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Delivery Logistics
            </span>
            <strong style={{ fontSize: "1.15rem", color: "#1e293b" }}>
              {data.packedOrders ?? 0} Ready to Ship &middot; {data.shippedOrders ?? 0} In Transit
            </strong>
          </div>
        </div>
      </div>
    </>
  );

  const renderCustomerDashboard = () => (
    <>
      <div className="dashboard-grid">
        <div className="card card-primary">
          <div className="stat-label">Total Orders Placed</div>
          <div className="stat-value">{data.totalOrders ?? 0}</div>
        </div>
        <div className="card card-warning">
          <div className="stat-label">Active Orders</div>
          <div className="stat-value">{data.pendingOrders ?? 0}</div>
        </div>
        <div className="card card-success">
          <div className="stat-label">Orders Delivered</div>
          <div className="stat-value">{data.deliveredOrders ?? 0}</div>
        </div>
      </div>

      <div className="interactive-panel">
        <h3 style={{ marginBottom: "15px" }}>Welcome to SLS Store!</h3>
        <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
          Browse our premium catalog of high-quality products and place orders instantly.
        </p>
        <button className="btn-primary" style={{ width: "auto" }} onClick={() => navigate("/products")}>
          🛒 Start Shopping Now
        </button>
      </div>
    </>
  );

  const renderWarehouseDashboard = () => (
    <>
      <div className="dashboard-grid">
        <div className="card card-danger">
          <div className="stat-label">Pending Restocks</div>
          <div className="stat-value">{data.pendingRestocks ?? 0}</div>
        </div>
        <div className="card card-warning">
          <div className="stat-label">Pending Order Packing</div>
          <div className="stat-value">{data.pendingPacking ?? 0}</div>
        </div>
      </div>

      <div className="interactive-panel">
        <h3 style={{ marginBottom: "15px" }}>Warehouse Operations Dispatch</h3>
        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
          <button className="btn-primary" style={{ width: "auto" }} onClick={() => navigate("/restocks")}>
            Manage Restock Logs
          </button>
          <button className="btn-secondary" style={{ width: "auto" }} onClick={() => navigate("/orders")}>
            Pack Pending Customer Orders
          </button>
        </div>
      </div>
    </>
  );

  const renderDeliveryDashboard = () => (
    <>
      <div className="dashboard-grid">
        <div className="card card-warning">
          <div className="stat-label">Packed Orders (Ready to Ship)</div>
          <div className="stat-value">{data.packedOrders ?? 0}</div>
        </div>
        <div className="card card-info">
          <div className="stat-label">Orders Shipped (In Transit)</div>
          <div className="stat-value">{data.shippedOrders ?? 0}</div>
        </div>
        <div className="card card-success">
          <div className="stat-label">Completed Deliveries</div>
          <div className="stat-value">{data.deliveredOrders ?? 0}</div>
        </div>
      </div>

      <div className="interactive-panel">
        <h3 style={{ marginBottom: "15px" }}>Delivery Partner Dashboard</h3>
        <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
          Check for newly packed orders in the warehouse, ship them out, and mark them delivered on arrival.
        </p>
        <button className="btn-primary" style={{ width: "auto" }} onClick={() => navigate("/deliveries")}>
          🚚 Open Delivery Board
        </button>
      </div>
    </>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "35px" }}>
        <div>
          <h2 className="page-title">Dashboard Overview</h2>
          <p style={{ color: "var(--text-muted)", marginTop: "5px" }}>
            Welcome back! You are logged in as a{" "}
            <span style={{ color: "var(--primary-color)", fontWeight: "600", textTransform: "capitalize" }}>
              {role}
            </span>.
          </p>
        </div>
        <button className="btn-secondary" style={{ width: "auto" }} onClick={fetchDashboard}>
          🔄 Refresh Data
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: "600" }}>Loading statistics...</div>
        </div>
      ) : (
        <>
          {role === "admin" && renderAdminDashboard()}
          {role === "customer" && renderCustomerDashboard()}
          {role === "warehouse" && renderWarehouseDashboard()}
          {role === "delivery" && renderDeliveryDashboard()}
        </>
      )}
    </div>
  );
}

export default Dashboard;