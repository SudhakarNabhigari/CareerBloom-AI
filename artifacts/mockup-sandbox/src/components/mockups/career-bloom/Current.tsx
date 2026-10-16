import {
  Activity, ArrowRight, BarChart3, BookOpen, BriefcaseBusiness, CalendarDays,
  CheckCircle2, Clock3, Compass, LayoutDashboard, LogOut, MessageCircle,
  Settings, Sparkles, Target,
} from 'lucide-react';
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import './_group.css';

const career = {
  id: 'gen-ai-engineer',
  title: 'Generative AI Engineer',
  category: 'AI & Data',
  skills: [
    { name: 'Large language models', targetLevel: 2, topic: 'Transformer fundamentals, inference, and model selection' },
    { name: 'Retrieval-augmented generation', targetLevel: 2, topic: 'Chunking, retrieval quality, citations, and grounding' },
    { name: 'Vector databases', targetLevel: 2, topic: 'Embeddings, indexing, metadata filters, and retrieval trade-offs' },
    { name: 'LLM evaluation', targetLevel: 2, topic: 'Golden sets, relevance metrics, regression tests, and human review' },
    { name: 'Prompt and context design', targetLevel: 2, topic: 'Instruction hierarchy, context windows, and structured outputs' },
  ],
  roadmap: [
    { title: 'Build the foundations', week: 1, skills: ['Large language models', 'Retrieval-augmented generation'], resource: 'Study: Transformer fundamentals, inference, and model selection', project: 'Create a small, documented Large language models practice project.', hours: 4 },
    { title: 'Practice the core workflow', week: 2, skills: ['Retrieval-augmented generation', 'Vector databases'], resource: 'Explore: Chunking, retrieval quality, citations, and grounding', project: 'Build a focused demo using Retrieval-augmented generation and explain your decisions.', hours: 5 },
    { title: 'Create a portfolio piece', week: 3, skills: ['Vector databases', 'LLM evaluation'], resource: 'Review examples and practice: Embeddings, indexing, metadata filters, and retrieval trade-offs', project: 'Publish one polished project that demonstrates Vector databases.', hours: 6 },
    { title: 'Tell your career story', week: 4, skills: ['LLM evaluation', 'Prompt and context design'], resource: 'Practice: Instruction hierarchy, context windows, and structured outputs', project: 'Write a concise case study and practice explaining the outcome.', hours: 3 },
  ],
};

const state = {
  user: { name: 'Maya Chen' },
  careerId: career.id,
  skillLevels: {} as Record<string, number>,
  roadmapDone: [] as string[],
  plannerTasks: [
    { id: 'one', title: 'Explore the role requirements', dueDate: '', priority: 'Medium', completed: false },
    { id: 'two', title: 'Choose one skill to practice this week', dueDate: '', priority: 'High', completed: false },
  ],
  assessmentHistory: [] as { average: number }[],
};

