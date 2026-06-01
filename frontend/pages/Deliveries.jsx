import { useEffect, useState } from "react";
import API from "../services/axios.js";

function Deliveries() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const res = await API.get("/delivery/orders");
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load delivery orders");
    } finally {
      setLoading(false);
    }
  };

  const handleShipOrder = async (id) => {
    try {
      await API.put(`/delivery/orders/${id}/shipped`);
      alert("Order status updated to SHIPPED (In Transit)!");
      loadDeliveries();
    } catch (err) {
      console.error(err);
      alert("Failed to ship order");
    }
  };

  const handleDeliverOrder = async (id) => {
    try {
      await API.put(`/delivery/orders/${id}/delivered`);
      alert("Order marked as DELIVERED successfully!");
      loadDeliveries();
    } catch (err) {
      console.error(err);
      alert("Failed to deliver order");
    }
  };

  // Filter orders by packed and shipped statuses
  const packedOrders = orders.filter((o) => o.status === "packed");
  const shippedOrders = orders.filter((o) => o.status === "shipped");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
        <h2>Delivery Dispatch Board</h2>
        <button className="btn-secondary" style={{ width: "auto" }} onClick={loadDeliveries}>
          🔄 Refresh Deliveries
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>Loading delivery manifest...</div>
      ) : (
        <div className="grid-2">
          {/* SECTION 1: READY FOR SHIPMENT */}
          <div className="interactive-panel">
            <h3 style={{ borderBottom: "2px solid #2196f3", paddingBottom: "10px", marginBottom: "15px", color: "#2196f3" }}>
              📦 Ready to Ship ({packedOrders.length})
            </h3>
            {packedOrders.length === 0 ? (
              <p style={{ color: "#666", padding: "10px 0" }}>No packed orders waiting for shipment.</p>
            ) : (
              <div className="list-group">
                {packedOrders.map((o) => (
                  <div key={o._id} className="list-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: "10px" }}>
                    <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                      <strong>Order #{o._id.substring(o._id.length - 8)}</strong>
                      <span className="badge badge-packed">{o.status}</span>
                    </div>
                    <div style={{ fontSize: "0.9rem" }}>
                      Product: <strong>{o.product?.productName}</strong> ({o.quantity} Units)
                    </div>
                    <div style={{ fontSize: "0.9rem" }}>
                      Customer: <strong>{o.customer?.name}</strong>
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#666" }}>
                      Address: {o.product?.warehouseLocation || "Main Warehouse Dispatch Hub"}
                    </div>
                    <button
                      className="btn-primary"
                      onClick={() => handleShipOrder(o._id)}
                      style={{ marginTop: "5px", padding: "8px 12px", fontSize: "0.85rem" }}
                    >
                      🚚 Pickup & Ship Order
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 2: ACTIVE TRANSITS */}
          <div className="interactive-panel">
            <h3 style={{ borderBottom: "2px solid #8b5cf6", paddingBottom: "10px", marginBottom: "15px", color: "#8b5cf6" }}>
              ⚡ In Transit ({shippedOrders.length})
            </h3>
            {shippedOrders.length === 0 ? (
              <p style={{ color: "#666", padding: "10px 0" }}>No active shipments in transit.</p>
            ) : (
              <div className="list-group">
                {shippedOrders.map((o) => (
                  <div key={o._id} className="list-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: "10px" }}>
                    <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                      <strong>Order #{o._id.substring(o._id.length - 8)}</strong>
                      <span className="badge badge-shipped">{o.status}</span>
                    </div>
                    <div style={{ fontSize: "0.9rem" }}>
                      Product: <strong>{o.product?.productName}</strong> ({o.quantity} Units)
                    </div>
                    <div style={{ fontSize: "0.9rem" }}>
                      Customer: <strong>{o.customer?.name}</strong>
                    </div>
                    <button
                      className="btn-success"
                      onClick={() => handleDeliverOrder(o._id)}
                      style={{ marginTop: "5px", padding: "8px 12px", fontSize: "0.85rem" }}
                    >
                      ✓ Mark as Delivered
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Deliveries;