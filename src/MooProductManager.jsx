import { useState, useEffect } from "react";
import { authAPI, productsAPI, salesAPI, bookingsAPI, uploadAPI, dispatchAPI, spaServicesAPI, setToken, clearToken, getToken, setRole, getRole, clearRole } from "./services/api";

const PINK = "#e91e8c";
const LIGHT_PINK = "#fce4f3";

const ICONS = {
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>
  ),
  products: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>
  ),
  sales: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5h3.25a1.75 1.75 0 0 1 0 3.5h-2.5a1.75 1.75 0 0 0 0 3.5H14"/></svg>
  ),
  spa: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c4-3 7-6.5 7-11a7 7 0 0 0-14 0c0 4.5 3 8 7 11z"/><path d="M12 11v7"/></svg>
  ),
  staff: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  plus: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
  ),
  dispatch: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
  ),
  spaPrices: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41 13.41 20.59a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z"/><circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none"/></svg>
  ),
};

function stockInfo(p) {
  const qty = p.stock_quantity ?? 0;
  if (qty <= 0) return { label: "Restocking Soon", bg: "#fff3e0", text: "#e65100" };
  if (p.stock_status === "Low Stock") return { label: "Low Stock", bg: "#fff8e1", text: "#f57f17" };
  return { label: "In Stock", bg: "#e8f5e9", text: "#2e7d32" };
}

