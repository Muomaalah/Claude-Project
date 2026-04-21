// Payment token card + Record payment screen
const TokenCard = ({ app, onBack, onEmail, onDownload }) => {
  const toasts = useToasts();
  return (
    <div style={{ display:"flex", flexDirection:"column", gap: 18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontSize: 11, color:"var(--success)", fontWeight: 700, letterSpacing:"0.12em", textTransform:"uppercase" }}>✓ Approved</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4, letterSpacing:"-0.01em" }}>Payment Token Issued</div>
          <div style={{ fontSize: 13, color:"var(--ink-3)", marginTop: 4 }}>Share this token with {app.company}. They must pay at Room 7 within 30 days.</div>
        </div>
        <div style={{ display:"flex", gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => { window.print(); }}><Icon name="printer" size={14}/>Print</button>
          <button className="btn btn-secondary" onClick={() => { toasts.push("PDF downloaded", "success"); }}><Icon name="download" size={14}/>Download PDF</button>
          <button className="btn btn-primary" onClick={() => { toasts.push(`Token emailed to ${app.email}`, "success"); }}><Icon name="mail" size={14}/>Email to Applicant</button>
        </div>
      </div>

      {/* Token card */}
      <div className="token-printable" style={{
        background: "linear-gradient(135deg, #fff 0%, #F8FBFE 100%)",
        border: "2px solid var(--gwcl-blue)", borderRadius: 14, padding: 36, maxWidth: 620, position:"relative", overflow:"hidden",
        boxShadow: "0 20px 60px rgba(0,63,135,0.18)", margin: "0 auto",
      }}>
        {/* Watermark droplet */}
        <svg style={{ position:"absolute", right: -60, bottom: -60, opacity: 0.05 }} width="300" height="300" viewBox="0 0 200 200">
          <path d="M100 20 C70 60 40 95 40 130 a60 60 0 0 0 120 0 C160 95 130 60 100 20z" fill="#003F87"/>
        </svg>
        <div style={{ position:"absolute", top: 0, left: 0, right: 0, height: 6, background:"linear-gradient(90deg, var(--gwcl-blue), var(--gwcl-cyan))" }}/>

        <div style={{ display:"flex", alignItems:"center", gap: 12, marginBottom: 28, position:"relative" }}>
          <GwclLogo size={48}/>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color:"var(--gwcl-sky)", letterSpacing:"0.2em", textTransform:"uppercase" }}>Ghana Water Company Limited</div>
            <div style={{ fontSize: 16, fontWeight: 700, color:"var(--gwcl-blue)", marginTop: 2, letterSpacing:"-0.01em" }}>Plumbing Contractor Registration</div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <div style={{ fontSize: 10, textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--ink-3)", fontWeight: 600, textAlign:"right" }}>Payment</div>
            <div style={{ fontSize: 10, textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--gwcl-blue)", fontWeight: 700, textAlign:"right" }}>Token</div>
          </div>
        </div>

        <div style={{ fontSize: 11, color:"var(--ink-3)", fontWeight: 600, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom: 8 }}>Token Reference</div>
        <div className="mono" style={{ fontSize: 30, fontWeight: 700, color:"var(--gwcl-blue)", letterSpacing:"0.02em", padding: "12px 16px", background:"#EFF4FB", border:"1.5px dashed var(--gwcl-blue)", borderRadius: 8, textAlign:"center", position:"relative" }}>
          {app.token}
        </div>

        <div style={{ display:"grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 22, position:"relative" }}>
          <div>
            <div style={{ fontSize: 10, color:"var(--ink-3)", fontWeight: 600, letterSpacing:"0.08em", textTransform:"uppercase" }}>Company</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 3 }}>{app.company}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color:"var(--ink-3)", fontWeight: 600, letterSpacing:"0.08em", textTransform:"uppercase" }}>Fee</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 3, color:"var(--gwcl-blue)" }}>{fmtMoney(app.fee)} <span style={{ fontSize: 12, color:"var(--ink-3)", fontWeight: 500 }}>({app.appType} Licence)</span></div>
          </div>
          <div>
            <div style={{ fontSize: 10, color:"var(--ink-3)", fontWeight: 600, letterSpacing:"0.08em", textTransform:"uppercase" }}>Issued</div>
            <div style={{ fontSize: 14, fontWeight: 500, marginTop: 3 }}>{fmtDate(app.tokenIssuedDate)}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color:"var(--ink-3)", fontWeight: 600, letterSpacing:"0.08em", textTransform:"uppercase" }}>Valid Until</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 3, color:"var(--warning)" }}>{fmtDate(app.tokenExpiryDate)} <span style={{ fontSize: 11, color:"var(--ink-3)", fontWeight: 500 }}>({daysToExpiry(app.tokenExpiryDate)} days)</span></div>
          </div>
        </div>

        <div style={{ marginTop: 24, padding: "14px 16px", background: "#0B2544", color:"#fff", borderRadius: 10, position:"relative" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#9EB7D8" }}>Payment Location</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 3 }}>Room 7, Main Accounts</div>
          <div style={{ fontSize: 12.5, color:"#C6D5E7", marginTop: 3 }}>GWCL Head Office · 28<sup>th</sup> February Road · Accra</div>
        </div>

        <div style={{ marginTop: 16, fontSize: 11.5, color:"var(--ink-3)", textAlign:"center", lineHeight: 1.6 }}>
          Present this token at Room 7. Accounts will verify the company name and issue a paper receipt.<br/>
          Upload the receipt to this application to proceed to final registration.
        </div>
      </div>
    </div>
  );
};

