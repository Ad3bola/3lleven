// ── UMD GLOBALS ────────────────────────────────────────────────────────
const { useState, useEffect, useMemo } = React;
const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } = Recharts;
const {
  LayoutDashboard, Users, Briefcase, DollarSign, Settings, LogOut,
  Plus, Pencil, Trash2, ExternalLink, Eye, EyeOff, X, Search,
  Lock, TrendingUp, AlertTriangle, CheckCircle, Clock,
  ChevronRight, Target, Building2, Calendar
} = lucideReact;

// ── THEME ──────────────────────────────────────────────────────────────
const C = {
  bg:"#000000", surface:"#1D1D1F", surface2:"#2C2C2E", surface3:"#3A3A3C",
  border:"rgba(255,255,255,0.09)", borderHi:"rgba(41,151,255,0.45)",
  fg:"#F5F5F7", muted:"#A1A1A6", muted2:"#86868B",
  accent:"#2997FF", accent2:"#BF5AF2",
  green:"#22c55e", yellow:"#eab308", red:"#ef4444", orange:"#f97316", blue:"#0066CC",
};

// ── CONSTANTS ──────────────────────────────────────────────────────────
const DEFAULT_PW = "311";
const LEAD_STAGES = ["Prospect","Contacted","Replied","Call Booked","Proposal Sent","Won","Lost","Cooling Off"];
const LEAD_DOT = {"Prospect":"#3a3a50","Contacted":C.blue,"Replied":C.green,"Call Booked":C.yellow,"Proposal Sent":C.orange,"Won":C.green,"Lost":C.red,"Cooling Off":"#3a3a50"};
const LEAD_NEXT = {"Prospect":"Contacted","Contacted":"Replied","Replied":"Call Booked","Call Booked":"Proposal Sent","Proposal Sent":"Won"};
const LEAD_CHANNELS = ["Cold Email","Cold DM (IG)","Cold DM (LinkedIn)","Google Maps","Referral","In Person","Other"];
const PROJ_STATUSES = ["Kickoff","Design","Development","Review","Launched","Paused","Cancelled"];
const PROJ_DOT = {"Kickoff":C.blue,"Design":C.accent2,"Development":C.accent,"Review":C.yellow,"Launched":C.green,"Paused":C.orange,"Cancelled":C.red};
const PLANS = ["None","Starter — $299/mo","Growth — $399/mo","Pro — $599/mo"];
const PLAN_PRICE = {"None":0,"Starter — $299/mo":299,"Growth — $399/mo":399,"Pro — $599/mo":599};
const PAY_TYPES = ["Deposit (50%)","Milestone","Final Payment","Monthly Plan","Add-On","Refund","Other"];
const PAY_STATUSES = ["Pending","Paid","Overdue"];
const PAY_STATUS_COLOR = {"Pending":C.yellow,"Paid":C.green,"Overdue":C.red};
const HOSTING = ["Vercel","Netlify","Client's Hosting","Other"];
const METHODS = ["Stripe","Cash","Check","Venmo","Zelle","Other"];

// ── EMPTY OBJECTS ──────────────────────────────────────────────────────
const EL = {id:null,business:"",contact:"",channel:"Cold Email",stage:"Prospect",email:"",phone:"",instagram:"",website:"",notes:"",lastContact:"",nextFollowUp:"",value:"",city:""};
const EP = {id:null,clientName:"",businessName:"",email:"",phone:"",type:"New Build",status:"Kickoff",plan:"None",budget:"",depositPaid:false,depositAmount:"",finalPaid:false,finalAmount:"",startDate:"",targetLaunch:"",launchDate:"",domain:"",liveUrl:"",repoUrl:"",hosting:"Vercel",lighthouse:"",pages:"1–3",addons:"",notes:""};
const EPY = {id:null,projectId:"",clientName:"",type:"Deposit (50%)",amount:"",status:"Pending",dueDate:"",paidDate:"",description:"",method:"Stripe"};

// ── HELPERS ────────────────────────────────────────────────────────────
const uid = () => Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const fmt$ = n => `$${(Math.round(Number(n)||0)).toLocaleString()}`;
const fmtDate = d => d ? new Date(d+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"2-digit"}) : "—";
const todayStr = () => new Date().toISOString().slice(0,10);
const daysUntil = d => { if(!d) return null; const diff=Math.ceil((new Date(d)-Date.now())/86400000); return {days:diff,label:diff<0?`${Math.abs(diff)}d overdue`:diff===0?"today":`${diff}d`,overdue:diff<0}; };
const daysAgo = d => { if(!d) return "—"; const diff=Math.floor((Date.now()-new Date(d))/86400000); return diff===0?"today":diff===1?"1d ago":`${diff}d ago`; };
const last6Months = () => { const r=[]; for(let i=5;i>=0;i--){ const d=new Date(); d.setMonth(d.getMonth()-i); r.push({key:d.toISOString().slice(0,7),label:d.toLocaleDateString("en-US",{month:"short"})}); } return r; };

// ── localStorage helpers ───────────────────────────────────────────────
const lsGet = key => { try { return localStorage.getItem(key); } catch(e) { return null; } };
const lsSet = (key, val) => { try { localStorage.setItem(key, val); } catch(e) {} };

// ── SHARED STYLES ──────────────────────────────────────────────────────
const S = {
  input: { background:C.surface3, border:`1px solid ${C.border}`, borderRadius:6, padding:"8px 11px", fontFamily:"inherit", fontSize:12, color:C.fg, outline:"none", width:"100%", transition:"border-color .15s" },
  label: { fontSize:9, letterSpacing:"1.8px", textTransform:"uppercase", color:C.muted2, display:"block", marginBottom:4 },
  btn: (col="#6366f1",bg="transparent") => ({ background:bg||`${col}18`, border:`1px solid ${col}44`, color:col, borderRadius:6, padding:"6px 14px", fontSize:11, cursor:"pointer", fontFamily:"inherit", letterSpacing:".5px" }),
  btnSolid: (col=C.accent) => ({ background:col, border:"none", color:"#fff", borderRadius:6, padding:"8px 18px", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }),
  card: { background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"18px 20px" },
  statCard: (accent=C.accent) => ({ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"16px 20px", borderTop:`2px solid ${accent}` }),
  pill: (col=C.accent) => ({ background:`${col}18`, border:`1px solid ${col}33`, color:col, borderRadius:20, padding:"3px 10px", fontSize:10, fontWeight:500, whiteSpace:"nowrap", display:"inline-flex", alignItems:"center", gap:4 }),
  dot: (col) => ({ width:7, height:7, borderRadius:"50%", background:col, flexShrink:0 }),
};

// ── TOAST ──────────────────────────────────────────────────────────────
function Toast({toast}) {
  if(!toast) return null;
  const col = toast.type==="error" ? C.red : toast.type==="warn" ? C.yellow : C.green;
  return <div style={{position:"fixed",bottom:24,right:24,background:C.surface,border:`1px solid ${col}`,color:C.fg,padding:"10px 18px",borderRadius:8,fontSize:12,zIndex:9999,display:"flex",alignItems:"center",gap:8}}><div style={{width:6,height:6,borderRadius:"50%",background:col}} />{toast.msg}</div>;
}

// ── MODAL WRAPPER ──────────────────────────────────────────────────────
function Modal({title, onClose, children, wide=false}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.72)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,width:"100%",maxWidth:wide?680:520,maxHeight:"90vh",overflowY:"auto",display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
          <span style={{fontWeight:700,fontSize:13,color:C.fg,letterSpacing:"-.02em"}}>{title}</span>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:C.muted}}><X size={16}/></button>
        </div>
        <div style={{padding:"20px",overflowY:"auto"}}>{children}</div>
      </div>
    </div>
  );
}

// ── FIELD ──────────────────────────────────────────────────────────────
function Field({label, children, style={}}) {
  return <div style={{display:"flex",flexDirection:"column",gap:5,...style}}><label style={S.label}>{label}</label>{children}</div>;
}

