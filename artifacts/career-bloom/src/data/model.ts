export type Level = 0 | 1 | 2 | 3;
export type Skill = { name: string; targetLevel: Level; topic: string };
export type Milestone = { title: string; week: number; skills: string[]; resource: string; project: string; hours: number };
export type Career = { id: string; title: string; category: string; description: string; skills: Skill[]; roadmap: Milestone[] };
export type PlannerTask = { id: string; title: string; dueDate: string; priority: 'Low' | 'Medium' | 'High'; completed: boolean };
export type Snapshot = { at: string; levels: Record<string, number>; average: number; improved: number };
export type CoachMessage = { id: string; role: 'user' | 'assistant'; text: string; at: string };
export type ResumeAnalysis = { fileName: string; text: string; detected: string[]; missing: string[]; analyzedAt: string };
export type DemoUser = { name: string; passwordHash: string; salt: string };
export type AppState = {
  user: DemoUser | null;
  careerId: string | null;
  skillLevels: Record<string, Level>;
  assessmentHistory: Snapshot[];
  roadmapDone: string[];
  plannerTasks: PlannerTask[];
  resumeAnalysis: ResumeAnalysis | null;
  coachMessages: CoachMessage[];
};

const skillsByCategory: Record<string, [string, string][]> = {
  'AI & Data': [['Python', 'Data structures, notebooks, and clean reusable code'], ['Machine learning', 'Model training, evaluation, and responsible use'], ['Statistics', 'Probability, experiments, and interpreting uncertainty'], ['SQL', 'Queries, joins, and analytical data modeling'], ['Data storytelling', 'Visual explanation of findings and trade-offs']],
  Engineering: [['JavaScript / TypeScript', 'Language fundamentals and maintainable application code'], ['API design', 'HTTP, REST patterns, and reliable integrations'], ['Git & collaboration', 'Branching, code review, and team workflows'], ['Testing', 'Unit, integration, and accessible UI testing'], ['System design', 'Architecture, performance, and scaling decisions']],
  Design: [['User research', 'Interview planning, synthesis, and evidence'], ['Interaction design', 'Flows, states, and accessible interactions'], ['Prototyping', 'High-fidelity interactive concepts and iteration'], ['Visual systems', 'Typography, color, spacing, and component systems'], ['Usability testing', 'Moderated testing, observation, and iteration']],
  Product: [['Product discovery', 'Customer problems, research, and opportunity sizing'], ['Prioritization', 'Impact, effort, and transparent trade-offs'], ['Analytics', 'Funnels, experiments, and product metrics'], ['Communication', 'Clear briefs, alignment, and decision records'], ['Roadmapping', 'Outcomes, sequencing, and delivery planning']],
  Cloud: [['Linux & networking', 'Shell, network fundamentals, and troubleshooting'], ['Cloud platforms', 'Core compute, storage, identity, and services'], ['Infrastructure as code', 'Repeatable infrastructure and safe changes'], ['Containers', 'Images, orchestration, and deployment workflows'], ['Observability', 'Logs, metrics, alerts, and incident learning']],
  Security: [['Networking', 'Protocols, traffic analysis, and network controls'], ['Security fundamentals', 'Threat modeling, access control, and risk'], ['Incident response', 'Triage, evidence handling, and clear reporting'], ['Scripting', 'Python or shell automation for investigation'], ['Cloud security', 'Identity, configuration, and cloud threat patterns']],
};

const roleDefs: [string, string, string, string[]][] = [
  ['gen-ai-engineer', 'Generative AI Engineer', 'AI & Data', ['Large language models', 'Retrieval-augmented generation', 'Vector databases', 'LLM evaluation', 'Prompt and context design']],
  ['ai-ml-engineer', 'AI/ML Engineer', 'AI & Data', ['Python', 'Machine learning', 'Model deployment', 'Feature engineering', 'Experiment tracking']],
  ['data-scientist', 'Data Scientist', 'AI & Data', ['Python', 'Statistics', 'SQL', 'Machine learning', 'Data storytelling']],
  ['data-analyst', 'Data Analyst', 'AI & Data', ['SQL', 'Spreadsheet analysis', 'Data visualization', 'Statistics', 'Data storytelling']],
  ['full-stack-developer', 'Full-Stack Developer', 'Engineering', ['JavaScript / TypeScript', 'React', 'API design', 'SQL', 'Testing']],
  ['frontend-developer', 'Frontend Developer', 'Engineering', ['JavaScript / TypeScript', 'React', 'Accessibility', 'CSS systems', 'Testing']],
  ['backend-developer', 'Backend Developer', 'Engineering', ['API design', 'SQL', 'Authentication', 'Testing', 'System design']],
  ['cloud-engineer', 'Cloud Engineer', 'Cloud', ['Linux & networking', 'Cloud platforms', 'Infrastructure as code', 'Containers', 'Observability']],
  ['cybersecurity-analyst', 'Cybersecurity Analyst', 'Security', ['Networking', 'Security fundamentals', 'Incident response', 'Scripting', 'Cloud security']],
  ['ui-ux-designer', 'UI/UX Designer', 'Design', ['User research', 'Interaction design', 'Prototyping', 'Visual systems', 'Usability testing']],
  ['product-manager', 'Product Manager', 'Product', ['Product discovery', 'Prioritization', 'Analytics', 'Communication', 'Roadmapping']],
  ['devops-engineer', 'DevOps Engineer', 'Cloud', ['Linux & networking', 'Cloud platforms', 'Infrastructure as code', 'Containers', 'Observability']],
];

