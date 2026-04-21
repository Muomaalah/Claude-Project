// Application detail view (tabs)
const { useState: uS_d } = React;

const AppDetail = ({ app, role, onAct, onBack, onEdit, onRenew }) => {
  const [tab, setTab] = uS_d("data");
  const liveStatus = deriveStatus(app);

  const tabs = [
    { id: "data", label: "Application Data", icon: "file" },
    { id: "attachments", label: "Attachments", icon: "paperclip" },
    { id: "payment", label: "Payment", icon: "cash" },
    { id: "audit", label: "Audit Log", icon: "clock" },
  ];

  const showAction = role === "admin" && (liveStatus === "DRAFT" || liveStatus === "REJECTED");
  const showRenew = role === "admin" && (liveStatus === "EXPIRING_SOON" || liveStatus === "EXPIRED");

  return (
    <div style={{ display:"flex", flexDirection:"column", gap: 18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize: 12, color:"var(--gwcl-sky)", fontWeight: 700, letterSpacing:"0.08em", textTransform:"uppercase" }}>{app.licenceType} · {app.appType} {app.regNo ? "· " + app.regNo : ""}</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4, letterSpacing:"-0.01em" }}>{app.company}</div>
          <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 4, display:"flex", gap: 12, alignItems:"center" }}>
            <span className="mono">{app.id}</span>
            <StatusBadge status={liveStatus}/>
            {app.grade && <GradeBadge grade={app.grade}/>}
          </div>
        </div>
        <div style={{ display:"flex", gap: 8 }}>
          {showAction && <button className="btn btn-primary" onClick={onEdit}><Icon name="edit" size={14}/>Continue Editing</button>}
          {showRenew && <button className="btn btn-primary" onClick={onRenew}><Icon name="refresh" size={14}/>Initiate Renewal</button>}
          {liveStatus === "TOKEN_ISSUED" && role === "admin" && <button className="btn btn-primary" onClick={() => onAct("recordPayment")}><Icon name="cash" size={14}/>Record Payment</button>}
          {liveStatus === "PENDING_APPROVAL" && role === "super" && <button className="btn btn-primary" onClick={() => onAct("review")}><Icon name="shield" size={14}/>Review</button>}
          {liveStatus === "PENDING_FINAL_APPROVAL" && role === "super" && <button className="btn btn-primary" onClick={() => onAct("final")}><Icon name="certificate" size={14}/>Final Approval</button>}
          {liveStatus === "TOKEN_ISSUED" && <button className="btn btn-secondary" onClick={() => onAct("viewToken")}><Icon name="eye" size={14}/>View Token</button>}
        </div>
      </div>

      {/* Rejection banner */}
      {liveStatus === "REJECTED" && app.rejectionReason && (
        <div style={{ background: "#FBEAEA", border: "1px solid #F5C2C2", borderRadius: 10, padding: "14px 16px", display:"flex", gap: 12, alignItems:"flex-start" }}>
          <Icon name="alertTriangle" size={18} color="var(--error)"/>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color:"var(--error)" }}>Application Rejected</div>
            <div style={{ fontSize: 12.5, color: "var(--ink)", marginTop: 4 }}>{app.rejectionReason}</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 6 }}>— {app.reviewedBy} · {fmtDate(app.reviewedDate)}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:"flex", gap: 4, borderBottom: "1px solid var(--line)" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "10px 14px", background:"transparent", border: "none",
            borderBottom: `2px solid ${tab === t.id ? "var(--gwcl-blue)" : "transparent"}`,
            color: tab === t.id ? "var(--gwcl-blue)" : "var(--ink-3)",
            fontWeight: 600, fontSize: 13, cursor:"pointer",
            display:"flex", alignItems:"center", gap: 6,
          }}>
            <Icon name={t.icon} size={13}/>{t.label}
          </button>
        ))}
      </div>

      {/* Body */}
      {tab === "data" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap: 18 }}>
          <div style={{ display:"flex", flexDirection:"column", gap: 14 }}>
            <ApplicationReadonly app={app}/>
          </div>
          <div>
            {app.regNo && (
              <div className="card card-padded" style={{ marginBottom: 14, background:"linear-gradient(135deg,#fff,#F8FBFE)", border:"1.5px solid var(--gwcl-blue)" }}>
                <div style={{ display:"flex", gap: 14, alignItems:"center" }}>
                  <GradeBadge grade={app.grade} size="lg"/>
                  <div>
                    <div style={{ fontSize: 10, color:"var(--ink-3)", fontWeight: 700, letterSpacing:"0.08em", textTransform:"uppercase" }}>Registration</div>
                    <div className="mono" style={{ fontSize: 14, fontWeight: 700, color:"var(--gwcl-blue)", marginTop: 2 }}>{app.regNo}</div>
                    <div style={{ fontSize: 11.5, color:"var(--ink-3)", marginTop: 4 }}>Expires {fmtDate(app.expiryDate)}</div>
                  </div>
                </div>
              </div>
            )}
            <AuditLog entries={app.audit}/>
          </div>
        </div>
      )}

      {tab === "attachments" && (
        <div className="card">
          <div className="card-head"><h3>All Attachments</h3></div>
          <div style={{ padding: 18, display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap: 12 }}>
            {MANDATORY_DOCS.map(d => {
              const f = app.docs?.[d];
              return (
                <div key={d} className="card" style={{ padding: 14, boxShadow: "none" }}>
                  <div style={{ fontSize: 11, color:"var(--ink-3)", fontWeight: 700, textTransform:"uppercase", letterSpacing: "0.05em" }}>{d}</div>
                  {f
                    ? <div style={{ marginTop: 8, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <div style={{ fontSize: 12, color:"var(--ink)", display:"flex", gap: 6, alignItems:"center" }}><Icon name="paperclip" size={12} color="var(--success)"/> {f.name}</div>
                        <button className="btn btn-ghost btn-sm"><Icon name="download" size={12}/></button>
                      </div>
                    : <div style={{ marginTop: 8, fontSize: 12, color:"var(--error)" }}>Not uploaded</div>}
                </div>
              );
            })}
            {app.financial?.statement && (
              <div className="card" style={{ padding: 14, boxShadow: "none" }}>
                <div style={{ fontSize: 11, color:"var(--ink-3)", fontWeight: 700, textTransform:"uppercase", letterSpacing:"0.05em" }}>Bank Statement</div>
                <div style={{ marginTop: 8, fontSize: 12, display:"flex", gap: 6, alignItems:"center" }}><Icon name="paperclip" size={12} color="var(--success)"/> {app.financial.statement}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "payment" && (
        <div className="card card-padded">
          {!app.token ? (
            <EmptyState icon="cash" title="No payment information yet" sub="Application has not reached the payment stage."/>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 18 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Token</div>
                <KV k="Token Reference" v={<span className="mono">{app.token}</span>}/>
                <div style={{ height: 12 }}/>
                <KV k="Issued" v={fmtDate(app.tokenIssuedDate)}/>
                <div style={{ height: 12 }}/>
                <KV k="Valid Until" v={fmtDate(app.tokenExpiryDate)}/>
                <div style={{ height: 12 }}/>
                <KV k="Fee" v={fmtMoney(app.fee)}/>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Receipt</div>
                {app.receiptNumber ? (
                  <>
                    <KV k="Receipt Number" v={<span className="mono">{app.receiptNumber}</span>}/>
                    <div style={{ height: 12 }}/>
                    <KV k="Payment Date" v={fmtDate(app.paymentDate)}/>
                    <div style={{ height: 12 }}/>
                    <KV k="Recorded By" v={app.paymentRecordedBy}/>
                    <div style={{ height: 12 }}/>
                    <KV k="Verified By" v={app.paymentVerifiedBy || "Pending"}/>
                    <div style={{ height: 12 }}/>
                    <div className="placeholder-img" style={{ height: 100 }}>receipt · {app.receiptFile}</div>
                  </>
                ) : <div style={{ fontSize: 13, color:"var(--ink-3)" }}>No receipt recorded yet.</div>}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "audit" && (
        <div className="card card-padded" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Complete Audit Log</div>
          <div>
            {(app.audit || []).slice().reverse().map((e, i) => (
              <div key={i} className="timeline-dot">
                <div style={{ display:"flex", alignItems:"center", gap: 10 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{e.action}</div>
                  <span style={{ fontSize: 11.5, color:"var(--ink-3)" }}>· {e.by}</span>
                </div>
                <div style={{ fontSize: 12, color:"var(--ink-3)", marginTop: 2 }}>{fmtDate(e.ts)} at {new Date(e.ts).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</div>
                {e.notes && <div style={{ fontSize: 12.5, color: "var(--ink-2)", marginTop: 6, paddingLeft: 10, borderLeft: "3px solid var(--line)", background:"#FAFBFC", padding:"8px 12px", borderRadius: 4 }}>{e.notes}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { AppDetail });