function FGrid({children, cols=2}) {
  return <div style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap:12,marginBottom:12}}>{children}</div>;
}

// ── LOGIN SCREEN ───────────────────────────────────────────────────────
function LoginScreen({pw, onAuth}) {
  const [val, setVal] = useState("");
  const [show, setShow] = useState(false);
  const [shake, setShake] = useState(false);

  function attempt() {
    if(val === pw) { onAuth(); }
    else { setShake(true); setVal(""); setTimeout(()=>setShake(false),500); }
  }

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300&display=swap');body{margin:0;}`}</style>
      <div style={{width:360,textAlign:"center"}}>
        <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,fontSize:28,letterSpacing:"-.05em",marginBottom:6}}>
          <span style={{background:`linear-gradient(135deg,${C.accent},${C.accent2})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>3</span>
          <span style={{color:C.fg}}>lleven</span>
        </div>
        <div style={{fontFamily:"'Plus Jakarta Sans',monospace",fontSize:9,letterSpacing:"2.5px",textTransform:"uppercase",color:C.muted2,marginBottom:40}}>// Dashboard</div>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"32px 28px",animation:shake?"shake .3s ease":"none"}}>
          <div style={{width:48,height:48,borderRadius:"50%",background:`${C.accent}18`,border:`1px solid ${C.accent}33`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><Lock size={20} color={C.accent}/></div>
          <div style={{fontSize:13,fontWeight:600,color:C.fg,marginBottom:6}}>Access Required</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:22}}>Enter your dashboard password to continue.</div>
          <div style={{position:"relative",marginBottom:14}}>
            <input type={show?"text":"password"} value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attempt()} placeholder="Password" autoFocus style={{...S.input,paddingRight:38,textAlign:"center",fontSize:16,letterSpacing:"0.2em"}}/>
            <button onClick={()=>setShow(s=>!s)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.muted}}>{show?<EyeOff size={14}/>:<Eye size={14}/>}</button>
          </div>
          <button onClick={attempt} style={{...S.btnSolid(),width:"100%",padding:"10px"}}>Unlock Dashboard →</button>
        </div>
        <div style={{marginTop:14,fontSize:10,color:C.muted2,fontFamily:"'Plus Jakarta Sans',monospace"}}>3lleven.com · private</div>
      </div>
      <style>{`@keyframes shake{0%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}100%{transform:translateX(0)}}`}</style>
    </div>
  );
}

// ── SIDEBAR ────────────────────────────────────────────────────────────
function Sidebar({tab, setTab, onLogout}) {
  const items = [
    {id:"overview",icon:<LayoutDashboard size={16}/>,label:"Overview"},
    {id:"leads",icon:<Target size={16}/>,label:"Leads"},
    {id:"projects",icon:<Briefcase size={16}/>,label:"Projects"},
    {id:"payments",icon:<DollarSign size={16}/>,label:"Payments"},
    {id:"settings",icon:<Settings size={16}/>,label:"Settings"},
  ];
  return (
    <div style={{width:200,background:C.surface,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",flexShrink:0}}>
      <div style={{padding:"18px 16px 14px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,fontSize:16,letterSpacing:"-.04em"}}>
          <span style={{background:`linear-gradient(135deg,${C.accent},${C.accent2})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>3</span>
          <span style={{color:C.fg}}>lleven</span>
        </div>
        <div style={{fontFamily:"'Plus Jakarta Sans',monospace",fontSize:8,color:C.muted2,letterSpacing:"2px",textTransform:"uppercase",marginTop:2}}>Dashboard</div>
      </div>
      <nav style={{flex:1,padding:"10px 8px"}}>
        {items.map(item=>(
          <button key={item.id} onClick={()=>setTab(item.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"8px 10px",borderRadius:7,border:"none",background:tab===item.id?`${C.accent}18`:"transparent",color:tab===item.id?C.accent:C.muted,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:tab===item.id?600:400,textAlign:"left",transition:"all .15s",marginBottom:2}}>
            {item.icon}{item.label}
            {tab===item.id && <div style={{marginLeft:"auto",width:4,height:4,borderRadius:"50%",background:C.accent}}/>}
          </button>
        ))}
      </nav>
      <div style={{padding:"10px 8px",borderTop:`1px solid ${C.border}`}}>
        <button onClick={onLogout} style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"8px 10px",borderRadius:7,border:"none",background:"transparent",color:C.muted2,cursor:"pointer",fontFamily:"inherit",fontSize:11}}>
          <LogOut size={14}/> Lock Dashboard
        </button>
      </div>
    </div>
  );
}

