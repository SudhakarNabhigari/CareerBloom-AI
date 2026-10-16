import { useEffect, useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Compass,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  MoreHorizontal,
  Settings,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import './Refined.css';

const career = {
  title: 'Generative AI Engineer',
  category: 'AI & Data',
  skills: [
    { name: 'Large language models', topic: 'Transformer fundamentals, inference, and model selection' },
    { name: 'Retrieval-augmented generation', topic: 'Chunking, retrieval quality, citations, and grounding' },
    { name: 'Vector databases', topic: 'Embeddings, indexing, metadata filters, and retrieval trade-offs' },
    { name: 'LLM evaluation', topic: 'Golden sets, relevance metrics, regression tests, and human review' },
    { name: 'Prompt and context design', topic: 'Instruction hierarchy, context windows, and structured outputs' },
  ],
  roadmap: [
    { title: 'Build the foundations', week: 1, skills: ['Large language models', 'Retrieval-augmented generation'], project: 'Create a small, documented Large language models practice project.', hours: 4 },
    { title: 'Practice the core workflow', week: 2, skills: ['Retrieval-augmented generation', 'Vector databases'], project: 'Build a focused demo using Retrieval-augmented generation and explain your decisions.', hours: 5 },
    { title: 'Create a portfolio piece', week: 3, skills: ['Vector databases', 'LLM evaluation'], project: 'Publish one polished project that demonstrates Vector databases.', hours: 6 },
    { title: 'Tell your career story', week: 4, skills: ['LLM evaluation', 'Prompt and context design'], project: 'Write a concise case study and practice explaining the outcome.', hours: 3 },
  ],
};

const tasks = [
  { title: 'Explore the role requirements', priority: 'Medium' },
  { title: 'Choose one skill to practice this week', priority: 'High' },
];

const navItems = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Career discovery', icon: Compass },
  { label: 'Skill assessment', icon: Target },
  { label: 'My roadmap', icon: BookOpen },
  { label: 'Daily planner', icon: CalendarDays },
  { label: 'Improvement analytics', icon: BarChart3 },
  { label: 'Career coach', icon: MessageCircle },
];

const descriptions: Record<string, string> = {
  'Explore roles': 'Compare career paths and find a direction that fits your interests. Your current focus stays Generative AI Engineer.',
  'Career discovery': 'Explore roles and keep your career direction grounded in the skills you want to build.',
  'Skill assessment': 'Rate the skills that matter for Generative AI Engineer. Your self-assessed alignment is 0% until you add your first rating.',
  'Open roadmap': 'Your four-step roadmap starts with building the foundations. The first milestone is ready when you are.',
  'My roadmap': 'Four practical milestones take you from foundations to a portfolio story. None have been started yet.',
  'See analytics': 'Assessment check-ins will appear here after you record your first self-assessment. There is no history yet.',
  'Improvement analytics': 'Your progress trends will take shape after you complete a check-in. No assessment history is recorded yet.',
  'Assess my skills': 'Start with a quick self-assessment. You can rate each of the five target skills against the role.',
  'Update self-ratings': 'Your five role skills are all waiting for a first self-rating. Start with the skill you feel most familiar with.',
  'Open planner': 'You have two planner tasks ready to work through. Neither task is due today.',
  'Daily planner': 'Your planner has two open tasks, ready for whenever you want to make time for a small step.',
  'Talk it through': 'Get a role-aware suggestion grounded in your current focus. No skill ratings have been recorded yet.',
  'Career coach': 'Use your career focus and self-ratings to shape a practical next step. Your ratings are currently unstarted.',
  'Switch career': 'Generative AI Engineer is your current focus. Explore roles first if you want to compare another direction.',
  Settings: 'Manage your workspace preferences and account details.',
  'Log out': 'You are signed in as Maya Chen. Logging out is not available in this preview.',
};

