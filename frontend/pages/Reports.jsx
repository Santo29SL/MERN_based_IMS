import { useEffect, useState } from "react";
import API from "../services/axios.js";

function Reports() {
  const [activeTab, setActiveTab] = useState("sales");
  const [salesData, setSalesData] = useState({ totalOrders: 0, totalRevenue: 0 });
  const [lowStock, setLowStock] = useState([]);
  const [outOfStock, setOutOfStock] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [activeTab]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      if (activeTab === "sales") {
        const res = await API.get("/reports/sales");
        setSalesData(res.data);
      } else if (activeTab === "lowStock") {
        const res = await API.get("/reports/low-stock");
        setLowStock(res.data);
      } else if (activeTab === "outOfStock") {
        const res = await API.get("/reports/out-of-stock");
        setOutOfStock(res.data);
      } else if (activeTab === "topProducts") {
        const res = await API.get("/reports/top-products");
        setTopProducts(res.data);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: "20px" }}>Management Reports</h2>

      {/* REPORT TABS */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "25px", borderBottom: "1px solid #d1d5db", paddingBottom: "10px" }}>
        <button
          className={activeTab === "sales" ? "btn-primary" : "btn-secondary"}
          onClick={() => setActiveTab("sales")}
          style={{ width: "auto" }}
        >
          📈 Sales & Revenue
        </button>
        <button
          className={activeTab === "lowStock" ? "btn-primary" : "btn-secondary"}
          onClick={() => setActiveTab("lowStock")}
          style={{ width: "auto" }}
        >
          ⚠️ Low Stock Alerts
        </button>
        <button
          className={activeTab === "outOfStock" ? "btn-primary" : "btn-secondary"}
          onClick={() => setActiveTab("outOfStock")}
          style={{ width: "auto" }}
        >
          🚫 Out of Stock
        </button>
        <button
          className={activeTab === "topProducts" ? "btn-primary" : "btn-secondary"}
          onClick={() => setActiveTab("topProducts")}
          style={{ width: "auto" }}
        >
          🏆 Best Selling
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>Generating report...</div>
      ) : (
        <div className="interactive-panel">
          {/* TAB 1: SALES & REVENUE */}
          {activeTab === "sales" && (
            <div>
              <h3>Sales & Revenue Summary</h3>
              <p style={{ color: "#666", marginBottom: "20px" }}>Delivered orders revenue aggregates.</p>
              
              <div className="dashboard-grid">
                <div className="card">
                  <div className="stat-label">Total Sales Volume</div>
                  <div className="stat-value">{salesData.totalOrders} Orders</div>
                </div>
                <div className="card">
                  <div className="stat-label">Total Cumulative Revenue</div>
                  <div className="stat-value" style={{ color: "#4caf50" }}>
                    ${(salesData.totalRevenue || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LOW STOCK */}
          {activeTab === "lowStock" && (
            <div>
              <h3>Low Stock Alert Report</h3>
              <p style={{ color: "#666", marginBottom: "15px" }}>Items with quantities equal to or below their reorder levels.</p>
              {lowStock.length === 0 ? (
                <div style={{ color: "#4caf50", fontWeight: "bold", padding: "10px 0" }}>
                  ✓ All products have adequate stock levels!
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Current Quantity</th>
                        <th>Reorder Level</th>
                        <th>Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStock.map((p) => (
                        <tr key={p._id}>
                          <td><strong>{p.productName}</strong></td>
                          <td>{p.category || "N/A"}</td>
                          <td>${p.price.toFixed(2)}</td>
                          <td style={{ color: "#f44336", fontWeight: "bold" }}>{p.quantity} Units</td>
                          <td>{p.reorderLevel || 10} Units</td>
                          <td>{p.warehouseLocation || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OUT OF STOCK */}
          {activeTab === "outOfStock" && (
            <div>
              <h3>Out of Stock Report</h3>
              <p style={{ color: "#666", marginBottom: "15px" }}>Products with exactly 0 quantity available in inventory.</p>
              {outOfStock.length === 0 ? (
                <div style={{ color: "#4caf50", fontWeight: "bold", padding: "10px 0" }}>
                  ✓ Great! No products are currently out of stock.
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Warehouse Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {outOfStock.map((p) => (
                        <tr key={p._id}>
                          <td><strong style={{ color: "#f44336" }}>{p.productName}</strong></td>
                          <td>{p.category || "N/A"}</td>
                          <td>${p.price.toFixed(2)}</td>
                          <td>{p.warehouseLocation || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TOP PRODUCTS */}
          {activeTab === "topProducts" && (
            <div>
              <h3>Top Selling Products</h3>
              <p style={{ color: "#666", marginBottom: "15px" }}>Best-selling items sorted by total quantity sold.</p>
              {topProducts.length === 0 ? (
                <div style={{ color: "#666", padding: "10px 0" }}>No sales logs found to aggregate products.</div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Product ID</th>
                        <th>Total Units Sold</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((p, index) => (
                        <tr key={p._id || index}>
                          <td><strong>#{index + 1}</strong></td>
                          <td><code>{p._id || "Unknown"}</code></td>
                          <td><strong>{p.totalSold} Units</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Reports;