// ── OVERVIEW TAB ───────────────────────────────────────────────────────
function OverviewTab({leads, projects, payments}) {
  const mrr = useMemo(()=>projects.filter(p=>p.status==="Launched"&&p.plan!=="None").reduce((s,p)=>s+(PLAN_PRICE[p.plan]||0),0),[projects]);
  const totalCollected = useMemo(()=>payments.filter(p=>p.status==="Paid").reduce((s,p)=>s+(Number(p.amount)||0),0),[payments]);
  const outstanding = useMemo(()=>payments.filter(p=>p.status==="Pending").reduce((s,p)=>s+(Number(p.amount)||0),0),[payments]);
  const overdue = useMemo(()=>payments.filter(p=>p.status==="Overdue").reduce((s,p)=>s+(Number(p.amount)||0),0),[payments]);
  const activeBuilds = useMemo(()=>projects.filter(p=>["Kickoff","Design","Development","Review"].includes(p.status)).length,[projects]);
  const hotLeads = useMemo(()=>leads.filter(l=>["Call Booked","Proposal Sent"].includes(l.stage)).length,[leads]);
  const pipelineVal = useMemo(()=>leads.filter(l=>!["Won","Lost"].includes(l.stage)&&l.value).reduce((s,l)=>s+(Number(l.value)||0),0),[leads]);

  const months = last6Months();
  const revenueData = useMemo(()=>months.map(m=>({
    label:m.label,
    value:payments.filter(p=>p.status==="Paid"&&p.paidDate?.startsWith(m.key)).reduce((s,p)=>s+(Number(p.amount)||0),0)
  })),[payments]);

  const recentActivity = useMemo(()=>{
    const acts = [
      ...payments.filter(p=>p.paidDate).map(p=>({date:p.paidDate,text:`Payment received — ${p.clientName}`,sub:fmt$(p.amount),color:C.green})),
      ...projects.filter(p=>p.launchDate).map(p=>({date:p.launchDate,text:`Site launched — ${p.businessName||p.clientName}`,sub:p.liveUrl||"",color:C.accent})),
      ...leads.filter(l=>l.stage==="Won"&&l.lastContact).map(l=>({date:l.lastContact,text:`Lead won — ${l.business}`,sub:l.value?fmt$(l.value):"",color:C.green})),
    ].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,8);
    return acts;
  },[payments,projects,leads]);

  const CustomTooltip = ({active,payload,label})=>{
    if(!active||!payload?.length) return null;
    return <div style={{background:C.surface3,border:`1px solid ${C.border}`,borderRadius:6,padding:"8px 12px",fontSize:11}}><div style={{color:C.muted,marginBottom:3}}>{label}</div><div style={{color:C.fg,fontWeight:600}}>{fmt$(payload[0].value)}</div></div>;
  };

  return (
    <div style={{padding:"24px",overflowY:"auto",flex:1}}>
      <div style={{marginBottom:20}}>
        <div style={{fontFamily:"'Plus Jakarta Sans',monospace",fontSize:9,color:C.accent,letterSpacing:"2px",textTransform:"uppercase",marginBottom:4}}>// Overview</div>
        <div style={{fontSize:20,fontWeight:700,color:C.fg,letterSpacing:"-.04em"}}>Good{new Date().getHours()<12?" morning":new Date().getHours()<17?" afternoon":" evening"}, Adebola.</div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
        {[
          {label:"Monthly Recurring",val:fmt$(mrr),sub:`${projects.filter(p=>p.status==="Launched"&&p.plan!=="None").length} active plans`,color:C.accent},
          {label:"Total Collected",val:fmt$(totalCollected),sub:"all time",color:C.green},
          {label:"Outstanding",val:fmt$(outstanding+overdue),sub:overdue>0?`${fmt$(overdue)} overdue`:"all on track",color:overdue>0?C.red:C.yellow},
          {label:"Active Builds",val:activeBuilds,sub:`${projects.filter(p=>p.status==="Launched").length} launched total`,color:C.blue},
          {label:"Hot Leads",val:hotLeads,sub:"call booked or proposal sent",color:C.orange},
          {label:"Pipeline Value",val:fmt$(pipelineVal),sub:`${leads.filter(l=>!["Won","Lost"].includes(l.stage)).length} open leads`,color:C.accent2},
        ].map(s=>(
          <div key={s.label} style={S.statCard(s.color)}>
            <div style={{fontSize:9,fontFamily:"'Plus Jakarta Sans',monospace",letterSpacing:"1.5px",textTransform:"uppercase",color:C.muted2,marginBottom:8}}>{s.label}</div>
            <div style={{fontSize:22,fontWeight:700,color:s.color,letterSpacing:"-.03em",marginBottom:2}}>{s.val}</div>
            <div style={{fontSize:10,color:C.muted}}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={{...S.card}}>
          <div style={{fontSize:10,fontFamily:"'Plus Jakarta Sans',monospace",letterSpacing:"1.5px",textTransform:"uppercase",color:C.muted2,marginBottom:16}}>Revenue — Last 6 Months</div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={revenueData} barSize={20}>
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize:10,fill:C.muted2}} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip/>} cursor={{fill:`${C.accent}10`}} />
              <Bar dataKey="value" radius={[4,4,0,0]}>
                {revenueData.map((e,i)=><Cell key={i} fill={i===revenueData.length-1?C.accent:`${C.accent}55`} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{...S.card}}>
          <div style={{fontSize:10,fontFamily:"'Plus Jakarta Sans',monospace",letterSpacing:"1.5px",textTransform:"uppercase",color:C.muted2,marginBottom:14}}>Recent Activity</div>
          {recentActivity.length===0 && <div style={{color:C.muted2,fontSize:11,textAlign:"center",padding:"20px 0"}}>No activity yet — add leads, projects, and payments to see the feed.</div>}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {recentActivity.map((a,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:a.color,flexShrink:0}} />
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:11,color:C.fg,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.text}</div>
                  <div style={{fontSize:10,color:C.muted}}>{fmtDate(a.date)}{a.sub&&` · ${a.sub}`}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {projects.filter(p=>["Kickoff","Design","Development","Review"].includes(p.status)).length>0 && (
        <div style={{...S.card,marginTop:16}}>
          <div style={{fontSize:10,fontFamily:"'Plus Jakarta Sans',monospace",letterSpacing:"1.5px",textTransform:"uppercase",color:C.muted2,marginBottom:14}}>Active Builds</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
            {projects.filter(p=>["Kickoff","Design","Development","Review"].includes(p.status)).map(p=>(
              <div key={p.id} style={{background:C.surface2,border:`1px solid ${C.border}`,borderLeft:`2px solid ${PROJ_DOT[p.status]}`,borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontSize:11,fontWeight:600,color:C.fg,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.businessName||p.clientName}</div>
                <div style={{fontSize:10,color:C.muted,marginBottom:6}}>{p.domain||"domain TBD"}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={S.pill(PROJ_DOT[p.status])}>{p.status}</span>
                  {p.targetLaunch && <span style={{fontSize:9,color:C.muted2,fontFamily:"'Plus Jakarta Sans',monospace"}}>{fmtDate(p.targetLaunch)}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── LEAD FORM ──────────────────────────────────────────────────────────
function LeadForm({form, setForm, onSave, onDelete, onClose}) {
  const f = (k,v) => setForm(p=>({...p,[k]:v}));
  return (
    <div>
      <FGrid><Field label="Business Name *"><input style={S.input} value={form.business} onChange={e=>f("business",e.target.value)} placeholder="Joe's Barbershop"/></Field><Field label="Contact Name"><input style={S.input} value={form.contact} onChange={e=>f("contact",e.target.value)} placeholder="Joe Smith"/></Field></FGrid>
      <FGrid><Field label="Stage"><select style={S.input} value={form.stage} onChange={e=>f("stage",e.target.value)}>{LEAD_STAGES.map(s=><option key={s}>{s}</option>)}</select></Field><Field label="Channel"><select style={S.input} value={form.channel} onChange={e=>f("channel",e.target.value)}>{LEAD_CHANNELS.map(c=><option key={c}>{c}</option>)}</select></Field></FGrid>
      <FGrid><Field label="Email"><input style={S.input} value={form.email} onChange={e=>f("email",e.target.value)} placeholder="joe@business.com"/></Field><Field label="Phone"><input style={S.input} value={form.phone} onChange={e=>f("phone",e.target.value)} placeholder="(313) 555-0100"/></Field></FGrid>
      <FGrid><Field label="Instagram"><input style={S.input} value={form.instagram} onChange={e=>f("instagram",e.target.value)} placeholder="@joebusiness"/></Field><Field label="Current Website"><input style={S.input} value={form.website} onChange={e=>f("website",e.target.value)} placeholder="joebusiness.com"/></Field></FGrid>
      <FGrid><Field label="Est. Value ($)"><input style={S.input} type="number" value={form.value} onChange={e=>f("value",e.target.value)} placeholder="900"/></Field><Field label="City"><input style={S.input} value={form.city} onChange={e=>f("city",e.target.value)} placeholder="Detroit, MI"/></Field></FGrid>
      <FGrid><Field label="Last Contacted"><input style={{...S.input,colorScheme:"dark"}} type="date" value={form.lastContact} onChange={e=>f("lastContact",e.target.value)}/></Field><Field label="Next Follow-Up"><input style={{...S.input,colorScheme:"dark"}} type="date" value={form.nextFollowUp} onChange={e=>f("nextFollowUp",e.target.value)}/></Field></FGrid>
      <Field label="Notes" style={{marginBottom:16}}><textarea style={{...S.input,minHeight:70,resize:"vertical"}} value={form.notes} onChange={e=>f("notes",e.target.value)} placeholder="Slow Wix site, active on IG, follow up in 5 days..."/></Field>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4}}>
        {form.id ? <button onClick={onDelete} style={{...S.btn(C.red),fontSize:11}}>Delete</button> : <span/>}
        <div style={{display:"flex",gap:8}}><button onClick={onClose} style={{...S.btn(C.muted2)}}>Cancel</button><button onClick={onSave} style={S.btnSolid()}>{form.id?"Save Changes":"Add Lead"}</button></div>
      </div>
    </div>
  );
}

// ── LEADS TAB ──────────────────────────────────────────────────────────
function LeadsTab({leads, saveLeads, showToast, setModal, onConvertToProject}) {
  const [view, setView] = useState("pipeline");
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState("All");

  const byStage = useMemo(()=>LEAD_STAGES.reduce((a,s)=>({...a,[s]:leads.filter(l=>l.stage===s)}),{}),[leads]);
  const overdue = useMemo(()=>leads.filter(l=>l.nextFollowUp&&!["Won","Lost"].includes(l.stage)&&new Date(l.nextFollowUp)<new Date()),[leads]);
  const visible = useMemo(()=>leads.filter(l=>{
    const ms = filterStage==="All"||l.stage===filterStage;
    const mq = !search||l.business.toLowerCase().includes(search.toLowerCase())||l.contact.toLowerCase().includes(search.toLowerCase());
    return ms&&mq;
  }),[leads,search,filterStage]);

  function saveLead(form) {
    const next = form.id ? leads.map(l=>l.id===form.id?{...form}:l) : [{...form,id:uid(),lastContact:todayStr()},...leads];
    saveLeads(next); showToast(form.id?"Lead updated":"Lead added");
  }
  function deleteLead(id) { saveLeads(leads.filter(l=>l.id!==id)); showToast("Lead removed","warn"); }
  function advance(id) {
    const l = leads.find(l=>l.id===id); if(!LEAD_NEXT[l.stage]) return;
    saveLeads(leads.map(x=>x.id===id?{...x,stage:LEAD_NEXT[l.stage],lastContact:todayStr()}:x));
    showToast(`→ ${LEAD_NEXT[l.stage]}`);
  }
  function openAdd() { setModal({type:"lead",data:{...EL}}); }
  function openEdit(lead) { setModal({type:"lead",data:{...lead}}); }

  return (
    <div style={{display:"flex",flexDirection:"column",flex:1,overflow:"hidden"}}>
      <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Plus Jakarta Sans',monospace",fontSize:8,color:C.accent,letterSpacing:"2px",textTransform:"uppercase"}}>// Leads</div>
          <div style={{fontSize:14,fontWeight:700,color:C.fg,letterSpacing:"-.03em"}}>Pipeline</div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {["pipeline","list"].map(v=><button key={v} onClick={()=>setView(v)} style={{...S.btn(v===view?C.accent:C.muted2),padding:"5px 12px",fontSize:10,textTransform:"capitalize"}}>{v}</button>)}
          <button onClick={openAdd} style={{...S.btnSolid(),padding:"6px 14px",display:"flex",alignItems:"center",gap:6}}><Plus size={13}/> Add Lead</button>
        </div>
      </div>

      <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        {[
          {l:"Total",v:leads.length,c:C.fg},
          {l:"Active",v:leads.filter(l=>!["Won","Lost","Cooling Off"].includes(l.stage)).length,c:C.blue},
          {l:"Won",v:byStage["Won"].length,c:C.green},
          {l:"Follow-up Due",v:overdue.length,c:overdue.length>0?C.red:C.muted2},
          {l:"Pipeline $",v:fmt$(leads.filter(l=>!["Won","Lost"].includes(l.stage)&&l.value).reduce((s,l)=>s+(Number(l.value)||0),0)),c:C.yellow},
        ].map(s=>(
          <div key={s.l} style={{flex:1,padding:"10px 14px",borderRight:`1px solid ${C.border}`}}>
            <div style={{fontSize:8,fontFamily:"'Plus Jakarta Sans',monospace",letterSpacing:"1.5px",textTransform:"uppercase",color:C.muted2,marginBottom:3}}>{s.l}</div>
            <div style={{fontSize:16,fontWeight:700,color:s.c}}>{s.v}</div>
          </div>
        ))}
      </div>

      {overdue.length>0&&<div style={{background:`${C.red}12`,borderBottom:`1px solid ${C.red}30`,padding:"7px 20px",fontSize:11,color:C.red,flexShrink:0}}>⚠ {overdue.length} follow-up{overdue.length>1?"s":""} overdue: {overdue.slice(0,3).map(l=>l.business).join(", ")}{overdue.length>3?"…":""}</div>}

      <div style={{flex:1,overflowY:"auto"}}>
        {view==="pipeline"&&(
          <div style={{padding:"16px 20px",overflowX:"auto"}}>
            <div style={{display:"flex",gap:10,minWidth:900}}>
              {LEAD_STAGES.filter(s=>s!=="Cooling Off").map(stage=>{
                const sl=byStage[stage]||[]; const dot=LEAD_DOT[stage];
                return (
                  <div key={stage} style={{flex:1,minWidth:130}}>
                    <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:8}}>
                      <div style={S.dot(dot)}/><span style={{fontSize:9,letterSpacing:"1.5px",textTransform:"uppercase",color:C.muted2}}>{stage}</span><span style={{fontSize:9,color:C.muted2,marginLeft:"auto"}}>{sl.length}</span>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:6,minHeight:40}}>
                      {sl.map(lead=>{
                        const fu=lead.nextFollowUp?daysUntil(lead.nextFollowUp):null;
                        return (
                          <div key={lead.id} onClick={()=>openEdit(lead)} style={{background:C.surface2,border:`1px solid ${C.border}`,borderLeft:`2px solid ${dot}`,borderRadius:7,padding:"9px 10px",cursor:"pointer",transition:"border-color .15s"}}>
                            <div style={{fontSize:11,color:C.fg,fontWeight:600,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lead.business}</div>
                            {lead.contact&&<div style={{fontSize:10,color:C.muted2,marginBottom:5}}>{lead.contact}</div>}
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:LEAD_NEXT[stage]?6:0}}>
                              <span style={{fontSize:9,color:C.muted2}}>{lead.channel}</span>
                              {fu&&<span style={{fontSize:9,color:fu.overdue?C.red:C.muted2}}>{fu.label}</span>}
                            </div>
                            {lead.value&&<div style={{fontSize:10,color:C.yellow,marginBottom:LEAD_NEXT[stage]?4:0}}>{fmt$(lead.value)}</div>}
                            {LEAD_NEXT[stage]&&<button onClick={e=>{e.stopPropagation();advance(lead.id);}} style={{width:"100%",background:`${dot}15`,border:`1px solid ${dot}30`,color:dot,borderRadius:4,padding:"4px",fontSize:9,letterSpacing:"1px",textTransform:"uppercase",cursor:"pointer",fontFamily:"inherit"}}>→ {LEAD_NEXT[stage]}</button>}
                            {stage==="Won"&&<button onClick={e=>{e.stopPropagation();onConvertToProject(lead);}} style={{width:"100%",marginTop:4,background:`${C.green}15`,border:`1px solid ${C.green}40`,color:C.green,borderRadius:4,padding:"4px",fontSize:9,letterSpacing:"1px",textTransform:"uppercase",cursor:"pointer",fontFamily:"inherit"}}>+ Convert to Project</button>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            {byStage["Cooling Off"].length>0&&(
              <div style={{marginTop:20,paddingTop:16,borderTop:`1px solid ${C.border}`}}>
                <div style={{fontSize:9,letterSpacing:"2px",textTransform:"uppercase",color:C.muted2,marginBottom:10}}>Cooling Off — wait before re-contacting</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {byStage["Cooling Off"].map(l=>(
                    <div key={l.id} onClick={()=>openEdit(l)} style={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:7,padding:"7px 12px",cursor:"pointer",minWidth:130}}>
                      <div style={{fontSize:11,color:C.muted,fontWeight:500}}>{l.business}</div>
                      <div style={{fontSize:9,color:C.muted2}}>{daysAgo(l.lastContact)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {view==="list"&&(
          <div style={{padding:"14px 20px"}}>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <div style={{position:"relative",flex:1,maxWidth:260}}>
                <Search size={12} style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:C.muted2,pointerEvents:"none"}}/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{...S.input,paddingLeft:28}}/>
              </div>
              <select value={filterStage} onChange={e=>setFilterStage(e.target.value)} style={{...S.input,width:140}}>
                <option value="All">All stages</option>
                {LEAD_STAGES.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            {visible.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:C.muted2,fontSize:12}}>No leads found.</div>}
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {visible.map(lead=>{
                const dot=LEAD_DOT[lead.stage]; const fu=lead.nextFollowUp?daysUntil(lead.nextFollowUp):null;
                return (
                  <div key={lead.id} style={{background:C.surface,border:`1px solid ${C.border}`,borderLeft:`2px solid ${dot}`,borderRadius:8,padding:"10px 14px",display:"grid",gridTemplateColumns:"1fr auto auto auto",gap:10,alignItems:"center"}}>
                    <div>
                      <div style={{fontSize:12,color:C.fg,fontWeight:600}}>{lead.business}</div>
                      <div style={{fontSize:10,color:C.muted2}}>{[lead.contact,lead.channel,lead.city].filter(Boolean).join(" · ")}</div>
                    </div>
                    {lead.value&&<div style={{fontSize:11,color:C.yellow,fontFamily:"'Plus Jakarta Sans',monospace"}}>{fmt$(lead.value)}</div>}
                    {fu?<div style={{fontSize:10,color:fu.overdue?C.red:C.muted2,whiteSpace:"nowrap"}}>{fu.label}</div>:<div/>}
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={S.pill(dot)}>{lead.stage}</span>
                      {lead.stage==="Won"&&<button onClick={()=>onConvertToProject(lead)} style={{...S.btn(C.green),padding:"4px 8px",fontSize:10}}>→ Project</button>}
                      <button onClick={()=>openEdit(lead)} style={{...S.btn(C.muted2),padding:"4px 8px"}}><Pencil size={11}/></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── PROJECT FORM ───────────────────────────────────────────────────────
function ProjectForm({form, setForm, onSave, onDelete, onClose}) {
  const f = (k,v) => setForm(p=>({...p,[k]:v}));
  return (
    <div>
      <FGrid><Field label="Client Name *"><input style={S.input} value={form.clientName} onChange={e=>f("clientName",e.target.value)} placeholder="Jane Smith"/></Field><Field label="Business Name"><input style={S.input} value={form.businessName} onChange={e=>f("businessName",e.target.value)} placeholder="Apex Barbershop"/></Field></FGrid>
      <FGrid><Field label="Email"><input style={S.input} value={form.email} onChange={e=>f("email",e.target.value)} placeholder="jane@business.com"/></Field><Field label="Phone"><input style={S.input} value={form.phone} onChange={e=>f("phone",e.target.value)} placeholder="(313) 555-0100"/></Field></FGrid>
      <FGrid><Field label="Project Type"><select style={S.input} value={form.type} onChange={e=>f("type",e.target.value)}><option>New Build</option><option>Redesign</option></select></Field><Field label="Status"><select style={S.input} value={form.status} onChange={e=>f("status",e.target.value)}>{PROJ_STATUSES.map(s=><option key={s}>{s}</option>)}</select></Field></FGrid>
      <FGrid><Field label="Monthly Plan"><select style={S.input} value={form.plan} onChange={e=>f("plan",e.target.value)}>{PLANS.map(p=><option key={p}>{p}</option>)}</select></Field><Field label="Pages"><select style={S.input} value={form.pages} onChange={e=>f("pages",e.target.value)}><option>1–3</option><option>4–5</option><option>6–10</option><option>10+</option></select></Field></FGrid>
      <FGrid><Field label="Domain"><input style={S.input} value={form.domain} onChange={e=>f("domain",e.target.value)} placeholder="apexbarbershop.com"/></Field><Field label="Live URL"><input style={S.input} value={form.liveUrl} onChange={e=>f("liveUrl",e.target.value)} placeholder="https://apexbarbershop.com"/></Field></FGrid>
      <FGrid cols={3}>
        <Field label="Budget ($)"><input style={S.input} type="number" value={form.budget} onChange={e=>f("budget",e.target.value)} placeholder="900"/></Field>
        <Field label="Deposit Amount ($)"><input style={S.input} type="number" value={form.depositAmount} onChange={e=>f("depositAmount",e.target.value)} placeholder="450"/></Field>
        <Field label="Final Amount ($)"><input style={S.input} type="number" value={form.finalAmount} onChange={e=>f("finalAmount",e.target.value)} placeholder="450"/></Field>
      </FGrid>
      <div style={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 14px",marginBottom:12,display:"flex",gap:24}}>
        <label style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",fontSize:12,color:C.fg}}><input type="checkbox" checked={form.depositPaid} onChange={e=>f("depositPaid",e.target.checked)}/><span>Deposit Paid ✓</span></label>
        <label style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",fontSize:12,color:C.fg}}><input type="checkbox" checked={form.finalPaid} onChange={e=>f("finalPaid",e.target.checked)}/><span>Final Payment Paid ✓</span></label>
      </div>
      <FGrid cols={3}>
        <Field label="Start Date"><input style={{...S.input,colorScheme:"dark"}} type="date" value={form.startDate} onChange={e=>f("startDate",e.target.value)}/></Field>
        <Field label="Target Launch"><input style={{...S.input,colorScheme:"dark"}} type="date" value={form.targetLaunch} onChange={e=>f("targetLaunch",e.target.value)}/></Field>
        <Field label="Launch Date"><input style={{...S.input,colorScheme:"dark"}} type="date" value={form.launchDate} onChange={e=>f("launchDate",e.target.value)}/></Field>
      </FGrid>
      <FGrid><Field label="Hosting Platform"><select style={S.input} value={form.hosting} onChange={e=>f("hosting",e.target.value)}>{HOSTING.map(h=><option key={h}>{h}</option>)}</select></Field><Field label="Lighthouse Score (0–100)"><input style={S.input} type="number" min="0" max="100" value={form.lighthouse} onChange={e=>f("lighthouse",e.target.value)} placeholder="97"/></Field></FGrid>
      <FGrid><Field label="Repo URL"><input style={S.input} value={form.repoUrl} onChange={e=>f("repoUrl",e.target.value)} placeholder="github.com/3lleven/..."/></Field><Field label="Add-Ons"><input style={S.input} value={form.addons} onChange={e=>f("addons",e.target.value)} placeholder="E-Commerce, Full SEO..."/></Field></FGrid>
      <Field label="Notes" style={{marginBottom:16}}><textarea style={{...S.input,minHeight:60,resize:"vertical"}} value={form.notes} onChange={e=>f("notes",e.target.value)} placeholder="Project notes, special requirements, client quirks..."/></Field>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        {form.id?<button onClick={onDelete} style={{...S.btn(C.red)}}>Delete</button>:<span/>}
        <div style={{display:"flex",gap:8}}><button onClick={onClose} style={S.btn(C.muted2)}>Cancel</button><button onClick={onSave} style={S.btnSolid()}>{form.id?"Save Changes":"Add Project"}</button></div>
      </div>
    </div>
  );
}

// ── PROJECTS TAB ───────────────────────────────────────────────────────
function ProjectsTab({projects, saveProjects, leads, showToast, setModal}) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const visible = useMemo(()=>projects.filter(p=>{
    const ms=filter==="All"||p.status===filter;
    const mq=!search||(p.businessName||p.clientName||"").toLowerCase().includes(search.toLowerCase())||(p.domain||"").toLowerCase().includes(search.toLowerCase());
    return ms&&mq;
  }),[projects,filter,search]);

  const totalBudget = useMemo(()=>projects.reduce((s,p)=>s+(Number(p.budget)||0),0),[projects]);
  const totalCollected = useMemo(()=>projects.reduce((s,p)=>{
    let c=0;
    if(p.depositPaid) c+=Number(p.depositAmount)||0;
    if(p.finalPaid) c+=Number(p.finalAmount)||0;
    return s+c;
  },0),[projects]);
  const mrr = useMemo(()=>projects.filter(p=>p.status==="Launched"&&p.plan!=="None").reduce((s,p)=>s+(PLAN_PRICE[p.plan]||0),0),[projects]);

  function saveProject(form) {
    const next = form.id?projects.map(p=>p.id===form.id?{...form}:p):[{...form,id:uid()},...projects];
    saveProjects(next); showToast(form.id?"Project updated":"Project added");
  }
  function deleteProject(id) { saveProjects(projects.filter(p=>p.id!==id)); showToast("Project removed","warn"); }
  function openAdd() { setModal({type:"project",data:{...EP,startDate:todayStr()}}); }
  function openEdit(proj) { setModal({type:"project",data:{...proj}}); }

  return (
    <div style={{display:"flex",flexDirection:"column",flex:1,overflow:"hidden"}}>
      <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Plus Jakarta Sans',monospace",fontSize:8,color:C.accent,letterSpacing:"2px",textTransform:"uppercase"}}>// Projects</div>
          <div style={{fontSize:14,fontWeight:700,color:C.fg,letterSpacing:"-.03em"}}>Client Sites</div>
        </div>
        <button onClick={openAdd} style={{...S.btnSolid(),padding:"6px 14px",display:"flex",alignItems:"center",gap:6}}><Plus size={13}/> Add Project</button>
      </div>

      <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        {[{l:"Total Budget",v:fmt$(totalBudget),c:C.fg},{l:"Collected",v:fmt$(totalCollected),c:C.green},{l:"MRR",v:fmt$(mrr),c:C.accent},{l:"Launched",v:projects.filter(p=>p.status==="Launched").length,c:C.green},{l:"In Progress",v:projects.filter(p=>["Kickoff","Design","Development","Review"].includes(p.status)).length,c:C.blue}].map(s=>(
          <div key={s.l} style={{flex:1,padding:"10px 14px",borderRight:`1px solid ${C.border}`}}>
            <div style={{fontSize:8,fontFamily:"'Plus Jakarta Sans',monospace",letterSpacing:"1.5px",textTransform:"uppercase",color:C.muted2,marginBottom:3}}>{s.l}</div>
            <div style={{fontSize:16,fontWeight:700,color:s.c}}>{s.v}</div>
          </div>
        ))}
      </div>

      <div style={{padding:"12px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:8,flexShrink:0}}>
        <div style={{position:"relative",flex:1,maxWidth:240}}>
          <Search size={12} style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:C.muted2,pointerEvents:"none"}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{...S.input,paddingLeft:28}}/>
        </div>
        <select value={filter} onChange={e=>setFilter(e.target.value)} style={{...S.input,width:130}}>
          <option value="All">All statuses</option>
          {PROJ_STATUSES.map(s=><option key={s}>{s}</option>)}
        </select>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"14px 20px"}}>
        {visible.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:C.muted2,fontSize:12}}>No projects yet. Click "Add Project" to get started.</div>}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {visible.map(p=>{
            const dot=PROJ_DOT[p.status];
            const collected=(p.depositPaid?(Number(p.depositAmount)||0):0)+(p.finalPaid?(Number(p.finalAmount)||0):0);
            const pct=p.budget?Math.round(collected/(Number(p.budget)||1)*100):0;
            const tl=p.targetLaunch?daysUntil(p.targetLaunch):null;
            return (
              <div key={p.id} style={{background:C.surface,border:`1px solid ${C.border}`,borderLeft:`2px solid ${dot}`,borderRadius:10,padding:"14px 16px"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:12}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                      <span style={{fontSize:13,fontWeight:700,color:C.fg}}>{p.businessName||p.clientName}</span>
                      <span style={S.pill(dot)}>{p.status}</span>
                      {p.plan!=="None"&&<span style={S.pill(C.accent2)}>{p.plan.split("—")[0].trim()}</span>}
                    </div>
                    <div style={{fontSize:11,color:C.muted2}}>{[p.clientName!==p.businessName?p.clientName:null,p.domain,p.type].filter(Boolean).join(" · ")}</div>
                  </div>
                  <div style={{display:"flex",gap:6,flexShrink:0}}>
                    {p.liveUrl&&<a href={p.liveUrl} target="_blank" rel="noreferrer" style={{...S.btn(C.muted),padding:"4px 8px",display:"flex",alignItems:"center",gap:4,textDecoration:"none"}}><ExternalLink size={11}/>Live</a>}
                    <button onClick={()=>openEdit(p)} style={{...S.btn(C.muted2),padding:"4px 8px"}}><Pencil size={11}/></button>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
                  <div><div style={{fontSize:8,fontFamily:"'Plus Jakarta Sans',monospace",letterSpacing:"1.5px",textTransform:"uppercase",color:C.muted2,marginBottom:2}}>Budget</div><div style={{fontSize:12,color:C.fg,fontWeight:600}}>{fmt$(p.budget)}</div></div>
                  <div>
                    <div style={{fontSize:8,fontFamily:"'Plus Jakarta Sans',monospace",letterSpacing:"1.5px",textTransform:"uppercase",color:C.muted2,marginBottom:2}}>Collected</div>
                    <div style={{fontSize:12,color:C.green,fontWeight:600}}>{fmt$(collected)} <span style={{color:C.muted2,fontWeight:400,fontSize:10}}>({pct}%)</span></div>
                    <div style={{marginTop:4,height:3,background:C.surface3,borderRadius:2}}><div style={{height:"100%",width:`${Math.min(pct,100)}%`,background:C.green,borderRadius:2,transition:"width .3s"}}/></div>
                  </div>
                  <div><div style={{fontSize:8,fontFamily:"'Plus Jakarta Sans',monospace",letterSpacing:"1.5px",textTransform:"uppercase",color:C.muted2,marginBottom:2}}>Target Launch</div><div style={{fontSize:12,color:tl?.overdue?C.red:C.fg,fontWeight:600}}>{fmtDate(p.targetLaunch)}</div></div>
                  <div><div style={{fontSize:8,fontFamily:"'Plus Jakarta Sans',monospace",letterSpacing:"1.5px",textTransform:"uppercase",color:C.muted2,marginBottom:2}}>Lighthouse</div><div style={{fontSize:12,color:Number(p.lighthouse)>=95?C.green:Number(p.lighthouse)>=80?C.yellow:C.muted,fontWeight:600}}>{p.lighthouse||"—"}{p.lighthouse&&"/100"}</div></div>
                </div>
                {p.notes&&<div style={{marginTop:10,fontSize:10,color:C.muted2,borderTop:`1px solid ${C.border}`,paddingTop:8,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.notes}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── PAYMENT FORM ───────────────────────────────────────────────────────
function PaymentForm({form, setForm, onSave, onDelete, onClose, projects}) {
  const f = (k,v) => setForm(p=>({...p,[k]:v}));
  return (
    <div>
      <FGrid>
        <Field label="Client Name *"><input style={S.input} value={form.clientName} onChange={e=>f("clientName",e.target.value)} placeholder="Jane Smith"/></Field>
        <Field label="Link to Project">
          <select style={S.input} value={form.projectId} onChange={e=>{const p=projects.find(x=>x.id===e.target.value); f("projectId",e.target.value); if(p&&!form.clientName) f("clientName",p.clientName);}}>
            <option value="">— None —</option>
            {projects.map(p=><option key={p.id} value={p.id}>{p.businessName||p.clientName}</option>)}
          </select>
        </Field>
      </FGrid>
      <FGrid>
        <Field label="Payment Type"><select style={S.input} value={form.type} onChange={e=>f("type",e.target.value)}>{PAY_TYPES.map(t=><option key={t}>{t}</option>)}</select></Field>
        <Field label="Status"><select style={S.input} value={form.status} onChange={e=>f("status",e.target.value)}>{PAY_STATUSES.map(s=><option key={s}>{s}</option>)}</select></Field>
      </FGrid>
      <FGrid>
        <Field label="Amount ($) *"><input style={S.input} type="number" value={form.amount} onChange={e=>f("amount",e.target.value)} placeholder="450"/></Field>
        <Field label="Payment Method"><select style={S.input} value={form.method} onChange={e=>f("method",e.target.value)}>{METHODS.map(m=><option key={m}>{m}</option>)}</select></Field>
      </FGrid>
      <FGrid>
        <Field label="Due Date"><input style={{...S.input,colorScheme:"dark"}} type="date" value={form.dueDate} onChange={e=>f("dueDate",e.target.value)}/></Field>
        <Field label="Date Paid"><input style={{...S.input,colorScheme:"dark"}} type="date" value={form.paidDate} onChange={e=>f("paidDate",e.target.value)}/></Field>
      </FGrid>
      <Field label="Description / Notes" style={{marginBottom:16}}><input style={S.input} value={form.description} onChange={e=>f("description",e.target.value)} placeholder="Deposit for Apex Barbershop new build..."/></Field>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        {form.id?<button onClick={onDelete} style={S.btn(C.red)}>Delete</button>:<span/>}
        <div style={{display:"flex",gap:8}}><button onClick={onClose} style={S.btn(C.muted2)}>Cancel</button><button onClick={onSave} style={S.btnSolid()}>{form.id?"Save Changes":"Add Payment"}</button></div>
      </div>
    </div>
  );
}

// ── PAYMENTS TAB ───────────────────────────────────────────────────────
function PaymentsTab({payments, savePayments, projects, showToast, setModal}) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const visible = useMemo(()=>payments.filter(p=>{
    const ms=filter==="All"||p.status===filter;
    const mq=!search||(p.clientName||"").toLowerCase().includes(search.toLowerCase())||(p.description||"").toLowerCase().includes(search.toLowerCase());
    return ms&&mq;
  }).sort((a,b)=>{
    const da=a.paidDate||a.dueDate||""; const db=b.paidDate||b.dueDate||"";
    return db.localeCompare(da);
  }),[payments,filter,search]);

  const totalPaid = useMemo(()=>payments.filter(p=>p.status==="Paid").reduce((s,p)=>s+(Number(p.amount)||0),0),[payments]);
  const pending = useMemo(()=>payments.filter(p=>p.status==="Pending").reduce((s,p)=>s+(Number(p.amount)||0),0),[payments]);
  const overdue = useMemo(()=>payments.filter(p=>p.status==="Overdue").reduce((s,p)=>s+(Number(p.amount)||0),0),[payments]);
  const mrr = useMemo(()=>projects.filter(p=>p.status==="Launched"&&p.plan!=="None").reduce((s,p)=>s+(PLAN_PRICE[p.plan]||0),0),[projects]);

  function savePayment(form) {
    const next=form.id?payments.map(p=>p.id===form.id?{...form}:p):[{...form,id:uid()},...payments];
    savePayments(next); showToast(form.id?"Payment updated":"Payment added");
  }
  function deletePayment(id) { savePayments(payments.filter(p=>p.id!==id)); showToast("Payment removed","warn"); }
  function openAdd() { setModal({type:"payment",data:{...EPY}}); }
  function openEdit(pay) { setModal({type:"payment",data:{...pay}}); }

  return (
    <div style={{display:"flex",flexDirection:"column",flex:1,overflow:"hidden"}}>
      <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Plus Jakarta Sans',monospace",fontSize:8,color:C.accent,letterSpacing:"2px",textTransform:"uppercase"}}>// Payments</div>
          <div style={{fontSize:14,fontWeight:700,color:C.fg,letterSpacing:"-.03em"}}>Revenue Tracker</div>
        </div>
        <button onClick={openAdd} style={{...S.btnSolid(),padding:"6px 14px",display:"flex",alignItems:"center",gap:6}}><Plus size={13}/> Log Payment</button>
      </div>

      <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        {[{l:"Total Collected",v:fmt$(totalPaid),c:C.green},{l:"MRR",v:fmt$(mrr),c:C.accent},{l:"Pending",v:fmt$(pending),c:C.yellow},{l:"Overdue",v:fmt$(overdue),c:overdue>0?C.red:C.muted2}].map(s=>(
          <div key={s.l} style={{flex:1,padding:"10px 16px",borderRight:`1px solid ${C.border}`}}>
            <div style={{fontSize:8,fontFamily:"'Plus Jakarta Sans',monospace",letterSpacing:"1.5px",textTransform:"uppercase",color:C.muted2,marginBottom:3}}>{s.l}</div>
            <div style={{fontSize:18,fontWeight:700,color:s.c}}>{s.v}</div>
          </div>
        ))}
      </div>

      <div style={{padding:"12px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:8,flexShrink:0}}>
        <div style={{position:"relative",flex:1,maxWidth:240}}>
          <Search size={12} style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:C.muted2,pointerEvents:"none"}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{...S.input,paddingLeft:28}}/>
        </div>
        {["All","Paid","Pending","Overdue"].map(s=><button key={s} onClick={()=>setFilter(s)} style={{...S.btn(s==="Paid"?C.green:s==="Pending"?C.yellow:s==="Overdue"?C.red:C.accent,filter===s?undefined:"transparent"),padding:"5px 12px",fontSize:10}}>{s}</button>)}
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"14px 20px"}}>
        {visible.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:C.muted2,fontSize:12}}>No payments recorded yet. Click "Log Payment" to add one.</div>}
        <div style={{display:"flex",flexDirection:"column",gap:4}}>
          {visible.map(pay=>{
            const sc=PAY_STATUS_COLOR[pay.status]||C.muted;
            return (
              <div key={pay.id} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",display:"grid",gridTemplateColumns:"1fr auto auto auto auto",gap:10,alignItems:"center"}}>
                <div>
                  <div style={{fontSize:12,color:C.fg,fontWeight:600}}>{pay.clientName}</div>
                  <div style={{fontSize:10,color:C.muted2}}>{[pay.type,pay.method,pay.description].filter(Boolean).join(" · ")}</div>
                </div>
                <div style={{fontSize:12,fontFamily:"'Plus Jakarta Sans',monospace",color:C.fg,fontWeight:700}}>{fmt$(pay.amount)}</div>
                <div style={{fontSize:10,color:C.muted2}}>{fmtDate(pay.paidDate||pay.dueDate)}</div>
                <span style={S.pill(sc)}>{pay.status}</span>
                <button onClick={()=>openEdit(pay)} style={{...S.btn(C.muted2),padding:"4px 8px"}}><Pencil size={11}/></button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── SETTINGS TAB ───────────────────────────────────────────────────────
function SettingsTab({savedPw, setSavedPw, leads, projects, payments, saveLeads, saveProjects, savePayments, showToast}) {
  const [newPw, setNewPw] = useState("");
  const [confPw, setConfPw] = useState("");
  const [show, setShow] = useState(false);

  function changePw() {
    if(!newPw) return showToast("Enter a new password","warn");
    if(newPw!==confPw) return showToast("Passwords don't match","error");
    lsSet("dash_password", newPw);
    setSavedPw(newPw); setNewPw(""); setConfPw("");
    showToast("Password updated ✓");
  }

  function clearAll(type) {
    if(!window.confirm(`Delete all ${type}? This cannot be undone.`)) return;
    if(type==="leads") { saveLeads([]); showToast("All leads cleared","warn"); }
    if(type==="projects") { saveProjects([]); showToast("All projects cleared","warn"); }
    if(type==="payments") { savePayments([]); showToast("All payments cleared","warn"); }
  }

  function exportData() {
    const blob = new Blob([JSON.stringify({leads,projects,payments,exportedAt:new Date().toISOString()},null,2)],{type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download="3lleven-dashboard-backup.json"; a.click();
    URL.revokeObjectURL(url);
    showToast("Data exported ✓");
  }

  return (
    <div style={{flex:1,overflowY:"auto",padding:"24px"}}>
      <div style={{marginBottom:20}}>
        <div style={{fontFamily:"'Plus Jakarta Sans',monospace",fontSize:8,color:C.accent,letterSpacing:"2px",textTransform:"uppercase",marginBottom:4}}>// Settings</div>
        <div style={{fontSize:20,fontWeight:700,color:C.fg,letterSpacing:"-.04em"}}>Dashboard Settings</div>
      </div>

      <div style={{maxWidth:480,display:"flex",flexDirection:"column",gap:16}}>
        <div style={S.card}>
          <div style={{fontSize:11,fontWeight:700,color:C.fg,marginBottom:4}}>Change Password</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:16}}>Current default is <span style={{fontFamily:"'Plus Jakarta Sans',monospace",color:C.accent}}>311</span> (your birthday 🎂 — March 11)</div>
          <div style={{display:"grid",gap:10}}>
            <Field label="New Password">
              <div style={{position:"relative"}}>
                <input type={show?"text":"password"} style={{...S.input,paddingRight:36}} value={newPw} onChange={e=>setNewPw(e.target.value)} placeholder="Enter new password"/>
                <button onClick={()=>setShow(s=>!s)} style={{position:"absolute",right:9,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.muted}}>{show?<EyeOff size={13}/>:<Eye size={13}/>}</button>
              </div>
            </Field>
            <Field label="Confirm Password"><input type={show?"text":"password"} style={S.input} value={confPw} onChange={e=>setConfPw(e.target.value)} placeholder="Repeat new password"/></Field>
            <button onClick={changePw} style={{...S.btnSolid(),alignSelf:"flex-start",padding:"7px 18px"}}>Update Password</button>
          </div>
        </div>

        <div style={S.card}>
          <div style={{fontSize:11,fontWeight:700,color:C.fg,marginBottom:14}}>Data Summary</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            {[{l:"Leads",v:leads.length,c:C.blue},{l:"Projects",v:projects.length,c:C.accent},{l:"Payments",v:payments.length,c:C.green}].map(s=>(
              <div key={s.l} style={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",textAlign:"center"}}>
                <div style={{fontSize:18,fontWeight:700,color:s.c}}>{s.v}</div>
                <div style={{fontSize:9,color:C.muted2,fontFamily:"'Plus Jakarta Sans',monospace",letterSpacing:"1px",textTransform:"uppercase"}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={S.card}>
          <div style={{fontSize:11,fontWeight:700,color:C.fg,marginBottom:6}}>Backup &amp; Export</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:14}}>Download all your leads, projects, and payments as a JSON file.</div>
          <button onClick={exportData} style={{...S.btn(C.accent),display:"flex",alignItems:"center",gap:6}}>Export All Data (.json)</button>
        </div>

        <div style={{...S.card,borderColor:`${C.red}30`}}>
          <div style={{fontSize:11,fontWeight:700,color:C.red,marginBottom:6}}>Danger Zone</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:14}}>These actions are permanent and cannot be undone.</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button onClick={()=>clearAll("leads")} style={S.btn(C.red)}>Clear All Leads</button>
            <button onClick={()=>clearAll("projects")} style={S.btn(C.red)}>Clear All Projects</button>
            <button onClick={()=>clearAll("payments")} style={S.btn(C.red)}>Clear All Payments</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────────────
function App() {
  const [loaded, setLoaded]   = useState(false);
  const [authed, setAuthed]   = useState(false);
  const [tab, setTab]         = useState("overview");
  const [leads, setLeads]     = useState([]);
  const [projects, setProjects] = useState([]);
  const [payments, setPayments] = useState([]);
  const [savedPw, setSavedPw] = useState(DEFAULT_PW);
  const [modal, setModal]     = useState(null);
  const [toast, setToast]     = useState(null);
  const [modalForm, setModalForm] = useState(null);

  useEffect(()=>{
    const lr  = lsGet("dash_leads");
    const pr  = lsGet("dash_projects");
    const payr= lsGet("dash_payments");
    const pwd = lsGet("dash_password");
    if(lr)   try { setLeads(JSON.parse(lr)); }    catch(e){}
    if(pr)   try { setProjects(JSON.parse(pr)); } catch(e){}
    if(payr) try { setPayments(JSON.parse(payr));} catch(e){}
    if(pwd)  setSavedPw(pwd);
    setLoaded(true);
  },[]);

  useEffect(()=>{
    if(modal) setModalForm({...modal.data});
    else setModalForm(null);
  },[modal]);

  const saveLeads    = next => { setLeads(next);    lsSet("dash_leads",    JSON.stringify(next)); };
  const saveProjects = next => { setProjects(next); lsSet("dash_projects", JSON.stringify(next)); };
  const savePayments = next => { setPayments(next); lsSet("dash_payments", JSON.stringify(next)); };

  function showToast(msg,type="success") { setToast({msg,type}); setTimeout(()=>setToast(null),2800); }

  function handleConvertToProject(lead) {
    setModal({
      type:"project",
      data:{
        ...EP,
        clientName: lead.contact || lead.business,
        businessName: lead.business,
        email: lead.email || "",
        phone: lead.phone || "",
        budget: lead.value || "",
        startDate: todayStr(),
      }
    });
    setTab("projects");
    showToast(`Opening project form for ${lead.business}`);
  }

  function handleModalSave() {
    if(!modalForm) return;
    if(modal.type==="lead") {
      if(!modalForm.business.trim()) return showToast("Business name required","error");
      const next=modalForm.id?leads.map(l=>l.id===modalForm.id?{...modalForm}:l):[{...modalForm,id:uid(),lastContact:todayStr()},...leads];
      saveLeads(next); showToast(modalForm.id?"Lead updated":"Lead added");
    } else if(modal.type==="project") {
      if(!modalForm.clientName.trim()) return showToast("Client name required","error");
      const next=modalForm.id?projects.map(p=>p.id===modalForm.id?{...modalForm}:p):[{...modalForm,id:uid()},...projects];
      saveProjects(next); showToast(modalForm.id?"Project updated":"Project added");
    } else if(modal.type==="payment") {
      if(!modalForm.clientName.trim()||!modalForm.amount) return showToast("Client name and amount required","error");
      const next=modalForm.id?payments.map(p=>p.id===modalForm.id?{...modalForm}:p):[{...modalForm,id:uid()},...payments];
      savePayments(next); showToast(modalForm.id?"Payment updated":"Payment logged");
    }
    setModal(null);
  }

  function handleModalDelete() {
    if(!modalForm?.id) return;
    if(modal.type==="lead") { saveLeads(leads.filter(l=>l.id!==modalForm.id)); showToast("Lead removed","warn"); }
    else if(modal.type==="project") { saveProjects(projects.filter(p=>p.id!==modalForm.id)); showToast("Project removed","warn"); }
    else if(modal.type==="payment") { savePayments(payments.filter(p=>p.id!==modalForm.id)); showToast("Payment removed","warn"); }
    setModal(null);
  }

  if(!loaded) return <div style={{background:C.bg,height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:C.muted2,fontFamily:"monospace",fontSize:11}}>loading…</div>;
  if(!authed) return <LoginScreen pw={savedPw} onAuth={()=>setAuthed(true)}/>;

  return (
    <div style={{display:"flex",height:"100vh",background:C.bg,fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",color:C.fg,overflow:"hidden"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300&display=swap');*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:4px;height:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:${C.muted2};border-radius:2px;}select option{background:${C.surface3};}input[type=checkbox]{accent-color:${C.accent};}`}</style>
      <Sidebar tab={tab} setTab={setTab} onLogout={()=>setAuthed(false)}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {tab==="overview" && <OverviewTab leads={leads} projects={projects} payments={payments}/>}
        {tab==="leads"    && <LeadsTab leads={leads} saveLeads={saveLeads} showToast={showToast} setModal={setModal} onConvertToProject={handleConvertToProject}/>}
        {tab==="projects" && <ProjectsTab projects={projects} saveProjects={saveProjects} leads={leads} showToast={showToast} setModal={setModal}/>}
        {tab==="payments" && <PaymentsTab payments={payments} savePayments={savePayments} projects={projects} showToast={showToast} setModal={setModal}/>}
        {tab==="settings" && <SettingsTab savedPw={savedPw} setSavedPw={setSavedPw} leads={leads} projects={projects} payments={payments} saveLeads={saveLeads} saveProjects={saveProjects} savePayments={savePayments} showToast={showToast}/>}
      </div>

      {modal && modalForm && (
        <Modal title={modal.type==="lead"?(modalForm.id?"Edit Lead":"New Lead"):modal.type==="project"?(modalForm.id?"Edit Project":"New Project"):(modalForm.id?"Edit Payment":"Log Payment")} onClose={()=>setModal(null)} wide={modal.type==="project"}>
          {modal.type==="lead" && <LeadForm form={modalForm} setForm={setModalForm} onSave={handleModalSave} onDelete={handleModalDelete} onClose={()=>setModal(null)}/>}
          {modal.type==="project" && <ProjectForm form={modalForm} setForm={setModalForm} onSave={handleModalSave} onDelete={handleModalDelete} onClose={()=>setModal(null)}/>}
          {modal.type==="payment" && <PaymentForm form={modalForm} setForm={setModalForm} onSave={handleModalSave} onDelete={handleModalDelete} onClose={()=>setModal(null)} projects={projects}/>}
        </Modal>
      )}
      <Toast toast={toast}/>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App/>);
