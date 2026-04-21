// Registry of registered contractors
const { useState: uS_rg, useMemo: uM_rg } = React;

const Registry = ({ apps, onOpen, onRenew, role }) => {
  const [search, setSearch] = uS_rg("");
  const [grade, setGrade] = uS_rg("all");
  const [licence, setLicence] = uS_rg("all");
  const [status, setStatus] = uS_rg("all");

  const list = uM_rg(() => {
    const registered = apps.map(a => ({ ...a, status: deriveStatus(a) })).filter(a => ["REGISTERED","EXPIRING_SOON","EXPIRED","LAPSED"].includes(a.status));
    return registered.filter(a => {
      if (search && !(a.company.toLowerCase().includes(search.toLowerCase()) || a.regNo?.toLowerCase().includes(search.toLowerCase()))) return false;
      if (grade !== "all" && a.grade !== grade) return false;
      if (licence !== "all" && a.licenceType !== licence) return false;
      if (status !== "all") {
        if (status === "active" && a.status !== "REGISTERED") return false;
        if (status === "expiring" && a.status !== "EXPIRING_SOON") return false;
        if (status === "expired" && !["EXPIRED","LAPSED"].includes(a.status)) return false;
      }
      return true;
    });
  }, [apps, search, grade, licence, status]);

  const toasts = useToasts();

  return (
    <div style={{ display:"flex", flexDirection:"column", gap: 18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing:"-0.01em" }}>Registered Contractors Registry</div>
          <div style={{ fontSize: 13, color:"var(--ink-3)", marginTop: 4 }}>All registered plumbing contractors. Click a row for full record.</div>
        </div>
        <button className="btn btn-secondary" onClick={() => toasts.push("Registry exported to Excel", "success")}><Icon name="download" size={14}/>Export to Excel</button>
      </div>

      <div className="card" style={{ padding: 14 }}>
        <div style={{ display:"flex", gap: 10, flexWrap:"wrap", alignItems:"center" }}>
          <div style={{ position:"relative", flex: "1 1 260px", minWidth: 200 }}>
            <Icon name="search" size={14} style={{ position:"absolute", left: 12, top: 13, color:"var(--ink-3)" }}/>
            <input className="input" placeholder="Search by company or registration number" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34 }}/>
          </div>
          <div className="segmented">
            {["all","A","B","C","D"].map(g => (
              <button key={g} className={grade === g ? "on" : ""} onClick={() => setGrade(g)}>{g === "all" ? "All Grades" : `Grade ${g}`}</button>
            ))}
          </div>
          <div className="segmented">
            {[["all","All"],["Master Plumber","Master"],["Plumbing Contractor","Contractor"]].map(([v,l]) => (
              <button key={v} className={licence === v ? "on" : ""} onClick={() => setLicence(v)}>{l}</button>
            ))}
          </div>
          <div className="segmented">
            {[["all","All"],["active","Active"],["expiring","Expiring"],["expired","Expired"]].map(([v,l]) => (
              <button key={v} className={status === v ? "on" : ""} onClick={() => setStatus(v)}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3>{list.length} contractor{list.length===1?"":"s"}</h3>
        </div>
        {list.length === 0
          ? <EmptyState icon="certificate" title="No contractors match your filters"/>
          : (
            <table className="tbl">
              <thead><tr>
                <th>Reg No</th><th>Company</th><th>Licence</th><th>Grade</th><th>Registered</th><th>Expires</th><th>Days</th><th>Status</th><th></th>
              </tr></thead>
              <tbody>
                {list.map(a => {
                  const d = a.expiryDate ? daysToExpiry(a.expiryDate) : null;
                  return (
                    <tr key={a.id} className="clickable" onClick={() => onOpen(a.id)}>
                      <td><span className="mono" style={{ fontWeight: 600, color:"var(--gwcl-blue)" }}>{a.regNo}</span></td>
                      <td style={{ fontWeight: 600 }}>{a.company}<div style={{ fontSize:11.5, color:"var(--ink-3)", fontWeight:400 }}>{a.md}</div></td>
                      <td>{a.licenceType}</td>
                      <td><GradeBadge grade={a.grade}/></td>
                      <td style={{ color:"var(--ink-2)" }}>{fmtDate(a.registrationDate)}</td>
                      <td style={{ color:"var(--ink-2)" }}>{fmtDate(a.expiryDate)}</td>
                      <td>
                        {d !== null && (
                          d < 0
                            ? <span style={{ color:"var(--error)", fontWeight: 600 }}>{Math.abs(d)}d overdue</span>
                            : d <= 30
                              ? <span style={{ color:"var(--warning)", fontWeight: 600 }}>{d}d</span>
                              : <span style={{ color:"var(--ink-2)" }}>{d}d</span>
                        )}
                      </td>
                      <td><StatusBadge status={a.status}/></td>
                      <td style={{ textAlign:"right" }}>
                        {role === "admin" && (a.status === "EXPIRING_SOON" || a.status === "EXPIRED") ? (
                          <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); onRenew(a.id); }}><Icon name="refresh" size={12}/>Renew</button>
                        ) : (
                          <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); onOpen(a.id); }}>Open<Icon name="chevronRight" size={12}/></button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        }
      </div>
    </div>
  );
};

// My Applications (Admin only)
const MyApps = ({ apps, onOpen, onNew }) => {
  const [search, setSearch] = uS_rg("");
  const [status, setStatus] = uS_rg("all");
  const list = apps.map(a => ({ ...a, status: deriveStatus(a) }))
    .filter(a => !search || a.company.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase()))
    .filter(a => status === "all" || a.status === status);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap: 18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing:"-0.01em" }}>My Applications</div>
          <div style={{ fontSize: 13, color:"var(--ink-3)", marginTop: 4 }}>All applications you have created or handled.</div>
        </div>
        <button className="btn btn-primary" onClick={onNew}><Icon name="plus" size={14}/>New Application</button>
      </div>

      <div className="card" style={{ padding: 14 }}>
        <div style={{ display:"flex", gap: 10, alignItems:"center" }}>
          <div style={{ position:"relative", flex:1 }}>
            <Icon name="search" size={14} style={{ position:"absolute", left: 12, top: 13, color:"var(--ink-3)" }}/>
            <input className="input" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34 }}/>
          </div>
          <div className="segmented">
            {[["all","All"],["DRAFT","Draft"],["PENDING_APPROVAL","Pending"],["REJECTED","Rejected"],["TOKEN_ISSUED","Token"],["PENDING_FINAL_APPROVAL","Pending Final"],["REGISTERED","Registered"]].map(([v,l]) => (
              <button key={v} className={status === v ? "on" : ""} onClick={() => setStatus(v)}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h3>{list.length} application{list.length===1?"":"s"}</h3></div>
        <AppTable apps={list} onOpen={onOpen} columns={["id","company","licenceType","status","lastUpdate","actions"]} role="admin"/>
      </div>
    </div>
  );
};

Object.assign(window, { Registry, MyApps });
