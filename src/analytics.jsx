// Analytics dashboard
const { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip: RTooltip, ResponsiveContainer, Legend } = Recharts;
const { useMemo: uM_a, useState: uS_a } = React;

const Analytics = ({ apps }) => {
  const [range, setRange] = uS_a("year");
  const [licenceF, setLicenceF] = uS_a("all");
  const [appTypeF, setAppTypeF] = uS_a("all");
  const toasts = useToasts();

  const live = uM_a(() => apps.map(a => ({ ...a, status: deriveStatus(a) })), [apps]);
  const all = uM_a(() => {
    const real = live.filter(a => licenceF === "all" || a.licenceType === licenceF).filter(a => appTypeF === "all" || a.appType === appTypeF);
    return real;
  }, [live, licenceF, appTypeF]);

  const registered = all.filter(a => ["REGISTERED","EXPIRING_SOON","EXPIRED","LAPSED"].includes(a.status));
  const active = all.filter(a => ["REGISTERED","EXPIRING_SOON"].includes(a.status));
  const expSoon = all.filter(a => a.status === "EXPIRING_SOON" && daysToExpiry(a.expiryDate) <= 30).length;

  const now = new Date();
  const thisYearRev = [...registered, ...HISTORICAL_EXTRA].reduce((sum, a) => {
    if (!a.registrationDate) return sum;
    if (new Date(a.registrationDate).getFullYear() !== now.getFullYear()) return sum;
    return sum + (a.fee || 0);
  }, 0);

  // Applications by status
  const statusData = [
    { key: "DRAFT", label: "Draft", color: "#757575" },
    { key: "PENDING_APPROVAL", label: "Pending Approval", color: "#ED6C02" },
    { key: "REJECTED", label: "Rejected", color: "#C62828" },
    { key: "TOKEN_ISSUED", label: "Token Issued", color: "#003F87" },
    { key: "PENDING_FINAL_APPROVAL", label: "Pending Final", color: "#00B2E3" },
    { key: "REGISTERED", label: "Registered", color: "#2E7D32" },
    { key: "EXPIRING_SOON", label: "Expiring Soon", color: "#F59E0B" },
    { key: "EXPIRED", label: "Expired", color: "#DC2626" },
    { key: "LAPSED", label: "Lapsed", color: "#2a2a2a" },
  ].map(s => ({ ...s, value: all.filter(a => a.status === s.key).length }));

  // Registrations over time (last 12 months)
  const monthsBack = Array.from({length: 12}, (_, i) => {
    const d = new Date(now); d.setMonth(d.getMonth() - (11 - i)); d.setDate(1);
    return d;
  });
  const regOverTime = monthsBack.map(m => {
    const ym = { y: m.getFullYear(), mo: m.getMonth() };
    const count = (type) => [...registered, ...HISTORICAL_EXTRA].filter(a => {
      if (!a.registrationDate) return false;
      const dt = new Date(a.registrationDate);
      return dt.getFullYear() === ym.y && dt.getMonth() === ym.mo && (a.appType || "New") === type;
    }).length;
    return { month: m.toLocaleDateString("en-GB", { month: "short" }), New: count("New"), Renewal: count("Renewal") };
  });

  // Grade distribution
  const gradeData = [
    { grade: "A", count: [...registered, ...HISTORICAL_EXTRA].filter(a => a.grade === "A").length, color: "#2E7D32" },
    { grade: "B", count: [...registered, ...HISTORICAL_EXTRA].filter(a => a.grade === "B").length, color: "#003F87" },
    { grade: "C", count: [...registered, ...HISTORICAL_EXTRA].filter(a => a.grade === "C").length, color: "#ED6C02" },
    { grade: "D", count: [...registered, ...HISTORICAL_EXTRA].filter(a => a.grade === "D").length, color: "#C62828" },
  ];

  // Upcoming expiries (buckets)
  const bucket = (min, max) => registered.filter(a => {
    if (!a.expiryDate) return false;
    const d = daysToExpiry(a.expiryDate);
    return d >= min && d <= max;
  }).length;
  const expiryData = [
    { bucket: "Next 30 days", count: bucket(0, 30), color: "#C62828" },
    { bucket: "31–60 days", count: bucket(31, 60), color: "#ED6C02" },
    { bucket: "61–90 days", count: bucket(61, 90), color: "#F1C40F" },
  ];

  // Rejection reasons (mocked categories)
  const rejectionData = [
    { reason: "Expired Tax Clearance", count: 7 },
    { reason: "Missing SSNIT stamp", count: 5 },
    { reason: "Insufficient staff qualification", count: 4 },
    { reason: "Bank statement unreadable", count: 3 },
    { reason: "Incomplete equipment proof", count: 2 },
  ];

  // Avg processing time
  const processingTimes = [8, 9, 7, 6, 8, 7]; // last 6 months, days
  const avgProc = processingTimes.reduce((a,b) => a+b, 0) / processingTimes.length;
  const procTrend = processingTimes.map((v, i) => ({ m: `M-${6-i}`, days: v }));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap: 18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing:"-0.01em" }}>Analytics Dashboard</div>
          <div style={{ fontSize: 13, color:"var(--ink-3)", marginTop: 4 }}>Registry performance and operational metrics.</div>
        </div>
        <button className="btn btn-secondary" onClick={() => toasts.push("Analytics PDF generated", "success")}><Icon name="download" size={14}/>Download Analytics PDF</button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 14, display:"flex", gap: 10, flexWrap:"wrap" }}>
        <div className="segmented">
          {[["month","This Month"],["quarter","This Quarter"],["year","This Year"],["all","All Time"]].map(([v,l]) => (
            <button key={v} className={range === v ? "on" : ""} onClick={() => setRange(v)}>{l}</button>
          ))}
        </div>
        <div className="segmented">
          {[["all","All Licences"],["Master Plumber","Master"],["Plumbing Contractor","Contractor"]].map(([v,l]) => (
            <button key={v} className={licenceF === v ? "on" : ""} onClick={() => setLicenceF(v)}>{l}</button>
          ))}
        </div>
        <div className="segmented">
          {[["all","New + Renewal"],["New","New"],["Renewal","Renewal"]].map(([v,l]) => (
            <button key={v} className={appTypeF === v ? "on" : ""} onClick={() => setAppTypeF(v)}>{l}</button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap: 14 }}>
        <KPI label="Total Registered" value={registered.length + HISTORICAL_EXTRA.length} sub="All-time contractors" icon="certificate"/>
        <KPI label="Active Licences" value={active.length} sub="Currently valid" icon="shield"/>
        <KPI label="Expiring in 30 Days" value={expSoon} sub="Action required" icon="clock"/>
        <KPI label="Revenue This Year" value={fmtMoney(thisYearRev)} sub="Registration + renewal fees" icon="cash"/>
      </div>

      {/* Row 1: status donut + over time */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1.4fr", gap: 14 }}>
        <ChartCard title="Applications by Status">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusData.filter(s => s.value > 0)} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {statusData.filter(s => s.value > 0).map((entry, i) => <Cell key={i} fill={entry.color}/>)}
              </Pie>
              <RTooltip contentStyle={{ borderRadius: 8, fontSize: 12, border:"1px solid var(--line)" }}/>
              <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 11 }}/>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Registrations Over Time · Last 12 Months">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={regOverTime} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F3"/>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#6b7280"/>
              <YAxis tick={{ fontSize: 11 }} stroke="#6b7280"/>
              <RTooltip contentStyle={{ borderRadius: 8, fontSize: 12 }}/>
              <Legend wrapperStyle={{ fontSize: 11 }}/>
              <Line type="monotone" dataKey="New" stroke="#003F87" strokeWidth={2.5} dot={{ r: 3 }}/>
              <Line type="monotone" dataKey="Renewal" stroke="#00B2E3" strokeWidth={2.5} dot={{ r: 3 }}/>
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2: grade + upcoming + rejection */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1.2fr", gap: 14 }}>
        <ChartCard title="Grade Distribution">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={gradeData} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F3"/>
              <XAxis dataKey="grade" tick={{ fontSize: 12, fontWeight: 600 }} stroke="#6b7280"/>
              <YAxis tick={{ fontSize: 11 }} stroke="#6b7280"/>
              <RTooltip contentStyle={{ borderRadius: 8, fontSize: 12 }}/>
              <Bar dataKey="count" radius={[6,6,0,0]}>
                {gradeData.map((e, i) => <Cell key={i} fill={e.color}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Upcoming Expiries">
          <div style={{ padding: "8px 16px 16px", display:"flex", flexDirection:"column", gap: 14 }}>
            {expiryData.map(e => {
              const max = Math.max(1, ...expiryData.map(x => x.count));
              return (
                <div key={e.bucket}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom: 6, fontSize: 12.5 }}>
                    <span style={{ fontWeight: 500 }}>{e.bucket}</span>
                    <span style={{ fontWeight: 700, color: e.color }}>{e.count}</span>
                  </div>
                  <div style={{ height: 10, background:"var(--line-2)", borderRadius: 999 }}>
                    <div style={{ width: `${(e.count/max)*100}%`, height: "100%", background: e.color, borderRadius: 999 }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>

        <ChartCard title="Top Rejection Reasons">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={rejectionData} layout="vertical" margin={{ left: 110 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F3" horizontal={false}/>
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#6b7280"/>
              <YAxis type="category" dataKey="reason" tick={{ fontSize: 11 }} stroke="#6b7280" width={130}/>
              <RTooltip contentStyle={{ borderRadius: 8, fontSize: 12 }}/>
              <Bar dataKey="count" fill="#C62828" radius={[0,4,4,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 3: avg processing time */}
      <div className="card card-padded" style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap: 20, padding: 20, alignItems:"center" }}>
        <div>
          <div style={{ fontSize: 11, color:"var(--ink-3)", fontWeight: 700, textTransform:"uppercase", letterSpacing:"0.06em" }}>Avg Processing Time</div>
          <div style={{ fontSize: 34, fontWeight: 700, color:"var(--gwcl-blue)", marginTop: 6, letterSpacing:"-0.02em" }}>{avgProc.toFixed(1)} <span style={{ fontSize: 16, color:"var(--ink-2)" }}>days</span></div>
          <div style={{ fontSize: 12, color:"var(--success)", marginTop: 4 }}>▼ 1.3 days vs previous period</div>
          <div style={{ fontSize: 11.5, color:"var(--ink-3)", marginTop: 4 }}>Submission → Registered</div>
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={procTrend} margin={{ top: 4, bottom: 4 }}>
            <Line type="monotone" dataKey="days" stroke="#00B2E3" strokeWidth={2.5} dot={{ r: 3, fill: "#00B2E3" }}/>
            <XAxis dataKey="m" hide/>
            <YAxis hide domain={[0, 12]}/>
            <RTooltip contentStyle={{ borderRadius: 8, fontSize: 12 }}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const KPI = ({ label, value, sub, icon }) => (
  <div className="kpi">
    <div className="kpi-icon"><Icon name={icon} size={18}/></div>
    <div className="kpi-label">{label}</div>
    <div className="kpi-value">{value}</div>
    {sub && <div className="kpi-sub">{sub}</div>}
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="card">
    <div className="card-head"><h3>{title}</h3></div>
    <div style={{ padding: "10px 10px 14px" }}>{children}</div>
  </div>
);

Object.assign(window, { Analytics });
