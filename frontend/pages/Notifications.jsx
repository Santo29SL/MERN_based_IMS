import { useEffect, useState } from "react";
import API from "../services/axios.js";

function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await API.get("/notifications");
      setItems(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      alert("Notification marked as read");
      loadNotifications();
    } catch (err) {
      console.error(err);
      alert("Failed to update notification");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Notifications Dashboard</h2>
        <button className="btn-secondary" style={{ width: "auto" }} onClick={loadNotifications}>
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>Loading alerts...</div>
      ) : items.length === 0 ? (
        <div className="interactive-panel" style={{ textAlign: "center", padding: "30px", color: "#666" }}>
          No notifications found.
        </div>
      ) : (
        <div className="list-group">
          {items.map((item) => (
            <div
              key={item._id}
              className={`list-item ${!item.isRead ? "notif-unread" : ""}`}
              style={{
                backgroundColor: item.isRead ? "#ffffff" : "#f1f5f9",
                borderLeft: item.isRead ? "1px solid #d1d5db" : "4px solid #2196f3",
                padding: "15px",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px"
              }}
            >
              <div>
                <div style={{ fontWeight: "bold", fontSize: "1.05rem", color: "#111" }}>
                  {item.title}{" "}
                  <span className={`badge ${item.type === "LOW_STOCK" ? "badge-low" : "badge-delivered"}`} style={{ fontSize: "0.7rem", marginLeft: "8px" }}>
                    {item.type}
                  </span>
                </div>
                <div style={{ marginTop: "5px", color: "#444" }}>{item.message}</div>
                <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "5px" }}>
                  {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>

              <div>
                {!item.isRead ? (
                  <button
                    className="btn-primary"
                    style={{ padding: "6px 12px", fontSize: "0.85rem", width: "auto" }}
                    onClick={() => handleMarkAsRead(item._id)}
                  >
                    Mark as Read
                  </button>
                ) : (
                  <span style={{ fontSize: "0.85rem", color: "#888", fontWeight: "bold" }}>✓ Read</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;