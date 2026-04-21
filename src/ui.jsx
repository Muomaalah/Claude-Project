// UI primitives
const { useState, useMemo, useEffect, useRef, useCallback } = React;

const StatusBadge = ({ status }) => {
  const map = {
    DRAFT:              { cls: "badge-grey",    label: "Draft" },
    PENDING_APPROVAL:   { cls: "badge-amber",   label: "Pending Approval" },
    REJECTED:           { cls: "badge-red",     label: "Rejected" },
    TOKEN_ISSUED:       { cls: "badge-blue",    label: "Token Issued" },
    PENDING_FINAL_APPROVAL: { cls: "badge-cyan", label: "Pending Final Approval" },
    REGISTERED:         { cls: "badge-green",   label: "Registered" },
    EXPIRING_SOON:      { cls: "badge-amber",   label: "Expiring Soon" },
    EXPIRED:            { cls: "badge-red",     label: "Expired" },
    LAPSED:             { cls: "badge-charcoal",label: "Lapsed" },
  };
  const s = map[status] || { cls: "badge-grey", label: status };
  return <span className={`badge ${s.cls}`}><span className="dot"/>{s.label}</span>;
};

const GradeBadge = ({ grade, size = "md" }) => {
  if (!grade) return <span className="badge badge-grey">—</span>;
  const cls = { A: "grade-a", B: "grade-b", C: "grade-c", D: "grade-d" }[grade] || "grade-a";
  const dims = size === "lg" ? { w: 64, h: 64, fs: 32 } : size === "xl" ? { w: 96, h: 96, fs: 48 } : { w: 28, h: 28, fs: 14 };
  return (
    <div className={cls} style={{
      width: dims.w, height: dims.h, borderRadius: 8,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontWeight: 800, fontSize: dims.fs, letterSpacing: "-0.02em",
    }}>{grade}</div>
  );
};

const Toast = ({ toasts }) => (
  <div className="toast-wrap">
    {toasts.map(t => (
      <div key={t.id} className={`toast ${t.kind}`}>
        <Icon name={t.kind === "success" ? "check" : t.kind === "error" ? "alertTriangle" : "info"} size={16}/>
        <span>{t.msg}</span>
      </div>
    ))}
  </div>
);

// Global toast controller
const ToastCtx = React.createContext({ push: () => {} });
const useToasts = () => React.useContext(ToastCtx);
const ToastProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const push = useCallback((msg, kind = "info") => {
    const id = Date.now() + Math.random();
    setItems(l => [...l, { id, msg, kind }]);
    setTimeout(() => setItems(l => l.filter(x => x.id !== id)), 3200);
  }, []);
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <Toast toasts={items}/>
    </ToastCtx.Provider>
  );
};

const Field = ({ label, required, children, error, hint }) => (
  <div className="field">
    {label && <label>{label}{required && <span className="req">*</span>}</label>}
    {children}
    {hint && !error && <div className="field-hint">{hint}</div>}
    {error && <div className="field-error">{error}</div>}
  </div>
);

const Check = ({ checked, onChange, label, sub }) => (
  <div className={`checkbox ${checked ? "on" : ""}`} onClick={() => onChange(!checked)}>
    <div className="checkbox-box">{checked && <Icon name="check" size={12}/>}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.4 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{sub}</div>}
    </div>
  </div>
);

const UploadTile = ({ label, file, onPick, hint, required }) => {
  const ref = useRef(null);
  const handle = (e) => {
    const f = e.target.files?.[0];
    if (f) onPick({ name: f.name, size: f.size });
  };
  return (
    <div className={`upload-tile ${file ? "done" : ""}`} onClick={() => ref.current?.click()}>
      <input ref={ref} type="file" style={{display:"none"}} onChange={handle}/>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{label}{required && <span style={{ color:"var(--error)" }}> *</span>}</div>
        {file
          ? <span style={{ color: "var(--success)", display:"flex", alignItems:"center", gap: 4, fontSize: 12, fontWeight: 600 }}><Icon name="check" size={14}/>Uploaded</span>
          : <Icon name="upload" size={16} color="#6b7280"/>}
      </div>
      {file ? (
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ink-2)" }}>
          <Icon name="paperclip" size={12}/>
          <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{file.name}</span>
        </div>
      ) : (
        <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{hint || "PDF, JPG or PNG · Click to upload"}</div>
      )}
    </div>
  );
};

const EmptyState = ({ icon = "inbox", title, sub, action }) => (
  <div style={{ padding: "48px 24px", display:"flex", flexDirection:"column", alignItems:"center", gap: 10, textAlign:"center" }}>
    <div style={{ width: 56, height: 56, borderRadius: 999, background: "#EFF4FB", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--gwcl-blue)" }}>
      <Icon name={icon} size={24}/>
    </div>
    <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
    {sub && <div style={{ fontSize: 13, color:"var(--ink-3)", maxWidth: 360 }}>{sub}</div>}
    {action}
  </div>
);

const fmtDate = (d) => {
  if (!d) return "—";
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtDateShort = (d) => {
  if (!d) return "—";
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};
const fmtMoney = (n) => `GHS ${Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const daysBetween = (a, b) => Math.round((new Date(a) - new Date(b)) / 86400000);
const daysToExpiry = (d) => daysBetween(d, new Date());

Object.assign(window, {
  StatusBadge, GradeBadge, ToastProvider, useToasts,
  Field, Check, UploadTile, EmptyState,
  fmtDate, fmtDateShort, fmtMoney, daysBetween, daysToExpiry,
});