export default function MooProductManager() {
  const [screen, setScreen] = useState(getToken() ? "app" : "login");
  const [role, setRoleState] = useState(getRole() || "admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [restockTarget, setRestockTarget] = useState(null);
  const [restockQty, setRestockQty] = useState("");
  const [connected, setConnected] = useState(true);
  const [toast, setToast] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "", category: "skincare", price: "", stock_quantity: "0", description: "", images: []
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Sales recording
  const [saleForm, setSaleForm] = useState({ product_id: "", quantity: "1", sale_type: "walk-in", customer_name: "", customer_phone: "" });
  const [sales, setSales] = useState([]);
  const [loadingSales, setLoadingSales] = useState(false);

  // Staff management (admin only)
  const [staff, setStaff] = useState([]);
  const [newStaff, setNewStaff] = useState({ name: "", email: "", password: "" });
  const [loadingStaff, setLoadingStaff] = useState(false);

  // Dispatch prices (admin only)
  const [zones, setZones] = useState([]);
  const [loadingZones, setLoadingZones] = useState(false);
  const [zonesError, setZonesError] = useState("");
  const [zoneEdits, setZoneEdits] = useState({});
  const [newZone, setNewZone] = useState({ lga: "", price: "", category: "Lagos" });

  // Spa service prices (admin only)
  const [spaServices, setSpaServices] = useState([]);
  const [loadingSpaServices, setLoadingSpaServices] = useState(false);
  const [spaServicesError, setSpaServicesError] = useState("");
  const [spaServiceEdits, setSpaServiceEdits] = useState({});
  const [newSpaService, setNewSpaService] = useState({ name: "", category: "Massage", duration: "60 min", price: "" });

  const isAdmin = role === "admin";

  function loadProducts() {
    setLoadingProducts(true);
    productsAPI.getAll().then(d => { setProducts(d.products || []); setConnected(true); }).catch(() => setConnected(false)).finally(() => setLoadingProducts(false));
  }

  useEffect(() => {
    if (screen === "app") loadProducts();
  }, [screen]);

  useEffect(() => {
    if (screen !== "app") return;
    const IDLE_LIMIT = 10 * 60 * 1000;
    let timer = setTimeout(handleLogout, IDLE_LIMIT);
    const reset = () => { clearTimeout(timer); timer = setTimeout(handleLogout, IDLE_LIMIT); };
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach(ev => window.addEventListener(ev, reset));
    return () => { clearTimeout(timer); events.forEach(ev => window.removeEventListener(ev, reset)); };
  }, [screen]);

  useEffect(() => {
    if (screen !== "app") return;
    if (activeTab === "spa") {
      setLoadingBookings(true);
      bookingsAPI.getAll().then(d => setBookings(d.bookings || [])).catch(() => {}).finally(() => setLoadingBookings(false));
    }
    if (activeTab === "dashboard") {
      bookingsAPI.getAll().then(d => setBookings(d.bookings || [])).catch(() => {});
    }
    if (activeTab === "sales" && isAdmin) {
      setLoadingSales(true);
      salesAPI.getAll().then(d => setSales(d.sales || [])).catch(() => {}).finally(() => setLoadingSales(false));
    }
    if (activeTab === "staff" && isAdmin) {
      setLoadingStaff(true);
      authAPI.getStaff().then(d => setStaff(d.staff || [])).catch(() => {}).finally(() => setLoadingStaff(false));
    }
    if (activeTab === "dispatch" && isAdmin) loadZones();
    if (activeTab === "spaPrices" && isAdmin) loadSpaServices();
  }, [activeTab, screen, isAdmin]);

  function loadZones() {
    setLoadingZones(true);
    setZonesError("");
    dispatchAPI.getAllAdmin()
      .then(d => {
        const sorted = (d.zones || []).sort((a, b) =>
          (a.category || "Lagos").localeCompare(b.category || "Lagos") || a.lga.localeCompare(b.lga));
        setZones(sorted); setZoneEdits({});
      })
      .catch(err => setZonesError(err.message))
      .finally(() => setLoadingZones(false));
  }

  async function saveZone(zone) {
    const price = zoneEdits[zone.id];
    if (price === undefined || price === "" || isNaN(Number(price))) return showToast("Enter a valid price", "error");
    try {
      await dispatchAPI.update(zone.id, { price: Number(price) });
      showToast(`${zone.lga} updated`);
      loadZones();
    } catch (err) { showToast(err.message, "error"); }
  }

  async function toggleZone(zone) {
    try {
      await dispatchAPI.update(zone.id, { active: !zone.active });
      loadZones();
    } catch (err) { showToast(err.message, "error"); }
  }

  async function deleteZone(zone) {
    try {
      await dispatchAPI.remove(zone.id);
      showToast(`${zone.lga} removed`);
      loadZones();
    } catch (err) { showToast(err.message, "error"); }
  }

  async function addZone() {
    if (!newZone.lga.trim() || newZone.price === "" || isNaN(Number(newZone.price))) return showToast("Area name and price required", "error");
    try {
      await dispatchAPI.create({ lga: newZone.lga.trim(), price: Number(newZone.price), category: newZone.category });
      showToast(`${newZone.lga.trim()} added`);
      setNewZone({ lga: "", price: "", category: "Lagos" });
      loadZones();
    } catch (err) { showToast(err.message, "error"); }
  }

  function loadSpaServices() {
    setLoadingSpaServices(true);
    setSpaServicesError("");
    spaServicesAPI.getAllAdmin()
      .then(d => { setSpaServices(d.services || []); setSpaServiceEdits({}); })
      .catch(err => setSpaServicesError(err.message))
      .finally(() => setLoadingSpaServices(false));
  }

  async function saveSpaServicePrice(service) {
    const price = spaServiceEdits[service.id];
    if (price === undefined || price === "" || isNaN(Number(price))) return showToast("Enter a valid price", "error");
    try {
      await spaServicesAPI.update(service.id, { price: Number(price) });
      showToast(`${service.name} updated`);
      loadSpaServices();
    } catch (err) { showToast(err.message, "error"); }
  }

  async function toggleSpaService(service) {
    try {
      await spaServicesAPI.update(service.id, { active: !service.active });
      loadSpaServices();
    } catch (err) { showToast(err.message, "error"); }
  }

  async function deleteSpaService(service) {
    try {
      await spaServicesAPI.remove(service.id);
      showToast(`${service.name} removed`);
      loadSpaServices();
    } catch (err) { showToast(err.message, "error"); }
  }

  async function addSpaService() {
    if (!newSpaService.name.trim() || newSpaService.price === "" || isNaN(Number(newSpaService.price))) return showToast("Service name and price required", "error");
    try {
      await spaServicesAPI.create({
        name: newSpaService.name.trim(),
        category: newSpaService.category,
        duration: newSpaService.duration,
        price: Number(newSpaService.price),
      });
      showToast(`${newSpaService.name.trim()} added`);
      setNewSpaService({ name: "", category: "Massage", duration: "60 min", price: "" });
      loadSpaServices();
    } catch (err) { showToast(err.message, "error"); }
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleLogin() {
    setLoginError("");
    try {
      const data = await authAPI.login(email, password);
      setToken(data.token);
      setRole(data.admin.role);
      setRoleState(data.admin.role);
      setScreen("app");
    } catch (err) {
      setLoginError(err.message || "Invalid credentials");
    }
  }

  function handleLogout() {
    clearToken();
    clearRole();
    setScreen("login");
    setActiveTab("dashboard");
  }

  async function handleImageUpload(file, onDone) {
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await uploadAPI.image(file);
      if (!res.success) throw new Error(res.message || "Upload failed");
      onDone(res.url);
      showToast("Image uploaded");
    } catch (err) {
      showToast(err.message || "Failed to upload image", "error");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleAddProduct() {
    if (!newProduct.name || !newProduct.price) return;
    try {
      await productsAPI.create({
        name: newProduct.name,
        category: newProduct.category,
        price: parseFloat(newProduct.price),
        stock_quantity: parseInt(newProduct.stock_quantity, 10) || 0,
        short_desc: newProduct.description,
        images: newProduct.images,
      });
      setShowAddModal(false);
      setNewProduct({ name: "", category: "skincare", price: "", stock_quantity: "0", description: "", images: [] });
      showToast("Product added");
      loadProducts();
    } catch (err) {
      showToast(err.message || "Failed to add product", "error");
    }
  }

  async function handleUpdateProduct() {
    try {
      await productsAPI.update(selectedProduct.id, {
        name: selectedProduct.name,
        category: selectedProduct.category,
        price: selectedProduct.price,
        original_price: selectedProduct.original_price,
        stock_quantity: parseInt(selectedProduct.stock_quantity, 10) || 0,
        stock_status: selectedProduct.stock_quantity > 0 ? "In Stock" : "Out of Stock",
        short_desc: selectedProduct.short_desc,
        description: selectedProduct.description,
        images: selectedProduct.images || [],
        badge: selectedProduct.badge,
        featured: selectedProduct.featured,
      });
      setSelectedProduct(null);
      showToast("Product updated");
      loadProducts();
    } catch (err) {
      showToast(err.message || "Failed to update product", "error");
    }
  }

  async function handleDelete(id) {
    try {
      await productsAPI.remove(id);
      setShowDeleteConfirm(null);
      showToast("Product deleted");
      loadProducts();
    } catch (err) {
      showToast(err.message || "Failed to delete product", "error");
    }
  }

  async function handleRestock() {
    const qty = parseInt(restockQty, 10);
    if (!qty || qty <= 0) {
      showToast("Enter a quantity of 1 or more", "error");
      return;
    }
    try {
      await productsAPI.restock(restockTarget.id, qty);
      setRestockTarget(null);
      setRestockQty("");
      showToast(`Added ${qty} units to ${restockTarget.name}`);
      loadProducts();
    } catch (err) {
      showToast(err.message || "Failed to restock", "error");
    }
  }

  async function handleRecordSale() {
    if (!saleForm.product_id || !saleForm.quantity) return;
    try {
      await salesAPI.record({
        product_id: saleForm.product_id,
        quantity: parseInt(saleForm.quantity, 10),
        sale_type: saleForm.sale_type,
        customer_name: saleForm.customer_name || null,
        customer_phone: saleForm.customer_phone || null,
      });
      showToast("Sale recorded");
      setSaleForm({ product_id: "", quantity: "1", sale_type: "walk-in", customer_name: "", customer_phone: "" });
      loadProducts();
      if (isAdmin && activeTab === "sales") {
        salesAPI.getAll().then(d => setSales(d.sales || [])).catch(() => {});
      }
    } catch (err) {
      showToast(err.message || "Failed to record sale", "error");
    }
  }

  async function handleAddStaff() {
    if (!newStaff.email || !newStaff.password) return;
    try {
      await authAPI.createStaff(newStaff);
      setNewStaff({ name: "", email: "", password: "" });
      showToast("Attendant account created");
      authAPI.getStaff().then(d => setStaff(d.staff || [])).catch(() => {});
    } catch (err) {
      showToast(err.message || "Failed to create account", "error");
    }
  }

  async function handleRemoveStaff(id) {
    try {
      await authAPI.removeStaff(id);
      showToast("Attendant removed");
      setStaff(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      showToast(err.message || "Failed to remove account", "error");
    }
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total: products.length,
    inStock: products.filter(p => (p.stock_quantity ?? 0) > 0).length,
    restocking: products.filter(p => (p.stock_quantity ?? 0) <= 0).length,
    totalUnits: products.reduce((sum, p) => sum + (p.stock_quantity ?? 0), 0),
  };

  if (screen === "login") {
    return (
      <div style={{ minHeight: "100vh", background: "#0d0d0d", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Georgia', serif" }}>
        <div style={{ background: "#1a1a1a", borderRadius: 16, padding: "48px 40px", width: 380, border: `1px solid ${PINK}33`, boxShadow: `0 0 60px ${PINK}22` }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ width: 64, height: 64, background: PINK, borderRadius: 16, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: "bold", color: "white" }}>M</div>
            <div style={{ color: PINK, fontSize: 22, fontWeight: "bold", letterSpacing: 2 }}>HOUSE OF MOO</div>
            <div style={{ color: "#888", fontSize: 13, marginTop: 4 }}>Staff Login</div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ color: "#aaa", fontSize: 12, display: "block", marginBottom: 6, letterSpacing: 1 }}>EMAIL ADDRESS</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@moo.com"
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
        </div>
      </div>
    );
  }

  const navTabs = [
    { id: "dashboard", icon: ICONS.dashboard, label: "Dashboard" },
    { id: "products", icon: ICONS.products, label: "Products" },
    { id: "sales", icon: ICONS.sales, label: "Record Sale" },
    { id: "spa", icon: ICONS.spa, label: "Spa Bookings" },
    ...(isAdmin ? [{ id: "spaPrices", icon: ICONS.spaPrices, label: "Spa Prices" }] : []),
    ...(isAdmin ? [{ id: "dispatch", icon: ICONS.dispatch, label: "Dispatch Prices" }] : []),
    ...(isAdmin ? [{ id: "staff", icon: ICONS.staff, label: "Staff" }] : []),
  ];

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Segoe UI', Arial, sans-serif", background: "#f8f8f8", position: "relative" }}>

      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, padding: "12px 20px", borderRadius: 8, background: toast.type === "success" ? "#2e7d32" : "#c62828", color: "white", fontSize: 13, fontWeight: "bold", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
          {toast.msg}
        </div>
      )}

      <div style={{ width: 220, background: "#1a1a1a", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "24px 20px", borderBottom: "1px solid #333" }}>
          <div style={{ color: PINK, fontSize: 18, fontWeight: "bold", letterSpacing: 1 }}>HOUSE OF MOO</div>
          <div style={{ color: "#666", fontSize: 11, marginTop: 2, textTransform: "capitalize" }}>{role} panel</div>
        </div>

        <nav style={{ padding: "16px 0", flex: 1 }}>
          {navTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ width: "100%", padding: "12px 20px", background: activeTab === tab.id ? `${PINK}22` : "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, color: activeTab === tab.id ? PINK : "#888", fontSize: 14, borderLeft: activeTab === tab.id ? `3px solid ${PINK}` : "3px solid transparent", transition: "all 0.2s" }}
            >
              <span style={{ display: "flex", alignItems: "center" }}>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: 20, borderTop: "1px solid #333" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: connected ? "#4caf50" : "#f44336" }}></div>
            <span style={{ color: "#888", fontSize: 12 }}>{connected ? "Connected" : "Offline"}</span>
          </div>
          <button
            onClick={handleLogout}
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
              {activeTab === "products" && "Products & Stock"}
              {activeTab === "sales" && "Record a Sale"}
              {activeTab === "spa" && "Spa Bookings"}
              {activeTab === "spaPrices" && "Spa Prices"}
              {activeTab === "dispatch" && "Dispatch Prices & Locations"}
              {activeTab === "staff" && "Sales Attendants"}
            </div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>House of Moo</div>
          </div>
          {activeTab === "products" && isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              style={{ padding: "10px 20px", background: PINK, border: "none", borderRadius: 8, color: "white", fontWeight: "bold", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
            >
              {ICONS.plus} Add Product
            </button>
          )}
        </div>

        <div style={{ padding: 24, flex: 1, overflowY: "auto" }}>

          {activeTab === "dashboard" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
                {[
                  { label: "Products", value: stats.total, color: PINK },
                  { label: "In Stock", value: stats.inStock, color: "#2e7d32" },
                  { label: "Restocking Soon", value: stats.restocking, color: "#e65100" },
                  { label: "Total Units", value: stats.totalUnits, color: "#2196F3" },
                ].map(card => (
                  <div key={card.label} style={{ background: "white", borderRadius: 12, padding: "20px 24px", border: `1px solid #eee`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <div style={{ fontSize: 36, fontWeight: "bold", color: card.color }}>{card.value}</div>
                    <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{card.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: "white", borderRadius: 12, padding: 24, border: "1px solid #eee" }}>
                <div style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16, color: "#1a1a1a" }}>Products needing restock</div>
                {products.filter(p => (p.stock_quantity ?? 0) <= 0).length === 0 && (
                  <div style={{ color: "#aaa", padding: "20px 0" }}>Everything is in stock.</div>
                )}
                {products.filter(p => (p.stock_quantity ?? 0) <= 0).map(p => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f5f5f5" }}>
                    <div style={{ fontWeight: "600", fontSize: 14, color: "#1a1a1a" }}>{p.name}</div>
                    <div style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: "bold", background: "#fff3e0", color: "#e65100" }}>Restocking Soon</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <div>
              {loadingProducts && <div style={{ textAlign: "center", padding: 40, color: "#888" }}>Loading products...</div>}
              <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search products..."
                  style={{ flex: 1, padding: "10px 16px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none" }}
                />
              </div>

              <div style={{ background: "white", borderRadius: 12, border: "1px solid #eee", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f9f9f9" }}>
                      {["Product", "Category", "Price", "Qty in Stock", "Status", "Actions"].map(h => (
                        <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 12, color: "#888", fontWeight: "bold", letterSpacing: 1, borderBottom: "1px solid #eee" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => {
                      const sc = stockInfo(p);
                      return (
                        <tr key={p.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                          <td style={{ padding: "14px 20px" }}>
                            <span style={{ fontWeight: "600", fontSize: 14, color: "#1a1a1a" }}>{p.name}</span>
                          </td>
                          <td style={{ padding: "14px 20px", fontSize: 13, color: "#666", textTransform: "capitalize" }}>{p.category}</td>
                          <td style={{ padding: "14px 20px", fontWeight: "bold", color: PINK, fontSize: 14 }}>N{Number(p.price).toLocaleString()}</td>
                          <td style={{ padding: "14px 20px", fontSize: 14, color: "#1a1a1a", fontWeight: "600" }}>{p.stock_quantity ?? 0}</td>
                          <td style={{ padding: "14px 20px" }}>
                            <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: "bold", background: sc.bg, color: sc.text }}>{sc.label}</span>
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                onClick={() => { setRestockTarget(p); setRestockQty(""); }}
                                style={{ padding: "6px 14px", background: "#e3f2fd", border: "1px solid #2196F344", borderRadius: 6, color: "#1565c0", fontSize: 12, fontWeight: "bold", cursor: "pointer" }}
                              >
                                Restock
                              </button>
                              {isAdmin && (
                                <>
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
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {!loadingProducts && filtered.length === 0 && (
                  <div style={{ padding: 40, textAlign: "center", color: "#aaa" }}>No products found.</div>
                )}
              </div>
              {!isAdmin && (
                <div style={{ marginTop: 12, fontSize: 12, color: "#aaa" }}>
                  Attendants can add stock via "Restock" but cannot edit or delete products.
                </div>
              )}
            </div>
          )}

          {activeTab === "sales" && (
            <div style={{ display: "grid", gridTemplateColumns: isAdmin ? "380px 1fr" : "1fr", gap: 24 }}>
              <div style={{ background: "white", borderRadius: 12, padding: 24, border: "1px solid #eee", alignSelf: "start" }}>
                <div style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16, color: "#1a1a1a" }}>Record a Sale</div>

                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6 }}>PRODUCT</label>
                <select
                  value={saleForm.product_id}
                  onChange={e => setSaleForm(f => ({ ...f, product_id: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none", marginBottom: 16 }}
                >
                  <option value="">Select a product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id} disabled={(p.stock_quantity ?? 0) <= 0}>
                      {p.name} ({p.stock_quantity ?? 0} in stock){(p.stock_quantity ?? 0) <= 0 ? " - Restocking Soon" : ""}
                    </option>
                  ))}
                </select>

                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6 }}>QUANTITY</label>
                <input
                  type="number"
                  min="1"
                  value={saleForm.quantity}
                  onChange={e => setSaleForm(f => ({ ...f, quantity: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none", marginBottom: 16, boxSizing: "border-box" }}
                />

                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6 }}>SALE TYPE</label>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  {["walk-in", "online"].map(t => (
                    <button
                      key={t}
                      onClick={() => setSaleForm(f => ({ ...f, sale_type: t }))}
                      style={{ flex: 1, padding: "10px", borderRadius: 8, border: saleForm.sale_type === t ? `2px solid ${PINK}` : "2px solid #e0e0e0", background: saleForm.sale_type === t ? LIGHT_PINK : "white", color: saleForm.sale_type === t ? PINK : "#666", fontWeight: "bold", fontSize: 13, cursor: "pointer", textTransform: "capitalize" }}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6 }}>CUSTOMER NAME (optional)</label>
                <input
                  value={saleForm.customer_name}
                  onChange={e => setSaleForm(f => ({ ...f, customer_name: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none", marginBottom: 16, boxSizing: "border-box" }}
                />

                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6 }}>CUSTOMER PHONE (optional)</label>
                <input
                  value={saleForm.customer_phone}
                  onChange={e => setSaleForm(f => ({ ...f, customer_phone: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none", marginBottom: 20, boxSizing: "border-box" }}
                />

                <button
                  onClick={handleRecordSale}
                  style={{ width: "100%", padding: 12, background: PINK, border: "none", borderRadius: 8, fontSize: 14, fontWeight: "bold", cursor: "pointer", color: "white" }}
                >
                  Record Sale
                </button>
              </div>

              {isAdmin && (
                <div style={{ background: "white", borderRadius: 12, padding: 24, border: "1px solid #eee" }}>
                  <div style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16, color: "#1a1a1a" }}>Sales History</div>
                  {loadingSales && <div style={{ color: "#888" }}>Loading...</div>}
                  {!loadingSales && sales.length === 0 && <div style={{ color: "#aaa" }}>No sales recorded yet.</div>}
                  {!loadingSales && sales.map(s => (
                    <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f5f5f5" }}>
                      <div>
                        <div style={{ fontWeight: "600", fontSize: 14, color: "#1a1a1a" }}>{s.product_name} x{s.quantity}</div>
                        <div style={{ fontSize: 12, color: "#888" }}>
                          {new Date(s.created_at).toLocaleString()} · {s.recorded_by_email || "Staff"}
                          {s.customer_name ? ` · ${s.customer_name}` : ""}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: "bold", color: PINK }}>N{Number(s.total).toLocaleString()}</div>
                        <div style={{ fontSize: 11, color: "#888", textTransform: "capitalize" }}>{s.sale_type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "spa" && (
            <div style={{ background: "white", borderRadius: 12, padding: 24, border: "1px solid #eee" }}>
              <div style={{ fontSize: 16, fontWeight: "bold", marginBottom: 4, color: "#1a1a1a" }}>Spa Bookings</div>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>Live bookings from customers</div>
              {loadingBookings && <div style={{ textAlign: "center", padding: 40, color: "#888" }}>Loading bookings...</div>}
              {!loadingBookings && bookings.length === 0 && (
                <div style={{ textAlign: "center", padding: 40, color: "#aaa" }}>No bookings yet.</div>
              )}
              {!loadingBookings && bookings.map(b => {
                const statusColors = { pending: { bg: "#fff8e1", text: "#f57f17" }, confirmed: { bg: "#e8f5e9", text: "#2e7d32" }, completed: { bg: "#e3f2fd", text: "#1565c0" }, cancelled: { bg: "#fce4ec", text: "#c62828" } };
                const sc = statusColors[b.status] || statusColors.pending;
                return (
                  <div key={b.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderRadius: 8, background: "#f9f9f9", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: "700", color: "#1a1a1a", fontSize: 14 }}>{b.customer_name}</div>
                      <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{b.service_name} · {b.booking_date} at {b.booking_time}</div>
                      <div style={{ fontSize: 12, color: "#888" }}>{b.customer_phone}{b.customer_email ? ` · ${b.customer_email}` : ""}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {b.service_price && <span style={{ fontWeight: "bold", color: PINK }}>N{Number(b.service_price).toLocaleString()}</span>}
                      <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: "bold", background: sc.bg, color: sc.text, textTransform: "capitalize" }}>{b.status}</span>
                      <select
                        value={b.status}
                        onChange={async e => {
                          const status = e.target.value;
                          try {
                            await bookingsAPI.setStatus(b.id, status);
                            setBookings(prev => prev.map(x => x.id === b.id ? { ...x, status } : x));
                            showToast("Booking status updated");
                          } catch (err) {
                            showToast(err.message || "Failed to update booking", "error");
                          }
                        }}
                        style={{ padding: "5px 10px", border: `1px solid ${PINK}44`, borderRadius: 6, fontSize: 12, color: PINK, background: LIGHT_PINK, cursor: "pointer", outline: "none" }}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "spaPrices" && isAdmin && (
            <div>
              <div style={{ background: "white", borderRadius: 12, padding: "16px 20px", border: "1px solid #eee", marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
                <div style={{ flex: 2, minWidth: 160 }}>
                  <div style={{ fontSize: 11, color: "#888", fontWeight: "bold", letterSpacing: 1, marginBottom: 6 }}>SERVICE NAME</div>
                  <input value={newSpaService.name} onChange={e => setNewSpaService(z => ({ ...z, name: e.target.value }))} placeholder="e.g. Hot Stone Massage"
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div style={{ fontSize: 11, color: "#888", fontWeight: "bold", letterSpacing: 1, marginBottom: 6 }}>CATEGORY</div>
                  <select value={newSpaService.category} onChange={e => setNewSpaService(z => ({ ...z, category: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", background: "white" }}>
                    <option value="Massage">Massage</option>
                    <option value="Facial">Facial</option>
                    <option value="Treatment">Treatment</option>
                    <option value="Nails">Nails</option>
                    <option value="Package">Package</option>
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: 110 }}>
                  <div style={{ fontSize: 11, color: "#888", fontWeight: "bold", letterSpacing: 1, marginBottom: 6 }}>DURATION</div>
                  <input value={newSpaService.duration} onChange={e => setNewSpaService(z => ({ ...z, duration: e.target.value }))} placeholder="60 min"
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontSize: 11, color: "#888", fontWeight: "bold", letterSpacing: 1, marginBottom: 6 }}>PRICE (N)</div>
                  <input type="number" value={newSpaService.price} onChange={e => setNewSpaService(z => ({ ...z, price: e.target.value }))} placeholder="30000"
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
                <button onClick={addSpaService}
                  style={{ padding: "10px 20px", background: PINK, border: "none", borderRadius: 8, color: "white", fontWeight: "bold", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  {ICONS.plus} Add Service
                </button>
              </div>

              {loadingSpaServices && <div style={{ textAlign: "center", padding: 40, color: "#888" }}>Loading spa prices...</div>}
              {spaServicesError && (
                <div style={{ background: "#fff3e0", border: "1px solid #ffcc80", borderRadius: 8, padding: "14px 18px", color: "#e65100", fontSize: 13, marginBottom: 16 }}>
                  {spaServicesError}
                </div>
              )}

              <div style={{ background: "white", borderRadius: 12, border: "1px solid #eee", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f9f9f9" }}>
                      {["Service", "Category", "Duration", "Price", "Status", "Actions"].map(h => (
                        <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 12, color: "#888", fontWeight: "bold", letterSpacing: 1, borderBottom: "1px solid #eee" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {spaServices.map(sv => (
                      <tr key={sv.id} style={{ borderBottom: "1px solid #f5f5f5", opacity: sv.active ? 1 : 0.5 }}>
                        <td style={{ padding: "14px 20px", fontWeight: "600", fontSize: 14, color: "#1a1a1a" }}>{sv.name}</td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: "bold", background: LIGHT_PINK, color: PINK }}>
                            {sv.category}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: 13, color: "#666" }}>{sv.duration}</td>
                        <td style={{ padding: "14px 20px" }}>
                          <input type="number" value={spaServiceEdits[sv.id] ?? Number(sv.price)}
                            onChange={e => setSpaServiceEdits(ed => ({ ...ed, [sv.id]: e.target.value }))}
                            style={{ width: 110, padding: "8px 12px", border: `1px solid ${spaServiceEdits[sv.id] !== undefined ? PINK : "#e0e0e0"}`, borderRadius: 6, fontSize: 14, fontWeight: "bold", color: PINK, outline: "none" }} />
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: "bold", background: sv.active ? "#e8f5e9" : "#f5f5f5", color: sv.active ? "#2e7d32" : "#888" }}>
                            {sv.active ? "Active" : "Hidden"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => saveSpaServicePrice(sv)} disabled={spaServiceEdits[sv.id] === undefined}
                              style={{ padding: "6px 14px", background: spaServiceEdits[sv.id] !== undefined ? LIGHT_PINK : "#f5f5f5", border: `1px solid ${spaServiceEdits[sv.id] !== undefined ? PINK + "44" : "#eee"}`, borderRadius: 6, color: spaServiceEdits[sv.id] !== undefined ? PINK : "#bbb", fontSize: 12, fontWeight: "bold", cursor: spaServiceEdits[sv.id] !== undefined ? "pointer" : "default" }}>
                              Save
                            </button>
                            <button onClick={() => toggleSpaService(sv)}
                              style={{ padding: "6px 14px", background: "#e3f2fd", border: "1px solid #2196F344", borderRadius: 6, color: "#1565c0", fontSize: 12, fontWeight: "bold", cursor: "pointer" }}>
                              {sv.active ? "Hide" : "Show"}
                            </button>
                            <button onClick={() => deleteSpaService(sv)}
                              style={{ padding: "6px 14px", background: "#fce4ec", border: "1px solid #f4849044", borderRadius: 6, color: "#c62828", fontSize: 12, fontWeight: "bold", cursor: "pointer" }}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!loadingSpaServices && !spaServicesError && spaServices.length === 0 && (
                  <div style={{ padding: 40, textAlign: "center", color: "#aaa" }}>No spa services yet. Add one above.</div>
                )}
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: "#aaa" }}>
                Customers see active services with their prices on the Spa page. "Hide" removes a service without deleting it.
              </div>
            </div>
          )}

          {activeTab === "dispatch" && isAdmin && (
            <div>
              <div style={{ background: "white", borderRadius: 12, padding: "16px 20px", border: "1px solid #eee", marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
                <div style={{ flex: 2, minWidth: 180 }}>
                  <div style={{ fontSize: 11, color: "#888", fontWeight: "bold", letterSpacing: 1, marginBottom: 6 }}>AREA / LGA</div>
                  <input value={newZone.lga} onChange={e => setNewZone(z => ({ ...z, lga: e.target.value }))} placeholder="e.g. Yaba"
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontSize: 11, color: "#888", fontWeight: "bold", letterSpacing: 1, marginBottom: 6 }}>DELIVERY PRICE (N)</div>
                  <input type="number" value={newZone.price} onChange={e => setNewZone(z => ({ ...z, price: e.target.value }))} placeholder="3000"
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ flex: 1, minWidth: 150 }}>
                  <div style={{ fontSize: 11, color: "#888", fontWeight: "bold", letterSpacing: 1, marginBottom: 6 }}>TYPE</div>
                  <select value={newZone.category} onChange={e => setNewZone(z => ({ ...z, category: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", background: "white" }}>
                    <option value="Lagos">Lagos (LGA)</option>
                    <option value="Outside Lagos">Outside Lagos (State)</option>
                  </select>
                </div>
                <button onClick={addZone}
                  style={{ padding: "10px 20px", background: PINK, border: "none", borderRadius: 8, color: "white", fontWeight: "bold", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  {ICONS.plus} Add Area
                </button>
              </div>

              {loadingZones && <div style={{ textAlign: "center", padding: 40, color: "#888" }}>Loading dispatch prices...</div>}
              {zonesError && (
                <div style={{ background: "#fff3e0", border: "1px solid #ffcc80", borderRadius: 8, padding: "14px 18px", color: "#e65100", fontSize: 13, marginBottom: 16 }}>
                  {zonesError}
                </div>
              )}

              <div style={{ background: "white", borderRadius: 12, border: "1px solid #eee", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f9f9f9" }}>
                      {["Area / LGA", "Type", "Delivery Price", "Status", "Actions"].map(h => (
                        <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 12, color: "#888", fontWeight: "bold", letterSpacing: 1, borderBottom: "1px solid #eee" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {zones.map(z => (
                      <tr key={z.id} style={{ borderBottom: "1px solid #f5f5f5", opacity: z.active ? 1 : 0.5 }}>
                        <td style={{ padding: "14px 20px", fontWeight: "600", fontSize: 14, color: "#1a1a1a" }}>{z.lga}</td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: "bold", background: (z.category || "Lagos") === "Lagos" ? LIGHT_PINK : "#e3f2fd", color: (z.category || "Lagos") === "Lagos" ? PINK : "#1565c0" }}>
                            {z.category || "Lagos"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <input type="number" value={zoneEdits[z.id] ?? Number(z.price)}
                            onChange={e => setZoneEdits(ed => ({ ...ed, [z.id]: e.target.value }))}
                            style={{ width: 110, padding: "8px 12px", border: `1px solid ${zoneEdits[z.id] !== undefined ? PINK : "#e0e0e0"}`, borderRadius: 6, fontSize: 14, fontWeight: "bold", color: PINK, outline: "none" }} />
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: "bold", background: z.active ? "#e8f5e9" : "#f5f5f5", color: z.active ? "#2e7d32" : "#888" }}>
                            {z.active ? "Active" : "Hidden"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => saveZone(z)} disabled={zoneEdits[z.id] === undefined}
                              style={{ padding: "6px 14px", background: zoneEdits[z.id] !== undefined ? LIGHT_PINK : "#f5f5f5", border: `1px solid ${zoneEdits[z.id] !== undefined ? PINK + "44" : "#eee"}`, borderRadius: 6, color: zoneEdits[z.id] !== undefined ? PINK : "#bbb", fontSize: 12, fontWeight: "bold", cursor: zoneEdits[z.id] !== undefined ? "pointer" : "default" }}>
                              Save
                            </button>
                            <button onClick={() => toggleZone(z)}
                              style={{ padding: "6px 14px", background: "#e3f2fd", border: "1px solid #2196F344", borderRadius: 6, color: "#1565c0", fontSize: 12, fontWeight: "bold", cursor: "pointer" }}>
                              {z.active ? "Hide" : "Show"}
                            </button>
                            <button onClick={() => deleteZone(z)}
                              style={{ padding: "6px 14px", background: "#fce4ec", border: "1px solid #f4849044", borderRadius: 6, color: "#c62828", fontSize: 12, fontWeight: "bold", cursor: "pointer" }}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!loadingZones && !zonesError && zones.length === 0 && (
                  <div style={{ padding: 40, textAlign: "center", color: "#aaa" }}>No dispatch areas yet. Add one above.</div>
                )}
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: "#aaa" }}>
                Customers see active areas with their prices at checkout. "Hide" removes an area from checkout without deleting it.
              </div>
            </div>
          )}

          {activeTab === "staff" && isAdmin && (
            <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 24 }}>
              <div style={{ background: "white", borderRadius: 12, padding: 24, border: "1px solid #eee", alignSelf: "start" }}>
                <div style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16, color: "#1a1a1a" }}>Add Sales Attendant</div>
                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6 }}>NAME</label>
                <input
                  value={newStaff.name}
                  onChange={e => setNewStaff(s => ({ ...s, name: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none", marginBottom: 16, boxSizing: "border-box" }}
                />
                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6 }}>EMAIL</label>
                <input
                  value={newStaff.email}
                  onChange={e => setNewStaff(s => ({ ...s, email: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none", marginBottom: 16, boxSizing: "border-box" }}
                />
                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6 }}>PASSWORD</label>
                <input
                  type="password"
                  value={newStaff.password}
                  onChange={e => setNewStaff(s => ({ ...s, password: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none", marginBottom: 20, boxSizing: "border-box" }}
                />
                <button
                  onClick={handleAddStaff}
                  style={{ width: "100%", padding: 12, background: PINK, border: "none", borderRadius: 8, fontSize: 14, fontWeight: "bold", cursor: "pointer", color: "white" }}
                >
                  Create Login
                </button>
              </div>

              <div style={{ background: "white", borderRadius: 12, padding: 24, border: "1px solid #eee" }}>
                <div style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16, color: "#1a1a1a" }}>Staff Accounts</div>
                {loadingStaff && <div style={{ color: "#888" }}>Loading...</div>}
                {!loadingStaff && staff.map(s => (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f5f5f5" }}>
                    <div>
                      <div style={{ fontWeight: "600", fontSize: 14, color: "#1a1a1a" }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: "#888" }}>{s.email}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: "bold", background: s.role === "admin" ? LIGHT_PINK : "#e3f2fd", color: s.role === "admin" ? PINK : "#1565c0", textTransform: "capitalize" }}>{s.role}</span>
                      {s.role === "attendant" && (
                        <button
                          onClick={() => handleRemoveStaff(s.id)}
                          style={{ padding: "6px 14px", background: "#fce4ec", border: "1px solid #f4849044", borderRadius: 6, color: "#c62828", fontSize: 12, fontWeight: "bold", cursor: "pointer" }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {restockTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: 16, padding: 32, width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8, color: "#1a1a1a" }}>Restock {restockTarget.name}</div>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>Currently {restockTarget.stock_quantity ?? 0} in stock</div>
            <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6 }}>QUANTITY TO ADD</label>
            <input
              type="number"
              min="1"
              value={restockQty}
              onChange={e => setRestockQty(e.target.value)}
              autoFocus
              style={{ width: "100%", padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none", marginBottom: 20, boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setRestockTarget(null)} style={{ flex: 1, padding: 12, background: "#f5f5f5", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer", color: "#666" }}>Cancel</button>
              <button onClick={handleRestock} style={{ flex: 1, padding: 12, background: PINK, border: "none", borderRadius: 8, fontSize: 14, fontWeight: "bold", cursor: "pointer", color: "white" }}>Add Stock</button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && isAdmin && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: 16, padding: 32, width: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 18, fontWeight: "bold", marginBottom: 24, color: "#1a1a1a" }}>Add Product</div>
            <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6 }}>NAME</label>
            <input
              value={newProduct.name}
              onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))}
              style={{ width: "100%", padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none", marginBottom: 16, boxSizing: "border-box" }}
            />
            <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6 }}>DESCRIPTION</label>
            <input
              value={newProduct.description}
              onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))}
              style={{ width: "100%", padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none", marginBottom: 16, boxSizing: "border-box" }}
            />
            <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6 }}>PHOTO</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              {newProduct.images[0] && (
                <img src={newProduct.images[0]} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", border: "1px solid #e0e0e0" }} />
              )}
              <label style={{ padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, cursor: uploadingImage ? "wait" : "pointer", color: "#666" }}>
                {uploadingImage ? "Uploading..." : newProduct.images[0] ? "Change photo" : "Upload photo"}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingImage}
                  onChange={e => handleImageUpload(e.target.files[0], url => setNewProduct(p => ({ ...p, images: [url] })))}
                  style={{ display: "none" }}
                />
              </label>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6 }}>CATEGORY</label>
                <select value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))} style={{ width: "100%", padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none" }}>
                  {["skincare", "sextoys"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6 }}>PRICE (N)</label>
                <input type="number" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} style={{ width: "100%", padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6 }}>STOCK QTY</label>
                <input type="number" value={newProduct.stock_quantity} onChange={e => setNewProduct(p => ({ ...p, stock_quantity: e.target.value }))} style={{ width: "100%", padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: 12, background: "#f5f5f5", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer", color: "#666" }}>Cancel</button>
              <button onClick={handleAddProduct} style={{ flex: 1, padding: 12, background: PINK, border: "none", borderRadius: 8, fontSize: 14, fontWeight: "bold", cursor: "pointer", color: "white" }}>Add</button>
            </div>
          </div>
        </div>
      )}

      {selectedProduct && isAdmin && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: 16, padding: 32, width: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 18, fontWeight: "bold", marginBottom: 24, color: "#1a1a1a" }}>Edit Product</div>
            <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6 }}>NAME</label>
            <input
              value={selectedProduct.name}
              onChange={e => setSelectedProduct(p => ({ ...p, name: e.target.value }))}
              style={{ width: "100%", padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none", marginBottom: 16, boxSizing: "border-box" }}
            />
            <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6 }}>PHOTO</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              {selectedProduct.images?.[0] && (
                <img src={selectedProduct.images[0]} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", border: "1px solid #e0e0e0" }} />
              )}
              <label style={{ padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, cursor: uploadingImage ? "wait" : "pointer", color: "#666" }}>
                {uploadingImage ? "Uploading..." : selectedProduct.images?.[0] ? "Change photo" : "Upload photo"}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingImage}
                  onChange={e => handleImageUpload(e.target.files[0], url => setSelectedProduct(p => ({ ...p, images: [url, ...(p.images || []).slice(1)] })))}
                  style={{ display: "none" }}
                />
              </label>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6 }}>PRICE (N)</label>
                <input type="number" value={selectedProduct.price} onChange={e => setSelectedProduct(p => ({ ...p, price: parseFloat(e.target.value) }))} style={{ width: "100%", padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6 }}>STOCK QTY</label>
                <input type="number" value={selectedProduct.stock_quantity ?? 0} onChange={e => setSelectedProduct(p => ({ ...p, stock_quantity: parseInt(e.target.value, 10) || 0 }))} style={{ width: "100%", padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setSelectedProduct(null)} style={{ flex: 1, padding: 12, background: "#f5f5f5", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer", color: "#666" }}>Cancel</button>
              <button onClick={handleUpdateProduct} style={{ flex: 1, padding: 12, background: PINK, border: "none", borderRadius: 8, fontSize: 14, fontWeight: "bold", cursor: "pointer", color: "white" }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && isAdmin && (
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
