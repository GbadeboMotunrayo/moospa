import { useState } from "react";

const MOCK_PRODUCTS = [
  { id: 1, name: "Glow Booster Cream", category: "Skincare", price: 15000, stock: "In Stock", image: "https://placehold.co/80x80/e91e8c/white?text=GBC" },
  { id: 2, name: "Yoni Tightening Gel", category: "Skincare", price: 12000, stock: "In Stock", image: "https://placehold.co/80x80/e91e8c/white?text=YTG" },
  { id: 3, name: "Rabbit Vibrator", category: "Sex Toys", price: 28000, stock: "Low Stock", image: "https://placehold.co/80x80/1a1a1a/white?text=RV" },
  { id: 4, name: "Waist Beads", category: "Accessories", price: 6000, stock: "In Stock", image: "https://placehold.co/80x80/e91e8c/white?text=WB" },
  { id: 5, name: "Luxury Massage Oil", category: "Skincare", price: 10000, stock: "Out of Stock", image: "https://placehold.co/80x80/e91e8c/white?text=LMO" },
  { id: 6, name: "Body Scrub", category: "Skincare", price: 8500, stock: "In Stock", image: "https://placehold.co/80x80/e91e8c/white?text=BS" },
];

const CATEGORIES = ["All", "Skincare", "Sex Toys", "Accessories"];
const STOCK_OPTIONS = ["In Stock", "Low Stock", "Out of Stock"];

const PINK = "#e91e8c";
const LIGHT_PINK = "#fce4f3";

function stockColor(s) {
  if (s === "In Stock") return { bg: "#e8f5e9", text: "#2e7d32" };
  if (s === "Low Stock") return { bg: "#fff8e1", text: "#f57f17" };
  return { bg: "#fce4ec", text: "#c62828" };
}

