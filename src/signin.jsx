const SignIn = ({ onSignIn }) => {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
      <div className="watermark"/>
      {/* Decorative droplets */}
      <svg style={{ position:"absolute", top: 40, right: 40, opacity: 0.05 }} width="280" height="280" viewBox="0 0 200 200">
        <path d="M100 20 C70 60 40 95 40 130 a60 60 0 0 0 120 0 C160 95 130 60 100 20z" fill="#003F87"/>
      </svg>
      <svg style={{ position:"absolute", bottom: -40, left: -40, opacity: 0.04 }} width="220" height="220" viewBox="0 0 200 200">
        <path d="M100 20 C70 60 40 95 40 130 a60 60 0 0 0 120 0 C160 95 130 60 100 20z" fill="#00B2E3"/>
      </svg>

      <div style={{ width: 420, maxWidth: "calc(100% - 32px)", position:"relative", zIndex: 1 }}>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom: 24 }}>
          <GwclLogo size={64}/>
          <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, color:"var(--gwcl-sky)", letterSpacing: "0.2em", textTransform:"uppercase" }}>Ghana Water Company Limited</div>
          <div style={{ marginTop: 6, fontSize: 22, fontWeight: 700, color:"var(--gwcl-blue)", letterSpacing: "-0.02em", textAlign:"center" }}>Plumbing Contractor Registry</div>
          <div style={{ marginTop: 6, fontSize: 13, color: "var(--ink-3)", textAlign:"center", maxWidth: 300 }}>
            Project Planning and Development · Internal workspace
          </div>
        </div>

        <div className="card card-padded" style={{ padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Sign in to continue</div>

          <button className="btn btn-lg" onClick={() => onSignIn("admin")} style={{ width: "100%", background: "#fff", color: "var(--ink)", border: "1px solid var(--line)", justifyContent:"flex-start", gap: 12, marginBottom: 10 }}>
            <span style={{ width: 20, height: 20, background: "linear-gradient(135deg,#F35325,#FFB900,#00A4EF,#7FBA00)", borderRadius: 3 }}/>
            Continue with Microsoft 365
          </button>

          <div style={{ display:"flex", alignItems:"center", gap: 10, margin: "14px 0", color:"var(--ink-3)", fontSize: 11, fontWeight: 500, letterSpacing: "0.1em" }}>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }}/>
            <span>OR PREVIEW AS</span>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }}/>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button className="btn btn-primary btn-lg" onClick={() => onSignIn("admin")} style={{ flexDirection:"column", height: "auto", padding: "14px 12px", gap: 4, alignItems:"center" }}>
              <Icon name="edit" size={18}/>
              <span style={{ fontSize: 13 }}>Admin</span>
              <span style={{ fontSize: 10.5, opacity: 0.7, fontWeight: 500 }}>Data Capture</span>
            </button>
            <button className="btn btn-lg" onClick={() => onSignIn("super")} style={{ flexDirection:"column", height: "auto", padding: "14px 12px", gap: 4, alignItems:"center", background:"var(--gwcl-sky)", color:"#fff" }}>
              <Icon name="shield" size={18}/>
              <span style={{ fontSize: 13 }}>Super Admin</span>
              <span style={{ fontSize: 10.5, opacity: 0.85, fontWeight: 500 }}>Approver</span>
            </button>
          </div>
        </div>

        <div style={{ marginTop: 20, textAlign:"center", fontSize: 11.5, color:"var(--ink-3)", lineHeight: 1.6 }}>
          Ghana Water Company Limited · Project Planning & Development<br/>
          Head Office, 28<sup>th</sup> February Road, Accra · Room 306
        </div>
      </div>
    </div>
  );
};
window.SignIn = SignIn;
