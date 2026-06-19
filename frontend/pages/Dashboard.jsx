import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/axios.js";

function Dashboard() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [priorityAlerts, setPriorityAlerts] = useState([]);
  const role = localStorage.getItem("role") || "customer";
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
    fetchPriorityAlerts();
  }, [role]);

  const fetchPriorityAlerts = async () => {
    if (role === "warehouse" || role === "delivery" || role === "admin") {
      try {
        const res = await API.get("/notifications");
        const activeAlerts = res.data.filter(n => !n.isRead && n.type === "PRIORITY");
        setPriorityAlerts(activeAlerts);
      } catch (err) {
        console.error("Failed to load priority alerts:", err);
      }
    }
  };

  const handleAcknowledgeAlert = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setPriorityAlerts(prev => prev.filter(alert => alert._id !== id));
      alert("Priority nudge acknowledged.");
    } catch (err) {
      console.error("Failed to acknowledge alert:", err);
    }
  };

  const sendNudge = async (target) => {
    try {
      const payload = {
        title: target === "warehouse" ? "Priority: Warehouse Packing" : "Priority: Delivery Logistics",
        message: target === "warehouse"
          ? "Admin requested high priority for packing pending orders immediately."
          : "Admin requested high priority for shipping and delivering packed orders.",
        type: "PRIORITY"
      };
      await API.post("/notifications", payload);
      alert(`Nudge trigger successfully sent to ${target === "warehouse" ? "Warehouse" : "Delivery"} operations!`);
    } catch (err) {
      console.error("Nudge failed:", err);
      alert("Failed to send nudge message.");
    }
  };

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

  const renderAdminDashboard = () => {
    const warehousePriorityCount = priorityAlerts.filter(n => n.title.includes("Pack") || n.title.includes("Warehouse")).length;
    const deliveryPriorityCount = priorityAlerts.filter(n => n.title.includes("Dispatch") || n.title.includes("Delivery")).length;

    return (
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
            <div style={{ flex: "1 1 200px", padding: "15px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600", display: "block", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Warehouse Operations
                </span>
                <strong style={{ fontSize: "1.15rem", color: "#1e293b", display: "block", marginBottom: "12px" }}>
                  {data.pendingOrders ?? 0} Pending Packing
                </strong>
              </div>
              {warehousePriorityCount > 0 ? (
                <span style={{ fontSize: "0.8rem", color: "#ea580c", backgroundColor: "#ffedd5", padding: "6px 10px", borderRadius: "20px", display: "inline-block", fontWeight: "600", border: "1px solid #fed7aa", width: "fit-content" }}>
                  ⚠️ {warehousePriorityCount} Priority Nudges Active
                </span>
              ) : (
                <span style={{ fontSize: "0.8rem", color: "#16a34a", backgroundColor: "#dcfce7", padding: "6px 10px", borderRadius: "20px", display: "inline-block", fontWeight: "600", border: "1px solid #bbf7d0", width: "fit-content" }}>
                  ✓ Standard Priority
                </span>
              )}
            </div>
            <div style={{ flex: "1 1 200px", padding: "15px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600", display: "block", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Delivery Logistics
                </span>
                <strong style={{ fontSize: "1.15rem", color: "#1e293b", display: "block", marginBottom: "12px" }}>
                  {data.packedOrders ?? 0} Ready to Ship &middot; {data.shippedOrders ?? 0} In Transit
                </strong>
              </div>
              {deliveryPriorityCount > 0 ? (
                <span style={{ fontSize: "0.8rem", color: "#ea580c", backgroundColor: "#ffedd5", padding: "6px 10px", borderRadius: "20px", display: "inline-block", fontWeight: "600", border: "1px solid #fed7aa", width: "fit-content" }}>
                  ⚠️ {deliveryPriorityCount} Priority Nudges Active
                </span>
              ) : (
                <span style={{ fontSize: "0.8rem", color: "#16a34a", backgroundColor: "#dcfce7", padding: "6px 10px", borderRadius: "20px", display: "inline-block", fontWeight: "600", border: "1px solid #bbf7d0", width: "fit-content" }}>
                  ✓ Standard Priority
                </span>
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

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
          {priorityAlerts.map(alert => (
            <div
              key={alert._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
                color: "white",
                padding: "15px 20px",
                borderRadius: "8px",
                marginBottom: "25px",
                boxShadow: "0 4px 6px -1px rgba(239, 68, 68, 0.2)",
                border: "1px solid #dc2626"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "1.5rem" }}>⚠️</span>
                <div>
                  <strong style={{ fontSize: "1rem", display: "block", marginBottom: "2px" }}>{alert.title} (HIGH PRIORITY)</strong>
                  <span style={{ fontSize: "0.85rem", opacity: 0.95 }}>{alert.message}</span>
                </div>
              </div>
              <button
                onClick={() => handleAcknowledgeAlert(alert._id)}
                style={{
                  width: "auto",
                  padding: "8px 16px",
                  fontSize: "0.85rem",
                  borderRadius: "20px",
                  border: "none",
                  background: "#ffffff",
                  color: "#dc2626",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}
              >
                Acknowledge & Dismiss
              </button>
            </div>
          ))}
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