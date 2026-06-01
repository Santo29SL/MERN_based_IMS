import { useEffect, useState } from "react";
import API from "../services/axios.js";

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const role = localStorage.getItem("role") || "customer";

  // Form states for creating/editing products
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    category: "",
    price: "",
    quantity: "",
    reorderLevel: "",
    warehouseLocation: ""
  });

  // Quantity to buy state for each product
  const [buyQuantities, setBuyQuantities] = useState({});

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load products");
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await API.put(`/products/${currentId}`, formData);
        alert("Product updated successfully!");
      } else {
        await API.post("/products", formData);
        alert("Product created successfully!");
      }
      // Reset form
      setFormData({
        productName: "",
        description: "",
        category: "",
        price: "",
        quantity: "",
        reorderLevel: "",
        warehouseLocation: ""
      });
      setEditMode(false);
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const handleEditClick = (product) => {
    setEditMode(true);
    setCurrentId(product._id);
    setFormData({
      productName: product.productName,
      description: product.description || "",
      category: product.category || "",
      price: product.price,
      quantity: product.quantity,
      reorderLevel: product.reorderLevel,
      warehouseLocation: product.warehouseLocation || ""
    });
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await API.delete(`/products/${id}`);
      alert("Product deleted successfully");
      loadProducts();
    } catch (err) {
      alert("Failed to delete product");
    }
  };

  const handleBuyQuantityChange = (productId, val) => {
    setBuyQuantities({
      ...buyQuantities,
      [productId]: parseInt(val) || 1
    });
  };

  const handleBuyClick = async (productId) => {
    const qty = buyQuantities[productId] || 1;
    if (qty <= 0) {
      alert("Please enter a valid quantity of 1 or more");
      return;
    }
    try {
      await API.post("/orders", { productId, quantity: qty });
      alert("Order placed successfully!");
      loadProducts(); // Refresh to see updated stock
    } catch (err) {
      alert(err.response?.data?.message || "Purchase failed");
    }
  };

  // Filter products by name or category
  const filteredProducts = products.filter((p) => {
    const searchStr = search.toLowerCase();
    return (
      p.productName.toLowerCase().includes(searchStr) ||
      (p.category && p.category.toLowerCase().includes(searchStr))
    );
  });

  return (
    <div>
      <h2 style={{ marginBottom: "20px" }}>Products Catalog</h2>

      {/* SEARCH AND FILTERS */}
      <div className="action-bar" style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input"
          style={{ maxWidth: "350px" }}
        />
      </div>

      {/* ADMIN ADD/EDIT PRODUCT FORM */}
      {role === "admin" && (
        <div className="interactive-panel">
          <h3>{editMode ? "Edit Product" : "Add New Product"}</h3>
          <form onSubmit={handleFormSubmit} style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "15px" }}>
            <input
              type="text"
              name="productName"
              placeholder="Product Name"
              value={formData.productName}
              onChange={handleInputChange}
              required
              className="form-input"
              style={{ flex: "1 1 200px" }}
            />
            <input
              type="text"
              name="category"
              placeholder="Category"
              value={formData.category}
              onChange={handleInputChange}
              className="form-input"
              style={{ flex: "1 1 150px" }}
            />
            <input
              type="number"
              name="price"
              placeholder="Price (USD)"
              value={formData.price}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="form-input"
              style={{ flex: "1 1 100px" }}
            />
            <input
              type="number"
              name="quantity"
              placeholder="Initial Stock"
              value={formData.quantity}
              onChange={handleInputChange}
              required
              min="0"
              className="form-input"
              style={{ flex: "1 1 100px" }}
            />
            <input
              type="number"
              name="reorderLevel"
              placeholder="Reorder Level"
              value={formData.reorderLevel}
              onChange={handleInputChange}
              min="0"
              className="form-input"
              style={{ flex: "1 1 100px" }}
            />
            <input
              type="text"
              name="warehouseLocation"
              placeholder="Warehouse Location"
              value={formData.warehouseLocation}
              onChange={handleInputChange}
              className="form-input"
              style={{ flex: "1 1 150px" }}
            />
            <input
              type="text"
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-input"
              style={{ flex: "1 1 100%" }}
            />
            <div style={{ display: "flex", gap: "10px", marginTop: "10px", width: "100%" }}>
              <button type="submit" className="btn-success" style={{ width: "auto" }}>
                {editMode ? "Update Product" : "Create Product"}
              </button>
              {editMode && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ width: "auto" }}
                  onClick={() => {
                    setEditMode(false);
                    setFormData({
                      productName: "",
                      description: "",
                      category: "",
                      price: "",
                      quantity: "",
                      reorderLevel: "",
                      warehouseLocation: ""
                    });
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* PRODUCTS TABLE */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock Status</th>
              {role === "admin" && <th>Location</th>}
              <th style={{ width: "220px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={role === "admin" ? 6 : 5} style={{ textAlign: "center", color: "#666" }}>
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const isLowStock = p.quantity <= (p.reorderLevel || 10);
                return (
                  <tr key={p._id}>
                    <td>
                      <strong>{p.productName}</strong>
                      {p.description && <div style={{ fontSize: "0.8rem", color: "#666" }}>{p.description}</div>}
                    </td>
                    <td>{p.category || "N/A"}</td>
                    <td>${p.price.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${isLowStock ? "badge-low" : "badge-delivered"}`}>
                        {p.quantity} Units {isLowStock ? "(Low Stock)" : ""}
                      </span>
                    </td>
                    {role === "admin" && <td>{p.warehouseLocation || "N/A"}</td>}
                    <td>
                      {role === "admin" ? (
                        <div style={{ display: "flex", gap: "5px" }}>
                          <button className="btn-secondary" style={{ padding: "4px 8px", fontSize: "0.85rem" }} onClick={() => handleEditClick(p)}>
                            Edit
                          </button>
                          <button className="btn-danger" style={{ padding: "4px 8px", fontSize: "0.85rem" }} onClick={() => handleDeleteClick(p._id)}>
                            Delete
                          </button>
                        </div>
                      ) : role === "customer" ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <input
                            type="number"
                            min="1"
                            max={p.quantity}
                            value={buyQuantities[p._id] || 1}
                            onChange={(e) => handleBuyQuantityChange(p._id, e.target.value)}
                            className="form-input"
                            style={{ width: "65px", padding: "6px", fontSize: "0.85rem" }}
                            disabled={p.quantity === 0}
                          />
                          <button
                            className="btn-primary"
                            style={{ padding: "6px 12px", fontSize: "0.85rem", width: "auto" }}
                            onClick={() => handleBuyClick(p._id)}
                            disabled={p.quantity === 0}
                          >
                            {p.quantity === 0 ? "Out of Stock" : "Buy"}
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.85rem", color: "#666" }}>No Actions</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Products;