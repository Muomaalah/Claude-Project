// Shell: top bar + side nav + role switcher
const { useState: uS_shell, useEffect: uE_shell, useRef: uR_shell } = React;

const NAV_ITEMS = {
  admin: [
    { id: "dashboard", label: "Dashboard", icon: "home" },
    { id: "myApps", label: "My Applications", icon: "files" },
    { id: "newApp", label: "New Application", icon: "plus" },
    { id: "registry", label: "Registry", icon: "certificate" },
    { id: "expiring", label: "Expiring Licences", icon: "clock" },
    { id: "analytics", label: "Analytics", icon: "chart" },
  ],
  super: [
    { id: "dashboard", label: "Dashboard", icon: "home" },
    { id: "review", label: "Review Queue", icon: "inbox" },
    { id: "finalApproval", label: "Final Approvals", icon: "shield" },
    { id: "registry", label: "Registry", icon: "certificate" },
    { id: "expiring", label: "Expiring Licences", icon: "clock" },
    { id: "analytics", label: "Analytics", icon: "chart" },
  ],
};

const Shell = ({ role, setRole, screen, setScreen, user, breadcrumb, children, onNav }) => {
  const [roleOpen, setRoleOpen] = uS_shell(false);
  const [notifOpen, setNotifOpen] = uS_shell(false);
  const items = NAV_ITEMS[role];
  const roleLabel = role === "admin" ? "Admin" : "Super Admin";
  const roleDesc = role === "admin" ? "Data Capture Officer" : "Chief Manager, PPD";

  const notifications = [
    { id: 1, icon: "alertTriangle", color: "var(--warning)", title: "Cape Coast Hydraulics expiring in 45 days", sub: "Initiate renewal to avoid lapse", time: "2h ago" },
    { id: 2, icon: "cash", color: "var(--gwcl-sky)", title: "Payment received: Volta Rivers Plumbing", sub: "Receipt R7-2026-04-3311 awaiting verification", time: "3h ago" },
    { id: 3, icon: "inbox", color: "var(--gwcl-blue)", title: "New application: Takoradi Waterworks", sub: "Pending Super Admin review", time: "5d ago" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "232px 1fr", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Sidebar */}
      <aside style={{ background: "var(--gwcl-blue)", color: "#fff", padding: "18px 14px", display:"flex", flexDirection:"column", position:"sticky", top: 0, height:"100vh" }}>
        <div style={{ display:"flex", alignItems:"center", gap: 10, padding: "4px 6px 18px" }}>
          <GwclLogo size={32} mono/>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "-0.01em" }}>GWCL</div>
            <div style={{ fontSize: 10, color: "#9EB7D8", fontWeight: 600, letterSpacing: "0.06em", textTransform:"uppercase" }}>PPD · Registry</div>
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap: 2 }}>
          {items.map(it => (
            <div key={it.id} className={`nav-item ${screen === it.id ? "active" : ""}`} onClick={() => onNav(it.id)}>
              <Icon name={it.icon} size={18}/>
              <span>{it.label}</span>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }}/>

        <div style={{ padding: "12px 14px", background: "rgba(255,255,255,0.06)", borderRadius: 10, marginTop: 12 }}>
          <div style={{ fontSize: 11, color:"#9EB7D8", textTransform:"uppercase", letterSpacing:"0.06em", fontWeight:600 }}>Signed in</div>
          <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 4 }}>{user.name}</div>
          <div style={{ fontSize: 11.5, color: "#9EB7D8", marginTop: 2 }}>{roleDesc}</div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ display:"flex", flexDirection:"column", minHeight: "100vh", overflow:"hidden" }}>
        {/* Top bar */}
        <header style={{ height: 60, background: "#fff", borderBottom: "1px solid var(--line)", display:"flex", alignItems:"center", padding: "0 24px", justifyContent:"space-between", position:"sticky", top: 0, zIndex: 10 }}>
          <div style={{ display:"flex", alignItems:"center", gap: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color:"var(--gwcl-blue)", letterSpacing: "-0.01em" }}>Plumbing Contractor Registry</div>
            {breadcrumb && <>
              <div style={{ width: 1, height: 20, background: "var(--line)" }}/>
              <div className="breadcrumb">{breadcrumb}</div>
            </>}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap: 8 }}>
            {/* Search */}
            <div style={{ position:"relative" }}>
              <Icon name="search" size={14} className="" style={{ position:"absolute", left: 10, top: 10, color: "var(--ink-3)" }}/>
              <input className="input" placeholder="Search applications, contractors…" style={{ paddingLeft: 32, height: 36, width: 280, background: "var(--bg)" }}/>
            </div>
            {/* Notif */}
            <div style={{ position:"relative" }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setNotifOpen(v => !v)} style={{ position:"relative", width: 36, padding: 0 }}>
                <Icon name="bell" size={18}/>
                <span style={{ position:"absolute", top: 6, right: 7, width: 8, height: 8, background: "var(--error)", borderRadius: 999, border: "2px solid #fff" }}/>
              </button>
              {notifOpen && (
                <div className="dropdown" style={{ minWidth: 360, padding: 0 }} onMouseLeave={() => setNotifOpen(false)}>
                  <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Notifications</div>
                    <div style={{ fontSize: 12, color:"var(--gwcl-sky)", cursor:"pointer" }}>Mark all read</div>
                  </div>
                  <div style={{ maxHeight: 360, overflowY: "auto" }}>
                    {notifications.map(n => (
                      <div key={n.id} style={{ padding: "12px 14px", display:"flex", gap: 10, borderBottom: "1px solid var(--line-2)" }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#EFF4FB", display:"flex", alignItems:"center", justifyContent:"center", color: n.color, flex: "none" }}>
                          <Icon name={n.icon} size={16}/>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color:"var(--ink)" }}>{n.title}</div>
                          <div style={{ fontSize: 12, color:"var(--ink-3)", marginTop: 2 }}>{n.sub}</div>
                          <div style={{ fontSize: 11, color:"var(--ink-3)", marginTop: 4 }}>{n.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Role switcher */}
            <div style={{ position:"relative" }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setRoleOpen(v => !v)} style={{ gap: 8, border: "1px solid var(--line)", background:"#fff" }}>
                <span style={{ fontSize: 11, color:"var(--ink-3)", fontWeight: 500 }}>View as:</span>
                <span style={{ fontWeight: 600 }}>{roleLabel}</span>
                <Icon name="chevronDown" size={14}/>
              </button>
              {roleOpen && (
                <div className="dropdown" onMouseLeave={() => setRoleOpen(false)}>
                  <div style={{ padding: "6px 10px", fontSize: 11, color:"var(--ink-3)", fontWeight: 600, textTransform:"uppercase", letterSpacing:"0.05em" }}>Switch role</div>
                  <div className={`dropdown-item ${role === "admin" ? "active" : ""}`} onClick={() => { setRole("admin"); setRoleOpen(false); onNav("dashboard"); }}>
                    <div style={{ width: 28, height: 28, borderRadius: 999, background:"#EFF4FB", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--gwcl-blue)" }}>
                      <Icon name="edit" size={14}/>
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>Admin</div>
                      <div style={{ fontSize: 11.5, color:"var(--ink-3)" }}>Data Capture Officer</div>
                    </div>
                  </div>
                  <div className={`dropdown-item ${role === "super" ? "active" : ""}`} onClick={() => { setRole("super"); setRoleOpen(false); onNav("dashboard"); }}>
                    <div style={{ width: 28, height: 28, borderRadius: 999, background:"#EFF4FB", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--gwcl-blue)" }}>
                      <Icon name="shield" size={14}/>
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>Super Admin</div>
                      <div style={{ fontSize: 11.5, color:"var(--ink-3)" }}>Chief Manager, PPD</div>
                    </div>
                  </div>
                  <div style={{ borderTop: "1px solid var(--line)", margin: "6px 0" }}/>
                  <div className="dropdown-item" onClick={() => onNav("signin")}>
                    <Icon name="logout" size={14}/>
                    <span>Sign out</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto" }} className="scrollable">
          <div style={{ padding: 24, maxWidth: 1480, margin: "0 auto" }}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

window.Shell = Shell;