// Record Payment (Admin)
const { useState: uS_p } = React;
const RecordPayment = ({ app, onSubmit, onBack }) => {
  const [receipt, setReceipt] = uS_p(app.receiptNumber || "");
  const [date, setDate] = uS_p(app.paymentDate?.slice(0,10) || new Date().toISOString().slice(0,10));
  const [file, setFile] = uS_p(app.receiptFile ? { name: app.receiptFile } : null);
  const toasts = useToasts();

  const valid = receipt.trim().length > 3 && date && file;
  const submit = () => {
    if (!valid) { toasts.push("Complete all payment fields", "warn"); return; }
    onSubmit(app.id, { receiptNumber: receipt, paymentDate: new Date(date).toISOString(), receiptFile: file.name });
    toasts.push("Payment recorded. Super Admin notified.", "success");
  };

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 420px", gap: 18 }}>
      <div className="card card-padded">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 11, color:"var(--gwcl-sky)", fontWeight: 700, letterSpacing:"0.12em", textTransform:"uppercase" }}>Record Payment</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4, letterSpacing: "-0.01em" }}>{app.company}</div>
            <div style={{ fontSize: 13, color:"var(--ink-3)", marginTop: 3 }}>Enter receipt details issued at Room 7, Main Accounts.</div>
          </div>
          <StatusBadge status="TOKEN_ISSUED"/>
        </div>

        <div style={{ background: "#EFF4FB", border: "1px solid #C9D9EC", borderRadius: 10, padding: 14, marginBottom: 20, display:"flex", gap: 14, alignItems:"center" }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--gwcl-blue)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}><Icon name="cash" size={18}/></div>
          <div>
            <div style={{ fontSize: 12.5, color:"var(--ink-2)" }}>Expected amount</div>
            <div style={{ fontSize: 20, fontWeight: 700, color:"var(--gwcl-blue)" }}>{fmtMoney(app.fee)}</div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--ink-2)", textAlign:"right" }}>
            <div>Token: <span className="mono" style={{ fontWeight: 600, color: "var(--gwcl-blue)" }}>{app.token}</span></div>
            <div style={{ marginTop: 2 }}>Valid until {fmtDate(app.tokenExpiryDate)}</div>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 14 }}>
          <Field label="Receipt Number" required><input className="input mono" placeholder="R7-YYYY-MM-####" value={receipt} onChange={e => setReceipt(e.target.value)}/></Field>
          <Field label="Payment Date" required><input className="input" type="date" value={date} onChange={e => setDate(e.target.value)}/></Field>
          <div style={{ gridColumn: "span 2" }}>
            <UploadTile label="Scanned Receipt (PDF or JPG)" required file={file} onPick={setFile} hint="Clear scan of the Room 7 paper receipt"/>
          </div>
        </div>

        <div style={{ display:"flex", justifyContent:"flex-end", gap: 10, marginTop: 22 }}>
          <button className="btn btn-ghost" onClick={onBack}>Cancel</button>
          <button className="btn btn-primary btn-lg" onClick={submit} disabled={!valid}><Icon name="check" size={16}/>Submit for Verification</button>
        </div>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap: 14 }}>
        <AuditLog entries={app.audit}/>
      </div>
    </div>
  );
};

Object.assign(window, { TokenCard, RecordPayment });