export default function NDOProductManager() {
  const [screen, setScreen] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [activeTab, setActiveTab] = useState("products");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [connected, setConnected] = useState(true);
  const [toast, setToast] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "", category: "Skincare", price: "", stock: "In Stock", description: ""
  });

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handleLogin() {
    if (email === "admin@ndo.com" && password === "ndo2025") {
      setScreen("app");
    } else {
      setLoginError("Invalid email or password. Try admin@ndo.com / ndo2025");
    }
  }

  function handleDelete(id) {
    setProducts(p => p.filter(x => x.id !== id));
    setShowDeleteConfirm(null);
    showToast("Product deleted from website.");
  }

  function handleAddProduct() {
    if (!newProduct.name || !newProduct.price) return;
    const p = {
      id: Date.now(),
      ...newProduct,
      price: parseInt(newProduct.price),
      image: `https://placehold.co/80x80/e91e8c/white?text=${newProduct.name.slice(0,2).toUpperCase()}`
    };
    setProducts(prev => [p, ...prev]);
    setShowAddModal(false);
    setNewProduct({ name: "", category: "Skincare", price: "", stock: "In Stock", description: "" });
    showToast("Product added to website!");
  }

  function handleUpdateProduct() {
    setProducts(prev => prev.map(p => p.id === selectedProduct.id ? selectedProduct : p));
    setSelectedProduct(null);
    showToast("Product updated on website!");
  }

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "All" || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const stats = {
    total: products.length,
    inStock: products.filter(p => p.stock === "In Stock").length,
    lowStock: products.filter(p => p.stock === "Low Stock").length,
    outOfStock: products.filter(p => p.stock === "Out of Stock").length,
  };

  if (screen === "login") {
    return (
      <div style={{ minHeight: "100vh", background: "#0d0d0d", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Georgia', serif" }}>
        <div style={{ background: "#1a1a1a", borderRadius: 16, padding: "48px 40px", width: 380, border: `1px solid ${PINK}33`, boxShadow: `0 0 60px ${PINK}22` }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ width: 64, height: 64, background: PINK, borderRadius: 16, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: "bold", color: "white" }}>N</div>
            <div style={{ color: PINK, fontSize: 22, fontWeight: "bold", letterSpacing: 2 }}>HOUSE OF NDO</div>
            <div style={{ color: "#888", fontSize: 13, marginTop: 4 }}>Product Manager</div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ color: "#aaa", fontSize: 12, display: "block", marginBottom: 6, letterSpacing: 1 }}>EMAIL ADDRESS</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@ndo.com"
              style={{ width: "100%", padding: "12px 16px", background: "#111", border: `1px solid #333`, borderRadius: 8, color: "white", fontSize: 14, boxSizing: "border-box", outline: "none" }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ color: "#aaa", fontSize: 12, display: "block", marginBottom: 6, letterSpacing: 1 }}>PASSWORD</label>
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{ width: "100%", padding: "12px 16px", background: "#111", border: `1px solid #333`, borderRadius: 8, color: "white", fontSize: 14, boxSizing: "border-box", outline: "none" }}
            />
          </div>
          {loginError && <div style={{ color: "#ff6b6b", fontSize: 12, marginBottom: 16, textAlign: "center" }}>{loginError}</div>}
          <button
            onClick={handleLogin}
            style={{ width: "100%", padding: "14px", background: PINK, border: "none", borderRadius: 8, color: "white", fontSize: 15, fontWeight: "bold", cursor: "pointer", letterSpacing: 1 }}
          >
            LOGIN TO DASHBOARD
          </button>
          <div style={{ color: "#555", fontSize: 11, textAlign: "center", marginTop: 20 }}>
            Demo: admin@ndo.com / ndo2025
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Segoe UI', Arial, sans-serif", background: "#f8f8f8", position: "relative" }}>

      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, padding: "12px 20px", borderRadius: 8, background: toast.type === "success" ? "#2e7d32" : "#c62828", color: "white", fontSize: 13, fontWeight: "bold", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
          {toast.type === "success" ? "Ok" : "Error"} {toast.msg}
        </div>
      )}

      <div style={{ width: 220, background: "#1a1a1a", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "24px 20px", borderBottom: "1px solid #333" }}>
          <div style={{ color: PINK, fontSize: 18, fontWeight: "bold", letterSpacing: 1 }}>HOUSE OF NDO</div>
          <div style={{ color: "#666", fontSize: 11, marginTop: 2 }}>Product Manager v1.0</div>
        </div>

        <nav style={{ padding: "16px 0", flex: 1 }}>
          {[
            { id: "dashboard", icon: "o", label: "Dashboard" },
            { id: "products", icon: "x", label: "Products" },
            { id: "categories", icon: "#", label: "Categories" },
            { id: "settings", icon: "^", label: "Settings" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ width: "100%", padding: "12px 20px", background: activeTab === tab.id ? `${PINK}22` : "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, color: activeTab === tab.id ? PINK : "#888", fontSize: 14, borderLeft: activeTab === tab.id ? `3px solid ${PINK}` : "3px solid transparent", transition: "all 0.2s" }}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: 20, borderTop: "1px solid #333" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: connected ? "#4caf50" : "#f44336", animation: connected ? "pulse 2s infinite" : "none" }}></div>
            <span style={{ color: "#888", fontSize: 12 }}>{connected ? "Connected" : "Offline"}</span>
          </div>
          <button
            onClick={() => setScreen("login")}
            style={{ width: "100%", padding: "8px", background: "#333", border: "none", borderRadius: 6, color: "#aaa", fontSize: 12, cursor: "pointer" }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>

        <div style={{ padding: "16px 24px", background: "white", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: "bold", color: "#1a1a1a" }}>
              {activeTab === "dashboard" && "Dashboard"}
              {activeTab === "products" && "Products"}
              {activeTab === "categories" && "Categories"}
              {activeTab === "settings" && "Settings"}
            </div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>House of NDO - Admin</div>
          </div>
          {activeTab === "products" && (
            <button
              onClick={() => setShowAddModal(true)}
              style={{ padding: "10px 20px", background: PINK, border: "none", borderRadius: 8, color: "white", fontWeight: "bold", fontSize: 14, cursor: "pointer" }}
            >
              + Add Product
            </button>
          )}
        </div>

        <div style={{ padding: 24, flex: 1, overflowY: "auto" }}>

          {activeTab === "dashboard" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
                {[
                  { label: "Total", value: stats.total, color: PINK },
                  { label: "In Stock", value: stats.inStock, color: "#2e7d32" },
                  { label: "Low Stock", value: stats.lowStock, color: "#f57f17" },
                  { label: "Out of Stock", value: stats.outOfStock, color: "#c62828" },
                ].map(card => (
                  <div key={card.label} style={{ background: "white", borderRadius: 12, padding: "20px 24px", border: `1px solid #eee`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <div style={{ fontSize: 36, fontWeight: "bold", color: card.color }}>{card.value}</div>
                    <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{card.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: "white", borderRadius: 12, padding: 24, border: "1px solid #eee" }}>
                <div style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16, color: "#1a1a1a" }}>Recent</div>
                {products.slice(0, 4).map(p => {
                  const sc = stockColor(p.stock);
                  return (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 0", borderBottom: "1px solid #f5f5f5" }}>
                      <img src={p.image} alt={p.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover" }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "600", fontSize: 14, color: "#1a1a1a" }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: "#888" }}>{p.category}</div>
                      </div>
                      <div style={{ fontWeight: "bold", color: PINK }}>N{p.price.toLocaleString()}</div>
                      <div style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: "bold", background: sc.bg, color: sc.text }}>{p.stock}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <div>
              <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search..."
                  style={{ flex: 1, padding: "10px 16px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none" }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  {CATEGORIES.map(c => (
                    <button
                      key={c}
                      onClick={() => setFilterCat(c)}
                      style={{ padding: "8px 16px", borderRadius: 20, border: filterCat === c ? `2px solid ${PINK}` : "2px solid #e0e0e0", background: filterCat === c ? LIGHT_PINK : "white", color: filterCat === c ? PINK : "#666", fontSize: 13, fontWeight: filterCat === c ? "bold" : "normal", cursor: "pointer" }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ background: "white", borderRadius: 12, border: "1px solid #eee", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f9f9f9" }}>
                      {["Product", "Category", "Price", "Stock", "Actions"].map(h => (
                        <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 12, color: "#888", fontWeight: "bold", letterSpacing: 1, borderBottom: "1px solid #eee" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => {
                      const sc = stockColor(p.stock);
                      return (
                        <tr key={p.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                          <td style={{ padding: "14px 20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <img src={p.image} alt={p.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} />
                              <span style={{ fontWeight: "600", fontSize: 14, color: "#1a1a1a" }}>{p.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: "14px 20px", fontSize: 13, color: "#666" }}>{p.category}</td>
                          <td style={{ padding: "14px 20px", fontWeight: "bold", color: PINK, fontSize: 14 }}>N{p.price.toLocaleString()}</td>
                          <td style={{ padding: "14px 20px" }}>
                            <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: "bold", background: sc.bg, color: sc.text }}>{p.stock}</span>
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                onClick={() => setSelectedProduct({ ...p })}
                                style={{ padding: "6px 14px", background: LIGHT_PINK, border: `1px solid ${PINK}44`, borderRadius: 6, color: PINK, fontSize: 12, fontWeight: "bold", cursor: "pointer" }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(p.id)}
                                style={{ padding: "6px 14px", background: "#fce4ec", border: "1px solid #f4849044", borderRadius: 6, color: "#c62828", fontSize: 12, fontWeight: "bold", cursor: "pointer" }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div style={{ padding: 40, textAlign: "center", color: "#aaa" }}>No products found.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === "categories" && (
            <div style={{ background: "white", borderRadius: 12, padding: 24, border: "1px solid #eee" }}>
              <div style={{ fontSize: 16, fontWeight: "bold", marginBottom: 20, color: "#1a1a1a" }}>Categories</div>
              {["Skincare", "Sex Toys", "Accessories"].map(cat => (
                <div key={cat} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderRadius: 8, background: "#f9f9f9", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: "600", color: "#1a1a1a" }}>{cat}</div>
                    <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{products.filter(p => p.category === cat).length} items</div>
                  </div>
                  <button style={{ padding: "6px 14px", background: LIGHT_PINK, border: `1px solid ${PINK}44`, borderRadius: 6, color: PINK, fontSize: 12, fontWeight: "bold", cursor: "pointer" }}>Edit</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "settings" && (
            <div style={{ background: "white", borderRadius: 12, padding: 24, border: "1px solid #eee" }}>
              <div style={{ fontSize: 16, fontWeight: "bold", marginBottom: 20, color: "#1a1a1a" }}>Settings</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, background: "#f9f9f9", borderRadius: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: connected ? "#4caf50" : "#f44336" }}></div>
                <span style={{ fontSize: 14, color: "#666" }}>Status: <strong style={{ color: connected ? "#2e7d32" : "#c62828" }}>{connected ? "Active" : "Offline"}</strong></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: 16, padding: 32, width: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 18, fontWeight: "bold", marginBottom: 24, color: "#1a1a1a" }}>Add Product</div>
            {[
              { label: "NAME", key: "name", type: "text" },
              { label: "PRICE (N)", key: "price", type: "number" },
              { label: "DESCRIPTION", key: "description", type: "text" },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6 }}>{field.label}</label>
                <input
                  type={field.type}
                  value={newProduct[field.key]}
                  onChange={e => setNewProduct(p => ({ ...p, [field.key]: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                />
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6 }}>CATEGORY</label>
                <select value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))} style={{ width: "100%", padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none" }}>
                  {["Skincare", "Sex Toys", "Accessories"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6 }}>STOCK</label>
                <select value={newProduct.stock} onChange={e => setNewProduct(p => ({ ...p, stock: e.target.value }))} style={{ width: "100%", padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none" }}>
                  {STOCK_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: 12, background: "#f5f5f5", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer", color: "#666" }}>Cancel</button>
              <button onClick={handleAddProduct} style={{ flex: 1, padding: 12, background: PINK, border: "none", borderRadius: 8, fontSize: 14, fontWeight: "bold", cursor: "pointer", color: "white" }}>Add</button>
            </div>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: 16, padding: 32, width: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 18, fontWeight: "bold", marginBottom: 24, color: "#1a1a1a" }}>Edit Product</div>
            {[
              { label: "NAME", key: "name", type: "text" },
              { label: "PRICE (N)", key: "price", type: "number" },
              { label: "DESCRIPTION", key: "description", type: "text" },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6 }}>{field.label}</label>
                <input
                  type={field.type}
                  value={selectedProduct[field.key]}
                  onChange={e => setSelectedProduct(p => ({ ...p, [field.key]: field.type === "number" ? parseInt(e.target.value) : e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                />
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6 }}>CATEGORY</label>
                <select value={selectedProduct.category} onChange={e => setSelectedProduct(p => ({ ...p, category: e.target.value }))} style={{ width: "100%", padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none" }}>
                  {["Skincare", "Sex Toys", "Accessories"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6 }}>STOCK</label>
                <select value={selectedProduct.stock} onChange={e => setSelectedProduct(p => ({ ...p, stock: e.target.value }))} style={{ width: "100%", padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none" }}>
                  {STOCK_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setSelectedProduct(null)} style={{ flex: 1, padding: 12, background: "#f5f5f5", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer", color: "#666" }}>Cancel</button>
              <button onClick={handleUpdateProduct} style={{ flex: 1, padding: 12, background: PINK, border: "none", borderRadius: 8, fontSize: 14, fontWeight: "bold", cursor: "pointer", color: "white" }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: 16, padding: 32, width: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16, color: "#1a1a1a" }}>Delete Product</div>
            <p style={{ color: "#666", marginBottom: 24 }}>Are you sure? This cannot be undone.</p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setShowDeleteConfirm(null)} style={{ flex: 1, padding: 12, background: "#f5f5f5", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer", color: "#666" }}>Cancel</button>
              <button onClick={() => handleDelete(showDeleteConfirm)} style={{ flex: 1, padding: 12, background: "#c62828", border: "none", borderRadius: 8, fontSize: 14, fontWeight: "bold", cursor: "pointer", color: "white" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
