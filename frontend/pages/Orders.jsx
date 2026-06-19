import React, { useEffect, useState } from "react";
import API from "../services/axios.js";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [groupBy, setGroupBy] = useState("none");
  const role = localStorage.getItem("role") || "customer";

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url =
        role === "admin"
          ? "/orders"
          : role === "warehouse"
          ? "/warehouse/orders"
          : "/orders/myorders";
      const res = await API.get(url);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handlePackOrder = async (id) => {
    try {
      await API.put(`/warehouse/orders/${id}/packed`);
      alert("Order marked as packed successfully!");
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to pack order");
    }
  };

  const handleSendNudge = async (order) => {
    try {
      const target = order.status === "pending" ? "warehouse" : "delivery";
      const payload = {
        title: target === "warehouse"
          ? `Priority: Pack Order #${order._id.substring(order._id.length - 8)}`
          : `Priority: Dispatch Order #${order._id.substring(order._id.length - 8)}`,
        message: `Admin has prioritized the delivery of ${order.product?.productName || "Product"} (${order.quantity} Units).`,
        type: "PRIORITY"
      };
      await API.post("/notifications", payload);
      alert(`Nudge trigger successfully sent to ${target === "warehouse" ? "Warehouse" : "Delivery"} for Order #${order._id.substring(order._id.length - 8)}!`);
    } catch (err) {
      console.error("Nudge failed:", err);
      alert("Failed to send nudge message.");
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this order?")) return;
    try {
      await API.delete(`/orders/${id}`);
      alert("Order deleted successfully!");
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete order");
    }
  };

  const handleCancelOrder = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await API.put(`/orders/${id}/cancel`);
      alert("Order cancelled successfully!");
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to cancel order");
    }
  };

  const renderTimeline = (order) => {
    if (order.status === "cancelled") {
      return (
        <div style={{ color: "#ef4444", fontSize: "0.8rem", fontWeight: "600", marginTop: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
          ❌ Cancelled
        </div>
      );
    }
    const steps = ["pending", "packed", "shipped", "delivered"];
    const stepLabels = ["Placed", "Packed", "In Transit", "Delivered"];
    const currentIndex = steps.indexOf(order.status);

    return (
      <div style={{ display: "flex", alignItems: "center", gap: "2px", marginTop: "12px", padding: "5px 0", maxWidth: "380px" }}>
        {stepLabels.map((label, idx) => {
          const isActive = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <div key={label} style={{ display: "flex", alignItems: "center", flex: idx < 3 ? "1" : "none" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: isActive ? "#3b82f6" : "#cbd5e1",
                    border: isCurrent ? "2.5px solid #1e3a8a" : "none",
                    boxShadow: isCurrent ? "0 0 0 3px rgba(59, 130, 246, 0.4)" : "none",
                    transition: "all 0.3s ease",
                    zIndex: 2
                  }}
                />
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: isActive ? "600" : "400",
                    color: isActive ? "#1e3a8a" : "#64748b",
                    whiteSpace: "nowrap",
                    marginTop: "6px",
                    textAlign: "center"
                  }}
                >
                  {label}
                </span>
              </div>
              {idx < 3 && (
                <div
                  style={{
                    height: "2px",
                    backgroundColor: idx < currentIndex ? "#3b82f6" : "#cbd5e1",
                    flexGrow: 1,
                    margin: "0 -2px",
                    alignSelf: "center",
                    marginTop: "-16px",
                    zIndex: 1,
                    transition: "background-color 0.3s ease"
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "badge-pending";
      case "packed":
        return "badge-packed";
      case "shipped":
        return "badge-shipped";
      case "delivered":
        return "badge-delivered";
      case "cancelled":
        return "badge-danger";
      default:
        return "badge-pending";
    }
  };

  // Compute pagination values
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOrders = orders.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(orders.length / pageSize) || 1;

  // Grouping logic (Admin only)
  const isGrouped = role === "admin" && groupBy === "orderId";
  const groupedOrders = {};
  if (isGrouped) {
    paginatedOrders.forEach(order => {
      const key = order._id;
      if (!groupedOrders[key]) {
        groupedOrders[key] = [];
      }
      groupedOrders[key].push(order);
    });
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>
          {role === "admin"
            ? "All Orders"
            : role === "warehouse"
            ? "Warehouse Order Manifest"
            : "My Orders History"}
        </h2>
        <button className="btn-secondary" style={{ width: "auto" }} onClick={fetchOrders}>
          🔄 Refresh Orders
        </button>
      </div>

      {/* ADMIN GROUP BY FILTER */}
      {role === "admin" && !loading && orders.length > 0 && (
        <div style={{ display: "flex", gap: "15px", alignItems: "center", marginBottom: "20px", background: "#ffffff", padding: "12px 18px", borderRadius: "6px", border: "1px solid #d1d5db" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label style={{ fontSize: "0.9rem", fontWeight: "600", color: "#475569" }}>Group By:</label>
            <select
              value={groupBy}
              onChange={(e) => { setGroupBy(e.target.value); setCurrentPage(1); }}
              className="form-input"
              style={{ width: "220px", padding: "6px 10px", fontSize: "0.85rem" }}
            >
              <option value="none">None (List View)</option>
              <option value="orderId">Order ID (With Customer Username)</option>
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="interactive-panel" style={{ textAlign: "center", padding: "30px", color: "#666" }}>
          No orders found. {role === "customer" && "Go to the Products page to place your first order!"}
        </div>
      ) : (
        <div className="table-container">
          <table style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Order ID</th>
                {(role === "admin" || role === "warehouse") && <th>Customer</th>}
                <th>Product</th>
                <th>Quantity</th>
                <th>Total Price</th>
                <th>Order Status</th>
                <th>Order Date &amp; Time</th>
                {(role === "admin" || role === "warehouse" || role === "customer") && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {isGrouped ? (
                Object.keys(groupedOrders).map((groupId) => {
                  const groupItems = groupedOrders[groupId];
                  const firstItem = groupItems[0];
                  return (
                    <React.Fragment key={groupId}>
                      {/* Group Header Row */}
                      <tr style={{ backgroundColor: "#f1f5f9" }}>
                        <td colSpan={(role === "admin" || role === "warehouse" || role === "customer") ? 8 : 6} style={{ padding: "10px 12px", fontWeight: "600", color: "#334155" }}>
                          📦 Order ID: <code style={{ color: "#0f172a" }}>{groupId}</code> &nbsp;|&nbsp; 👤 Customer: <strong style={{ color: "#0f172a" }}>{firstItem.customer?.name || "Deleted User"}</strong> ({firstItem.customer?.email || "No Email"})
                        </td>
                      </tr>
                      {/* Group Item Rows */}
                      {groupItems.map((order) => (
                        <tr key={order._id}>
                          <td>
                            <code style={{ fontSize: "0.85rem", color: "#666" }}>{order._id}</code>
                          </td>
                          {(role === "admin" || role === "warehouse") && (
                            <td>
                              <div><strong>{order.customer?.name || "Deleted User"}</strong></div>
                              <div style={{ fontSize: "0.8rem", color: "#666" }}>{order.customer?.email}</div>
                            </td>
                          )}
                          <td>
                            <strong>{order.product?.productName || "Unknown Product"}</strong>
                            {order.product?.category && (
                              <div style={{ fontSize: "0.8rem", color: "#666" }}>{order.product.category}</div>
                            )}
                            {renderTimeline(order)}
                          </td>
                          <td>{order.quantity} Units</td>
                          <td>
                            <strong>${(order.totalPrice || 0).toFixed(2)}</strong>
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td style={{ fontSize: "0.85rem", color: "#666" }}>
                            <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                            <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "3px" }}>
                              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          {role === "admin" && (
                            <td>
                              <div style={{ display: "flex", gap: "8px" }}>
                                {order.status !== "delivered" && order.status !== "cancelled" ? (
                                  <button
                                    className="btn-primary"
                                    style={{ padding: "6px 12px", fontSize: "0.85rem", width: "auto", background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", border: "none" }}
                                    onClick={() => handleSendNudge(order)}
                                  >
                                    ⚡ Nudge
                                  </button>
                                ) : null}
                                <button
                                  className="btn-danger"
                                  style={{ padding: "6px 12px", fontSize: "0.85rem", width: "auto" }}
                                  onClick={() => handleDeleteOrder(order._id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <code style={{ fontSize: "0.85rem", color: "#666" }}>{order._id}</code>
                    </td>
                    {(role === "admin" || role === "warehouse") && (
                      <td>
                        <div><strong>{order.customer?.name || "Deleted User"}</strong></div>
                        <div style={{ fontSize: "0.8rem", color: "#666" }}>{order.customer?.email}</div>
                      </td>
                    )}
                    <td>
                      <strong>{order.product?.productName || "Unknown Product"}</strong>
                      {order.product?.category && (
                        <div style={{ fontSize: "0.8rem", color: "#666" }}>{order.product.category}</div>
                      )}
                      {renderTimeline(order)}
                    </td>
                    <td>{order.quantity} Units</td>
                    <td>
                      <strong>${(order.totalPrice || 0).toFixed(2)}</strong>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.85rem", color: "#666" }}>
                      <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                      <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "3px" }}>
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    {role === "admin" && (
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          {order.status !== "delivered" && order.status !== "cancelled" ? (
                            <button
                              className="btn-primary"
                              style={{ padding: "6px 12px", fontSize: "0.85rem", width: "auto", background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", border: "none" }}
                              onClick={() => handleSendNudge(order)}
                            >
                              ⚡ Nudge
                            </button>
                          ) : null}
                          <button
                            className="btn-danger"
                            style={{ padding: "6px 12px", fontSize: "0.85rem", width: "auto" }}
                            onClick={() => handleDeleteOrder(order._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                    {role === "warehouse" && (
                      <td>
                        {order.status === "pending" ? (
                          <button
                            className="btn-primary"
                            style={{ padding: "6px 12px", fontSize: "0.85rem", width: "auto" }}
                            onClick={() => handlePackOrder(order._id)}
                          >
                            📦 Pack Order
                          </button>
                        ) : (
                          <span style={{ fontSize: "0.85rem", color: "#666" }}>Ready</span>
                        )}
                      </td>
                    )}
                    {role === "customer" && (
                      <td>
                        {order.status === "pending" ? (
                          <button
                            className="btn-danger"
                            style={{ padding: "6px 12px", fontSize: "0.85rem", width: "auto" }}
                            onClick={() => handleCancelOrder(order._id)}
                          >
                            Cancel Order
                          </button>
                        ) : (
                          <span style={{ fontSize: "0.85rem", color: "#666" }}>—</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION CONTROLS */}
      {!loading && orders.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", padding: "15px 0", borderTop: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.9rem", color: "#64748b" }}>Show</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(parseInt(e.target.value)); setCurrentPage(1); }}
              className="form-input"
              style={{ width: "70px", padding: "6px 10px", fontSize: "0.85rem" }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span style={{ fontSize: "0.9rem", color: "#64748b" }}>orders per page</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn-secondary"
              style={{ width: "auto", padding: "6px 12px", fontSize: "0.85rem" }}
            >
              &larr; Previous
            </button>
            <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "#334155" }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn-secondary"
              style={{ width: "auto", padding: "6px 12px", fontSize: "0.85rem" }}
            >
              Next &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;