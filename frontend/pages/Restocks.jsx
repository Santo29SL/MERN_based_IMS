import { useEffect, useState } from "react";
import API from "../services/axios.js";

function Restocks() {
  const [restocks, setRestocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRestocks();
  }, []);

  const loadRestocks = async () => {
    try {
      setLoading(true);
      const res = await API.get("/warehouse/restocks");
      setRestocks(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load restock requests");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRestock = async (restockId, defaultQty) => {
    const qtyInput = window.prompt("Enter quantity added to stock:", defaultQty || 100);
    if (qtyInput === null) return; // User cancelled
    
    const qty = parseInt(qtyInput);
    if (isNaN(qty) || qty <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }

    try {
      await API.put(`/warehouse/restocks/${restockId}`, { quantityAdded: qty });
      alert("Restock completed successfully!");
      loadRestocks();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to complete restock");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Restock Requests</h2>
        <button className="btn-secondary" style={{ width: "auto" }} onClick={loadRestocks}>
          🔄 Refresh Restocks
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>Loading restock logs...</div>
      ) : restocks.length === 0 ? (
        <div className="interactive-panel" style={{ textAlign: "center", padding: "30px", color: "#666" }}>
          No restock requests found. Excellent! All inventory stocks are healthy.
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Current Stock</th>
                <th>Requested Qty</th>
                <th>Status</th>
                <th>Request Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {restocks.map((r) => (
                <tr key={r._id}>
                  <td>
                    <strong>{r.productId?.productName || "Unknown Product"}</strong>
                  </td>
                  <td>{r.currentStock} Units</td>
                  <td>{r.requestedQuantity} Units</td>
                  <td>
                    <span className={`badge ${r.status === "completed" ? "badge-delivered" : "badge-pending"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td>
                    {r.status === "pending" ? (
                      <button
                        className="btn-success"
                        style={{ padding: "6px 12px", fontSize: "0.85rem", width: "auto" }}
                        onClick={() => handleCompleteRestock(r._id, r.requestedQuantity)}
                      >
                        Complete Restock
                      </button>
                    ) : (
                      <span style={{ fontSize: "0.85rem", color: "#666" }}>Done</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Restocks;