const topicsFor = (name: string): string => {
  const known = Object.values(skillsByCategory).flat().find(([skill]) => skill.toLowerCase() === name.toLowerCase());
  if (known) return known[1];
  const topics: Record<string, string> = {
    'Large language models': 'Transformer fundamentals, inference, and model selection',
    'Retrieval-augmented generation': 'Chunking, retrieval quality, citations, and grounding',
    'Vector databases': 'Embeddings, indexing, metadata filters, and retrieval trade-offs',
    'LLM evaluation': 'Golden sets, relevance metrics, regression tests, and human review',
    'Prompt and context design': 'Instruction hierarchy, context windows, and structured outputs',
    'Model deployment': 'Serving, monitoring, latency, and reproducible releases',
    'Feature engineering': 'Data leakage, feature pipelines, and meaningful baselines',
    'Experiment tracking': 'Reproducible runs, versioned data, and comparison',
    'Spreadsheet analysis': 'Pivot tables, formulas, data cleaning, and validation',
    'Data visualization': 'Chart selection, dashboard hierarchy, and accessible color',
    React: 'Component composition, state, and user interface patterns',
    Accessibility: 'Semantic HTML, keyboard support, and assistive technology',
    'CSS systems': 'Responsive layouts, design tokens, and maintainable styles',
    Authentication: 'Session design, password safety, and authorization boundaries',
    'User research': 'Interview planning, synthesis, and evidence',
  };
  return topics[name] || `${name} foundations, practical patterns, and a small portfolio example`;
};

export const careers: Career[] = roleDefs.map(([id, title, category, names]) => {
  const descriptionMap: Record<string, string> = {
    'Generative AI Engineer': 'Build grounded, useful applications around language models and retrieval.',
    'AI/ML Engineer': 'Turn data and experiments into dependable machine-learning products.',
    'Data Scientist': 'Use statistical thinking to find patterns and guide better decisions.',
    'Data Analyst': 'Translate business questions into clear, trustworthy data stories.',
    'Full-Stack Developer': 'Shape complete product experiences, from interface to data layer.',
    'Frontend Developer': 'Build fast, inclusive interfaces that make digital products feel clear.',
    'Backend Developer': 'Design reliable services, APIs, and data foundations for products.',
    'Cloud Engineer': 'Create secure, reliable infrastructure for modern applications.',
    'Cybersecurity Analyst': 'Help teams identify threats, investigate incidents, and reduce risk.',
    'UI/UX Designer': 'Make complex products feel intuitive through research, systems, and craft.',
    'Product Manager': 'Connect user needs, business outcomes, and teams around the right work.',
    'DevOps Engineer': 'Help software teams ship safely through automation and observability.',
  };
  const skills = names.map((name, i) => ({ name, targetLevel: (i === 0 || i === 1 ? 2 : 2) as Level, topic: topicsFor(name) }));
  return {
    id, title, category, description: descriptionMap[title], skills,
    roadmap: [
      { title: 'Build the foundations', week: 1, skills: [names[0], names[1]], resource: `Study: ${topicsFor(names[0])}`, project: `Create a small, documented ${names[0]} practice project.`, hours: 4 },
      { title: 'Practice the core workflow', week: 2, skills: [names[1], names[2]], resource: `Explore: ${topicsFor(names[1])}`, project: `Build a focused demo using ${names[1]} and explain your decisions.`, hours: 5 },
      { title: 'Create a portfolio piece', week: 3, skills: [names[2], names[3]], resource: `Review examples and practice: ${topicsFor(names[2])}`, project: `Publish one polished project that demonstrates ${names[2]}.`, hours: 6 },
      { title: 'Tell your career story', week: 4, skills: [names[3], names[4]], resource: `Practice: ${topicsFor(names[4])}`, project: `Write a concise case study and practice explaining the outcome.`, hours: 3 },
    ],
  };
});

