// Dashboard — role-aware
const Dashboard = ({ role, apps, onOpenApp, onNew, onNav }) => {
  const now = new Date();
  const live = apps.map(a => ({ ...a, status: deriveStatus(a) }));

  const myDrafts = live.filter(a => a.status === "DRAFT").length;
  const pendingApproval = live.filter(a => a.status === "PENDING_APPROVAL").length;
  const awaitingPayment = live.filter(a => a.status === "TOKEN_ISSUED").length;
  const pendingFinal = live.filter(a => a.status === "PENDING_FINAL_APPROVAL").length;
  const registeredThisMonth = live.filter(a => a.registrationDate && new Date(a.registrationDate).getMonth() === now.getMonth() && new Date(a.registrationDate).getFullYear() === now.getFullYear()).length;
  const expiring30 = live.filter(a => a.expiryDate && daysToExpiry(a.expiryDate) <= 30 && daysToExpiry(a.expiryDate) >= 0).length;
  const expiring60 = live.filter(a => a.expiryDate && daysToExpiry(a.expiryDate) <= 60 && daysToExpiry(a.expiryDate) >= 0).length;

  const adminApps = live.filter(a => ["DRAFT","PENDING_APPROVAL","REJECTED","TOKEN_ISSUED","PENDING_FINAL_APPROVAL"].includes(a.status));
  const reviewQueue = live.filter(a => a.status === "PENDING_APPROVAL");
  const finalQueue = live.filter(a => a.status === "PENDING_FINAL_APPROVAL");

  const kpi = (label, value, sub, icon, tone = "cyan") => (
    <div className="kpi">
      <div className="kpi-icon"><Icon name={icon} size={18}/></div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap: 20 }}>
      {/* Hero strip */}
      <div style={{ background: "linear-gradient(135deg, var(--gwcl-blue), #0057B5 60%, var(--gwcl-sky))", borderRadius: 12, padding: "22px 26px", color:"#fff", display:"flex", justifyContent:"space-between", alignItems:"center", position:"relative", overflow:"hidden" }}>
        <svg style={{ position:"absolute", right: -20, top: -40, opacity: 0.16 }} width="240" height="240" viewBox="0 0 200 200">
          <path d="M100 20 C70 60 40 95 40 130 a60 60 0 0 0 120 0 C160 95 130 60 100 20z" fill="#fff"/>
        </svg>
        <div style={{ zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform:"uppercase", opacity: 0.8 }}>
            {role === "admin" ? "Data Capture · Admin" : "Approver · Super Admin"}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6, letterSpacing: "-0.01em" }}>
            Welcome back, {role === "admin" ? "Adjoa" : "Eng. Ofori"}
          </div>
          <div style={{ fontSize: 13, marginTop: 4, opacity: 0.9 }}>
            {role === "admin"
              ? `You have ${myDrafts} draft${myDrafts===1?"":"s"} and ${awaitingPayment} application${awaitingPayment===1?"":"s"} awaiting payment.`
              : `${pendingApproval} application${pendingApproval===1?"":"s"} awaiting your review · ${pendingFinal} pending final approval.`}
          </div>
        </div>
        <div style={{ display:"flex", gap: 10, zIndex: 1 }}>
          {role === "admin" && (
            <button className="btn btn-lg" onClick={onNew} style={{ background:"#fff", color:"var(--gwcl-blue)" }}>
              <Icon name="plus" size={16}/>New Application
            </button>
          )}
          {role === "super" && reviewQueue[0] && (
            <button className="btn btn-lg" onClick={() => onOpenApp(reviewQueue[0].id)} style={{ background:"#fff", color:"var(--gwcl-blue)" }}>
              <Icon name="arrowRight" size={16}/>Start Reviewing
            </button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap: 14 }}>
        {role === "admin" ? (
          <>
            {kpi("My Drafts", myDrafts, "In progress", "edit")}
            {kpi("Pending Approval", pendingApproval, "With Super Admin", "inbox")}
            {kpi("Awaiting Payment", awaitingPayment, "Token issued", "cash")}
            {kpi("Registered This Month", registeredThisMonth, "Completed", "certificate")}
          </>
        ) : (
          <>
            {kpi("Pending My Review", pendingApproval, "Oldest first", "inbox")}
            {kpi("Pending Final Approval", pendingFinal, "Payment submitted", "shield")}
            {kpi("Expiring in 30 Days", expiring30, `${expiring60} in 60 days`, "clock")}
            {kpi("Registered This Month", registeredThisMonth, "Completed", "certificate")}
          </>
        )}
      </div>

      {/* Tables */}
      {role === "admin" ? (
        <div className="card">
          <div className="card-head">
            <h3>My Applications</h3>
            <div style={{ display:"flex", gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => onNav("myApps")}>View all <Icon name="arrowRight" size={12}/></button>
            </div>
          </div>
          <AppTable apps={adminApps.slice(0, 7)} onOpen={onOpenApp} columns={["id","company","licenceType","status","lastUpdate","actions"]} role={role}/>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 16 }}>
          <div className="card">
            <div className="card-head">
              <h3>Applications Awaiting My Review</h3>
              <span className="badge badge-amber">{reviewQueue.length}</span>
            </div>
            {reviewQueue.length === 0
              ? <EmptyState icon="check" title="All caught up" sub="No pending reviews. Nice."/>
              : <AppTable apps={reviewQueue} onOpen={onOpenApp} columns={["id","company","licenceType","submitted","actions"]} role={role}/>}
          </div>
          <div className="card">
            <div className="card-head">
              <h3>Pending Final Approval</h3>
              <span className="badge badge-cyan">{finalQueue.length}</span>
            </div>
            {finalQueue.length === 0
              ? <EmptyState icon="shield" title="Nothing to approve" sub="Payment-recorded applications will appear here."/>
              : <AppTable apps={finalQueue} onOpen={onOpenApp} columns={["id","company","licenceType","submitted","actions"]} role={role}/>}
          </div>
        </div>
      )}
    </div>
  );
};

