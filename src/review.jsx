// Review (Super Admin first gate) + Token
const { useState: uS_r } = React;

const ReviewQueue = ({ apps, onOpen }) => {
  const list = apps.map(a => ({ ...a, status: deriveStatus(a) })).filter(a => a.status === "PENDING_APPROVAL")
    .sort((a,b) => new Date(a.submittedDate) - new Date(b.submittedDate));
  return (
    <div style={{ display:"flex", flexDirection:"column", gap: 18 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing:"-0.01em" }}>Review Queue</div>
        <div style={{ fontSize: 13, color:"var(--ink-3)", marginTop: 4 }}>Applications awaiting your review. Oldest first.</div>
      </div>
      <div className="card">
        <div className="card-head"><h3>{list.length} application{list.length===1?"":"s"} pending</h3></div>
        {list.length === 0
          ? <EmptyState icon="check" title="All caught up" sub="No applications awaiting review."/>
          : (
            <table className="tbl">
              <thead><tr><th>App ID</th><th>Company</th><th>Licence</th><th>Submitted</th><th>Waiting</th><th></th></tr></thead>
              <tbody>
                {list.map(a => {
                  const days = daysToExpiry(a.submittedDate) * -1;
                  return (
                    <tr key={a.id} className="clickable" onClick={() => onOpen(a.id)}>
                      <td><span className="mono" style={{ color:"var(--gwcl-blue)", fontWeight: 600 }}>{a.id}</span></td>
                      <td style={{ fontWeight: 600 }}>{a.company}<div style={{ fontSize: 11.5, color:"var(--ink-3)", fontWeight:400 }}>{a.md}</div></td>
                      <td><div>{a.licenceType}</div><div style={{ fontSize: 11.5, color:"var(--ink-3)" }}>{a.appType}</div></td>
                      <td style={{ color:"var(--ink-2)" }}>{fmtDate(a.submittedDate)}</td>
                      <td><span className={`badge ${days >= 5 ? "badge-amber" : "badge-grey"}`}>{days} day{days===1?"":"s"}</span></td>
                      <td style={{ textAlign:"right" }}><button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); onOpen(a.id); }}>Review<Icon name="arrowRight" size={12}/></button></td>
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

const ReviewApplication = ({ app, onApprove, onReject, onBack }) => {
  const [comments, setComments] = uS_r("");
  const [rejectMode, setRejectMode] = uS_r(false);
  const toasts = useToasts();
  const canAct = app.status === "PENDING_APPROVAL";

  const approve = () => {
    onApprove(app.id, comments);
    toasts.push("Application approved. Token issued.", "success");
  };
  const reject = () => {
    if (!comments.trim()) { toasts.push("Rejection reason required", "warn"); return; }
    onReject(app.id, comments);
    toasts.push("Application rejected. Admin notified.", "info");
  };

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap: 18 }}>
      <div style={{ display:"flex", flexDirection:"column", gap: 14 }}>
        <ApplicationReadonly app={app}/>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap: 14, position: "sticky", top: 76, height: "fit-content" }}>
        {canAct && (
          <div className="card card-padded">
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Approval Decision</div>
            <Field label={rejectMode ? "Rejection Reason" : "Comments (optional)"} required={rejectMode}>
              <textarea className="textarea" rows={5} value={comments} onChange={e => setComments(e.target.value)} placeholder={rejectMode ? "Be specific — e.g. Tax clearance expired; re-upload and resubmit." : "Optional notes for applicant or file"}/>
            </Field>
            <div style={{ display:"flex", gap: 8, marginTop: 12, flexDirection:"column" }}>
              {!rejectMode ? (
                <>
                  <button className="btn btn-primary btn-lg" onClick={approve} style={{ width: "100%" }}><Icon name="check" size={16}/>Approve & Issue Token</button>
                  <button className="btn btn-danger" onClick={() => setRejectMode(true)} style={{ width: "100%" }}><Icon name="x" size={14}/>Reject Application</button>
                </>
              ) : (
                <>
                  <button className="btn btn-danger btn-lg" onClick={reject} style={{ width: "100%" }}><Icon name="x" size={14}/>Confirm Rejection</button>
                  <button className="btn btn-ghost" onClick={() => setRejectMode(false)} style={{ width: "100%" }}>Cancel</button>
                </>
              )}
            </div>
          </div>
        )}
        <AuditLog entries={app.audit}/>
      </div>
    </div>
  );
};

