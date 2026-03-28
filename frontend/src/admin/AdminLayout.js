import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/admin.css";

function AdminLayout({ children }) {

  const navigate = useNavigate();
  const location = useLocation();

  const admin = JSON.parse(localStorage.getItem("user") || "null");

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const navItems = [
    { path: "/admin",               label: "Dashboard",   icon: "bi-speedometer2"    },
    { path: "/admin/trips",         label: "Trips",       icon: "bi-map"             },
    { path: "/admin/add-trip",      label: "Add Trip",    icon: "bi-plus-circle"     },
    { path: "/admin/bookings",      label: "Bookings",    icon: "bi-calendar-check"  },
    { path: "/admin/payments",      label: "Payments",    icon: "bi-credit-card"     },
    { path: "/admin/users",         label: "Users",       icon: "bi-people"          },
    { path: "/admin/guides",        label: "Guides",      icon: "bi-person-badge"    },
    { path: "/admin/smart-trips",   label: "Smart Trips", icon: "bi-robot"           },
  ];

  const isActive = (path) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9" }}>

      {/* ── Sidebar ── */}
      <div style={{ width: "240px", background: "#0f172a", color: "white", minHeight: "100vh", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflowY: "auto", flexShrink: 0 }}>

        {/* Logo */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <i className="bi bi-airplane-engines" style={{ fontSize: "20px", color: "#86efac" }}></i>
            <span style={{ fontSize: "17px", fontWeight: "700", color: "white" }}>GoBeyond</span>
          </div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", paddingLeft: "28px" }}>Admin Panel</div>
        </div>

        {/* Nav items */}
        <nav style={{ padding: "12px 10px", flex: 1 }}>
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 12px", borderRadius: "8px", margin: "2px 0",
                textDecoration: "none", fontSize: "14px", fontWeight: "500",
                transition: "all 0.15s",
                background: isActive(item.path) ? "rgba(134,239,172,0.12)" : "transparent",
                color:      isActive(item.path) ? "#86efac" : "rgba(255,255,255,0.65)",
                borderLeft: isActive(item.path) ? "2px solid #86efac" : "2px solid transparent",
              }}>
              <i className={`bi ${item.icon}`} style={{ fontSize: "16px", width: "18px" }}></i>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Admin info + logout */}
        <div style={{ padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#0f5132", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", flexShrink: 0 }}>
              {admin?.firstName?.[0]?.toUpperCase() || "A"}
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "white" }}>{admin?.firstName} {admin?.lastName}</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>Administrator</div>
            </div>
          </div>
          <button onClick={logout}
            style={{ width: "100%", padding: "8px", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "500", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <i className="bi bi-box-arrow-right"></i> Logout
          </button>
        </div>

      </div>

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Top bar */}
        <div style={{ background: "white", padding: "14px 28px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "14px", color: "#64748b" }}>
            <i className="bi bi-house" style={{ marginRight: "6px" }}></i>
            Admin
            <i className="bi bi-chevron-right" style={{ margin: "0 6px", fontSize: "11px" }}></i>
            <span style={{ color: "#1e293b", fontWeight: "500" }}>
              {navItems.find(n => isActive(n.path))?.label || "Dashboard"}
            </span>
          </div>
          <div style={{ fontSize: "13px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
            <i className="bi bi-clock" style={{ color: "#0f5132" }}></i>
            {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, padding: "28px" }}>
          {children}
        </div>

      </div>

    </div>
  );
}

export default AdminLayout;