const AppTable = ({ apps, onOpen, columns, role }) => {
  const headerLabel = { id: "Application ID", company: "Company", licenceType: "Licence", status: "Status", lastUpdate: "Last Updated", submitted: "Submitted", actions: "" };
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="tbl">
        <thead>
          <tr>
            {columns.map(c => <th key={c}>{headerLabel[c]}</th>)}
          </tr>
        </thead>
        <tbody>
          {apps.map(a => (
            <tr key={a.id} className="clickable" onClick={() => onOpen(a.id)}>
              {columns.includes("id") && <td><span className="mono" style={{ color:"var(--gwcl-blue)", fontWeight: 600 }}>{a.id}</span></td>}
              {columns.includes("company") && <td style={{ fontWeight: 600 }}>{a.company}<div style={{ fontSize: 11.5, color:"var(--ink-3)", fontWeight: 400, marginTop: 2 }}>{a.md}</div></td>}
              {columns.includes("licenceType") && <td><div style={{ fontSize: 13 }}>{a.licenceType}</div><div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{a.appType}</div></td>}
              {columns.includes("status") && <td><StatusBadge status={a.status}/></td>}
              {columns.includes("lastUpdate") && <td style={{ color:"var(--ink-2)" }}>{a.audit?.[a.audit.length-1] ? fmtDate(a.audit[a.audit.length-1].ts) : fmtDate(a.submittedDate)}</td>}
              {columns.includes("submitted") && <td style={{ color:"var(--ink-2)" }}>{fmtDate(a.submittedDate)}</td>}
              {columns.includes("actions") && <td style={{ textAlign:"right" }}>
                {role === "admin" && (a.status === "DRAFT" || a.status === "REJECTED")
                  ? <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); onOpen(a.id); }}>Continue</button>
                  : <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); onOpen(a.id); }}>Open <Icon name="chevronRight" size={12}/></button>}
              </td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

Object.assign(window, { Dashboard, AppTable });
