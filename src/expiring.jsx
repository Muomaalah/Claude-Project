// Expiring licences + renewal wizard
const { useState: uS_e } = React;

const Expiring = ({ apps, onRenew, onOpen }) => {
  const [tab, setTab] = uS_e("30");
  const live = apps.map(a => ({ ...a, status: deriveStatus(a) })).filter(a => a.expiryDate);

  const inRange = (a, min, max) => {
    const d = daysToExpiry(a.expiryDate);
    return d >= min && d <= max;
  };
  const bucketed = {
    "30": live.filter(a => inRange(a, 0, 30) && a.status !== "EXPIRED" && a.status !== "LAPSED"),
    "60": live.filter(a => inRange(a, 31, 60)),
    "90": live.filter(a => inRange(a, 61, 90)),
    "grace": live.filter(a => a.status === "EXPIRED"),
    "lapsed": live.filter(a => a.status === "LAPSED"),
  };

  const rows = bucketed[tab];

  const tabs = [
    { id: "30", label: "Expiring in 30 days", count: bucketed["30"].length },
    { id: "60", label: "31–60 days", count: bucketed["60"].length },
    { id: "90", label: "61–90 days", count: bucketed["90"].length },
    { id: "grace", label: "Expired (in grace)", count: bucketed["grace"].length },
    { id: "lapsed", label: "Lapsed", count: bucketed["lapsed"].length },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap: 18 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing:"-0.01em" }}>Expiring Licences</div>
        <div style={{ fontSize: 13, color:"var(--ink-3)", marginTop: 4 }}>Contractors approaching or past their expiry date. Automated reminders are sent on the 90/60/30/7-day schedule.</div>
      </div>

      <div style={{ display:"flex", gap: 4, borderBottom: "1px solid var(--line)" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "10px 16px", background:"transparent", border: "none",
            borderBottom: `2px solid ${tab === t.id ? "var(--gwcl-blue)" : "transparent"}`,
            color: tab === t.id ? "var(--gwcl-blue)" : "var(--ink-3)",
            fontWeight: 600, fontSize: 13, cursor:"pointer",
            display:"flex", alignItems:"center", gap: 8,
          }}>
            {t.label}
            <span style={{ padding: "1px 7px", borderRadius: 999, background: tab === t.id ? "#EFF4FB" : "var(--line-2)", fontSize: 11 }}>{t.count}</span>
          </button>
        ))}
      </div>

      <div className="card">
        {rows.length === 0 ? (
          <EmptyState icon={tab === "lapsed" ? "trash" : "clock"} title={`No contractors in this bucket`} sub="Good — nothing to action here right now."/>
        ) : (
          <table className="tbl">
            <thead><tr><th>Company</th><th>Reg No</th><th>Registered</th><th>Expiry</th><th>{tab === "grace" || tab === "lapsed" ? "Overdue" : "Days Left"}</th><th>Last Reminder</th><th></th></tr></thead>
            <tbody>
              {rows.map(a => {
                const d = daysToExpiry(a.expiryDate);
                return (
                  <tr key={a.id} className="clickable" onClick={() => onOpen(a.id)}>
                    <td style={{ fontWeight: 600 }}>{a.company}<div style={{ fontSize:11.5, color:"var(--ink-3)", fontWeight:400 }}>{a.md}</div></td>
                    <td><span className="mono" style={{ fontWeight: 600, color:"var(--gwcl-blue)" }}>{a.regNo}</span></td>
                    <td style={{ color:"var(--ink-2)" }}>{fmtDate(a.registrationDate)}</td>
                    <td style={{ color:"var(--ink-2)" }}>{fmtDate(a.expiryDate)}</td>
                    <td>{d < 0 ? <span style={{ color:"var(--error)", fontWeight: 600 }}>{Math.abs(d)}d overdue</span> : <span style={{ color: d <= 7 ? "var(--error)" : d <= 30 ? "var(--warning)" : "var(--ink-2)", fontWeight: 600 }}>{d}d</span>}</td>
                    <td style={{ fontSize: 12, color:"var(--ink-2)" }}>{d <= 7 ? "7-day reminder" : d <= 30 ? "30-day reminder" : d <= 60 ? "60-day reminder" : "90-day reminder"}<div style={{ fontSize: 11, color:"var(--ink-3)" }}>{fmtDate(new Date(Date.now() - 2*86400000))}</div></td>
                    <td style={{ textAlign:"right" }}>
                      {tab === "lapsed"
                        ? <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); onOpen(a.id); }}>New Application</button>
                        : <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); onRenew(a.id); }}><Icon name="refresh" size={12}/>Initiate Renewal</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { Expiring });
