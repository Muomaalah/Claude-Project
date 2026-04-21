// Final Approval (Super Admin 2nd gate) with checklist + grade
const { useState: uS_f, useMemo: uM_f } = React;

const FinalApproval = ({ app, onRegister, onRevert, onBack }) => {
  const [required, setRequired] = uS_f(app.checklistRequired || []);
  const [optional, setOptional] = uS_f(app.checklistOptional || []);
  const [paymentVerified, setPaymentVerified] = uS_f(null); // null | "verified" | "discrepancy"
  const [revertMode, setRevertMode] = uS_f(false);
  const [revertNote, setRevertNote] = uS_f("");
  const toasts = useToasts();

  const toggle = (list, setList, i) => setList(list.includes(i) ? list.filter(x => x !== i) : [...list, i]);
  const grade = uM_f(() => calcGrade(required.length, optional.length), [required, optional]);

  const canRegister = paymentVerified === "verified" && required.length === 10;

  const register = () => {
    if (!canRegister) { toasts.push("Verify payment and tick all required criteria", "warn"); return; }
    onRegister(app.id, { required, optional, grade });
    toasts.push(`Registration complete. Grade ${grade} issued.`, "success");
  };

  const revert = () => {
    if (!revertNote.trim()) { toasts.push("Provide a reason", "warn"); return; }
    onRevert(app.id, revertNote);
    toasts.push("Reverted to Admin for correction", "info");
  };

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 18 }}>
      {/* Left: Payment verification + application summary */}
      <div style={{ display:"flex", flexDirection:"column", gap: 14 }}>
        <div className="card card-padded">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom: 4 }}>
            <div>
              <div style={{ fontSize: 11, color:"var(--gwcl-sky)", fontWeight: 700, letterSpacing:"0.12em", textTransform:"uppercase" }}>Final Approval</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4, letterSpacing:"-0.01em" }}>{app.company}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 3 }}><span className="mono">{app.id}</span> · {app.licenceType} · {app.appType}</div>
            </div>
            <StatusBadge status="PENDING_FINAL_APPROVAL"/>
          </div>
        </div>

        {/* Payment panel */}
        <div className="card">
          <div className="card-head"><h3 style={{ display:"flex", alignItems:"center", gap: 8 }}><Icon name="cash" size={14} color="var(--gwcl-sky)"/> Payment Verification</h3></div>
          <div style={{ padding: 18 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 14, marginBottom: 14 }}>
              <KV k="Receipt Number" v={<span className="mono" style={{ fontWeight: 600 }}>{app.receiptNumber}</span>}/>
              <KV k="Expected Amount" v={<span style={{ fontWeight: 600, color:"var(--gwcl-blue)" }}>{fmtMoney(app.fee)}</span>}/>
              <KV k="Payment Date" v={fmtDate(app.paymentDate)}/>
              <KV k="Recorded By" v={app.paymentRecordedBy}/>
            </div>

            <div style={{ display:"flex", gap: 12, marginBottom: 14 }}>
              <div className="placeholder-img" style={{ flex:1, height: 120 }}>receipt scan · {app.receiptFile}</div>
              <div style={{ flex:"none", display:"flex", flexDirection:"column", justifyContent:"center", gap: 6 }}>
                <button className="btn btn-ghost btn-sm"><Icon name="eye" size={12}/> View</button>
                <button className="btn btn-ghost btn-sm"><Icon name="download" size={12}/> Download</button>
              </div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color:"var(--ink-3)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom: 8 }}>Decision</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 10 }}>
              <div onClick={() => setPaymentVerified("verified")} style={{
                padding: "12px 14px", border: `1.5px solid ${paymentVerified === "verified" ? "var(--success)" : "var(--line)"}`,
                borderRadius: 10, cursor:"pointer", background: paymentVerified === "verified" ? "#F3FAF4" : "#fff",
                display:"flex", gap: 10, alignItems:"center",
              }}>
                <div style={{ width: 28, height: 28, borderRadius: 999, background: paymentVerified === "verified" ? "var(--success)" : "#EFF4FB", color: paymentVerified === "verified" ? "#fff" : "var(--ink-3)", display:"flex", alignItems:"center", justifyContent:"center" }}><Icon name="check" size={14}/></div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Verified</div>
                  <div style={{ fontSize: 11.5, color:"var(--ink-3)" }}>Receipt matches token & amount</div>
                </div>
              </div>
              <div onClick={() => setPaymentVerified("discrepancy")} style={{
                padding: "12px 14px", border: `1.5px solid ${paymentVerified === "discrepancy" ? "var(--error)" : "var(--line)"}`,
                borderRadius: 10, cursor:"pointer", background: paymentVerified === "discrepancy" ? "#FBEAEA" : "#fff",
                display:"flex", gap: 10, alignItems:"center",
              }}>
                <div style={{ width: 28, height: 28, borderRadius: 999, background: paymentVerified === "discrepancy" ? "var(--error)" : "#EFF4FB", color: paymentVerified === "discrepancy" ? "#fff" : "var(--ink-3)", display:"flex", alignItems:"center", justifyContent:"center" }}><Icon name="alertTriangle" size={14}/></div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Discrepancy</div>
                  <div style={{ fontSize: 11.5, color:"var(--ink-3)" }}>Amount / reference mismatch</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick summary */}
        <div className="card card-padded" style={{ padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display:"flex", alignItems:"center", gap: 8 }}><Icon name="info" size={14} color="var(--gwcl-sky)"/> Application Summary</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 12 }}>
            <KV k="Managing Director" v={app.md}/>
            <KV k="Email" v={app.email}/>
            <KV k="Staff" v={`${(app.staff||[]).length} members`}/>
            <KV k="Equipment" v={`${(app.tools||[]).length} items`}/>
            <KV k="Projects" v={`${(app.projects||[]).length} executed`}/>
            <KV k="Bank" v={app.financial?.bank}/>
            <KV k="Documents" v={`${MANDATORY_DOCS.filter(d => app.docs?.[d]).length}/6 uploaded`}/>
          </div>
        </div>
      </div>

      {/* Right: Checklist + Action */}
      <div style={{ display:"flex", flexDirection:"column", gap: 14 }}>
        {/* Live grade */}
        <div className="card" style={{ padding: 18, display:"flex", gap: 16, alignItems:"center", background: "linear-gradient(135deg,#fff,#F8FBFE)" }}>
          <GradeBadge grade={grade} size="xl"/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color:"var(--ink-3)", letterSpacing:"0.08em", textTransform:"uppercase" }}>Live Classification</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4, letterSpacing:"-0.01em" }}>
              {grade ? `Grade ${grade}` : "Not yet registrable"}
            </div>
            <div style={{ fontSize: 12.5, color:"var(--ink-2)", marginTop: 4 }}>
              {required.length}/10 required criteria · {optional.length}/8 optional ticked
              {grade === "A" && " · Top-tier contractor"}
              {grade === "B" && " · Fully qualified"}
              {grade === "C" && " · Meets minimum bar"}
              {grade === "D" && " · Minimum grade — monitor renewal"}
              {!grade && " · Cannot register — revert to Admin"}
            </div>
          </div>
        </div>

        {/* Required */}
        <div className="card">
          <div className="card-head">
            <h3 style={{ display:"flex", alignItems:"center", gap: 8 }}><Icon name="shield" size={14} color="var(--error)"/> Required Criteria</h3>
            <span className={`badge ${required.length === 10 ? "badge-green" : "badge-amber"}`}>{required.length}/10</span>
          </div>
          <div style={{ padding: 12, display:"flex", flexDirection:"column", gap: 6 }}>
            {CHECKLIST_REQUIRED.map((c, i) => (
              <Check key={i} checked={required.includes(i)} onChange={() => toggle(required, setRequired, i)} label={c}/>
            ))}
          </div>
        </div>

        {/* Optional */}
        <div className="card">
          <div className="card-head">
            <h3 style={{ display:"flex", alignItems:"center", gap: 8 }}><Icon name="sliders" size={14} color="var(--gwcl-sky)"/> Optional Criteria</h3>
            <span className="badge badge-blue">{optional.length}/8</span>
          </div>
          <div style={{ padding: 12, display:"flex", flexDirection:"column", gap: 6 }}>
            {CHECKLIST_OPTIONAL.map((c, i) => (
              <Check key={i} checked={optional.includes(i)} onChange={() => toggle(optional, setOptional, i)} label={c}
                sub={i===0 && optional.length < 2 ? "≥2 for Grade C, ≥4 for B, ≥7 for A" : ""}/>
            ))}
          </div>
          <div style={{ padding: "10px 16px", borderTop: "1px solid var(--line)", background:"#FAFBFC", fontSize: 11.5, color:"var(--ink-3)", display:"flex", gap: 16 }}>
            <span><span className="grade-a" style={{ display:"inline-block", width: 12, height: 12, borderRadius: 3, verticalAlign:"middle", marginRight: 4 }}/>A: 7–8</span>
            <span><span className="grade-b" style={{ display:"inline-block", width: 12, height: 12, borderRadius: 3, verticalAlign:"middle", marginRight: 4 }}/>B: 4–6</span>
            <span><span className="grade-c" style={{ display:"inline-block", width: 12, height: 12, borderRadius: 3, verticalAlign:"middle", marginRight: 4 }}/>C: 2–3</span>
            <span><span className="grade-d" style={{ display:"inline-block", width: 12, height: 12, borderRadius: 3, verticalAlign:"middle", marginRight: 4 }}/>D: 0–1</span>
          </div>
        </div>

        {/* Action */}
        <div className="card card-padded">
          {!revertMode ? (
            <>
              <button className="btn btn-primary btn-lg" onClick={register} disabled={!canRegister} style={{ width: "100%" }}>
                <Icon name="certificate" size={16}/>Complete Registration{grade ? ` · Grade ${grade}` : ""}
              </button>
              <div style={{ fontSize: 11.5, color:"var(--ink-3)", textAlign:"center", marginTop: 8, lineHeight: 1.5 }}>
                {!canRegister ? (paymentVerified !== "verified" ? "Verify payment first." : `Tick all 10 required criteria (${required.length}/10).`)
                  : "Registration number will be issued and certificate generated."}
              </div>
              <button className="btn btn-ghost" onClick={() => setRevertMode(true)} style={{ width: "100%", marginTop: 10 }}><Icon name="arrowLeft" size={14}/>Revert to Admin</button>
            </>
          ) : (
            <>
              <Field label="Revert Reason" required>
                <textarea className="textarea" rows={4} value={revertNote} onChange={e => setRevertNote(e.target.value)} placeholder="e.g. Bank statement is unreadable; please re-upload."/>
              </Field>
              <div style={{ display:"flex", gap: 8, marginTop: 10 }}>
                <button className="btn btn-danger" onClick={revert} style={{ flex: 1 }}>Confirm Revert</button>
                <button className="btn btn-ghost" onClick={() => setRevertMode(false)} style={{ flex: 1 }}>Cancel</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Completion screen after registration
const RegistrationComplete = ({ app, onView, onHome }) => {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding: "28px 0", gap: 20 }}>
      <div style={{ width: 72, height: 72, borderRadius: 999, background: "var(--success)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", boxShadow: "0 8px 24px rgba(46,125,50,0.35)" }}>
        <Icon name="check" size={36}/>
      </div>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize: 11, color:"var(--success)", fontWeight: 700, letterSpacing:"0.15em", textTransform:"uppercase" }}>Registration Complete</div>
        <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6, letterSpacing:"-0.01em" }}>{app.company}</div>
        <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>Now listed in the GWCL Plumbing Contractor Registry.</div>
      </div>

      <div className="card" style={{ width: "100%", maxWidth: 640, padding: 26, display:"flex", gap: 24, alignItems:"center", background:"linear-gradient(135deg,#fff,#F8FBFE)", border:"2px solid var(--gwcl-blue)", boxShadow:"0 20px 40px rgba(0,63,135,0.12)" }}>
        <GradeBadge grade={app.grade} size="xl"/>
        <div style={{ flex: 1, borderLeft: "1px solid var(--line)", paddingLeft: 20 }}>
          <div style={{ fontSize: 11, color:"var(--ink-3)", fontWeight: 700, letterSpacing:"0.08em", textTransform:"uppercase" }}>Registration Number</div>
          <div className="mono" style={{ fontSize: 20, fontWeight: 700, color:"var(--gwcl-blue)", marginTop: 4 }}>{app.regNo}</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 14, marginTop: 14 }}>
            <KV k="Licence Class" v={app.licenceType}/>
            <KV k="Grade" v={`${app.grade} — ${app.grade === "A" ? "Top tier" : app.grade === "B" ? "Fully qualified" : app.grade === "C" ? "Standard" : "Minimum"}`}/>
            <KV k="Registered" v={fmtDate(app.registrationDate)}/>
            <KV k="Expires" v={fmtDate(app.expiryDate)}/>
          </div>
        </div>
      </div>

      <div style={{ display:"flex", gap: 10 }}>
        <button className="btn btn-secondary"><Icon name="download" size={14}/>Download Certificate</button>
        <button className="btn btn-secondary"><Icon name="mail" size={14}/>Email Applicant</button>
        <button className="btn btn-primary" onClick={onView}><Icon name="eye" size={14}/>View in Registry</button>
      </div>
    </div>
  );
};

Object.assign(window, { FinalApproval, RegistrationComplete });