function Brand() {
  return (
    <div className="cb-brand" aria-label="CareerBloom">
      <span className="cb-brand-mark"><Sparkles size={17} strokeWidth={2.2} /></span>
      <span>Career<span>Bloom</span></span>
    </div>
  );
}

function ActionDialog({ title, onClose }: { title: string; onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="cb-dialog-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="cb-dialog" role="dialog" aria-modal="true" aria-labelledby="cb-dialog-title">
        <button className="cb-icon-button cb-dialog-close" onClick={onClose} aria-label="Close dialog">
          <X size={18} />
        </button>
        <span className="cb-dialog-icon"><Sparkles size={19} /></span>
        <p className="cb-overline">CareerBloom workspace</p>
        <h2 id="cb-dialog-title">{title}</h2>
        <p className="cb-dialog-copy">{descriptions[title] ?? 'This workspace action is available from your CareerBloom account.'}</p>
        <div className="cb-dialog-context">
          <BriefcaseBusiness size={15} />
          <span>Current focus</span>
          <strong>{career.title}</strong>
        </div>
        <button className="cb-button cb-button-primary cb-dialog-done" onClick={onClose}>Back to overview</button>
      </section>
    </div>
  );
}

function AlignmentRing() {
  const values = [{ name: 'Alignment', value: 0 }, { name: 'Not yet rated', value: 100 }];
  return (
    <div className="cb-ring" aria-label="0 percent self-assessed alignment">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={values} dataKey="value" cx="50%" cy="50%" innerRadius="76%" outerRadius="94%" startAngle={90} endAngle={-270} stroke="none" isAnimationActive={false}>
            <Cell fill="#7771cf" />
            <Cell fill="#e9e8f4" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="cb-ring-label"><strong>0%</strong><span>aligned</span></div>
    </div>
  );
}

function EmptyPanel({ icon: Icon, title, copy, action, onAction }: {
  icon: typeof Activity;
  title: string;
  copy: string;
  action?: string;
  onAction?: (label: string) => void;
}) {
  return (
    <div className="cb-empty">
      <span className="cb-empty-icon"><Icon size={19} /></span>
      <div className="cb-empty-title">{title}</div>
      <p>{copy}</p>
      {action && onAction && <button className="cb-button cb-button-soft cb-button-small" onClick={() => onAction(action)}>{action}<ArrowRight size={14} /></button>}
    </div>
  );
}

