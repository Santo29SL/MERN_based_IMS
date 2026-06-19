import { useEffect, useState } from "react";
import API from "../services/axios.js";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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
      default:
        return "badge-pending";
    }
  };

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

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="interactive-panel" style={{ textAlign: "center", padding: "30px", color: "#666" }}>
          No orders found. {role === "customer" && "Go to the Products page to place your first order!"}
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                {(role === "admin" || role === "warehouse") && <th>Customer</th>}
                <th>Product</th>
                <th>Quantity</th>
                <th>Total Price</th>
                <th>Order Status</th>
                <th>Order Date</th>
                {role === "warehouse" && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
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
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Orders;