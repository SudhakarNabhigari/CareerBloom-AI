import { createContext, useContext, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Route, Switch, Link, Redirect, useLocation, Router as WouterRouter } from 'wouter';
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, BookOpen, BriefcaseBusiness,
  Check, CheckCircle2, ChevronDown, CircleHelp, ClipboardList, CloudUpload, Compass, FileText,
  GraduationCap, LayoutDashboard, LogOut, Menu, MessageCircle, Plus, Search, Settings,
  ShieldCheck, Sparkles, Target, Trash2, Upload, X, Pencil, CalendarDays, Send, LockKeyhole,
  Eye, EyeOff, Clock3, RotateCcw, SlidersHorizontal, CircleCheck, CircleAlert, LoaderCircle,
  WandSparkles, UserRound, ChartNoAxesCombined,
} from 'lucide-react';
import {
  Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useCareerBloom } from '@/hooks/useCareerBloom';
import {
  assessReadiness, blankState, careers, coachReply, getCareer, strengthName, uid,
  type AppState, type Career, type CoachMessage, type Level, type PlannerTask, type Snapshot,
} from '@/data/model';
import '@/index.css';

type Store = ReturnType<typeof useCareerBloom>;
const StateContext = createContext<Store | null>(null);
function useStore(): Store { const context = useContext(StateContext); if (!context) throw new Error('Missing application state'); return context; }
const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/careers', label: 'Career discovery', icon: Compass },
  { href: '/skills', label: 'Skill assessment', icon: Target },
  { href: '/roadmap', label: 'My roadmap', icon: BookOpen },
  { href: '/planner', label: 'Daily planner', icon: ClipboardList },
  { href: '/resume', label: 'Resume analyzer', icon: FileText },
  { href: '/analytics', label: 'Improvement analytics', icon: BarChart3 },
  { href: '/coach', label: 'Career coach', icon: MessageCircle },
];
type Account = { name: string; passwordHash: string; salt: string };

