// 8-step New Application / Renewal Wizard
const { useState: uS_w, useMemo: uM_w } = React;

const STEPS = [
  { id: 1, label: "Licence Type", icon: "briefcase" },
  { id: 2, label: "Company Details", icon: "building" },
  { id: 3, label: "Key Staff", icon: "users" },
  { id: 4, label: "Tools & Equipment", icon: "tool" },
  { id: 5, label: "Previous Projects", icon: "clipboard" },
  { id: 6, label: "Financial Standing", icon: "cash" },
  { id: 7, label: "Mandatory Attachments", icon: "paperclip" },
  { id: 8, label: "Review & Submit", icon: "check" },
];

const Wizard = ({ app, onSave, onSubmit, onCancel, isRenewal }) => {
  const [step, setStep] = uS_w(1);
  const [data, setData] = uS_w(app);
  const [signature, setSignature] = uS_w("");
  const [agreed, setAgreed] = uS_w(false);
  const toasts = useToasts();

  const update = (k, v) => setData(d => ({ ...d, [k]: v }));

  const stepValid = uM_w(() => {
    if (step === 1) return !!data.licenceType && !!data.appType;
    if (step === 2) return data.company && data.md && data.postal && data.office && data.phone && data.email;
    if (step === 3) return (data.staff || []).length >= 1 && data.staff.every(s => s.name && s.role);
    if (step === 4) return (data.tools || []).length >= 1 && data.tools.every(s => s.category && s.type);
    if (step === 5) return (data.projects || []).length >= 1 && data.projects.every(s => s.name && s.year);
    if (step === 6) return data.financial?.bank && data.financial?.statement;
    if (step === 7) return MANDATORY_DOCS.every(d => data.docs?.[d]);
    if (step === 8) return agreed && signature.trim().length >= 3;
    return true;
  }, [step, data, agreed, signature]);

  const next = () => {
    if (!stepValid) { toasts.push("Please fill required fields for this step", "warn"); return; }
    if (step < 8) setStep(step + 1);
  };
  const prev = () => step > 1 && setStep(step - 1);

  const submit = () => {
    if (!stepValid) return;
    onSubmit({ ...data, signature, signatureDate: new Date().toISOString() });
  };

  const saveDraft = () => { onSave(data); toasts.push("Draft saved", "success"); };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap: 18 }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize: 11, color:"var(--gwcl-sky)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            {isRenewal ? "Renewal Application" : "New Application"}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4, letterSpacing: "-0.01em" }}>
            {data.company || "Untitled Application"}
          </div>
          <div style={{ fontSize: 12.5, color:"var(--ink-3)", marginTop: 3 }}>
            <span className="mono">{data.id}</span> · Step {step} of 8 · {STEPS[step-1].label}
          </div>
        </div>
        <div style={{ display:"flex", gap: 8 }}>
          <button className="btn btn-ghost" onClick={onCancel}><Icon name="x" size={14}/>Cancel</button>
          <button className="btn btn-secondary" onClick={saveDraft}><Icon name="file" size={14}/>Save Draft</button>
        </div>
      </div>

      {/* Stepper */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ display:"flex", alignItems:"center", gap: 4, marginBottom: 12 }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div onClick={() => s.id < step && setStep(s.id)} style={{
                display:"flex", alignItems:"center", gap: 8, cursor: s.id < step ? "pointer" : "default",
                padding: "4px 10px", borderRadius: 999,
                background: step === s.id ? "var(--gwcl-blue)" : s.id < step ? "rgba(0,63,135,0.08)" : "transparent",
                color: step === s.id ? "#fff" : s.id < step ? "var(--gwcl-blue)" : "var(--ink-3)",
                fontWeight: step === s.id ? 600 : 500, fontSize: 12.5,
                flex: "none",
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 999,
                  background: step === s.id ? "#fff" : s.id < step ? "var(--gwcl-blue)" : "var(--line)",
                  color: step === s.id ? "var(--gwcl-blue)" : s.id < step ? "#fff" : "var(--ink-3)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize: 11, fontWeight: 700,
                }}>
                  {s.id < step ? <Icon name="check" size={10}/> : s.id}
                </div>
                <span>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: s.id < step ? "var(--gwcl-blue)" : "var(--line-2)" }}/>}
            </React.Fragment>
          ))}
        </div>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${(step/8)*100}%` }}/></div>
      </div>

      {/* Body */}
      <div className="card card-padded" style={{ padding: 28 }}>
        {step === 1 && <StepLicence data={data} update={update} isRenewal={isRenewal}/>}
        {step === 2 && <StepCompany data={data} update={update}/>}
        {step === 3 && <StepStaff data={data} update={update}/>}
        {step === 4 && <StepTools data={data} update={update}/>}
        {step === 5 && <StepProjects data={data} update={update}/>}
        {step === 6 && <StepFinancial data={data} update={update}/>}
        {step === 7 && <StepAttachments data={data} update={update} isRenewal={isRenewal}/>}
        {step === 8 && <StepReview data={data} agreed={agreed} setAgreed={setAgreed} signature={signature} setSignature={setSignature}/>}
      </div>

      {/* Footer nav */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <button className="btn btn-ghost" onClick={prev} disabled={step === 1}>
          <Icon name="arrowLeft" size={14}/>Previous
        </button>
        <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
          {stepValid ? <span style={{ color:"var(--success)", display:"inline-flex", alignItems:"center", gap: 4 }}><Icon name="check" size={12}/>Step complete</span> : "Complete required fields to continue"}
        </div>
        {step < 8
          ? <button className="btn btn-primary" onClick={next} disabled={!stepValid}>Next<Icon name="arrowRight" size={14}/></button>
          : <button className="btn btn-primary btn-lg" onClick={submit} disabled={!stepValid}><Icon name="check" size={14}/>Submit for Approval</button>}
      </div>
    </div>
  );
};

// ---------- Steps ----------
const StepLicence = ({ data, update, isRenewal }) => {
  const fee = data.appType === "Renewal" ? 150 : 250;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap: 22, maxWidth: 680 }}>
      <SectionHead title="Licence & Application Type" sub="Choose the registration class and whether this is a new or renewal application."/>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)", letterSpacing: "0.02em", textTransform:"uppercase", marginBottom: 10 }}>Licence Class <span style={{ color: "var(--error)" }}>*</span></div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 12 }}>
          {["Master Plumber","Plumbing Contractor"].map(opt => (
            <RadioCard key={opt} selected={data.licenceType === opt} onClick={() => update("licenceType", opt)}
              title={opt}
              desc={opt === "Master Plumber" ? "Individual plumber holding master-level certification. Qualifies for Master Plumber badge." : "Limited company offering plumbing contracting services, meeting firm-level criteria."}
              icon={opt === "Master Plumber" ? "users" : "building"}/>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)", letterSpacing: "0.02em", textTransform:"uppercase", marginBottom: 10 }}>Application Type <span style={{ color: "var(--error)" }}>*</span></div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 12 }}>
          {["New","Renewal"].map(opt => (
            <RadioCard key={opt} selected={data.appType === opt} onClick={() => !isRenewal && update("appType", opt)}
              disabled={isRenewal && opt === "New"}
              title={opt === "New" ? "New Application" : "Renewal"}
              desc={opt === "New" ? "Contractor is not currently registered, or prior registration has lapsed (>30 days post-expiry)." : "Extend an existing registration. Pre-fills from prior application data."}
              icon={opt === "New" ? "plus" : "refresh"}/>
          ))}
        </div>
      </div>
      <div style={{ background: "#EFF8FA", border: "1px solid #B7E3F0", borderRadius: 10, padding: "14px 16px", display:"flex", gap: 12, alignItems:"center" }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background:"var(--gwcl-cyan)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}><Icon name="cash" size={18}/></div>
        <div>
          <div style={{ fontSize: 12.5, color:"var(--ink-2)", fontWeight: 500 }}>Processing fee for this application</div>
          <div style={{ fontSize: 20, fontWeight: 700, color:"var(--gwcl-blue)", letterSpacing: "-0.01em" }}>{fmtMoney(fee)}</div>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>Payable at Room 7, Main Accounts after approval. A payment token will be issued.</div>
        </div>
      </div>
    </div>
  );
};

const RadioCard = ({ selected, onClick, title, desc, icon, disabled }) => (
  <div onClick={disabled ? undefined : onClick} style={{
    padding: "14px 16px", border: `1.5px solid ${selected ? "var(--gwcl-blue)" : "var(--line)"}`,
    borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer",
    background: selected ? "#EFF4FB" : "#fff", opacity: disabled ? 0.45 : 1,
    display:"flex", gap: 12, alignItems:"flex-start",
    transition: "border-color 0.15s, background 0.15s",
  }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: selected ? "var(--gwcl-blue)" : "#EFF4FB", color: selected ? "#fff" : "var(--gwcl-blue)", display:"flex", alignItems:"center", justifyContent:"center", flex:"none" }}><Icon name={icon} size={16}/></div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: 12.5, color:"var(--ink-3)", marginTop: 3 }}>{desc}</div>
    </div>
    <div style={{ width: 18, height: 18, borderRadius: 999, border: `1.5px solid ${selected ? "var(--gwcl-blue)" : "var(--line)"}`, background: selected ? "var(--gwcl-blue)" : "#fff", display:"flex", alignItems:"center", justifyContent:"center", flex:"none", marginTop: 4 }}>
      {selected && <div style={{ width: 8, height: 8, borderRadius: 999, background:"#fff" }}/>}
    </div>
  </div>
);

const SectionHead = ({ title, sub }) => (
  <div>
    <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em" }}>{title}</div>
    {sub && <div style={{ fontSize: 13, color:"var(--ink-3)", marginTop: 4, maxWidth: 640 }}>{sub}</div>}
  </div>
);

const StepCompany = ({ data, update }) => (
  <div style={{ display:"flex", flexDirection:"column", gap: 22 }}>
    <SectionHead title="Company Details" sub="Information on letterhead. Per GWCL form instructions, enter in CAPITAL LETTERS."/>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 14 }}>
      <Field label="Full Name of Firm" required><input className="input caps" value={data.company || ""} onChange={e => update("company", e.target.value)}/></Field>
      <Field label="Managing Director" required><input className="input caps" value={data.md || ""} onChange={e => update("md", e.target.value)}/></Field>
      <Field label="Postal Address" required><input className="input caps" value={data.postal || ""} onChange={e => update("postal", e.target.value)}/></Field>
      <Field label="Office Address" required><input className="input caps" value={data.office || ""} onChange={e => update("office", e.target.value)}/></Field>
      <Field label="Office manned during working hours" required>
        <select className="select" value={data.officeManned || ""} onChange={e => update("officeManned", e.target.value)}>
          <option value="">Select…</option><option>Yes</option><option>No</option>
        </select>
      </Field>
      <Field label="Telephone" required><input className="input" value={data.phone || ""} onChange={e => update("phone", e.target.value)} placeholder="+233 …"/></Field>
      <Field label="Fax Number"><input className="input" value={data.fax || ""} onChange={e => update("fax", e.target.value)}/></Field>
      <Field label="Email Address" required><input className="input" value={data.email || ""} onChange={e => update("email", e.target.value)}/></Field>
      <Field label="Warehouse Location"><input className="input caps" value={data.warehouse || ""} onChange={e => update("warehouse", e.target.value)}/></Field>
      <Field label="Warehouse Facilities Description"><textarea className="textarea" value={data.warehouseDesc || ""} onChange={e => update("warehouseDesc", e.target.value)} placeholder="Size, storage capacity, office, security…"/></Field>
    </div>
  </div>
);

const StepStaff = ({ data, update }) => {
  const rows = data.staff || [];
  const add = () => update("staff", [...rows, { name: "", role: "Pipe Fitter", qual: "", years: "", file: "" }]);
  const edit = (i, k, v) => update("staff", rows.map((r, idx) => idx === i ? { ...r, [k]: v } : r));
  const del = (i) => update("staff", rows.filter((_, idx) => idx !== i));
  return (
    <div style={{ display:"flex", flexDirection:"column", gap: 18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap: 20 }}>
        <SectionHead title="Key Staff" sub="List engineers, pipe fitters and administrative staff on permanent employment. Minimum 1 row."/>
        <button className="btn btn-secondary" onClick={add}><Icon name="plus" size={14}/>Add Staff</button>
      </div>
      {rows.length === 0 && <EmptyState icon="users" title="No staff added yet" sub="Add at least one staff member to continue." action={<button className="btn btn-primary btn-sm" onClick={add}><Icon name="plus" size={12}/>Add Staff</button>}/>}
      {rows.map((r, i) => (
        <div key={i} className="card" style={{ padding: 14, display:"grid", gridTemplateColumns:"1.1fr 1fr 1.3fr 0.7fr 1.3fr 36px", gap: 10, alignItems:"center" }}>
          <input className="input caps" placeholder="Full Name" value={r.name} onChange={e => edit(i,"name",e.target.value)}/>
          <select className="select" value={r.role} onChange={e => edit(i,"role",e.target.value)}>
            <option>Civil Engineer</option><option>Technician Engineer</option><option>Pipe Fitter</option><option>Administrative Staff</option><option>Other</option>
          </select>
          <input className="input" placeholder="Qualification" value={r.qual} onChange={e => edit(i,"qual",e.target.value)}/>
          <input className="input" placeholder="Years exp." type="number" value={r.years} onChange={e => edit(i,"years",e.target.value)}/>
          <MiniUpload file={r.file} onPick={(n) => edit(i,"file",n)} hint="CV / Cert"/>
          <button className="btn btn-ghost btn-sm" onClick={() => del(i)} style={{ width: 32, padding: 0 }}><Icon name="trash" size={14} color="var(--error)"/></button>
        </div>
      ))}
    </div>
  );
};

const MiniUpload = ({ file, onPick, hint }) => {
  const ref = React.useRef(null);
  return (
    <div onClick={() => ref.current?.click()} style={{
      height: 40, border: `1px dashed ${file ? "var(--success)" : "var(--line)"}`, borderRadius: 8,
      padding: "0 10px", display:"flex", alignItems:"center", gap: 8,
      background: file ? "#F3FAF4" : "#FAFBFC", cursor: "pointer", overflow:"hidden",
    }}>
      <input ref={ref} type="file" style={{display:"none"}} onChange={e => e.target.files?.[0] && onPick(e.target.files[0].name)}/>
      <Icon name={file ? "check" : "upload"} size={13} color={file ? "var(--success)" : "var(--ink-3)"}/>
      <span style={{ fontSize: 12, color: file ? "var(--ink)" : "var(--ink-3)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
        {file || hint || "Upload"}
      </span>
    </div>
  );
};

const StepTools = ({ data, update }) => {
  const rows = data.tools || [];
  const add = () => update("tools", [...rows, { category: "Pickup", type: "", serial: "", dom: "", file: "" }]);
  const edit = (i, k, v) => update("tools", rows.map((r, idx) => idx === i ? { ...r, [k]: v } : r));
  const del = (i) => update("tools", rows.filter((_, idx) => idx !== i));
  return (
    <div style={{ display:"flex", flexDirection:"column", gap: 18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", gap: 20 }}>
        <SectionHead title="Tools & Equipment" sub="Vehicles, heavy equipment and pipe-testing gear owned. Attach ownership proof."/>
        <button className="btn btn-secondary" onClick={add}><Icon name="plus" size={14}/>Add Equipment</button>
      </div>
      {rows.length === 0 && <EmptyState icon="tool" title="No equipment added" action={<button className="btn btn-primary btn-sm" onClick={add}><Icon name="plus" size={12}/>Add Equipment</button>}/>}
      {rows.map((r, i) => (
        <div key={i} className="card" style={{ padding: 14, display:"grid", gridTemplateColumns:"1.2fr 1.3fr 1fr 1fr 1.3fr 36px", gap: 10, alignItems:"center" }}>
          <select className="select" value={r.category} onChange={e => edit(i,"category",e.target.value)}>
            <option>Pickup</option><option>Crane Truck</option><option>Ordinary Truck</option><option>Low Loader</option><option>Heavy Construction Equipment</option><option>Pipe Testing Equipment</option>
          </select>
          <input className="input" placeholder="Type / Make" value={r.type} onChange={e => edit(i,"type",e.target.value)}/>
          <input className="input mono" placeholder="Serial #" value={r.serial} onChange={e => edit(i,"serial",e.target.value)}/>
          <input className="input" type="date" value={r.dom?.slice(0,10) || ""} onChange={e => edit(i,"dom",e.target.value)}/>
          <MiniUpload file={r.file} onPick={(n) => edit(i,"file",n)} hint="Ownership proof"/>
          <button className="btn btn-ghost btn-sm" onClick={() => del(i)} style={{ width: 32, padding: 0 }}><Icon name="trash" size={14} color="var(--error)"/></button>
        </div>
      ))}
    </div>
  );
};

const StepProjects = ({ data, update }) => {
  const rows = data.projects || [];
  const add = () => update("projects", [...rows, { name: "", details: "", cost: "", year: "", file: "" }]);
  const edit = (i, k, v) => update("projects", rows.map((r, idx) => idx === i ? { ...r, [k]: v } : r));
  const del = (i) => update("projects", rows.filter((_, idx) => idx !== i));
  return (
    <div style={{ display:"flex", flexDirection:"column", gap: 18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", gap: 20 }}>
        <SectionHead title="Previous Similar Projects" sub="Recent plumbing contracts the firm has executed, with proof of completion."/>
        <button className="btn btn-secondary" onClick={add}><Icon name="plus" size={14}/>Add Project</button>
      </div>
      {rows.length === 0 && <EmptyState icon="clipboard" title="No projects added" action={<button className="btn btn-primary btn-sm" onClick={add}><Icon name="plus" size={12}/>Add Project</button>}/>}
      {rows.map((r, i) => (
        <div key={i} className="card" style={{ padding: 14, display:"grid", gridTemplateColumns:"1.2fr 1.8fr 0.9fr 0.6fr 1.2fr 36px", gap: 10, alignItems:"center" }}>
          <input className="input caps" placeholder="Project Name" value={r.name} onChange={e => edit(i,"name",e.target.value)}/>
          <input className="input" placeholder="Details (length, pipe type…)" value={r.details} onChange={e => edit(i,"details",e.target.value)}/>
          <input className="input" type="number" placeholder="Cost (GHS)" value={r.cost} onChange={e => edit(i,"cost",e.target.value)}/>
          <input className="input" type="number" placeholder="Year" value={r.year} onChange={e => edit(i,"year",e.target.value)}/>
          <MiniUpload file={r.file} onPick={(n) => edit(i,"file",n)} hint="Proof of execution"/>
          <button className="btn btn-ghost btn-sm" onClick={() => del(i)} style={{ width: 32, padding: 0 }}><Icon name="trash" size={14} color="var(--error)"/></button>
        </div>
      ))}
    </div>
  );
};

const StepFinancial = ({ data, update }) => {
  const f = data.financial || {};
  const setF = (k, v) => update("financial", { ...f, [k]: v });
  return (
    <div style={{ display:"flex", flexDirection:"column", gap: 18, maxWidth: 780 }}>
      <SectionHead title="Financial Standing" sub="Provide banking reference. Bank statement is mandatory; line of credit optional but improves grade."/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr", gap: 14 }}>
        <Field label="Bank Name" required><input className="input caps" value={f.bank || ""} onChange={e => setF("bank", e.target.value)}/></Field>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 14 }}>
          <UploadTile label="Bank Statement" required file={f.statement ? { name: f.statement } : null} onPick={(x) => setF("statement", x.name)} hint="Last 6 months · PDF"/>
          <UploadTile label="Line of Credit (optional)" file={f.credit ? { name: f.credit } : null} onPick={(x) => setF("credit", x.name)} hint="Bank LoC letter · PDF"/>
        </div>
      </div>
    </div>
  );
};

const StepAttachments = ({ data, update, isRenewal }) => {
  const docs = data.docs || {};
  const setDoc = (k, v) => update("docs", { ...docs, [k]: v });
  const uploadedCount = MANDATORY_DOCS.filter(d => docs[d]).length;
  const needsRefreshHint = (d) => {
    if (!isRenewal) return null;
    const stale = ["Current Tax Clearance Cert","SSNIT Clearance Cert"].includes(d);
    return stale ? "Must be re-uploaded if older than 6 months" : "Must be re-uploaded if older than 12 months";
  };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap: 18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", gap: 20 }}>
        <SectionHead title="Mandatory Attachments" sub="All six documents are required to submit. Formats: PDF, JPG or PNG."/>
        <div style={{ fontSize: 13, color: "var(--ink-2)" }}>
          <span style={{ fontWeight: 700, color: uploadedCount === 6 ? "var(--success)" : "var(--warning)" }}>{uploadedCount}</span> of 6 uploaded
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap: 14 }}>
        {MANDATORY_DOCS.map(d => (
          <UploadTile key={d} label={d} required file={docs[d]} onPick={(x) => setDoc(d, x)} hint={needsRefreshHint(d) || "Click to upload"}/>
        ))}
      </div>
    </div>
  );
};

const StepReview = ({ data, agreed, setAgreed, signature, setSignature }) => {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap: 20 }}>
      <SectionHead title="Review & Submit" sub="Verify all details before submitting to Super Admin for approval."/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 14 }}>
        <SummaryCard title="Licence & Application" items={[
          ["Licence Class", data.licenceType],
          ["Application Type", data.appType],
          ["Fee", fmtMoney(data.appType === "Renewal" ? 150 : 250)],
        ]}/>
        <SummaryCard title="Company" items={[
          ["Firm", data.company],
          ["Managing Director", data.md],
          ["Office", data.office],
          ["Phone", data.phone],
          ["Email", data.email],
        ]}/>
        <SummaryCard title="Staff, Tools & Projects" items={[
          ["Staff Members", (data.staff || []).length],
          ["Equipment", (data.tools || []).length],
          ["Previous Projects", (data.projects || []).length],
        ]}/>
        <SummaryCard title="Financial & Attachments" items={[
          ["Bank", data.financial?.bank],
          ["Bank Statement", data.financial?.statement ? "✓ Uploaded" : "—"],
          ["Line of Credit", data.financial?.credit ? "✓ Uploaded" : "—"],
          ["Mandatory Docs", `${MANDATORY_DOCS.filter(d => data.docs?.[d]).length}/6 uploaded`],
        ]}/>
      </div>

      <div style={{ border: "1.5px solid var(--line)", borderRadius: 10, padding: "18px 20px", background:"#FAFBFC" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color:"var(--gwcl-blue)", letterSpacing: "0.08em", textTransform:"uppercase", marginBottom: 8 }}>
          Statement of Understanding
        </div>
        <div style={{ fontSize: 13, color:"var(--ink-2)", lineHeight: 1.7, fontStyle:"italic" }}>
          It is understood and agreed that the information submitted is to be used by the Ghana Water Company Limited in determining, according to their sole judgement and discretion, the qualifications of contractors to be registered by GWCL. The Company reserves the right to ascertain the authenticity of the documents and information provided and reject them if found not to be in order. The undersigned of this application guarantees the truth and accuracy of all statements and of all answers to the queries.
        </div>
      </div>

      <Check checked={agreed} onChange={setAgreed} label="I have read and agree to the Statement of Understanding above." sub="Required to submit the application."/>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 240px", gap: 14 }}>
        <Field label="Typed Signature" required hint="Your full name serves as legal e-signature.">
          <input className="input" value={signature} onChange={e => setSignature(e.target.value)} placeholder="Type your full name"/>
        </Field>
        <Field label="Signature Date">
          <input className="input" value={fmtDate(new Date())} disabled/>
        </Field>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, items }) => (
  <div className="card" style={{ padding: "14px 16px" }}>
    <div style={{ fontSize: 11, fontWeight: 700, color:"var(--ink-3)", textTransform:"uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>{title}</div>
    <div style={{ display:"flex", flexDirection:"column", gap: 6 }}>
      {items.map(([k,v]) => (
        <div key={k} style={{ display:"flex", justifyContent:"space-between", gap: 12, fontSize: 13 }}>
          <span style={{ color:"var(--ink-3)" }}>{k}</span>
          <span style={{ fontWeight: 500, textAlign:"right" }}>{v || <span style={{ color:"var(--error)" }}>missing</span>}</span>
        </div>
      ))}
    </div>
  </div>
);

Object.assign(window, { Wizard });