// Readonly application view used by both reviewers
const ApplicationReadonly = ({ app }) => {
  return (
    <>
      <div className="card card-padded">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, color:"var(--gwcl-sky)", fontWeight: 700, letterSpacing: "0.12em", textTransform:"uppercase" }}>{app.licenceType} · {app.appType}</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 3, letterSpacing:"-0.01em" }}>{app.company}</div>
            <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>{app.md} · <span className="mono">{app.id}</span></div>
          </div>
          <StatusBadge status={deriveStatus(app)}/>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 14 }}>
          <KV k="Postal Address" v={app.postal}/>
          <KV k="Office Address" v={app.office}/>
          <KV k="Telephone" v={app.phone}/>
          <KV k="Email" v={app.email}/>
          <KV k="Fax" v={app.fax || "—"}/>
          <KV k="Office Manned" v={app.officeManned}/>
          <KV k="Warehouse Location" v={app.warehouse}/>
          <KV k="Warehouse Description" v={app.warehouseDesc}/>
        </div>
      </div>

      <SubCard title={`Key Staff (${(app.staff||[]).length})`} icon="users">
        <table className="tbl"><thead><tr><th>Name</th><th>Role</th><th>Qualification</th><th>Years</th><th>Cert</th></tr></thead>
          <tbody>{(app.staff||[]).map((s,i) => (
            <tr key={i}>
              <td style={{ fontWeight: 500 }}>{s.name}</td>
              <td>{s.role}</td>
              <td style={{ color: "var(--ink-2)" }}>{s.qual}</td>
              <td>{s.years}</td>
              <td>{s.file ? <a style={{ color:"var(--gwcl-sky)", fontSize: 12 }}><Icon name="paperclip" size={11}/> {s.file}</a> : <span style={{ color: "var(--ink-3)", fontSize: 12 }}>—</span>}</td>
            </tr>
          ))}</tbody>
        </table>
      </SubCard>

      <SubCard title={`Tools & Equipment (${(app.tools||[]).length})`} icon="tool">
        <table className="tbl"><thead><tr><th>Category</th><th>Type</th><th>Serial</th><th>Mfg Date</th><th>Proof</th></tr></thead>
          <tbody>{(app.tools||[]).map((s,i) => (
            <tr key={i}>
              <td>{s.category}</td><td style={{ fontWeight: 500 }}>{s.type}</td>
              <td className="mono" style={{ fontSize: 12 }}>{s.serial}</td>
              <td>{fmtDate(s.dom)}</td>
              <td>{s.file ? <a style={{ color:"var(--gwcl-sky)", fontSize: 12 }}><Icon name="paperclip" size={11}/> {s.file}</a> : <span style={{ color:"var(--ink-3)", fontSize: 12 }}>—</span>}</td>
            </tr>
          ))}</tbody>
        </table>
      </SubCard>

      <SubCard title={`Previous Projects (${(app.projects||[]).length})`} icon="clipboard">
        <table className="tbl"><thead><tr><th>Project</th><th>Details</th><th>Cost</th><th>Year</th><th>Proof</th></tr></thead>
          <tbody>{(app.projects||[]).map((s,i) => (
            <tr key={i}>
              <td style={{ fontWeight: 500 }}>{s.name}</td>
              <td style={{ color:"var(--ink-2)" }}>{s.details}</td>
              <td>{fmtMoney(s.cost)}</td><td>{s.year}</td>
              <td>{s.file ? <a style={{ color:"var(--gwcl-sky)", fontSize: 12 }}><Icon name="paperclip" size={11}/> {s.file}</a> : <span style={{ color:"var(--ink-3)", fontSize: 12 }}>—</span>}</td>
            </tr>
          ))}</tbody>
        </table>
      </SubCard>

      <SubCard title="Financial Standing" icon="cash">
        <div style={{ padding: 16, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap: 14 }}>
          <KV k="Bank" v={app.financial?.bank}/>
          <KV k="Bank Statement" v={app.financial?.statement ? <span style={{ color:"var(--success)", fontWeight: 500 }}><Icon name="check" size={12}/> {app.financial.statement}</span> : "—"}/>
          <KV k="Line of Credit" v={app.financial?.credit ? <span style={{ color:"var(--success)", fontWeight: 500 }}><Icon name="check" size={12}/> {app.financial.credit}</span> : "Not provided"}/>
        </div>
      </SubCard>

      <SubCard title="Mandatory Attachments" icon="paperclip">
        <div style={{ padding: 16, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap: 10 }}>
          {MANDATORY_DOCS.map(d => {
            const f = app.docs?.[d];
            return (
              <div key={d} style={{ padding: 12, border: `1px solid ${f ? "var(--success)" : "var(--line)"}`, borderRadius: 8, background: f ? "#F3FAF4" : "#FAFBFC" }}>
                <div style={{ display:"flex", alignItems:"center", gap: 8 }}>
                  {f ? <Icon name="check" size={14} color="var(--success)"/> : <Icon name="x" size={14} color="var(--error)"/>}
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{d}</div>
                </div>
                {f && <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4, marginLeft: 22 }}>{f.name}</div>}
              </div>
            );
          })}
        </div>
      </SubCard>
    </>
  );
};

const SubCard = ({ title, icon, children }) => (
  <div className="card">
    <div className="card-head">
      <h3 style={{ display:"flex", alignItems:"center", gap: 8 }}><Icon name={icon} size={14} color="var(--gwcl-sky)"/> {title}</h3>
    </div>
    {children}
  </div>
);

const KV = ({ k, v }) => (
  <div>
    <div style={{ fontSize: 11, color:"var(--ink-3)", textTransform:"uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{k}</div>
    <div style={{ fontSize: 13.5, marginTop: 3, fontWeight: 500, color: "var(--ink)" }}>{v || "—"}</div>
  </div>
);

const AuditLog = ({ entries = [], compact = false }) => {
  return (
    <div className="card card-padded">
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display:"flex", alignItems:"center", gap: 6 }}>
        <Icon name="clock" size={14} color="var(--gwcl-sky)"/> Audit Log
      </div>
      <div>
        {entries.length === 0 && <div style={{ fontSize: 12, color: "var(--ink-3)" }}>No activity yet.</div>}
        {entries.slice().reverse().map((e, i) => (
          <div key={i} className="timeline-dot">
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>{e.action}</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{e.by}</div>
            <div style={{ fontSize: 11, color:"var(--ink-3)" }}>{fmtDate(e.ts)} · {new Date(e.ts).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</div>
            {e.notes && <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 4, paddingLeft: 8, borderLeft: "2px solid var(--line)" }}>{e.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

Object.assign(window, { ReviewQueue, ReviewApplication, ApplicationReadonly, AuditLog, SubCard, KV });