async function passwordDigest(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  if (crypto.subtle) {
    const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: encoder.encode(salt), iterations: 120000, hash: 'SHA-256' }, key, 256);
    return Array.from(new Uint8Array(bits)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  let value = `${salt}:${password}`;
  for (let i = 0; i < 10000; i += 1) value = `${value}:${i}`;
  return btoa(value);
}
function getAccounts(): Account[] {
  try { const value = JSON.parse(localStorage.getItem('career-bloom-accounts') || '[]'); return Array.isArray(value) ? value : []; }
  catch { return []; }
}
function saveAccount(account: Account) {
  const accounts = getAccounts();
  const next = accounts.filter((item) => item.name.toLowerCase() !== account.name.toLowerCase());
  localStorage.setItem('career-bloom-accounts', JSON.stringify([...next, account]));
}
function useNotify() {
  const [message, setMessage] = useState('');
  useEffect(() => { if (!message) return; const id = window.setTimeout(() => setMessage(''), 2800); return () => window.clearTimeout(id); }, [message]);
  return { message, notify: setMessage, Toast: () => message ? <div role="status" className="toast" data-testid="status-notification">{message}</div> : null };
}
function Logo() { return <div className="brand"><span className="brand-mark"><Sparkles size={18} /></span><span>CareerBloom</span></div>; }
function PrimaryButton({ children, onClick, type = 'button', className = '', disabled, ...rest }: { children: ReactNode; onClick?: () => void; type?: 'button' | 'submit'; className?: string; disabled?: boolean; [key: string]: any }) {
  return <button type={type} className={`btn btn-primary ${className}`} onClick={onClick} disabled={disabled} {...rest}>{children}</button>;
}
function EmptyState({ icon: Icon = CircleHelp, title, detail, action }: { icon?: any; title: string; detail: string; action?: React.ReactNode }) {
  return <div className="empty-state"><span className="empty-icon"><Icon size={20} /></span><strong>{title}</strong><div>{detail}</div>{action && <div style={{ marginTop: 15 }}>{action}</div>}</div>;
}
function App() {
  const store = useCareerBloom();
  useEffect(() => { document.title = 'CareerBloom AI · Your career readiness workspace'; }, []);
  return <StateContext.Provider value={store}><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter></StateContext.Provider>;
}
function Router() {
  const { state } = useStore();
  const [path, setPath] = useLocation();
  useEffect(() => {
    if (!state.user && !['/login', '/register'].includes(path)) setPath('/login');
    else if (state.user && !state.careerId && !['/select-career', '/settings'].includes(path)) setPath('/select-career');
    else if (state.user && state.careerId && ['/login', '/register', '/'].includes(path)) setPath('/dashboard');
  }, [state.user, state.careerId, path, setPath]);
  return <Switch>
    <Route path="/"><Redirect to={state.user ? (state.careerId ? '/dashboard' : '/select-career') : '/login'} /></Route>
    <Route path="/login"><AuthPage mode="login" /></Route>
    <Route path="/register"><AuthPage mode="register" /></Route>
    <Route path="/select-career"><CareerSelectPage /></Route>
    <Route path="/dashboard"><WorkspacePage kind="dashboard" /></Route>
    <Route path="/careers"><WorkspacePage kind="careers" /></Route>
    <Route path="/skills"><WorkspacePage kind="skills" /></Route>
    <Route path="/roadmap"><WorkspacePage kind="roadmap" /></Route>
    <Route path="/planner"><WorkspacePage kind="planner" /></Route>
    <Route path="/resume"><WorkspacePage kind="resume" /></Route>
    <Route path="/analytics"><WorkspacePage kind="analytics" /></Route>
    <Route path="/coach"><WorkspacePage kind="coach" /></Route>
    <Route path="/settings"><WorkspacePage kind="settings" /></Route>
    <Route><NotFound /></Route>
  </Switch>;
}
function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { setState } = useStore(); const [, setPath] = useLocation();
  const [name, setName] = useState(''); const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const register = mode === 'register';
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    const cleanName = name.trim();
    if (cleanName.length < 2) { setError('Enter a name with at least two characters.'); return; }
    if (password.length < 8) { setError('Use a password with at least 8 characters.'); return; }
    if (register && password !== confirm) { setError('Those passwords do not match. Please check both fields.'); return; }
    setBusy(true);
    try {
      if (register) {
        if (getAccounts().some((account) => account.name.toLowerCase() === cleanName.toLowerCase())) { setError('An account with that name already exists. Try logging in instead.'); return; }
        const salt = Array.from(crypto.getRandomValues(new Uint8Array(16))).map((byte) => byte.toString(16).padStart(2, '0')).join('');
        const passwordHash = await passwordDigest(password, salt); const account = { name: cleanName, salt, passwordHash };
        saveAccount(account); localStorage.setItem('career-bloom-owner', cleanName.toLowerCase());
        setState(() => ({ ...blankState(), user: account }));
        setPath('/select-career');
      } else {
        const account = getAccounts().find((item) => item.name.toLowerCase() === cleanName.toLowerCase());
        if (!account || await passwordDigest(password, account.salt) !== account.passwordHash) { setError('We could not match that name and password. Check your details and try again.'); return; }
        const owner = localStorage.getItem('career-bloom-owner');
        if (owner && owner !== account.name.toLowerCase()) setState(() => ({ ...blankState(), user: account }));
        else setState((old) => ({ ...old, user: account }));
        localStorage.setItem('career-bloom-owner', account.name.toLowerCase()); setPath('/select-career');
      }
    } catch { setError('This browser could not save your demo account. Check local storage permissions and try again.'); }
    finally { setBusy(false); }
  }
  return <main className="auth-page">
    <aside className="auth-aside">
      <Logo />
      <div className="auth-aside-content">
        <p className="eyebrow"><Sparkles size={14} /> A little progress, every day</p>
        <h1>Your next chapter starts with a plan.</h1>
        <p>Make sense of your career goals, build the skills that matter, and see your progress take shape.</p>
        <div className="auth-path" aria-label="How CareerBloom helps">
          <div className="auth-path-step"><span className="auth-path-icon"><Compass size={16} /></span><span><strong>Choose a direction</strong><small>Find a role that feels right</small></span></div>
          <div className="auth-path-step"><span className="auth-path-icon auth-path-blue"><Target size={16} /></span><span><strong>Build the right skills</strong><small>Focus on what moves you forward</small></span></div>
          <div className="auth-path-step"><span className="auth-path-icon auth-path-green"><Activity size={16} /></span><span><strong>See your progress</strong><small>Make every small step count</small></span></div>
        </div>
      </div>
      <div className="auth-note">A private, browser-only workspace for your career journey.</div>
    </aside>
    <section className="auth-main"><form className="auth-form" onSubmit={submit} data-testid={`form-${mode}`}>
      <p className="eyebrow">{register ? 'Create your workspace' : 'Welcome back'}</p><h2>{register ? 'Start with your name' : 'Sign in to CareerBloom'}</h2>
      <p className="lead">{register ? 'Your roadmap will grow around the role you want.' : 'Pick up where your preparation left off.'}</p>
      {error && <div className="alert alert-error" role="alert" data-testid="status-auth-error">{error}</div>}
      <div className="field"><label htmlFor="auth-name">{register ? 'Full name' : 'Name or username'}</label><input id="auth-name" className="input" autoComplete="username" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Maya Chen" data-testid="input-auth-name" /></div>
      <div className="field"><label htmlFor="auth-password">Password</label><div style={{ position: 'relative' }}><input id="auth-password" className="input" type={showPassword ? 'text' : 'password'} autoComplete={register ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" data-testid="input-auth-password" /><button type="button" className="icon-btn" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} data-testid="button-toggle-password" style={{ position: 'absolute', right: 7, top: 6, border: 0 }}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></div>
      {register && <div className="field"><label htmlFor="auth-confirm">Confirm password</label><input id="auth-confirm" className="input" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="Enter it one more time" data-testid="input-confirm-password" /></div>}
      <PrimaryButton type="submit" disabled={busy} className="" data-testid={`button-${mode}-submit`}>{busy ? 'Please wait…' : register ? 'Create demo account' : 'Log in'} <ArrowRight size={16} /></PrimaryButton>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 20 }}>{register ? 'Already have a demo account?' : 'New to CareerBloom?'} <Link className="inline-link" href={register ? '/login' : '/register'} data-testid="link-auth-switch">{register ? 'Log in' : 'Create an account'}</Link></p>
      <div className="security-note"><ShieldCheck size={16} /><span>Demo-only sign-in. Passwords are hashed in this browser; local storage is not secure authentication. Do not use a password you use elsewhere.</span></div>
    </form></section>
  </main>;
}
function CareerSelectPage() {
  const { state, setState } = useStore(); const [, setPath] = useLocation(); const { notify, Toast } = useNotify();
  const [query, setQuery] = useState(''); const [searched, setSearched] = useState(false); const [selected, setSelected] = useState('');
  const filtered = useMemo(() => careers.filter((career) => career.title.toLowerCase().includes(query.trim().toLowerCase()) || career.category.toLowerCase().includes(query.trim().toLowerCase())), [query]);
  if (!state.user) return <AuthPage mode="login" />;
  function choose() { if (!selected) { notify('Choose a career to build your roadmap.'); return; } setState((old) => ({ ...old, careerId: selected, skillLevels: {}, roadmapDone: [], assessmentHistory: [], resumeAnalysis: null })); setPath('/dashboard'); }
  return <main className="page fade-in" style={{ maxWidth: 1120, paddingTop: 36 }}>
    <Logo />
    <div style={{ margin: '48px 0 26px' }}><p className="eyebrow">Your path begins here</p><h1>Welcome to CareerBloom, {state.user.name}!</h1><p className="lead">First, choose a direction. You can explore other roles and switch any time.</p></div>
    <section className="card" style={{ padding: 27 }}>
      <div className="page-heading"><div><p className="eyebrow">Step 1 of 1</p><h2>Select Your Dream Career</h2><p className="lead">Explore a role that feels right. Your skills and roadmap will adapt to it.</p></div></div>
      <form className="search-row" onSubmit={(event) => { event.preventDefault(); setSearched(true); }}><div className="search-wrap"><Search size={17} /><input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search roles or categories" aria-label="Search careers" data-testid="input-career-search" /></div><PrimaryButton type="submit" data-testid="button-career-search">Search</PrimaryButton></form>
      {searched && !query.trim() && <p className="alert alert-error" style={{ marginTop: 12, marginBottom: 0 }}>Type a role or category to search, or browse all careers below.</p>}
      <div className="grid grid-3" style={{ marginTop: 20 }}>
        {filtered.map((career) => <button type="button" key={career.id} onClick={() => setSelected(career.id)} className={`card career-card ${selected === career.id ? 'selected' : ''}`} data-testid={`card-onboarding-career-${career.id}`} aria-pressed={selected === career.id} style={{ textAlign: 'left', cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><span className="badge badge-lavender">{career.category}</span>{selected === career.id && <CheckCircle2 size={19} color="#7165c6" />}</div><h3 style={{ margin: '3px 0 0' }}>{career.title}</h3><p className="lead" style={{ fontSize: 12, margin: 0 }}>{career.description}</p><div className="skill-pills">{career.skills.slice(0, 3).map((skill) => <span className="skill-pill" key={skill.name}>{skill.name}</span>)}</div>
        </button>)}
      </div>
      {filtered.length === 0 && <div style={{ marginTop: 20 }}><EmptyState icon={Search} title="No matching roles yet" detail="Try another title, or search a broader category such as Design, AI & Data, or Cloud." /></div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, gap: 15 }}><span style={{ fontSize: 12, color: 'var(--muted)' }}>{selected ? `Selected: ${getCareer(selected).title}` : 'Select a role to see your starting point.'}</span><PrimaryButton onClick={choose} data-testid="button-build-roadmap">Build my roadmap <ArrowRight size={16} /></PrimaryButton></div>
    </section><Toast />
  </main>;
}
function WorkspacePage({ kind }: { kind: string }) {
  const { state, setState } = useStore();
  if (!state.user) return null;
  if (!state.careerId && kind !== 'settings') return null;
  const [, setPath] = useLocation(); const [mobileOpen, setMobileOpen] = useState(false);
  const career = getCareer(state.careerId);
  const title = navItems.find((item) => item.href === `/${kind}`)?.label || (kind === 'settings' ? 'Settings' : 'Overview');
  return <div className="app-shell">
    <div className={`menu-overlay ${mobileOpen ? 'visible' : ''}`} onClick={() => setMobileOpen(false)} aria-hidden="true" />
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`} aria-label="Main navigation">
      <Logo /><div className="nav-label">Workspace</div>
      {navItems.map((item) => <Link href={item.href} key={item.href} className={`nav-link ${kind === item.href.slice(1) ? 'active' : ''}`} onClick={() => setMobileOpen(false)} data-testid={`link-nav-${item.href.slice(1)}`}><item.icon size={17} strokeWidth={1.9} /><span>{item.label}</span></Link>)}
      <div className="nav-label" style={{ marginTop: 12 }}>Account</div><Link href="/settings" className={`nav-link ${kind === 'settings' ? 'active' : ''}`} onClick={() => setMobileOpen(false)} data-testid="link-nav-settings"><Settings size={17} /><span>Settings</span></Link>
      <div className="side-bottom"><div className="card" style={{ padding: 14, background: '#f9f8fe', borderColor: '#eeecf7', marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7 }}>Your focus</div><div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.4 }}>{career.title}</div><button className="btn btn-ghost btn-small" style={{ paddingLeft: 0, marginTop: 5 }} onClick={() => setPath('/careers')} data-testid="button-switch-career">Switch career <ArrowRight size={13} /></button>
      </div><div className="user-chip"><div className="avatar" aria-hidden="true">{state.user.name.slice(0, 1).toUpperCase()}</div><div style={{ flex: 1, minWidth: 0 }}><div className="user-name">{state.user.name}</div><div className="user-caption">Career explorer</div></div><button className="icon-btn" aria-label="Log out" onClick={() => { setState((old) => ({ ...old, user: null })); setPath('/login'); }} data-testid="button-logout"><LogOut size={15} /></button></div></div>
    </aside>
    <div className="main-area"><header className="topbar"><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><button className="icon-btn menu-toggle" aria-label="Open navigation menu" onClick={() => setMobileOpen(true)} data-testid="button-mobile-menu"><Menu size={18} /></button><div className="mobile-brand"><span className="brand-mark" style={{ width: 27, height: 27, borderRadius: 9 }}><Sparkles size={14} /></span>CareerBloom</div><span className="topbar-title">{title}</span></div><div className="topbar-right"><span className="badge badge-lavender"><BriefcaseBusiness size={12} style={{ marginRight: 5 }} />{career.title}</span><Link href="/settings" className="icon-btn" aria-label="Open settings" data-testid="link-settings-top"><Settings size={16} /></Link></div></header>
      <main className="page fade-in"><Screen kind={kind} /></main>
    </div>
  </div>;
}
function Screen({ kind }: { kind: string }) {
  if (kind === 'dashboard') return <Dashboard />;
  if (kind === 'careers') return <CareerDiscovery />;
  if (kind === 'skills') return <SkillsPage />;
  if (kind === 'roadmap') return <RoadmapPage />;
  if (kind === 'planner') return <PlannerPage />;
  if (kind === 'resume') return <ResumePage />;
  if (kind === 'analytics') return <AnalyticsPage />;
  if (kind === 'coach') return <CoachPage />;
  if (kind === 'settings') return <SettingsPage />;
  return <NotFound />;
}
function PageHeading({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail: string; action?: ReactNode }) {
  return <div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="lead">{detail}</p></div>{action}</div>;
}
function SkillRecommendation({ career, levels }: { career: Career; levels: Record<string, number> }) {
  const weakest = career.skills.slice().sort((a, b) => (levels[a.name] || 0) - (levels[b.name] || 0))[0];
  return <div className="notice"><strong>Try this next:</strong> spend one short session on {weakest.name} — {weakest.topic.toLowerCase()}.</div>;
}
function Dashboard() {
  const { state } = useStore(); const career = getCareer(state.careerId); const [, setPath] = useLocation();
  const readiness = assessReadiness(career, state.skillLevels);
  const done = career.roadmap.filter((item) => state.roadmapDone.includes(item.title)).length;
  const next = career.roadmap.find((item) => !state.roadmapDone.includes(item.title));
  const today = new Date().toISOString().slice(0, 10);
  const tasksToday = state.plannerTasks.filter((task) => !task.completed && task.dueDate === today);
  const tasksDone = state.plannerTasks.filter((task) => task.completed).length;
  const history = state.assessmentHistory.slice(-8).map((snapshot, index) => ({ name: `Check-in ${index + 1}`, value: snapshot.average }));
  return <div className="dashboard-v2">
    <section className="dashboard-welcome">
      <div>
        <p className="eyebrow dash-eyebrow"><Sparkles size={14} /> Your career workspace</p>
        <h1>Welcome back, {state.user?.name}!</h1>
        <p className="lead">You're exploring a path toward <strong>{career.title}</strong>. Start small, stay curious, and let your progress build.</p>
      </div>
      <button className="btn btn-secondary" onClick={() => setPath('/careers')} data-testid="button-dashboard-change-career"><Compass size={15} /> Explore roles <ArrowRight size={14} /></button>
    </section>

    <section className="dash-overview-strip" aria-label="Your progress at a glance">
      <div className="dash-alignment-block">
        <div className="dash-ring" role="img" aria-label={`${readiness}% self-assessed alignment`} style={{ background: `conic-gradient(#7771cf ${readiness}%, #e9e8f4 0)` }}>
          <div className="dash-ring-label"><strong data-testid="text-readiness-value">{readiness}%</strong><span>aligned</span></div>
        </div>
        <div className="dash-alignment-copy">
          <span className="dash-stat-label">Self-assessed alignment</span>
          <strong>{readiness > 0 ? 'Your check-in is recorded.' : 'A first rating is still ahead.'}</strong>
          <button className="dash-text-link" onClick={() => setPath('/skills')} data-testid="button-start-assessment">{readiness > 0 ? 'Update your check-in' : 'Start your check-in'} <ArrowRight size={14} /></button>
        </div>
      </div>
      <div className="dash-stat-block">
        <span className="dash-stat-icon dash-icon-lavender"><BookOpen size={17} /></span>
        <div className="dash-stat-content"><span className="dash-stat-label">Roadmap milestones</span><strong data-testid="text-roadmap-progress">{done}<small> / {career.roadmap.length}</small></strong><span className="dash-stat-foot">{done ? `${done} completed so far` : 'A four-step path, ready when you are'}</span></div>
      </div>
      <div className="dash-stat-block">
        <span className="dash-stat-icon dash-icon-blue"><CheckCircle2 size={17} /></span>
        <div className="dash-stat-content"><span className="dash-stat-label">Planner tasks done</span><strong data-testid="text-task-progress">{tasksDone}<small> / {state.plannerTasks.length}</small></strong><span className="dash-stat-foot">{state.plannerTasks.length ? `${state.plannerTasks.length - tasksDone} open task${state.plannerTasks.length - tasksDone === 1 ? '' : 's'} in your planner` : 'Your planner is ready for a first task'}</span></div>
      </div>
    </section>

    <div className="dash-content-grid">
      <div className="dash-main-column">
        <section className="dash-next-card">
          <div className="dash-next-topline">
            <span className="dash-section-label"><span className="dash-spark-icon"><Sparkles size={13} /></span> A useful next step</span>
            <span className="dash-week-badge"><span /> {next ? `WEEK ${String(next.week).padStart(2, '0')}` : 'ROADMAP COMPLETE'}</span>
          </div>
          <div className="dash-next-body">
            <div className="dash-next-copy">
              <h2>{next ? next.title : 'Your roadmap is complete.'}</h2>
              {next ? <p>{next.project}</p> : <p>Review your skills and choose a new goal to keep moving forward.</p>}
              {next && <div className="dash-chip-row">{next.skills.map((skill) => <span className="dash-skill-chip" key={skill}>{skill}</span>)}<span className="dash-skill-chip dash-hours-chip"><Clock3 size={12} /> {next.hours} hours</span></div>}
              <button className="btn btn-primary" onClick={() => setPath(next ? '/roadmap' : '/skills')} data-testid="button-open-next-milestone">{next ? 'Open roadmap' : 'Review skills'} <ArrowRight size={15} /></button>
            </div>
            <div className="dash-foundation-art" aria-hidden="true">
              <div className="dash-orbit dash-orbit-one" /><div className="dash-orbit dash-orbit-two" /><div className="dash-orbit dash-orbit-three" />
              <div className="dash-art-center"><BookOpen size={27} strokeWidth={1.6} /></div>
              <span className="dash-art-dot dash-art-dot-one" /><span className="dash-art-dot dash-art-dot-two" /><span className="dash-art-dot dash-art-dot-three" />
              <span className="dash-art-note">START<br />WITH ONE</span>
            </div>
          </div>
          <div className="dash-next-foot"><span><span className="dash-foot-dot" />{done ? `${done} of ${career.roadmap.length} milestones complete` : 'No milestones started yet'}</span><button onClick={() => setPath('/roadmap')} data-testid="link-dashboard-roadmap">View all {career.roadmap.length} steps <ArrowRight size={13} /></button></div>
        </section>

        <section className="dash-panel dash-assessment-panel">
          <div className="dash-panel-heading">
            <div><span className="dash-section-label">Your progress, over time</span><h2>Assessment check-ins</h2></div>
            <Link className="btn btn-ghost btn-small" href="/analytics" data-testid="link-dashboard-analytics">See analytics <ArrowRight size={14} /></Link>
          </div>
          {history.length ? <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={history}><defs><linearGradient id="dashProgress" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8378d1" stopOpacity={0.22} /><stop offset="95%" stopColor="#8378d1" stopOpacity={0.01} /></linearGradient></defs><CartesianGrid stroke="#efeff5" vertical={false} /><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#888da0' }} /><YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#888da0' }} /><Tooltip /><Area type="monotone" dataKey="value" name="Alignment" stroke="#786bc7" strokeWidth={2} fill="url(#dashProgress)" /></AreaChart></ResponsiveContainer></div> : <EmptyState icon={Activity} title="Your story starts with a check-in" detail="Rate your skills when you're ready. Your real progress will appear here over time." action={<button className="btn btn-secondary btn-small" onClick={() => setPath('/skills')} data-testid="button-start-assessment-empty">Assess my skills <ArrowRight size={13} /></button>} />}
        </section>
      </div>

      <aside className="dash-side-column">
        <section className="dash-panel dash-skills-panel">
          <div className="dash-panel-heading dash-skills-heading"><div><span className="dash-section-label">Your role, in focus</span><h2>Skill picture</h2></div><span className="dash-count-pill">{String(career.skills.length).padStart(2, '0')} skills</span></div>
          <div className="dash-skill-list">{career.skills.map((skill, index) => {
            const level = state.skillLevels[skill.name] || 0;
            return <div className="dash-skill-row" key={skill.name}>
              <span className={`dash-skill-index dash-index-${index + 1}`}>{String(index + 1).padStart(2, '0')}</span>
              <div className="dash-skill-info"><strong>{skill.name}</strong><div className="dash-skill-track"><span style={{ width: `${Math.min(level / skill.targetLevel, 1) * 100}%` }} /></div></div>
              <span className="dash-skill-level">{strengthName(level)}</span>
            </div>;
          })}</div>
          <button className="btn btn-secondary btn-small dash-ratings-button" onClick={() => setPath('/skills')} data-testid="button-dashboard-skills">Update self-ratings <ArrowRight size={14} /></button>
        </section>

        <section className="dash-panel dash-tasks-panel">
          <div className="dash-panel-heading dash-tasks-heading"><div><span className="dash-section-label">Make a little room</span><h2>Today's tasks</h2></div><span className="dash-calendar-icon"><CalendarDays size={17} /></span></div>
          {tasksToday.length ? <div className="dash-task-list">{tasksToday.slice(0, 3).map((task) => <div className="dash-task-row" key={task.id}><span className={`badge ${task.priority === 'High' ? 'badge-red' : task.priority === 'Medium' ? 'badge-amber' : 'badge-green'}`}>{task.priority}</span><span className="dash-task-title">{task.title}</span></div>)}</div> : <p className="dash-tasks-note"><Sparkles size={13} /> Nothing due today. That's a good place to begin.</p>}
          <button className="btn btn-secondary btn-small dash-planner-button" onClick={() => setPath('/planner')} data-testid="button-dashboard-planner">Open planner <ArrowRight size={14} /></button>
        </section>

        <section className="dash-support-card">
          <span className="dash-support-icon"><MessageCircle size={18} /></span>
          <div className="dash-support-copy"><span className="dash-section-label">A little support</span><h3>Not sure where to start?</h3><p>Get a role-aware suggestion, grounded in your own reflections.</p></div>
          <button className="dash-support-action" onClick={() => setPath('/coach')} aria-label="Talk it through" data-testid="button-dashboard-coach"><ArrowRight size={16} /></button>
        </section>
      </aside>
    </div>

    <footer className="dash-footer-note"><span className="dash-footer-spark"><Sparkles size={14} /></span><SkillRecommendation career={career} levels={state.skillLevels} /><button onClick={() => setPath('/skills')} data-testid="button-dashboard-next-focus">Choose a starting point <ArrowRight size={14} /></button></footer>
  </div>;
}
function CareerDiscovery() {
  const { state, setState } = useStore(); const [query, setQuery] = useState(''); const [category, setCategory] = useState('All'); const [selected, setSelected] = useState(state.careerId || ''); const [, setPath] = useLocation(); const { notify, Toast } = useNotify();
  const categories = ['All', ...Array.from(new Set(careers.map((career) => career.category)))];
  const filtered = careers.filter((career) => (category === 'All' || career.category === category) && `${career.title} ${career.description} ${career.category}`.toLowerCase().includes(query.toLowerCase()));
  function switchCareer() {
    if (!selected || selected === state.careerId) { if (selected === state.careerId) { notify('This is already your selected career.'); return; } notify('Choose a career before switching.'); return; }
    const oldCareer = getCareer(state.careerId);
    if (state.roadmapDone.length && !window.confirm(`Switch to ${getCareer(selected).title}? Your completed roadmap steps for ${oldCareer.title} will be cleared.`)) return;
    setState((old) => ({ ...old, careerId: selected, skillLevels: {}, roadmapDone: [], assessmentHistory: [], resumeAnalysis: null }));
    notify('Career updated. Your skill assessment and roadmap now match your new role.');
    setPath('/dashboard');
  }
  return <><PageHeading eyebrow="Find your direction" title="Career discovery" detail="Explore realistic role profiles, understand the skills they use, and choose the direction that fits you." action={<span className="badge badge-lavender">Current: {getCareer(state.careerId).title}</span>} />
    <div className="card" style={{ marginBottom: 18 }}><div className="search-row"><div className="search-wrap"><Search size={17} /><input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search roles and skills" aria-label="Search roles" data-testid="input-discovery-search" /></div><select className="select" value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by career category" data-testid="select-career-category" style={{ maxWidth: 210 }}>{categories.map((value) => <option value={value} key={value}>{value === 'All' ? 'All categories' : value}</option>)}</select></div></div>
    <div className="grid grid-3">{filtered.map((career) => <article key={career.id} className={`card career-card ${selected === career.id ? 'selected' : ''}`} data-testid={`card-career-${career.id}`}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span className="badge badge-lavender">{career.category}</span>{career.id === state.careerId && <span className="badge badge-green">Your focus</span>}</div><h3 style={{ margin: '3px 0 0' }}>{career.title}</h3><p className="lead" style={{ fontSize: 12, margin: 0 }}>{career.description}</p><div style={{ fontSize: 11, fontWeight: 700, color: '#747990' }}>Skills in this profile</div><div className="skill-pills">{career.skills.map((skill) => <span className="skill-pill" key={skill.name}>{skill.name} <span style={{ color: '#898da0' }}>· {strengthName(skill.targetLevel)}</span></span>)}</div><button className={`btn ${selected === career.id ? 'btn-secondary' : 'btn-ghost'} btn-small`} style={{ marginTop: 'auto', justifyContent: 'flex-start', paddingLeft: 0 }} onClick={() => setSelected(career.id)} data-testid={`button-choose-career-${career.id}`}>{selected === career.id ? <><Check size={14} /> Selected</> : 'View and select'} <ArrowRight size={13} /></button></article>)}</div>
    {filtered.length === 0 && <div style={{ marginTop: 20 }}><EmptyState icon={Search} title="No roles match that search" detail="Try a different role title or category." /></div>}
    <div className="card" style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 15 }}><div><strong style={{ fontSize: 13 }}>Ready to change direction?</strong><p className="lead" style={{ fontSize: 12, margin: '4px 0 0' }}>Selecting another role resets role-specific ratings and milestones. Your planner tasks stay with you.</p></div><PrimaryButton onClick={switchCareer} data-testid="button-confirm-career">Choose this career <ArrowRight size={15} /></PrimaryButton></div><Toast />
  </>;
}
function recordAssessment(state: AppState, levels: Record<string, Level>, career: Career): Snapshot[] {
  const previous = state.assessmentHistory[state.assessmentHistory.length - 1];
  const improved = previous ? career.skills.filter((skill) => (levels[skill.name] || 0) > (previous.levels[skill.name] || 0)).length : 0;
  const average = assessReadiness(career, levels);
  const last = previous && new Date(previous.at).getTime() > Date.now() - 1800 ? state.assessmentHistory.slice(0, -1) : state.assessmentHistory;
  return [...last, { at: new Date().toISOString(), levels, average, improved }].slice(-40);
}
function SkillsPage() {
  const { state, setState } = useStore(); const career = getCareer(state.careerId); const { notify, Toast } = useNotify();
  const [levels, setLevels] = useState<Record<string, Level>>(state.skillLevels);
  useEffect(() => setLevels(state.skillLevels), [state.skillLevels, career.id]);
  const ratedCount = career.skills.filter((skill) => (levels[skill.name] || 0) > 0).length;
  const strengths = career.skills.filter((skill) => (levels[skill.name] || 0) >= skill.targetLevel);
  const gaps = career.skills.filter((skill) => (levels[skill.name] || 0) < skill.targetLevel);
  function save() { setState((old) => ({ ...old, skillLevels: levels, assessmentHistory: recordAssessment(old, levels, career) })); notify('Self-assessment saved. Your analytics now reflect this check-in.'); }
  function setLevel(name: string, level: Level) { setLevels((old) => ({ ...old, [name]: level })); }
  return <><PageHeading eyebrow="Understand your starting point" title="Skill gap assessment" detail={`Rate each skill for your ${career.title} goal. These are your own reflections—not a test or a guarantee of job readiness.`} action={<PrimaryButton onClick={save} data-testid="button-save-assessment"><Check size={15} /> Save check-in</PrimaryButton>} />
    <div className="grid grid-3" style={{ marginBottom: 18 }}><div className="card"><div className="stat-label">Self-assessed alignment</div><div className="stat-value" style={{ marginTop: 6 }}>{assessReadiness(career, levels)}%</div><div className="stat-label">Average of self-ratings, capped at each role target.</div></div><div className="card"><div className="stat-label">At or above target</div><div className="stat-value" style={{ marginTop: 6 }}>{strengths.length}</div><div className="stat-label">Skills you rated at the configured target.</div></div><div className="card"><div className="stat-label">Still building</div><div className="stat-value" style={{ marginTop: 6 }}>{gaps.length}</div><div className="stat-label">A learning opportunity, not a pass/fail result.</div></div></div>
    <section className="card"><div className="card-title-row"><div><h2>Rate your skills</h2><p className="lead" style={{ fontSize: 12, margin: '5px 0 0' }}>{ratedCount} of {career.skills.length} rated. Changes are saved when you select “Save check-in”.</p></div><span className="badge">{career.title}</span></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.9px', color: '#9a9dae', padding: '0 0 8px' }}><span>Skill and suggested focus</span><span>Your rating · target</span></div>
      {career.skills.map((skill) => { const level = levels[skill.name] || 0; const behind = level < skill.targetLevel; return <div className="skill-row" key={skill.name} data-testid={`row-skill-${skill.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}><div><div className="skill-name">{skill.name}</div><div className="skill-topic">{skill.topic}</div></div><div className="level-switch" role="group" aria-label={`Rate ${skill.name}`}>{(['Not started', 'Beginner', 'Intermediate', 'Advanced'] as const).map((label, value) => <button type="button" className={level === value ? 'selected' : ''} key={label} onClick={() => setLevel(skill.name, value as Level)} aria-pressed={level === value} data-testid={`button-level-${skill.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${value}`}>{label}</button>)}</div><div className="gap-meter"><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)', marginBottom: 5 }}><span>Target: {strengthName(skill.targetLevel)}</span><span className={`badge ${behind ? 'badge-amber' : 'badge-green'}`} style={{ padding: '3px 7px' }}>{behind ? 'Learning area' : 'On target'}</span></div><div className="progress-track"><div className="progress-fill" style={{ width: `${Math.min(level / skill.targetLevel, 1) * 100}%` }} /></div></div></div>; })}
    </section>
    <div className="grid grid-2" style={{ marginTop: 18 }}><section className="card"><div className="card-title-row"><h2>Strengths</h2><span className="badge badge-green">{strengths.length}</span></div>{strengths.length ? <div className="skill-pills">{strengths.map((skill) => <span className="badge badge-green" key={skill.name}>{skill.name}</span>)}</div> : <p className="lead" style={{ fontSize: 12 }}>As you rate skills at or above their targets, they will appear here.</p>}</section><section className="card"><div className="card-title-row"><h2>Suggested learning focus</h2><GraduationCap size={17} color="#766bc5" /></div>{gaps.length ? <div style={{ display: 'grid', gap: 12 }}>{gaps.slice(0, 3).map((skill) => <div key={skill.name}><strong style={{ fontSize: 12 }}>{skill.name}</strong><p className="lead" style={{ fontSize: 11, margin: '3px 0' }}>{skill.topic}</p></div>)}</div> : <p className="lead" style={{ fontSize: 12 }}>You’ve rated each skill at target. Keep practicing and revisit your ratings when your experience grows.</p>}</section></div>
    <p className="notice" style={{ marginTop: 18 }}>Calculation: each self-rating (Not started 0, Beginner 1, Intermediate 2, Advanced 3) is divided by the skill's target level (capped at 100%), then averaged. Targets are predefined role expectations; this is not an objective measure of job readiness.</p><Toast />
  </>;
}
function RoadmapPage() {
  const { state, setState } = useStore(); const career = getCareer(state.careerId); const { notify, Toast } = useNotify(); const doneCount = career.roadmap.filter((item) => state.roadmapDone.includes(item.title)).length; const next = career.roadmap.find((item) => !state.roadmapDone.includes(item.title));
  function toggle(title: string) { setState((old) => ({ ...old, roadmapDone: old.roadmapDone.includes(title) ? old.roadmapDone.filter((item) => item !== title) : [...old.roadmapDone, title] })); notify(state.roadmapDone.includes(title) ? 'Milestone reopened.' : 'Milestone marked complete. Progress updated.'); }
  return <><PageHeading eyebrow="Small steps, steady momentum" title="My roadmap" detail={`A practical 4-week starting template for ${career.title}. Adapt the pace to your semester and commitments.`} action={<span className="badge badge-lavender">{doneCount} of {career.roadmap.length} complete</span>} />
    <div className="card" style={{ marginBottom: 18 }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 9, fontSize: 12 }}><strong>Roadmap progress</strong><span>{Math.round(doneCount / career.roadmap.length * 100)}%</span></div><div className="progress-track"><div className="progress-fill" style={{ width: `${doneCount / career.roadmap.length * 100}%` }} /></div><p className="lead" style={{ fontSize: 12, margin: '12px 0 0' }}>{next ? `Suggested next: ${next.title}. You can complete milestones in any order.` : 'Every milestone is complete. Review your skill assessment or keep building.'}</p></div>
    <section className="card"><div className="timeline">{career.roadmap.map((item, index) => { const isDone = state.roadmapDone.includes(item.title); const current = !isDone && item.title === next?.title; return <article className={`milestone ${isDone ? 'done' : current ? 'current' : ''}`} key={item.title} data-testid={`milestone-${index}`}><div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}><div><span className={`badge ${isDone ? 'badge-green' : current ? 'badge-lavender' : ''}`}>{isDone ? 'Complete' : current ? 'Up next' : `Week ${item.week}`}</span><h2 style={{ margin: '10px 0 7px', fontSize: 18 }}>{item.title}</h2><p className="lead" style={{ fontSize: 12 }}>{item.resource}</p></div><button className={`btn ${isDone ? 'btn-secondary' : 'btn-primary'} btn-small`} onClick={() => toggle(item.title)} aria-pressed={isDone} data-testid={`button-milestone-toggle-${index}`}>{isDone ? <><Check size={14} /> Done</> : 'Mark complete'}</button></div><div className="grid grid-2" style={{ gap: 12 }}><div style={{ padding: 13, borderRadius: 10, background: '#f8f8fb' }}><div className="eyebrow" style={{ marginBottom: 6 }}>Skills</div><div className="skill-pills">{item.skills.map((skill) => <span className="skill-pill" key={skill}>{skill}</span>)}</div></div><div style={{ padding: 13, borderRadius: 10, background: '#f8f8fb' }}><div className="eyebrow" style={{ marginBottom: 6 }}>Practice project · {item.hours} hours</div><div style={{ fontSize: 12, lineHeight: 1.55 }}>{item.project}</div></div></div></article>; })}</div></section><Toast />
  </>;
}
function PlannerPage() {
  const { state, setState } = useStore(); const { notify, Toast } = useNotify();
  const [filter, setFilter] = useState('All'); const [priority, setPriority] = useState('All'); const [editing, setEditing] = useState<PlannerTask | null>(null); const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState(''); const [dueDate, setDueDate] = useState(''); const [taskPriority, setTaskPriority] = useState<PlannerTask['priority']>('Medium'); const [error, setError] = useState('');
  const filtered = state.plannerTasks.filter((task) => (filter === 'All' || (filter === 'Open' ? !task.completed : task.completed)) && (priority === 'All' || task.priority === priority));
  const completed = state.plannerTasks.filter((task) => task.completed).length;
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayTasks = state.plannerTasks.filter((task) => !task.completed && task.dueDate === todayKey);
  const upcomingTasks = state.plannerTasks.filter((task) => !task.completed && task.dueDate > todayKey);
  function openEditor(task?: PlannerTask) { setEditing(task || null); setTitle(task?.title || ''); setDueDate(task?.dueDate || ''); setTaskPriority(task?.priority || 'Medium'); setError(''); setFormOpen(true); }
  function saveTask(event: FormEvent) { event.preventDefault(); if (title.trim().length < 2) { setError('Add a task title with at least two characters.'); return; } setState((old) => ({ ...old, plannerTasks: editing ? old.plannerTasks.map((task) => task.id === editing.id ? { ...task, title: title.trim(), dueDate, priority: taskPriority } : task) : [{ id: uid(), title: title.trim(), dueDate, priority: taskPriority, completed: false }, ...old.plannerTasks] })); setEditing(null); setTitle(''); setDueDate(''); setFormOpen(false); notify(editing ? 'Task updated.' : 'Task added to your planner.'); }
  function toggle(id: string) { setState((old) => ({ ...old, plannerTasks: old.plannerTasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task) })); }
  function remove(task: PlannerTask) { if (!window.confirm(`Delete “${task.title}”? This cannot be undone.`)) return; setState((old) => ({ ...old, plannerTasks: old.plannerTasks.filter((item) => item.id !== task.id) })); notify('Task deleted.'); }
  return <><PageHeading eyebrow="Turn intention into action" title="Daily planner" detail="Keep career prep small and doable. Tasks here are yours to create, change, and complete." action={<PrimaryButton onClick={() => openEditor()} data-testid="button-add-task"><Plus size={16} /> Add task</PrimaryButton>} />
    <div className="grid grid-3" style={{ marginBottom: 18 }}><div className="card"><div className="stat-label">Tasks on your list</div><div className="stat-value" style={{ marginTop: 6 }}>{state.plannerTasks.length}</div></div><div className="card"><div className="stat-label">Completed</div><div className="stat-value" style={{ marginTop: 6 }}>{completed}</div></div><div className="card"><div className="stat-label">Completion rate</div><div className="stat-value" style={{ marginTop: 6 }}>{state.plannerTasks.length ? Math.round(completed / state.plannerTasks.length * 100) : 0}%</div></div></div>
    <div className="grid grid-2" style={{ marginBottom: 18 }}><section className="card"><div className="card-title-row"><h2>Today</h2><span className="badge badge-lavender">{todayTasks.length} open</span></div>{todayTasks.length ? todayTasks.map((task) => <div className="task-row" key={task.id}><button className="icon-btn" aria-label={`Complete ${task.title}`} onClick={() => toggle(task.id)} data-testid={`button-today-task-${task.id}`}><Check size={14} /></button><div className="task-copy"><div className="task-title">{task.title}</div><div className="task-meta">{task.priority} priority</div></div></div>) : <p className="lead" style={{ fontSize: 12, margin: 0 }}>No open tasks due today. A little planning can make room for focused practice.</p>}</section><section className="card"><div className="card-title-row"><h2>Coming up</h2><span className="badge">{upcomingTasks.length} scheduled</span></div>{upcomingTasks.length ? upcomingTasks.slice().sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 3).map((task) => <div className="task-row" key={task.id}><CalendarDays size={15} color="#8177c9" /><div className="task-copy"><div className="task-title">{task.title}</div><div className="task-meta">{new Date(`${task.dueDate}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {task.priority} priority</div></div></div>) : <p className="lead" style={{ fontSize: 12, margin: 0 }}>Tasks with future due dates will appear here.</p>}</section></div>
    {formOpen ? <form className="card" onSubmit={saveTask} style={{ marginBottom: 18 }} aria-label={editing ? 'Edit planner task' : 'Add planner task'}><div className="card-title-row"><h2>{editing ? 'Edit task' : 'Add a task'}</h2><button type="button" className="icon-btn" aria-label="Close task form" onClick={() => { setEditing(null); setTitle(''); setError(''); setFormOpen(false); }} data-testid="button-close-task-form"><X size={16} /></button></div>{error && <div className="alert alert-error" role="alert">{error}</div>}<div className="grid grid-3"><div className="field" style={{ gridColumn: 'span 1' }}><label htmlFor="task-title">Task</label><input id="task-title" className="input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What would you like to do?" data-testid="input-task-title" /></div><div className="field"><label htmlFor="task-date">Due date</label><input id="task-date" className="input" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} data-testid="input-task-date" /></div><div className="field"><label htmlFor="task-priority">Priority</label><select id="task-priority" className="select" value={taskPriority} onChange={(event) => setTaskPriority(event.target.value as PlannerTask['priority'])} data-testid="select-task-priority">{['Low', 'Medium', 'High'].map((item) => <option key={item}>{item}</option>)}</select></div></div><div style={{ display: 'flex', gap: 9 }}><PrimaryButton type="submit" data-testid="button-save-task">{editing ? 'Save changes' : 'Add to planner'}</PrimaryButton><button className="btn btn-ghost" type="button" onClick={() => { setEditing(null); setTitle(''); setError(''); setFormOpen(false); }}>Cancel</button></div></form> : null}
    <section className="card"><div className="card-title-row"><div><h2>Your tasks</h2><p className="lead" style={{ fontSize: 12, margin: '4px 0 0' }}>Check off a task as you complete it.</p></div><div style={{ display: 'flex', gap: 8 }}><select className="select" value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter by task status" data-testid="select-task-status" style={{ width: 115, padding: '8px' }}>{['All', 'Open', 'Done'].map((value) => <option key={value}>{value}</option>)}</select><select className="select" value={priority} onChange={(event) => setPriority(event.target.value)} aria-label="Filter by task priority" data-testid="select-task-filter-priority" style={{ width: 125, padding: '8px' }}>{['All', 'High', 'Medium', 'Low'].map((value) => <option key={value}>{value === 'All' ? 'All priorities' : value}</option>)}</select></div></div>
    {filtered.length ? filtered.map((task) => <div className="task-row" key={task.id} data-testid={`row-task-${task.id}`}><input className="task-check" type="checkbox" checked={task.completed} onChange={() => toggle(task.id)} aria-label={`${task.completed ? 'Reopen' : 'Complete'} ${task.title}`} data-testid={`checkbox-task-${task.id}`} /><div className="task-copy"><div className={`task-title ${task.completed ? 'completed' : ''}`}>{task.title}</div><div className="task-meta">{task.dueDate ? `Due ${new Date(`${task.dueDate}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : 'No due date'} · {task.priority} priority</div></div><span className={`badge ${task.priority === 'High' ? 'badge-red' : task.priority === 'Medium' ? 'badge-amber' : ''}`}>{task.priority}</span><button className="icon-btn" onClick={() => openEditor(task)} aria-label={`Edit ${task.title}`} data-testid={`button-edit-task-${task.id}`}><Pencil size={14} /></button><button className="icon-btn" onClick={() => remove(task)} aria-label={`Delete ${task.title}`} data-testid={`button-delete-task-${task.id}`}><Trash2 size={14} /></button></div>) : <EmptyState icon={ClipboardList} title={state.plannerTasks.length ? 'No tasks in this view' : 'Your planner is ready for a first step'} detail={state.plannerTasks.length ? 'Adjust the filters or add a new task.' : 'Add a small, specific action that moves your career preparation forward.'} action={<button className="btn btn-secondary btn-small" onClick={() => openEditor()} data-testid="button-empty-add-task"><Plus size={14} /> Add a task</button>} />}</section><Toast />
  </>;
}
function pdfLiteral(value: string): string {
  return value.replace(/\\([\\()])/g, '$1').replace(/\\n/g, '\n').replace(/\\r/g, '\n').replace(/\\t/g, ' ').replace(/\\([0-7]{1,3})/g, (_match, octal: string) => String.fromCharCode(parseInt(octal, 8)));
}
function pdfStrings(value: string): string {
  const found: string[] = [];
  const opPattern = /\(((?:\\.|[^\\)])*)\)\s*T[jJ]/g;
  let match: RegExpExecArray | null;
  while ((match = opPattern.exec(value))) found.push(pdfLiteral(match[1]));
  const arrays = /\[((?:.|\n|\r)*?)\]\s*TJ/g;
  while ((match = arrays.exec(value))) {
    const parts = match[1].match(/\(((?:\\.|[^\\)])*)\)/g) || [];
    if (parts.length) found.push(parts.map((part) => pdfLiteral(part.slice(1, -1))).join(''));
  }
  return found.join(' ');
}
async function extractPdf(buffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer); const decoder = new TextDecoder('latin1'); const source = decoder.decode(bytes);
  const chunks = [source]; const streamPattern = /stream\r?\n/g; let match: RegExpExecArray | null;
  while ((match = streamPattern.exec(source))) {
    const start = match.index + match[0].length; const end = source.indexOf('endstream', start); if (end < 0) continue;
    const dictionary = source.slice(Math.max(0, match.index - 500), match.index);
    if (!/FlateDecode/.test(dictionary)) continue;
    try {
      const compressed = bytes.slice(start, end - (source[end - 1] === '\r' ? 1 : source[end - 1] === '\n' ? 1 : 0));
      const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate'));
      chunks.push(decoder.decode(await new Response(stream).arrayBuffer()));
    } catch { /* Other PDF compression filters are reported as unreadable if no text survives. */ }
    streamPattern.lastIndex = end + 9;
  }
  const text = chunks.map(pdfStrings).join(' ').replace(/\s+/g, ' ').trim();
  if (text.length < 20) throw new Error('No readable text was found. This PDF may be scanned, encrypted, or use an unsupported text encoding.');
  return text;
}
async function extractDocx(buffer: ArrayBuffer): Promise<string> {
  const data = new Uint8Array(buffer); const view = new DataView(buffer); const decoder = new TextDecoder(); let localOffset = -1; let method = 0; let compressedSize = 0;
  for (let i = 0; i < data.length - 46; i += 1) {
    if (view.getUint32(i, true) !== 0x02014b50) continue;
    const compression = view.getUint16(i + 10, true); const size = view.getUint32(i + 20, true); const nameLength = view.getUint16(i + 28, true); const extraLength = view.getUint16(i + 30, true); const commentLength = view.getUint16(i + 32, true);
    const fileName = decoder.decode(data.slice(i + 46, i + 46 + nameLength));
    if (fileName === 'word/document.xml') { method = compression; compressedSize = size; localOffset = view.getUint32(i + 42, true); break; }
    i += 45 + nameLength + extraLength + commentLength;
  }
  if (localOffset < 0) throw new Error('This DOCX does not contain a readable main document.');
  const fileNameLength = view.getUint16(localOffset + 26, true); const extraLength = view.getUint16(localOffset + 28, true); const start = localOffset + 30 + fileNameLength + extraLength;
  const compressed = data.slice(start, start + compressedSize); let xml: string;
  if (method === 0) xml = decoder.decode(compressed);
  else if (method === 8) xml = decoder.decode(await new Response(new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
  else throw new Error('This DOCX uses an unsupported compression format.');
  const text = xml.replace(/<\/w:p>/g, '\n').replace(/<w:tab[^>]*\/>/g, '\t').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_m, code: string) => String.fromCharCode(Number(code))).replace(/\s+/g, ' ').trim();
  if (text.length < 20) throw new Error('No readable text was found in this document.');
  return text;
}
function analyzeText(text: string, career: Career) {
  const normalized = text.toLowerCase();
  const detected = career.skills.filter((skill) => normalized.includes(skill.name.toLowerCase())).map((skill) => skill.name);
  const missing = career.skills.filter((skill) => !detected.includes(skill.name)).map((skill) => skill.name);
  return { detected, missing };
}
function ResumePage() {
  const { state, setState } = useStore(); const career = getCareer(state.careerId); const { notify, Toast } = useNotify();
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [drag, setDrag] = useState(false); const [showText, setShowText] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  async function processFile(file?: File) {
    setError('');
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx'].includes(ext || '')) { setError('Choose a PDF or DOCX file. Other formats are not supported.'); return; }
    if (file.size > 8 * 1024 * 1024) { setError('This file is larger than 8 MB. Choose a smaller resume to continue.'); return; }
    if (file.size < 100) { setError('This file appears to be empty or unreadable. Choose another file.'); return; }
    setBusy(true);
    try {
      const buffer = await file.arrayBuffer(); const text = ext === 'pdf' ? await extractPdf(buffer) : await extractDocx(buffer); const result = analyzeText(text, career);
      setState((old) => ({ ...old, resumeAnalysis: { fileName: file.name, text, ...result, analyzedAt: new Date().toISOString() } }));
      notify('Resume text analyzed in this browser.');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'We could not read this file. Try another PDF or DOCX document.'); }
    finally { setBusy(false); if (fileRef.current) fileRef.current.value = ''; }
  }
  function clearResume() { setState((old) => ({ ...old, resumeAnalysis: null })); setError(''); notify('Resume and extracted text cleared from this browser.'); }
  const analysis = state.resumeAnalysis;
  return <><PageHeading eyebrow="Keep your documents on your device" title="Resume analyzer" detail={`A transparent keyword check against the configured skills for ${career.title}. Your file is processed locally and is not uploaded.`} />
    <div className="notice" style={{ marginBottom: 18 }}>This is a simple role-based text match—not an ATS score, real AI assessment, or hiring prediction. Results depend on text extracted from your file and the configured skill names.</div>
    {error && <div className="alert alert-error" role="alert" data-testid="status-resume-error"><CircleAlert size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />{error}</div>}
    {!analysis ? <section className={`dropzone ${drag ? 'dragging' : ''}`} onDragOver={(event) => { event.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(event) => { event.preventDefault(); setDrag(false); void processFile(event.dataTransfer.files[0]); }} data-testid="dropzone-resume"><div className="empty-icon" style={{ width: 50, height: 50 }}><CloudUpload size={24} /></div><h2>{busy ? 'Reading your resume…' : 'Add a resume to review'}</h2><p className="lead" style={{ margin: '0 auto 17px', fontSize: 12 }}>Drop a PDF or DOCX here, or browse your device. Files are limited to 8 MB.</p><input ref={fileRef} type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => void processFile(event.target.files?.[0])} hidden data-testid="input-resume-file" /><button className="btn btn-primary" onClick={() => fileRef.current?.click()} disabled={busy} data-testid="button-browse-resume">{busy ? <><LoaderCircle size={15} /> Processing locally…</> : <><Upload size={15} /> Choose a file</>}</button><p style={{ color: '#989bad', fontSize: 11, margin: '14px 0 0' }}>PDF and DOCX · maximum 8 MB · content stays in this browser</p></section> : <div className="grid grid-2">
      <section className="card"><div className="card-title-row"><div><p className="eyebrow">Browser-side analysis</p><h2>Role match summary</h2></div><span className="badge badge-green"><CheckCircle2 size={12} style={{ marginRight: 4 }} />Analyzed</span></div><div className="file-summary"><span><FileText size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />{analysis.fileName}</span><button className="btn btn-danger btn-small" onClick={clearResume} data-testid="button-clear-resume"><Trash2 size={13} /> Clear</button></div><div className="grid grid-2" style={{ marginTop: 16 }}><div style={{ borderRadius: 11, background: '#edf6f0', padding: 15 }}><div className="stat-label">Detected skill names</div><div className="stat-value" style={{ fontSize: 23, marginTop: 4 }}>{analysis.detected.length}</div></div><div style={{ borderRadius: 11, background: '#f6f4fc', padding: 15 }}><div className="stat-label">Not found in extracted text</div><div className="stat-value" style={{ fontSize: 23, marginTop: 4 }}>{analysis.missing.length}</div></div></div><div style={{ marginTop: 18 }}><h3>Detected in your resume text</h3>{analysis.detected.length ? <div className="skill-pills">{analysis.detected.map((skill) => <span className="badge badge-green" key={skill}><Check size={12} style={{ marginRight: 3 }} />{skill}</span>)}</div> : <p className="lead" style={{ fontSize: 12 }}>No configured skill names were found. Similar wording may not be recognized by this exact text match.</p>}</div><div style={{ marginTop: 18 }}><h3>Skills not found</h3>{analysis.missing.length ? <div style={{ display: 'grid', gap: 13 }}>{career.skills.filter((skill) => analysis.missing.includes(skill.name)).map((skill) => <div key={skill.name}><span className="badge badge-amber">{skill.name}</span><div className="skill-topic" style={{ marginTop: 5 }}>{skill.topic}</div></div>)}</div> : <p className="lead" style={{ fontSize: 12 }}>All configured skill names appear in the extracted text. This does not evaluate depth or evidence.</p>}</div></section>
      <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}><section className="card"><h2>Ideas to strengthen your story</h2><p className="lead" style={{ fontSize: 12 }}>Consider these role-specific next steps, based only on skill names not found.</p>{analysis.missing.length ? <><div style={{ display: 'grid', gap: 12 }}>{career.skills.filter((skill) => analysis.missing.includes(skill.name)).slice(0, 3).map((skill) => <div key={skill.name}><strong style={{ fontSize: 12 }}>Explore {skill.name}</strong><p className="lead" style={{ fontSize: 11, margin: '4px 0 0' }}>Learning topic: {skill.topic}</p></div>)}</div><div className="notice" style={{ marginTop: 16 }}>Portfolio idea: {career.roadmap.find((item) => item.skills.some((skill) => analysis.missing.includes(skill)))?.project || career.roadmap[0].project}</div></> : <p className="lead" style={{ fontSize: 12 }}>Keep a project case study close by to demonstrate how you used these skills.</p>}<ul style={{ color: 'var(--muted)', fontSize: 12, lineHeight: 1.8, paddingLeft: 18, marginBottom: 0 }}><li>Use specific verbs and explain your contribution.</li><li>Add outcomes and context where you can support them.</li><li>Keep examples relevant to this selected role.</li></ul></section>
        <section className="card"><div className="card-title-row"><h3>Extracted text preview</h3><button className="btn btn-ghost btn-small" onClick={() => setShowText(!showText)} data-testid="button-toggle-resume-preview">{showText ? 'Hide preview' : 'Show preview'} <ChevronDown size={13} /></button></div>{showText && <div style={{ maxHeight: 240, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#f8f8fb', padding: 13, borderRadius: 9, fontSize: 11, color: '#5f647a', lineHeight: 1.6 }} data-testid="text-resume-preview">{analysis.text.slice(0, 7000)}{analysis.text.length > 7000 ? '\n…preview shortened' : ''}</div>}<p className="skill-topic" style={{ marginTop: 11 }}>Analysis uses exact configured skill-name matches. Scanned PDFs and unusual encodings may not extract.</p></section>
      </div>
    </div>}
    {analysis && <div style={{ display: 'flex', gap: 9, marginTop: 18 }}><button className="btn btn-secondary" onClick={() => fileRef.current?.click()} data-testid="button-replace-resume"><Upload size={14} /> Analyze another resume</button><input ref={fileRef} type="file" accept=".pdf,.docx" onChange={(event) => void processFile(event.target.files?.[0])} hidden /></div>}
    <Toast />
  </>;
}
function AnalyticsPage() {
  const { state } = useStore(); const career = getCareer(state.careerId);
  const history = state.assessmentHistory; const latest = history[history.length - 1]; const previous = history.length > 1 ? history[history.length - 2] : null;
  const trend = history.map((snapshot, index) => ({ name: new Date(snapshot.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), alignment: snapshot.average, order: index + 1 }));
  const skillData = career.skills.map((skill) => ({ name: skill.name.length > 15 ? `${skill.name.slice(0, 13)}…` : skill.name, previous: previous?.levels[skill.name] || 0, current: latest?.levels[skill.name] || 0 }));
  const taskDone = state.plannerTasks.filter((task) => task.completed).length; const taskRate = state.plannerTasks.length ? Math.round(taskDone / state.plannerTasks.length * 100) : 0;
  const improved = previous && latest ? career.skills.filter((skill) => (latest.levels[skill.name] || 0) > (previous.levels[skill.name] || 0)).length : 0;
  const weekdayActions: Record<string, number> = {};
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  history.filter((entry) => new Date(entry.at).getTime() >= sevenDaysAgo).forEach((entry) => { const key = new Date(entry.at).toLocaleDateString(undefined, { weekday: 'short' }); weekdayActions[key] = (weekdayActions[key] || 0) + 1; });
  const activity = Object.entries(weekdayActions).map(([day, count]) => ({ day, count }));
  return <><PageHeading eyebrow="Your recorded actions, made visible" title="Improvement analytics" detail="These charts use your saved skill check-ins, completed milestones, and planner tasks. No simulated progress is included." />
    <div className="grid grid-3" style={{ marginBottom: 18 }}><div className="card"><div className="stat-label">Roadmap completed</div><div className="stat-value" style={{ marginTop: 5 }}>{Math.round(state.roadmapDone.length / career.roadmap.length * 100)}%</div><div className="stat-label">{state.roadmapDone.length} of {career.roadmap.length} milestones marked complete</div></div><div className="card"><div className="stat-label">Planner completion rate</div><div className="stat-value" style={{ marginTop: 5 }}>{taskRate}%</div><div className="stat-label">{taskDone} of {state.plannerTasks.length} current tasks checked off</div></div><div className="card"><div className="stat-label">Skills improved since last check-in</div><div className="stat-value" style={{ marginTop: 5 }}>{previous && latest ? improved : '—'}</div><div className="stat-label">{previous ? 'Higher self-ratings compared with the prior check-in' : 'Requires at least two saved check-ins'}</div></div></div>
    {history.length ? <div className="grid grid-2"><section className="card"><div className="card-title-row"><div><h2>Self-assessment trend</h2><p className="lead" style={{ fontSize: 11, margin: '4px 0 0' }}>Alignment at each check-in; the first point is a starting snapshot.</p></div><Activity size={17} color="#796dc8" /></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><LineChart data={trend}><CartesianGrid stroke="#efeff5" vertical={false} /><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#888da0' }} /><YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#888da0' }} /><Tooltip /><Line type="monotone" dataKey="alignment" name="Alignment" stroke="#786bc7" strokeWidth={2.5} dot={{ fill: '#786bc7', r: 4 }} /></LineChart></ResponsiveContainer></div></section>
      <section className="card"><div className="card-title-row"><div><h2>Skill ratings</h2><p className="lead" style={{ fontSize: 11, margin: '4px 0 0' }}>Most recent check-in compared to the previous one.</p></div><SlidersHorizontal size={17} color="#796dc8" /></div>{history.length < 2 ? <EmptyState icon={ChartNoAxesCombined} title="One check-in recorded" detail="Save another check-in after updating your ratings to compare the two." /> : <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><LineChart data={skillData} margin={{ left: -14, right: 8 }}><CartesianGrid stroke="#efeff5" vertical={false} /><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#888da0' }} /><YAxis domain={[0, 3]} ticks={[0, 1, 2, 3]} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#888da0' }} /><Tooltip /><Line type="monotone" dataKey="previous" name="Previous" stroke="#a9abc1" strokeWidth={2} /><Line type="monotone" dataKey="current" name="Current" stroke="#786bc7" strokeWidth={2.5} /></LineChart></ResponsiveContainer></div>}</section>
      <section className="card"><div className="card-title-row"><div><h2>Learning activity</h2><p className="lead" style={{ fontSize: 11, margin: '4px 0 0' }}>Assessment check-ins recorded in the last 7 days.</p></div><CalendarDays size={17} color="#796dc8" /></div>{activity.length ? <div style={{ display: 'grid', gap: 11 }}>{activity.map((item) => <div key={item.day} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 24px', alignItems: 'center', gap: 10, fontSize: 11 }}><span style={{ color: 'var(--muted)' }}>{item.day}</span><div className="progress-track"><div className="progress-fill" style={{ width: `${Math.min(item.count / Math.max(...activity.map((row) => row.count), 1) * 100, 100)}%` }} /></div><strong>{item.count}</strong></div>)}</div> : <p className="lead" style={{ fontSize: 12 }}>No check-ins were saved in the last 7 days. Task and milestone totals above reflect actions you have taken.</p>}</section>
      <section className="card"><div className="card-title-row"><h2>Weekly overview</h2><span className="badge badge-lavender">{history.length} saved check-ins</span></div><p className="lead" style={{ fontSize: 12 }}>There are {history.length} saved assessment snapshots. Each records self-ratings at the time you selected “Save check-in”; repeated saves within a short moment update the latest snapshot.</p><div className="notice">Progress metrics describe activity in this browser only. They do not predict hiring outcomes or objective job readiness.</div></section></div> : <section className="card"><EmptyState icon={ChartNoAxesCombined} title="Your first snapshot is waiting" detail="Rate and save your skills to create a genuine starting point. Later check-ins will show changes over time—without invented history." action={<Link href="/skills" className="btn btn-secondary btn-small" data-testid="link-analytics-assess">Go to skill assessment <ArrowRight size={14} /></Link>} /></section>}
    <div className="notice" style={{ marginTop: 18 }}>Metrics come from the current role’s saved self-rating snapshots, checked-off roadmap milestones, and the planner task list. Change career to start a fresh role-specific assessment history.</div>
  </>;
}
function CoachPage() {
  const { state, setState } = useStore(); const career = getCareer(state.careerId); const [question, setQuestion] = useState(''); const [busy, setBusy] = useState(false); const { notify, Toast } = useNotify(); const scrollRef = useRef<HTMLDivElement>(null);
  const prompts = ['Which skill should I learn next?', 'What project should I build?', 'Help me plan the coming week'];
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [state.coachMessages, busy]);
  function send(text = question) {
    const clean = text.trim(); if (!clean || busy) return;
    const user: CoachMessage = { id: uid(), role: 'user', text: clean, at: new Date().toISOString() };
    setState((old) => ({ ...old, coachMessages: [...old.coachMessages, user] })); setQuestion(''); setBusy(true);
    window.setTimeout(() => {
      try { const response: CoachMessage = { id: uid(), role: 'assistant', text: coachReply(clean, career, state.skillLevels, state.roadmapDone), at: new Date().toISOString() }; setState((old) => ({ ...old, coachMessages: [...old.coachMessages, response] })); }
      catch { notify('Could not create a local suggestion. Try another question.'); }
      finally { setBusy(false); }
    }, 480);
  }
  function clearChat() { if (!state.coachMessages.length) return; if (!window.confirm('Clear this conversation from your browser?')) return; setState((old) => ({ ...old, coachMessages: [] })); notify('Conversation cleared.'); }
  return <><PageHeading eyebrow="A sounding board for your next step" title="Career coach" detail="Ask a practical question about skills, projects, routines, or preparing for your selected role." action={<span className="badge badge-amber"><Sparkles size={12} style={{ marginRight: 4 }} />Local demo · rule-based</span>} />
    <div className="notice" style={{ marginBottom: 17 }}>This coach runs in your browser using your selected role, skill ratings, and roadmap. It does not call a real AI model or provide professional hiring advice.</div>
    <section className="card"><div className="card-title-row"><div><h2>Let’s find a manageable next step</h2><p className="lead" style={{ fontSize: 12, margin: '4px 0 0' }}>Answers are suggestions, not a substitute for your own judgment.</p></div>{state.coachMessages.length > 0 && <button className="btn btn-ghost btn-small" onClick={clearChat} data-testid="button-clear-chat"><Trash2 size={13} /> Clear chat</button>}</div>
      <div className="suggestions">{prompts.map((prompt) => <button className="btn btn-secondary btn-small" key={prompt} onClick={() => send(prompt)} disabled={busy} data-testid={`button-coach-prompt-${prompts.indexOf(prompt)}`}>{prompt}</button>)}</div>
      <div className="chat-window" ref={scrollRef} aria-live="polite" data-testid="panel-coach-conversation">{state.coachMessages.length ? state.coachMessages.map((message) => <div className={`chat-message ${message.role}`} key={message.id} data-testid={`message-${message.role}-${message.id}`}>{message.text}</div>) : <div className="chat-message assistant">I’m your local CareerBloom demo coach. Tell me what feels tricky about preparing for {career.title}, and I’ll suggest a practical next step.</div>}{busy && <div className="chat-message assistant" role="status"><span className="fade-in">Thinking through your role and roadmap…</span></div>}</div>
      <form className="chat-compose" onSubmit={(event) => { event.preventDefault(); send(); }}><input className="input" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask a question about your career prep…" aria-label="Message the local career coach" data-testid="input-coach-message" /><PrimaryButton type="submit" disabled={busy || !question.trim()} data-testid="button-send-coach"><Send size={15} /> Send</PrimaryButton></form>
    </section><Toast />
  </>;
}
function SettingsPage() {
  const { state, setState } = useStore(); const [, setPath] = useLocation(); const { notify, Toast } = useNotify(); const [name, setName] = useState(state.user?.name || ''); const [saved, setSaved] = useState(false);
  useEffect(() => setName(state.user?.name || ''), [state.user?.name]);
  function saveProfile(event: FormEvent) { event.preventDefault(); const clean = name.trim(); if (clean.length < 2 || !state.user) { notify('Enter a name with at least two characters.'); return; } const account = { ...state.user, name: clean }; saveAccount(account); setState((old) => ({ ...old, user: account })); notify('Profile name updated.'); setSaved(true); }
  function resetDemo() { if (!window.confirm('Reset your career, ratings, milestones, tasks, resume analysis, and coach messages? Your hashed demo account will remain available for login.')) return; const fresh = blankState(); fresh.user = state.user; setState(fresh); setPath('/select-career'); }
  function logout() { setState((old) => ({ ...old, user: null })); setPath('/login'); }
  return <><PageHeading eyebrow="Your workspace, your choice" title="Settings" detail="Manage your demo profile and browser-stored preparation data." />
    <div className="grid grid-2"><form className="card" onSubmit={saveProfile}><div className="card-title-row"><div><h2>Profile</h2><p className="lead" style={{ fontSize: 12, margin: '4px 0 0' }}>Your display name appears in your welcome message.</p></div><UserRound size={18} color="#766bc5" /></div><div className="field"><label htmlFor="profile-name">Display name</label><input id="profile-name" className="input" value={name} onChange={(event) => { setName(event.target.value); setSaved(false); }} data-testid="input-profile-name" /></div><PrimaryButton type="submit" data-testid="button-save-profile">Save profile <Check size={14} /></PrimaryButton>{saved && <span role="status" className="badge badge-green" style={{ marginLeft: 10 }}>Saved</span>}</form>
      <section className="card"><div className="card-title-row"><div><h2>Demo data</h2><p className="lead" style={{ fontSize: 12, margin: '4px 0 0' }}>Data lives in local storage on this browser.</p></div><RotateCcw size={18} color="#766bc5" /></div><p className="lead" style={{ fontSize: 12 }}>Reset clears role-specific skill ratings, assessment history, roadmap progress, planner tasks, resume text, and coach messages. Your demo account remains so you can log in again.</p><button className="btn btn-danger" onClick={resetDemo} data-testid="button-reset-demo"><RotateCcw size={15} /> Reset demo data</button></section>
      <section className="card"><div className="card-title-row"><div><h2>Privacy & security</h2><p className="lead" style={{ fontSize: 12, margin: '4px 0 0' }}>Know what this demo can—and cannot—protect.</p></div><ShieldCheck size={18} color="#766bc5" /></div><ul style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.8, paddingLeft: 18, marginBottom: 0 }}><li>Passwords are PBKDF2-hashed when browser crypto is available; plaintext passwords are not stored.</li><li>Local storage is accessible to this browser profile and is not secure authentication.</li><li>Resume content is analyzed locally; clear it from the analyzer when finished.</li><li>No backend, external AI service, or remote API is used.</li></ul></section>
      <section className="card"><div className="card-title-row"><div><h2>Session</h2><p className="lead" style={{ fontSize: 12, margin: '4px 0 0' }}>Sign out of this browser session.</p></div><LogOut size={18} color="#766bc5" /></div><button className="btn btn-secondary" onClick={logout} data-testid="button-settings-logout"><LogOut size={15} /> Log out</button></section></div><Toast />
  </>;
}
function NotFound() { return <main className="page"><div className="card" style={{ maxWidth: 550, margin: '8vh auto', textAlign: 'center' }}><span className="empty-icon"><CircleHelp size={20} /></span><h1>We couldn't find that page</h1><p className="lead" style={{ margin: '0 auto 18px' }}>The link may be outdated. Head back to your workspace.</p><Link className="btn btn-primary" href="/dashboard">Go to overview <ArrowRight size={15} /></Link></div></main>; }
export default App;
