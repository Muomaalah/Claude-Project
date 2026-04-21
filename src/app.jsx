// Main app — routing, state, glue
const { useState: uS_app, useEffect: uE_app, useMemo: uM_app } = React;

const nextAppId = (apps) => {
  const year = new Date().getFullYear();
  const nums = apps.map(a => parseInt((a.id || "").split("-").pop(), 10)).filter(n => !isNaN(n));
  const next = (Math.max(0, ...nums) + 1).toString().padStart(4, "0");
  return `APP-${year}-${next}`;
};

const nextRegNo = (apps) => {
  const year = new Date().getFullYear();
  const nums = apps.filter(a => a.regNo && a.regNo.includes(`/${year}/`))
    .map(a => parseInt(a.regNo.split("/").pop(), 10)).filter(n => !isNaN(n));
  const next = (Math.max(0, ...nums, 112) + 1).toString().padStart(4, "0");
  return `GWCL/PLB/${year}/${next}`;
};

const genToken = (company) => {
  const initials = company.split(/\s+/).map(w => w[0]).filter(Boolean).join("").toUpperCase().slice(0, 6) || "XXX";
  const num = Math.floor(100000 + Math.random() * 900000);
  return `GWCL-${new Date().getFullYear()}-${initials}-${num}`;
};

const App = () => {
  const [role, setRole] = uS_app(() => localStorage.getItem("gwcl-role") || "admin");
  const [screen, setScreen] = uS_app(() => localStorage.getItem("gwcl-screen") || "signin");
  const [apps, setApps] = uS_app(SEED_APPS);
  const [activeAppId, setActiveAppId] = uS_app(() => localStorage.getItem("gwcl-active") || null);
  const [renewalOf, setRenewalOf] = uS_app(null);
  const [lastCompleted, setLastCompleted] = uS_app(null);

  uE_app(() => { localStorage.setItem("gwcl-role", role); }, [role]);
  uE_app(() => { localStorage.setItem("gwcl-screen", screen); }, [screen]);
  uE_app(() => { if (activeAppId) localStorage.setItem("gwcl-active", activeAppId); }, [activeAppId]);

  const user = role === "admin" ? { name: "Adjoa Mensah" } : { name: "Eng. K. Ofori" };
  const activeApp = useMemo(() => apps.find(a => a.id === activeAppId), [apps, activeAppId]);

  const updateApp = (id, patch) => setApps(list => list.map(a => a.id === id ? { ...a, ...patch, audit: patch.audit || a.audit } : a));
  const addAudit = (id, entry) => setApps(list => list.map(a => a.id === id ? { ...a, audit: [...(a.audit||[]), { ...entry, ts: new Date().toISOString() }] } : a));

  const nav = (s) => { setScreen(s); if (s !== "appDetail" && s !== "wizard" && s !== "review" && s !== "final" && s !== "viewToken" && s !== "recordPayment" && s !== "completed") setActiveAppId(null); };

  const openApp = (id) => { setActiveAppId(id); setScreen("appDetail"); };

  const startNewApp = () => {
    const id = nextAppId(apps);
    const blank = {
      id, company: "", md: "", postal: "", office: "", officeManned: "", phone: "", fax: "", email: "",
      warehouse: "", warehouseDesc: "",
      licenceType: "Plumbing Contractor", appType: "New", status: "DRAFT", fee: 250,
      staff: [], tools: [], projects: [], financial: {}, docs: {},
      audit: [{ action: "Created", by: `${user.name} (Admin)`, ts: new Date().toISOString(), notes: "Draft created" }],
    };
    setApps(list => [blank, ...list]);
    setActiveAppId(id); setRenewalOf(null); setScreen("wizard");
  };

  const startRenewal = (sourceId) => {
    const src = apps.find(a => a.id === sourceId);
    if (!src) return;
    const id = nextAppId(apps);
    const renewal = {
      ...src, id, status: "DRAFT", appType: "Renewal", fee: 150, parentApplicationId: sourceId,
      submittedDate: null, reviewedBy: null, reviewedDate: null,
      token: null, tokenIssuedDate: null, tokenExpiryDate: null,
      receiptNumber: null, paymentDate: null, receiptFile: null,
      paymentVerifiedBy: null, paymentVerifiedDate: null,
      regNo: null, registrationDate: null, expiryDate: null,
      grade: null, checklistRequired: [], checklistOptional: [],
      rejectionReason: null,
      audit: [{ action: "Created", by: `${user.name} (Admin)`, ts: new Date().toISOString(), notes: "Renewal pre-filled from " + src.regNo }],
    };
    setApps(list => [renewal, ...list]);
    setActiveAppId(id); setRenewalOf(sourceId); setScreen("wizard");
  };

  const saveWizard = (data) => updateApp(data.id, data);

  const submitWizard = (data) => {
    const nowIso = new Date().toISOString();
    updateApp(data.id, {
      ...data,
      status: "PENDING_APPROVAL",
      submittedDate: nowIso,
      submittedBy: `${user.name} (Admin)`,
      signature: data.signature,
    });
    addAudit(data.id, { action: "Submitted", by: `${user.name} (Admin)`, notes: "Submitted for approval" });
    nav("dashboard");
  };

  const approve = (id, comments) => {
    const a = apps.find(x => x.id === id);
    const token = genToken(a.company);
    const iss = new Date();
    const exp = new Date(); exp.setDate(exp.getDate() + 30);
    updateApp(id, { status: "TOKEN_ISSUED", token, tokenIssuedDate: iss.toISOString(), tokenExpiryDate: exp.toISOString(), reviewedBy: `${user.name} (Super Admin)`, reviewedDate: iss.toISOString(), approvalComments: comments });
    addAudit(id, { action: "Approved", by: `${user.name} (Super Admin)`, notes: comments || "Approved" });
    addAudit(id, { action: "Token Issued", by: "System", notes: token });
    setActiveAppId(id); setScreen("viewToken");
  };

  const reject = (id, reason) => {
    updateApp(id, { status: "REJECTED", rejectionReason: reason, reviewedBy: `${user.name} (Super Admin)`, reviewedDate: new Date().toISOString() });
    addAudit(id, { action: "Rejected", by: `${user.name} (Super Admin)`, notes: reason });
    nav("dashboard");
  };

  const recordPayment = (id, p) => {
    updateApp(id, { status: "PENDING_FINAL_APPROVAL", ...p, paymentRecordedBy: `${user.name} (Admin)` });
    addAudit(id, { action: "Payment Recorded", by: `${user.name} (Admin)`, notes: `Receipt ${p.receiptNumber}` });
    nav("dashboard");
  };

  const completeRegistration = (id, { required, optional, grade }) => {
    const app = apps.find(a => a.id === id);
    const regNo = nextRegNo(apps);
    const regDate = new Date();
    const exp = new Date(regDate); exp.setDate(exp.getDate() + 365);
    updateApp(id, {
      status: "REGISTERED", regNo, registrationDate: regDate.toISOString(), expiryDate: exp.toISOString(),
      grade, checklistRequired: required, checklistOptional: optional,
      paymentVerifiedBy: `${user.name} (Super Admin)`, paymentVerifiedDate: regDate.toISOString(),
      registeredBy: `${user.name} (Super Admin)`,
    });
    addAudit(id, { action: "Payment Verified", by: `${user.name} (Super Admin)`, notes: "" });
    addAudit(id, { action: "Registered", by: `${user.name} (Super Admin)`, notes: `Grade ${grade} issued` });
    setLastCompleted({ ...app, status: "REGISTERED", regNo, registrationDate: regDate.toISOString(), expiryDate: exp.toISOString(), grade });
    setActiveAppId(id); setScreen("completed");
  };

  const revertFromFinal = (id, note) => {
    updateApp(id, { status: "TOKEN_ISSUED" }); // send back for payment correction
    addAudit(id, { action: "Reverted", by: `${user.name} (Super Admin)`, notes: note });
    nav("dashboard");
  };

  // Breadcrumb
  const breadcrumb = (() => {
    const bc = [<a key="h" onClick={() => nav("dashboard")}>Home</a>];
    const add = (label) => { bc.push(<span key={"s"+bc.length} className="sep">/</span>); bc.push(<span key={"l"+bc.length} className="current">{label}</span>); };
    if (screen === "dashboard") return null;
    if (screen === "myApps") add("My Applications");
    if (screen === "registry") add("Registry");
    if (screen === "analytics") add("Analytics");
    if (screen === "expiring") add("Expiring Licences");
    if (screen === "review") add("Review Queue");
    if (screen === "finalApproval") add("Final Approvals");
    if (screen === "wizard") { add("Applications"); add(activeApp?.company || "New Application"); }
    if (screen === "appDetail" && activeApp) add(activeApp.company);
    if (screen === "viewToken" && activeApp) { add(activeApp.company); add("Payment Token"); }
    if (screen === "recordPayment" && activeApp) { add(activeApp.company); add("Record Payment"); }
    if (screen === "reviewApp" && activeApp) { add(activeApp.company); add("Review"); }
    if (screen === "final" && activeApp) { add(activeApp.company); add("Final Approval"); }
    if (screen === "completed") add("Registration Complete");
    return bc;
  })();

  if (screen === "signin") {
    return <ToastProvider><SignIn onSignIn={(r) => { setRole(r); setScreen("dashboard"); }}/></ToastProvider>;
  }

  // Derive active screen for super admin "finalApproval" list
  const renderScreen = () => {
    if (screen === "dashboard") return <Dashboard role={role} apps={apps} onOpenApp={openApp} onNew={startNewApp} onNav={nav}/>;
    if (screen === "myApps") return <MyApps apps={apps.filter(a => ["DRAFT","PENDING_APPROVAL","REJECTED","TOKEN_ISSUED","PENDING_FINAL_APPROVAL"].includes(deriveStatus(a)))} onOpen={openApp} onNew={startNewApp}/>;
    if (screen === "newApp") { startNewApp(); return null; }
    if (screen === "registry") return <Registry apps={apps} onOpen={openApp} onRenew={startRenewal} role={role}/>;
    if (screen === "analytics") return <Analytics apps={apps}/>;
    if (screen === "expiring") return <Expiring apps={apps} onRenew={startRenewal} onOpen={openApp}/>;
    if (screen === "review") return <ReviewQueue apps={apps} onOpen={(id) => { setActiveAppId(id); setScreen("reviewApp"); }}/>;
    if (screen === "finalApproval") {
      const list = apps.filter(a => deriveStatus(a) === "PENDING_FINAL_APPROVAL");
      return (
        <div style={{ display:"flex", flexDirection:"column", gap: 18 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing:"-0.01em" }}>Final Approvals</div>
            <div style={{ fontSize: 13, color:"var(--ink-3)", marginTop: 4 }}>Payment verified applications awaiting registration.</div>
          </div>
          <div className="card">
            <div className="card-head"><h3>{list.length} pending</h3></div>
            {list.length === 0 ? <EmptyState icon="shield" title="Nothing pending" sub="Payment-recorded applications will appear here."/> :
              <AppTable apps={list} onOpen={(id) => { setActiveAppId(id); setScreen("final"); }} columns={["id","company","licenceType","submitted","actions"]} role="super"/>}
          </div>
        </div>
      );
    }
    if (screen === "wizard" && activeApp) return <Wizard app={activeApp} onSave={saveWizard} onSubmit={submitWizard} onCancel={() => nav("dashboard")} isRenewal={activeApp.appType === "Renewal" && !!renewalOf}/>;
    if (screen === "appDetail" && activeApp) return <AppDetail app={activeApp} role={role} onBack={() => nav("dashboard")} onEdit={() => setScreen("wizard")} onRenew={() => startRenewal(activeApp.id)} onAct={(what) => {
      if (what === "review") setScreen("reviewApp");
      else if (what === "final") setScreen("final");
      else if (what === "recordPayment") setScreen("recordPayment");
      else if (what === "viewToken") setScreen("viewToken");
    }}/>;
    if (screen === "reviewApp" && activeApp) return <ReviewApplication app={activeApp} onApprove={approve} onReject={reject} onBack={() => nav("review")}/>;
    if (screen === "viewToken" && activeApp) return <TokenCard app={activeApp} onBack={() => nav("dashboard")}/>;
    if (screen === "recordPayment" && activeApp) return <RecordPayment app={activeApp} onSubmit={recordPayment} onBack={() => openApp(activeApp.id)}/>;
    if (screen === "final" && activeApp) return <FinalApproval app={activeApp} onRegister={completeRegistration} onRevert={revertFromFinal} onBack={() => nav("finalApproval")}/>;
    if (screen === "completed" && lastCompleted) return <RegistrationComplete app={lastCompleted} onView={() => nav("registry")} onHome={() => nav("dashboard")}/>;
    return <Dashboard role={role} apps={apps} onOpenApp={openApp} onNew={startNewApp} onNav={nav}/>;
  };

  return (
    <ToastProvider>
      <Shell role={role} setRole={setRole} screen={screen} setScreen={setScreen} user={user} breadcrumb={breadcrumb} onNav={(s) => {
        if (s === "signin") { nav("signin"); return; }
        if (s === "newApp") { startNewApp(); return; }
        nav(s);
      }}>
        {renderScreen()}
      </Shell>
    </ToastProvider>
  );
};

const useMemo = React.useMemo;

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