function readiness() {
  return Math.round(career.skills.reduce((sum, skill) => sum + Math.min((state.skillLevels[skill.name] || 0) / skill.targetLevel, 1), 0) / career.skills.length * 100);
}
function Logo() {
  return <div className="brand"><span className="brand-mark"><Sparkles size={18} /></span><span>CareerBloom</span></div>;
}
function EmptyState({ icon: Icon, title, detail, action }: { icon: typeof Activity; title: string; detail: string; action?: React.ReactNode }) {
  return <div className="empty-state"><span className="empty-icon"><Icon size={20} /></span><strong>{title}</strong><div>{detail}</div>{action && <div style={{ marginTop: 15 }}>{action}</div>}</div>;
}
function Dashboard() {
  const done = state.roadmapDone.length;
  const next = career.roadmap.find((item) => !state.roadmapDone.includes(item.title));
  const today = new Date().toISOString().slice(0, 10);
  const tasksToday = state.plannerTasks.filter((task) => !task.completed && task.dueDate === today);
  const history = state.assessmentHistory.slice(-8).map((snapshot, index) => ({ name: `Check-in ${index + 1}`, value: snapshot.average }));

  return <>
    <div className="page-heading">
      <div><p className="eyebrow">Your career workspace</p><h1>Welcome back, {state.user.name}.</h1><p className="lead">You're preparing for {career.title}. Keep it practical: choose one skill, then put it to work.</p></div>
      <button className="btn btn-secondary"><Compass size={15} /> Explore roles</button>
    </div>
    <div className="grid grid-3" style={{ marginBottom: 18 }}>
      <div className="card"><div className="card-title-row"><span className="stat-label">Self-assessed alignment</span><span className="stat-icon"><Target size={17} /></span></div><div className="stat-value">{readiness()}%</div><div className="stat-label">A snapshot of your ratings against this role's skill targets.</div></div>
      <div className="card"><div className="card-title-row"><span className="stat-label">Roadmap milestones</span><span className="stat-icon"><BookOpen size={17} /></span></div><div className="stat-value">{done}<span style={{ color: '#9a9cac', fontSize: 16 }}> / {career.roadmap.length}</span></div><div className="progress-track" style={{ marginTop: 12 }}><div className="progress-fill" style={{ width: `${done / career.roadmap.length * 100}%` }} /></div></div>
      <div className="card"><div className="card-title-row"><span className="stat-label">Planner tasks done</span><span className="stat-icon"><CheckCircle2 size={17} /></span></div><div className="stat-value">{state.plannerTasks.filter((task) => task.completed).length}<span style={{ color: '#9a9cac', fontSize: 16 }}> / {state.plannerTasks.length}</span></div><div className="stat-label">Recorded tasks; no sample history is included.</div></div>
    </div>
    <div className="dashboard-grid">
      <div style={{ display: 'grid', gap: 18 }}>
        <section className="card"><div className="card-title-row"><div><p className="eyebrow">A useful next step</p><h2>{next ? next.title : 'Your roadmap is complete'}</h2></div><span className="badge badge-lavender">{next ? `Week ${next.week}` : 'Nice work'}</span></div>{next ? <><p className="lead">{next.project}</p><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '14px 0 17px' }}>{next.skills.map((skill) => <span className="skill-pill" key={skill}>{skill}</span>)}<span className="skill-pill"><Clock3 size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />{next.hours} hours</span></div><button className="btn btn-primary">Open roadmap <ArrowRight size={15} /></button></> : <button className="btn btn-secondary">Review skills</button>}</section>
        <section className="card"><div className="card-title-row"><div><p className="eyebrow">Progress you have recorded</p><h2>Assessment check-ins</h2></div><span className="btn btn-ghost btn-small">See analytics <ArrowRight size={14} /></span></div>{history.length ? <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={history}><defs><linearGradient id="dashProgressCurrent" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8378d1" stopOpacity={0.22} /><stop offset="95%" stopColor="#8378d1" stopOpacity={0.01} /></linearGradient></defs><CartesianGrid stroke="#efeff5" vertical={false} /><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#888da0' }} /><YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#888da0' }} /><Tooltip /><Area type="monotone" dataKey="value" name="Alignment" stroke="#786bc7" strokeWidth={2} fill="url(#dashProgressCurrent)" /></AreaChart></ResponsiveContainer></div> : <EmptyState icon={Activity} title="Your progress starts with a check-in" detail="Rate your skills in Skill assessment. We’ll show real changes here over time." action={<button className="btn btn-secondary btn-small">Assess my skills</button>} />}</section>
      </div>
      <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
        <section className="card"><div className="card-title-row"><h2>Skill picture</h2><span className="badge">{career.skills.length} skills</span></div><div style={{ display: 'grid', gap: 14 }}>{career.skills.slice(0, 4).map((skill) => { const level = state.skillLevels[skill.name] || 0; return <div key={skill.name}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}><span style={{ fontWeight: 700 }}>{skill.name}</span><span style={{ color: 'var(--muted)' }}>Not started</span></div><div className="progress-track"><div className="progress-fill" style={{ width: `${level / skill.targetLevel * 100}%` }} /></div></div>; })}</div><button className="btn btn-ghost btn-small" style={{ marginTop: 14, paddingLeft: 0 }}>Update self-ratings <ArrowRight size={14} /></button></section>
        <section className="card"><div className="card-title-row"><h2>Today's tasks</h2><CalendarDays size={17} color="#7a70c6" /></div>{tasksToday.length ? tasksToday.map((task) => <div className="task-row" key={task.id}><span className="badge">{task.priority}</span><div className="task-copy"><div className="task-title">{task.title}</div></div></div>) : <p className="lead" style={{ fontSize: 12 }}>Nothing due today. Plan a small step toward {career.title}.</p>}<button className="btn btn-secondary btn-small">Open planner <ArrowRight size={14} /></button></section>
        <section className="card" style={{ background: '#f0eefb', borderColor: '#e8e4f7' }}><p className="eyebrow">A little support</p><h3>Not sure what to work on?</h3><p className="lead" style={{ fontSize: 12 }}>Ask for a local, role-aware suggestion grounded in your self-ratings.</p><button className="btn btn-secondary btn-small"><MessageCircle size={14} /> Talk it through</button></section>
      </div>
    </div>
    <div style={{ marginTop: 18 }}><div className="notice"><strong>Try this next:</strong> spend one short session on {career.skills[0].name} — {career.skills[0].topic.toLowerCase()}.</div></div>
  </>;
}

export function Current() {
  return <div className="app-shell">
    <aside className="sidebar" aria-label="Main navigation">
      <Logo />
      <div className="nav-label">Workspace</div>
      <div className="nav-link active"><LayoutDashboard size={17} /><span>Overview</span></div>
      <div className="nav-link"><Compass size={17} /><span>Career discovery</span></div>
      <div className="nav-link"><Target size={17} /><span>Skill assessment</span></div>
      <div className="nav-link"><BookOpen size={17} /><span>My roadmap</span></div>
      <div className="nav-link"><CalendarDays size={17} /><span>Daily planner</span></div>
      <div className="nav-link"><BarChart3 size={17} /><span>Improvement analytics</span></div>
      <div className="nav-link"><MessageCircle size={17} /><span>Career coach</span></div>
      <div className="nav-label" style={{ marginTop: 12 }}>Account</div>
      <div className="nav-link"><Settings size={17} /><span>Settings</span></div>
      <div className="side-bottom">
        <div className="card" style={{ padding: 14, background: '#f9f8fe', borderColor: '#eeecf7', marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7 }}>Your focus</div>
          <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.4 }}>{career.title}</div>
          <button className="btn btn-ghost btn-small" style={{ paddingLeft: 0, marginTop: 5 }}>Switch career <ArrowRight size={13} /></button>
        </div>
        <div className="user-chip"><div className="avatar">M</div><div style={{ flex: 1, minWidth: 0 }}><div className="user-name">Maya Chen</div><div className="user-caption">Career explorer</div></div><button className="btn btn-ghost btn-small" aria-label="Log out"><LogOut size={15} /></button></div>
      </div>
    </aside>
    <div className="main-area">
      <header className="topbar"><span className="topbar-title">Overview</span><div className="topbar-right"><span className="badge badge-lavender"><BriefcaseBusiness size={12} style={{ marginRight: 5 }} />{career.title}</span><span className="brand-mark" style={{ width: 27, height: 27, borderRadius: 9 }}><Sparkles size={14} /></span></div></header>
      <main className="page"><Dashboard /></main>
    </div>
  </div>;
}