export const getCareer = (id: string | null | undefined): Career => careers.find((career) => career.id === id) || careers[0];
export const uid = (): string => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
export const blankState = (): AppState => ({
  user: null, careerId: null, skillLevels: {}, assessmentHistory: [], roadmapDone: [],
  plannerTasks: [
    { id: uid(), title: 'Explore the role requirements', dueDate: '', priority: 'Medium', completed: false },
    { id: uid(), title: 'Choose one skill to practice this week', dueDate: '', priority: 'High', completed: false },
  ],
  resumeAnalysis: null, coachMessages: [],
});
export const loadState = (): AppState => {
  try {
    const raw = localStorage.getItem('careerbloom-demo-v1');
    if (!raw) return blankState();
    const value = JSON.parse(raw) as Partial<AppState>;
    const fresh = blankState();
    const rawUser = value.user as Partial<DemoUser> | null | undefined;
    const rawLevels = value.skillLevels;
    const skillLevels = rawLevels && typeof rawLevels === 'object' && !Array.isArray(rawLevels)
      ? Object.fromEntries(Object.entries(rawLevels).filter(([, level]) => Number.isInteger(level) && Number(level) >= 0 && Number(level) <= 3)) as Record<string, Level>
      : {};
    const assessmentHistory = Array.isArray(value.assessmentHistory) ? value.assessmentHistory.filter((item): item is Snapshot =>
      !!item && typeof item.at === 'string' && Number.isFinite(item.average) && !!item.levels && typeof item.levels === 'object') : [];
    const plannerTasks = Array.isArray(value.plannerTasks) ? value.plannerTasks.filter((task): task is PlannerTask =>
      !!task && typeof task.id === 'string' && typeof task.title === 'string' && typeof task.dueDate === 'string' && ['Low', 'Medium', 'High'].includes(task.priority) && typeof task.completed === 'boolean') : fresh.plannerTasks;
    const rawResume = value.resumeAnalysis as ResumeAnalysis | null | undefined;
    const resumeAnalysis = rawResume && typeof rawResume.fileName === 'string' && typeof rawResume.text === 'string' &&
      Array.isArray(rawResume.detected) && Array.isArray(rawResume.missing) && typeof rawResume.analyzedAt === 'string' ? rawResume : null;
    const coachMessages = Array.isArray(value.coachMessages) ? value.coachMessages.filter((message): message is CoachMessage =>
      !!message && typeof message.id === 'string' && ['user', 'assistant'].includes(message.role) && typeof message.text === 'string' && typeof message.at === 'string') : [];
    return {
      ...fresh,
      user: rawUser && typeof rawUser.name === 'string' && typeof rawUser.passwordHash === 'string' && typeof rawUser.salt === 'string'
        ? { name: rawUser.name, passwordHash: rawUser.passwordHash, salt: rawUser.salt } : null,
      careerId: careers.some((career) => career.id === value.careerId) ? value.careerId as string : null,
      skillLevels,
      assessmentHistory,
      roadmapDone: Array.isArray(value.roadmapDone) ? value.roadmapDone.filter((title): title is string => typeof title === 'string') : [],
      plannerTasks,
      resumeAnalysis,
      coachMessages,
    };
  } catch {
    return blankState();
  }
};
export const strengthName = (level: number): string => ['Not started', 'Beginner', 'Intermediate', 'Advanced'][level] || 'Not started';
export const assessReadiness = (career: Career, levels: Record<string, number>): number => {
  if (!career.skills.length) return 0;
  return Math.round(career.skills.reduce((sum, skill) => sum + Math.min((levels[skill.name] || 0) / skill.targetLevel, 1), 0) / career.skills.length * 100);
};

export function coachReply(question: string, career: Career, levels: Record<string, number>, done: string[]): string {
  const lower = question.toLowerCase();
  const weakest = career.skills.slice().sort((a, b) => (levels[a.name] || 0) - (levels[b.name] || 0))[0];
  const next = career.roadmap.find((item) => !done.includes(item.title)) || career.roadmap[career.roadmap.length - 1];
  if (/(project|portfolio|build)/.test(lower)) return `A good next portfolio piece for ${career.title}: ${next.project} Keep the scope small enough to finish, then document the decisions and what you learned.`;
  if (/(week|routine|plan|schedule)/.test(lower)) return `Try two focused sessions this week: one to learn ${weakest.name} (${weakest.topic.toLowerCase()}), and one to apply it in a small exercise. Your next roadmap step is “${next.title},” estimated at ${next.hours} hours.`;
  if (/(resume|cv|interview|prepare)/.test(lower)) return `For a ${career.title} application, connect evidence to the role: describe the problem, your contribution, and the outcome. A project demonstrating ${weakest.name} would strengthen that story.`;
  if (/(gap|skill|learn|next)/.test(lower)) return `Based on your self-ratings, ${weakest.name} is currently your lowest-rated area. Start with ${weakest.topic.toLowerCase()}, then use it in: ${next.project}`;
  return `For your ${career.title} goal, start with ${weakest.name}: ${weakest.topic}. The current suggested roadmap step is “${next.title}.” These are local recommendations based on your selected role and self-ratings.`;
}