export function Refined() {
  const [dialog, setDialog] = useState<string | null>(null);
  const openAction = (label: string) => setDialog(label);

  return (
    <div className="cb-refined">
      <aside className="cb-sidebar" aria-label="Main navigation">
        <Brand />
        <div className="cb-nav-group">
          <span className="cb-nav-label">Workspace</span>
          <nav className="cb-nav">
            {navItems.map(({ label, icon: Icon }, index) => (
              <button
                key={label}
                className={`cb-nav-link${index === 0 ? ' is-active' : ''}`}
                aria-current={index === 0 ? 'page' : undefined}
                onClick={() => index !== 0 && openAction(label)}
              >
                <Icon size={17} strokeWidth={1.8} />
                <span>{label}</span>
                {index === 0 && <span className="cb-nav-current" aria-hidden="true" />}
              </button>
            ))}
          </nav>
        </div>
        <div className="cb-nav-group cb-account-group">
          <span className="cb-nav-label">Account</span>
          <button className="cb-nav-link" onClick={() => openAction('Settings')}><Settings size={17} strokeWidth={1.8} /><span>Settings</span></button>
        </div>
        <div className="cb-sidebar-bottom">
          <div className="cb-focus-card">
            <div className="cb-focus-kicker"><span className="cb-focus-dot" /> Your current focus</div>
            <div className="cb-focus-title">{career.title}</div>
            <div className="cb-focus-category">{career.category}</div>
            <button className="cb-focus-switch" onClick={() => openAction('Switch career')}>Switch career <ArrowRight size={13} /></button>
          </div>
          <div className="cb-user">
            <div className="cb-avatar" aria-hidden="true">MC</div>
            <div className="cb-user-copy"><strong>Maya Chen</strong><span>Career explorer</span></div>
            <button className="cb-icon-button cb-logout" aria-label="Log out" onClick={() => openAction('Log out')}><LogOut size={16} /></button>
          </div>
        </div>
      </aside>

      <div className="cb-main">
        <header className="cb-topbar">
          <div className="cb-breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>Overview</strong></div>
          <button className="cb-top-focus" onClick={() => openAction('Switch career')} aria-label={`Current career focus: ${career.title}. Switch career`}>
            <span className="cb-top-focus-icon"><BriefcaseBusiness size={15} /></span>
            <span>{career.title}</span>
            <MoreHorizontal size={17} />
          </button>
        </header>

        <main className="cb-page">
          <section className="cb-welcome">
            <div>
              <p className="cb-overline"><span className="cb-overline-line" /> YOUR CAREER WORKSPACE</p>
              <h1>Make room for <em>what’s next,</em><br className="cb-desktop-break" /> Maya.</h1>
              <p className="cb-welcome-copy">You’re exploring a path toward <strong>{career.title}</strong>. Start small, stay curious, and let your progress build.</p>
            </div>
            <button className="cb-button cb-button-outline cb-explore" onClick={() => openAction('Explore roles')}><Compass size={16} />Explore roles<ArrowRight size={15} /></button>
          </section>

          <section className="cb-overview-strip" aria-label="Your progress at a glance">
            <div className="cb-alignment-block">
              <AlignmentRing />
              <div className="cb-alignment-copy">
                <span className="cb-stat-label">Self-assessed alignment</span>
                <strong>A first rating is still ahead.</strong>
                <button className="cb-text-link" onClick={() => openAction('Assess my skills')}>Start your check-in <ArrowRight size={14} /></button>
              </div>
            </div>
            <div className="cb-stat-block">
              <span className="cb-stat-icon cb-stat-icon-lavender"><BookOpen size={17} /></span>
              <div className="cb-stat-content"><span className="cb-stat-label">Roadmap milestones</span><strong>0 <small>/ 4</small></strong><span className="cb-stat-foot">A four-step path, ready when you are</span></div>
            </div>
            <div className="cb-stat-block">
              <span className="cb-stat-icon cb-stat-icon-blue"><CheckCircle2 size={17} /></span>
              <div className="cb-stat-content"><span className="cb-stat-label">Planner tasks done</span><strong>0 <small>/ 2</small></strong><span className="cb-stat-foot">Two ideas waiting in your planner</span></div>
            </div>
          </section>

          <div className="cb-content-grid">
            <div className="cb-main-column">
              <section className="cb-next-card">
                <div className="cb-next-topline">
                  <span className="cb-section-label"><span className="cb-little-star"><Sparkles size={13} /></span> A useful next step</span>
                  <span className="cb-week-badge"><span /> WEEK 01</span>
                </div>
                <div className="cb-next-body">
                  <div className="cb-next-copy">
                    <h2>Build the<br />foundations.</h2>
                    <p>{career.roadmap[0].project}</p>
                    <div className="cb-chip-row">
                      {career.roadmap[0].skills.map((skill) => <span className="cb-skill-chip" key={skill}>{skill}</span>)}
                      <span className="cb-skill-chip cb-hours-chip"><Clock3 size={12} />4 hours</span>
                    </div>
                    <button className="cb-button cb-button-primary" onClick={() => openAction('Open roadmap')}>Open roadmap<ArrowRight size={15} /></button>
                  </div>
                  <div className="cb-foundation-art" aria-hidden="true">
                    <div className="cb-orbit cb-orbit-one" />
                    <div className="cb-orbit cb-orbit-two" />
                    <div className="cb-orbit cb-orbit-three" />
                    <div className="cb-art-center"><BookOpen size={27} strokeWidth={1.6} /></div>
                    <span className="cb-art-dot cb-art-dot-one" />
                    <span className="cb-art-dot cb-art-dot-two" />
                    <span className="cb-art-dot cb-art-dot-three" />
                    <span className="cb-art-note">START<br />WITH ONE</span>
                  </div>
                </div>
                <div className="cb-next-foot"><span><span className="cb-foot-dot" />No milestones started yet</span><button onClick={() => openAction('My roadmap')}>View all 4 steps <ArrowRight size={13} /></button></div>
              </section>

              <section className="cb-panel cb-assessment-panel">
                <div className="cb-panel-heading">
                  <div>
                    <span className="cb-section-label">Your progress, over time</span>
                    <h2>Assessment check-ins</h2>
                  </div>
                  <button className="cb-button cb-button-quiet cb-button-small" onClick={() => openAction('See analytics')}>See analytics<ArrowRight size={14} /></button>
                </div>
                <EmptyPanel icon={Activity} title="Your story starts with a check-in" copy="Rate your skills when you’re ready. Your real progress will appear here over time." action="Assess my skills" onAction={openAction} />
              </section>
            </div>

            <aside className="cb-side-column">
              <section className="cb-panel cb-skills-panel">
                <div className="cb-panel-heading cb-skills-heading">
                  <div><span className="cb-section-label">Your role, in focus</span><h2>Skill picture</h2></div>
                  <span className="cb-count-pill">05 skills</span>
                </div>
                <div className="cb-skill-list">
                  {career.skills.map((skill, index) => (
                    <div className="cb-skill-row" key={skill.name}>
                      <div className={`cb-skill-index cb-index-${index + 1}`}>{String(index + 1).padStart(2, '0')}</div>
                      <div className="cb-skill-info"><strong>{skill.name}</strong><div className="cb-skill-track"><span /></div></div>
                      <span className="cb-not-started">Not started</span>
                    </div>
                  ))}
                </div>
                <button className="cb-button cb-button-soft cb-ratings-button" onClick={() => openAction('Update self-ratings')}>Update self-ratings<ArrowRight size={14} /></button>
              </section>

              <section className="cb-panel cb-tasks-panel">
                <div className="cb-panel-heading cb-tasks-heading">
                  <div><span className="cb-section-label">Make a little room</span><h2>Today's tasks</h2></div>
                  <span className="cb-calendar-icon"><CalendarDays size={17} /></span>
                </div>
                <div className="cb-task-list">
                  {tasks.map((task) => (
                    <div className="cb-task-row" key={task.title}>
                      <span className="cb-task-check" aria-hidden="true"><Check size={12} /></span>
                      <span className="cb-task-title">{task.title}</span>
                      <span className={`cb-priority cb-priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
                    </div>
                  ))}
                </div>
                <p className="cb-tasks-note"><span className="cb-note-spark"><Sparkles size={11} /></span> Nothing due today. That’s a good place to begin.</p>
                <button className="cb-button cb-button-outline cb-planner-button" onClick={() => openAction('Open planner')}>Open planner<ArrowRight size={14} /></button>
              </section>

              <section className="cb-support-card">
                <div className="cb-support-icon"><MessageCircle size={18} /></div>
                <div className="cb-support-copy"><span className="cb-section-label">A little support</span><h3>Not sure where to start?</h3><p>Get a role-aware suggestion, grounded in your own reflections.</p></div>
                <button className="cb-support-action" onClick={() => openAction('Talk it through')} aria-label="Talk it through"><ArrowDownRight size={17} /></button>
              </section>
            </aside>
          </div>

          <footer className="cb-footer-note">
            <span className="cb-footer-spark"><Sparkles size={14} /></span>
            <span><strong>Keep it practical.</strong> One short session on {career.skills[0].name} can be enough for today.</span>
            <button onClick={() => openAction('Assess my skills')}>Choose a starting point<ArrowRight size={14} /></button>
          </footer>
        </main>
      </div>
      {dialog && <ActionDialog title={dialog} onClose={() => setDialog(null)} />}
    </div>
  );
}
