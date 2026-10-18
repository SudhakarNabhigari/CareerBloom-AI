import { useState } from "react";
import {
  Sparkles, Compass, Target, TrendingUp, LayoutDashboard,
  Map, CalendarDays, Bell, Search,
  ArrowRight, CheckCircle2, Clock,
  BrainCircuit, ChevronRight,
  Menu, Eye, EyeOff, LogOut, Zap, Settings
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, Tooltip,
  CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, RadialBarChart, RadialBar, YAxis
} from "recharts";
import "./index.css";



const skills = [
  { name: "Python", value: 78, color: "#9a75ff" },
  { name: "Data Structures", value: 56, color: "#5cbdff" },
  { name: "Machine Learning", value: 42, color: "#45d6b0" },
  { name: "System Design", value: 30, color: "#ffbd78" }
];




const subjectAnalytics = [
  { name: "Python", completed: 78, hours: 2.5, color: "#4f8cff" },
  { name: "Data Structures", completed: 56, hours: 1.8, color: "#a78bfa" },
  { name: "Machine Learning", completed: 42, hours: 2.0, color: "#34d399" },
  { name: "Mathematics", completed: 65, hours: 1.2, color: "#fbbf24" },
  { name: "Cloud Computing", completed: 35, hours: 1.0, color: "#fb7185" },
];

const dailyStudyData = [
  { day: "Mon", Python: 1.5, DSA: 2, ML: 1, Math: 0.5 },
  { day: "Tue", Python: 2, DSA: 1.5, ML: 1.5, Math: 1 },
  { day: "Wed", Python: 1, DSA: 2, ML: 2, Math: 0.5 },
  { day: "Thu", Python: 2, DSA: 1, ML: 1.5, Math: 1 },
  { day: "Fri", Python: 2.5, DSA: 1.5, ML: 1, Math: 0.5 },
  { day: "Sat", Python: 2, DSA: 2, ML: 2, Math: 1 },
  { day: "Sun", Python: 1.5, DSA: 1, ML: 1.5, Math: 1 },
];

const careerDetails: Record<string, {
  description: string;
  companies: string[];
  skills: string[];
  certifications: string[];
  projects: string[];
  salary: string;
  tip: string;
}> = {
  "Generative AI Engineer": {
    description: "Build applications powered by large language models, RAG, AI agents and generative AI APIs.",
    companies: ["Microsoft", "Google", "Amazon", "NVIDIA", "Adobe", "Accenture", "Infosys"],
    skills: ["Python", "LLMs", "RAG", "Prompt Engineering", "Vector Databases", "APIs", "Cloud Deployment"],
    certifications: ["Microsoft Azure AI Engineer", "Azure AI Fundamentals", "Cloud or GenAI specialization"],
    projects: ["RAG chatbot over PDFs", "AI research assistant", "LLM evaluation dashboard"],
    salary: "Varies by skills, company, location and experience. Check current job listings for reliable ranges.",
    tip: "Build one deployed GenAI project with evaluation, citations, error handling and a clear README."
  },
  "Machine Learning Engineer": {
    description: "Train, evaluate and deploy machine learning models that solve real-world problems.",
    companies: ["Google", "Microsoft", "Amazon", "NVIDIA", "Walmart Global Tech", "Flipkart", "Adobe"],
    skills: ["Python", "Statistics", "Scikit-learn", "PyTorch", "SQL", "Model Evaluation", "MLOps"],
    certifications: ["Azure AI Engineer", "Cloud ML specialization", "Machine Learning coursework"],
    projects: ["End-to-end prediction API", "Recommendation system", "Model monitoring dashboard"],
    salary: "Varies by skills, company, location and experience. Check current job listings for reliable ranges.",
    tip: "Show the complete ML lifecycle: data cleaning, baseline, evaluation, deployment and monitoring."
  },
  "Software Engineer": {
    description: "Design, build, test and maintain reliable software products and services.",
    companies: ["Microsoft", "Google", "Amazon", "Adobe", "Atlassian", "ServiceNow", "Infosys"],
    skills: ["DSA", "C++ or Java", "JavaScript", "Git", "SQL", "System Design", "Testing"],
    certifications: ["Role-relevant cloud certification", "Programming and software engineering coursework"],
    projects: ["Full-stack application", "REST API with authentication", "Collaborative software project"],
    salary: "Varies by skills, company, location and experience. Check current job listings for reliable ranges.",
    tip: "Practise DSA consistently and be ready to explain your project architecture and trade-offs."
  },
  "Data Scientist": {
    description: "Use statistics, programming and machine learning to turn data into useful decisions.",
    companies: ["Microsoft", "Google", "Amazon", "Adobe", "Walmart Global Tech", "Flipkart", "Fractal"],
    skills: ["Python", "SQL", "Statistics", "Pandas", "Machine Learning", "Visualisation", "Experiment Design"],
    certifications: ["Azure Data Fundamentals", "Role-relevant analytics or ML specialization"],
    projects: ["Customer churn analysis", "Forecasting model", "Interactive analytics dashboard"],
    salary: "Varies by skills, company, location and experience. Check current job listings for reliable ranges.",
    tip: "Explain business impact and why you chose each metric?not just model accuracy."
  },
  "AI Researcher": {
    description: "Explore new AI methods, run experiments and communicate findings through reproducible research.",
    companies: ["Google DeepMind", "Microsoft Research", "OpenAI", "NVIDIA Research", "Adobe Research", "Amazon"],
    skills: ["Linear Algebra", "Probability", "Python", "PyTorch", "Deep Learning", "Research Reading", "Experiment Design"],
    certifications: ["Deep learning specialization", "Research-oriented ML coursework"],
    projects: ["Reproduce a research paper", "Compare model architectures", "Publish an experiment report"],
    salary: "Varies substantially by research role, qualifications, company and location.",
    tip: "Read papers, reproduce a result and document experiments carefully. Research roles may require advanced study."
  }
};

const getCareerDetails = (job: string) => careerDetails[job] || {
  description: "Explore this role's responsibilities, skills and career opportunities, then validate requirements against current job descriptions.",
  companies: ["Microsoft", "Google", "Amazon", "NVIDIA", "Accenture", "Infosys"],
  skills: ["Programming fundamentals", "Problem solving", "Role-specific tools", "Communication", "Git"],
  certifications: ["Choose a certification relevant to the role and its current job listings"],
  projects: ["Build a practical role-specific project", "Deploy a portfolio project", "Document your work on GitHub"],
  salary: "Varies by skills, company, location and experience. Check current job listings for reliable ranges.",
  tip: "Compare 5-10 current job descriptions and build projects that demonstrate their repeated requirements."
};

function App() {
  const [user, setUser] = useState(localStorage.getItem("cb-user") || "");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [page, setPage] = useState("Overview");
  const [search, setSearch] = useState("");
  const [career, setCareer] = useState(localStorage.getItem("cb-career") || "Generative AI Engineer");
  const [onboardingStep, setOnboardingStep] = useState<"welcome" | "career" | "done">(localStorage.getItem("cb-career") ? "done" : "career");
  const [careerSearch, setCareerSearch] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [tasks, setTasks] = useState([
    { name: "Practice 2 DSA problems", done: true },
    { name: "Learn Python decorators", done: true },
    { name: "Build a mini AI project", done: false },
    { name: "Review today's notes", done: false }
  ]);
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState<{ role: string; text: string }[]>([
    { role: "ai", text: "Hey! I'm your CareerBloom coach. Tell me your career goal, and let's make a plan together." }
  ]);

  const logout = () => {
    localStorage.removeItem("cb-user");
    localStorage.removeItem("cb-career");
    setCareer("");
    setCareerSearch("");
    setOnboardingStep("career");
    setUser("");
    setPassword("");
    setConfirmPassword("");
    setOnboardingStep("done");
    setPage("Overview");
  };
  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password.trim()) return;
    if (mode === "register" && password !== confirmPassword) { alert("Passwords do not match."); return; }
    const saved = localStorage.getItem("cb-password:" + name.trim().toLowerCase());
    if (mode === "register") {
      localStorage.setItem("cb-password:" + name.trim().toLowerCase(), password);
    } else if (saved && saved !== password) {
      alert("Incorrect password. Please try again.");
      return;
    }
    localStorage.setItem("cb-user", name.trim());
    setUser(name.trim());
    setOnboardingStep("welcome");
  };


  const sendChat = () => {
    if (!question.trim()) return;
    const q = question.trim();
    setChat(prev => [...prev,
      { role: "user", text: q },
      { role: "ai", text: "Start with one focused step: identify the skills required for your target role, choose one skill to improve this week, and build a small project to demonstrate it. For personalized AI answers, connect an AI API to this app." }
    ]);
    setQuestion("");
  };

  if (!user) return (
    <main className="auth">
      <section className="auth-left">
        <div className="brand"><span className="brand-icon"><Sparkles size={21}/></span> CareerBloom</div>
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={13}/> A LITTLE PROGRESS, EVERY DAY</div>
          <h1>Your next chapter<br/>starts with a plan.</h1>
          <p>Make sense of your career goals, build the skills that matter, and see your progress take shape.</p>
          <div className="benefits">
            {[["Choose a direction","Find a role that feels right",Compass],
              ["Build the right skills","Focus on what moves you forward",Target],
              ["See your progress","Make every small step count",TrendingUp]].map(([title,desc,Icon]: any) =>
              <div className="benefit" key={title}><span className="benefit-icon"><Icon size={18}/></span><div><b>{title}</b><small>{desc}</small></div></div>
            )}
          </div>
          <div className="hero-illustration">
            <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
            <div className="float-card float-left"><Sparkles size={17}/><div><b>AI Skills</b><small>Growing every day</small></div><span className="dot"/></div>
            <div className="person"><div className="hair"/><div className="face"><span/><span/><i/></div><div className="body"/></div>
            <div className="laptop"><div className="screen"><i/><i/><i/></div><div className="base"/></div>
            <div className="float-card float-right"><CheckCircle2 size={18}/><div><b>Roadmap progress</b><small>One step at a time</small></div></div>
            <div className="journey"><small>● YOUR JOURNEY</small><div className="journey-line"><span>01</span><span>02</span><span>03</span><span>04</span></div><div className="journey-labels"><small>Discover</small><small>Learn</small><small>Build</small><small>Launch</small></div></div>
          </div>
          <small className="footer-note">A private, browser-only workspace for your career journey.</small>
        </div>
      </section>
      <section className="auth-right">
        <span className="float-symbol symbol-cap">🎓</span><span className="float-symbol symbol-book">📜</span><span className="float-symbol symbol-bag">💼</span>
        <form className="auth-card" onSubmit={login}>
          <div className="eyebrow">WELCOME {mode === "login" ? "BACK" : "ABOARD"}</div>
          <h2>{mode === "login" ? "Sign in to CareerBloom" : "Create your account"}</h2>
          <p>{mode === "login" ? "Pick up where your preparation left off." : "Your next chapter starts right here."}</p>
          <label>Name or username</label>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your name" autoComplete="username" required/>
          <label>Password</label>
          <div className="password-wrap"><input type={showPassword?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" autoComplete={mode==="login"?"current-password":"new-password"} required/><button className="eye" type="button" onClick={()=>setShowPassword(!showPassword)}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div>
          {mode === "register" && <>
            <label>Confirm Password</label>
            <div className="password-wrap">
              <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Confirm your password" autoComplete="new-password" required />
            </div>
          </>}
          <button className="primary-btn auth-submit" type="submit">{mode==="login"?"Log in":"Create account"} <ArrowRight size={17}/></button>
          <div className="switch-auth">{mode==="login"?"New to CareerBloom?":"Already have an account?"} <button type="button" onClick={()=>setMode(mode==="login"?"register":"login")}>{mode==="login"?"Create an account":"Sign in"}</button></div>
        </form>
      </section>
    </main>
  );

  const careerCatalog = [
    { branch: "Computer Science & Engineering", jobs: ["Software Engineer","Full-Stack Developer","Frontend Developer","Backend Developer","AI Engineer","Generative AI Engineer","Machine Learning Engineer","Data Scientist","Data Engineer","Cybersecurity Engineer","Cloud Engineer","DevOps Engineer","Computer Vision Engineer","NLP Engineer","AI Researcher","Game Developer","Mobile App Developer","Blockchain Developer","Database Engineer","Systems Engineer"] },
    { branch: "Information Technology", jobs: ["IT Engineer","Cloud Architect","Network Engineer","Site Reliability Engineer","IT Security Analyst","Systems Administrator","QA Engineer","Automation Engineer"] },
    { branch: "Artificial Intelligence & Machine Learning", jobs: ["AI Engineer","Machine Learning Engineer","Deep Learning Engineer","MLOps Engineer","NLP Engineer","Computer Vision Engineer","AI Research Scientist","Robotics AI Engineer"] },
    { branch: "Data Science & Data Engineering", jobs: ["Data Scientist","Data Analyst","Data Engineer","Business Intelligence Engineer","Analytics Engineer","Big Data Engineer"] },
    { branch: "Electronics & Communication (ECE)", jobs: ["Electronics Engineer","Embedded Systems Engineer","VLSI Design Engineer","Chip Design Engineer","Telecommunications Engineer","Signal Processing Engineer","IoT Engineer","Firmware Engineer"] },
    { branch: "Electrical & Electronics (EEE)", jobs: ["Electrical Engineer","Power Systems Engineer","Control Systems Engineer","Electrical Design Engineer","Renewable Energy Engineer","EV Systems Engineer","Instrumentation Engineer"] },
    { branch: "Mechanical Engineering", jobs: ["Mechanical Design Engineer","Automotive Engineer","Robotics Engineer","Manufacturing Engineer","Thermal Engineer","Aerospace Design Engineer","CAD Engineer","Mechatronics Engineer"] },
    { branch: "Civil Engineering", jobs: ["Civil Engineer","Structural Engineer","Geotechnical Engineer","Transportation Engineer","Construction Project Engineer","Water Resources Engineer","Environmental Engineer","BIM Engineer"] },
    { branch: "Chemical Engineering", jobs: ["Chemical Process Engineer","Process Design Engineer","Petroleum Engineer","Materials Engineer","Safety Engineer","Pharmaceutical Process Engineer"] },
    { branch: "Biotechnology & Biomedical", jobs: ["Biotechnology Engineer","Biomedical Engineer","Bioinformatics Engineer","Clinical Data Engineer","Medical Device Engineer","Bioprocess Engineer"] },
    { branch: "Aerospace & Aeronautical", jobs: ["Aerospace Engineer","Aeronautical Engineer","Flight Systems Engineer","Propulsion Engineer","Avionics Engineer","Aircraft Design Engineer"] },
    { branch: "Automobile Engineering", jobs: ["Automotive Design Engineer","EV Engineer","Vehicle Dynamics Engineer","Automotive Test Engineer","Powertrain Engineer"] },
    { branch: "Robotics & Mechatronics", jobs: ["Robotics Engineer","Automation Engineer","Mechatronics Engineer","Controls Engineer","Industrial Robotics Engineer"] },
    { branch: "Other Engineering", jobs: ["Industrial Engineer","Production Engineer","Quality Engineer","Agricultural Engineer","Mining Engineer","Marine Engineer","Petroleum Engineer","Environmental Engineer","Nuclear Engineer","Materials Engineer"] }
  ];

  const allCareers = careerCatalog.flatMap(group =>
    group.jobs.map(job => ({ job, branch: group.branch }))
  ).filter((item, index, arr) =>
    arr.findIndex(other => other.job === item.job) === index
  );

  if (user && onboardingStep !== "done") {
    return (
      <main className="career-onboarding">
        <div className="onboarding-glow onboarding-glow-one" />
        <div className="onboarding-glow onboarding-glow-two" />
        <div className="onboarding-brand">
          <span className="brand-icon"><Sparkles size={22}/></span>
          CareerBloom
        </div>

        {onboardingStep === "welcome" ? (
          <section className="welcome-animation">
            <span className="welcome-sparkle"><Sparkles size={35}/></span>
            <div className="onboarding-eyebrow">YOUR NEXT CHAPTER STARTS HERE</div>
            <h1>Welcome to <span>CareerBloom</span>, {user}!</h1>
            <p>Your goals. Your skills. Your future. Let's build your career journey together.</p>
            <button className="primary-btn onboarding-continue" onClick={() => setOnboardingStep("career")}>
              Select your dream career <ArrowRight size={18}/>
            </button>
          </section>
        ) : (
          <section className="career-picker">
            <div className="onboarding-eyebrow"><Sparkles size={14}/> PERSONALIZE YOUR JOURNEY</div>
            <h1>Select your <span>dream career</span></h1>
            <p>Search job roles across engineering branches and choose the career you want to pursue.</p>

            <div className="career-picker-search">
              <Search size={19}/>
              <input
                autoFocus
                value={careerSearch}
                onChange={e => setCareerSearch(e.target.value)}
                placeholder="Search jobs or branches, e.g. AI Engineer, ECE..."
              />
            </div>

            <div className="career-picker-count">
              <span>{allCareers.filter(item => (item.job + " " + item.branch).toLowerCase().includes(careerSearch.toLowerCase())).length} career roles</span>
              <span>Choose one to continue</span>
            </div>

            <div className="career-picker-list">
              {allCareers.filter(item =>
                (item.job + " " + item.branch).toLowerCase().includes(careerSearch.toLowerCase())
              ).map(item => (
                <button
                  key={item.job}
                  className={`career-picker-option ${career === item.job ? "selected" : ""}`}
                  onClick={() => {
                    setCareer(item.job);
                    localStorage.setItem("cb-career", item.job);
                    localStorage.setItem("cb-career-branch", item.branch);
                    setOnboardingStep("done");
                    setPage("Overview");
                  }}
                >
                  <span className="career-option-symbol"><BrainCircuit size={18}/></span>
                  <span className="career-option-copy">
                    <b>{item.job}</b>
                    <small>{item.branch}</small>
                  </span>
                  <ChevronRight size={18}/>
                </button>
              ))}
              {allCareers.filter(item =>
                (item.job + " " + item.branch).toLowerCase().includes(careerSearch.toLowerCase())
              ).length === 0 && (
                <div className="career-empty">No matching careers. Try another job title or engineering branch.</div>
              )}
            </div>
          </section>
        )}
      </main>
    );
  }
  const nav = [
    { group: "CAREER WORKSPACE", items: [
      ["Overview", LayoutDashboard],
      ["Dream Career", Compass],
      ["Skill Assessment", Target],
      ["My Roadmap", Map],
      ["Daily Planner", CalendarDays],
      ["Improvement Analytics", TrendingUp],
      ["Settings", Settings],
    ] as const },
  ];

  return (
    <div className="app-shell">
      {mobileMenu && <button className="mobile-scrim" onClick={()=>setMobileMenu(false)} aria-label="Close menu"/>}
      <aside className={`sidebar ${mobileMenu?"sidebar-open":""}`}>
        <div className="brand side-brand"><span className="brand-icon"><Sparkles size={20}/></span> CareerBloom</div>
        <div className="workspace-label">YOUR WORKSPACE</div>
        {nav.map(group=><div key={group.group}><div className="nav-group">{group.group}</div>{group.items.map(([label,Icon])=><button key={label} className={`nav-item ${page===label?"active":""}`} onClick={()=>{setPage(label==="Dream Career"?"Dream Career":label);setMobileMenu(false)}}><Icon size={18}/><span>{label}</span>{page===label&&<span className="active-mark"/>}</button>)}</div>)}
        <div className="sidebar-bottom"><div className="upgrade-card"><div className="upgrade-icon"><Sparkles size={17}/></div><b>Your future is built daily.</b><p>Small steps. Real progress.</p><button onClick={()=>setPage("Daily Planner")}>View today's plan <ArrowRight size={14}/></button></div><div className="profile-row"><button className="profile" onClick={() => setPage("Profile")}><div className="avatar">{user.slice(0,1).toUpperCase()}</div><div className="profile-copy"><b>{user}</b><small>Career explorer</small></div></button><button className="logout-btn" type="button" title="Log out" aria-label="Log out" onClick={logout}><LogOut size={17}/></button></div></div>
      </aside>
      <main className="main">
        <header className="topbar"><button className="mobile-menu-btn icon-btn" onClick={()=>setMobileMenu(!mobileMenu)}><Menu size={20}/></button><div className="breadcrumb">Workspace <ChevronRight size={14}/><b>{page}</b></div><div className="top-actions"><div className="search-box"><Search size={16}/><input placeholder="Search your workspace..." value={search} onChange={e=>setSearch(e.target.value)}/><kbd>⌘ K</kbd></div><button className="icon-btn" title="Notifications"><Bell size={18}/><span className="notification-dot"/></button></div></header>
        {page==="Overview" ? <div className="content">
          <section className="overview-analytics">
            <div className="analytics-heading">
              <div>
                <span className="eyebrow">YOUR LEARNING AT A GLANCE</span>
                <h2>Study Overview</h2>
                <p>Track subject completion and your daily learning hours.</p>
              </div>
              <span className="analytics-period">Weekly progress</span>
            </div>

            <div className="analytics-card">
              <div className="analytics-card-heading">
                <div><h3>Subject-wise completion</h3><p>Completed learning goals (%)</p></div>
                <span className="chart-tag">Column chart</span>
              </div>
              <div className="overview-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectAnalytics} margin={{top:10,right:12,left:-18,bottom:5}}>
                    <CartesianGrid stroke="#252b43" strokeDasharray="4 5" vertical={false}/>
                    <XAxis dataKey="name" tick={{fill:"#a8b3d1",fontSize:11}} axisLine={false} tickLine={false}/>
                    <YAxis domain={[0,100]} tick={{fill:"#a8b3d1",fontSize:11}} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{background:"#11172a",border:"1px solid #343452",borderRadius:10,color:"#fff"}}/>
                    <Bar dataKey="completed" name="Completion %" fill="#4f8cff" radius={[7,7,0,0]} maxBarSize={52}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="subject-chart-grid">
              {subjectAnalytics.map(subject => (
                <div className="analytics-card subject-analytics-card" key={subject.name}>
                  <div className="analytics-card-heading">
                    <div><h3>{subject.name}</h3><p>Learning completion</p></div>
                    <span className="subject-dot" style={{background:subject.color}}/>
                  </div>
                  <div className="subject-doughnut">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={[{name:"Completed",value:subject.completed},{name:"Remaining",value:100-subject.completed}]} dataKey="value" nameKey="name" innerRadius="65%" outerRadius="86%" startAngle={90} endAngle={-270} paddingAngle={3}>
                          <Cell fill={subject.color}/>
                          <Cell fill="#252b43"/>
                        </Pie>
                        <Tooltip contentStyle={{background:"#11172a",border:"1px solid #343452",borderRadius:10,color:"#fff"}}/>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="doughnut-center"><strong>{subject.completed}%</strong><small>complete</small></div>
                  </div>
                  <div className="radial-progress-row">
                    <div className="radial-chart">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart data={[{name:"Progress",value:subject.completed,fill:subject.color}]} startAngle={90} endAngle={-270} innerRadius="70%" outerRadius="100%">
                          <RadialBar dataKey="value" background={{fill:"#252b43"}} cornerRadius={8}/>
                        </RadialBarChart>
                      </ResponsiveContainer>
                    </div>
                    <div><b>{subject.completed}% achieved</b><small>Subject progress</small></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="analytics-card daily-hours-card">
              <div className="analytics-card-heading">
                <div><h3>Daily study time</h3><p>Hours spent per subject each day</p></div>
                <span className="chart-tag">Hours / day</span>
              </div>
              <div className="overview-chart daily-hours-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyStudyData} margin={{top:10,right:12,left:-18,bottom:0}}>
                    <CartesianGrid stroke="#252b43" strokeDasharray="4 5" vertical={false}/>
                    <XAxis dataKey="day" tick={{fill:"#a8b3d1",fontSize:11}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:"#a8b3d1",fontSize:11}} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{background:"#11172a",border:"1px solid #343452",borderRadius:10,color:"#fff"}}/>
                    <Area type="monotone" dataKey="Python" stackId="1" stroke="#4f8cff" fill="#4f8cff" fillOpacity={0.35}/>
                    <Area type="monotone" dataKey="DSA" stackId="1" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.35}/>
                    <Area type="monotone" dataKey="ML" stackId="1" stroke="#34d399" fill="#34d399" fillOpacity={0.35}/>
                    <Area type="monotone" dataKey="Math" stackId="1" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.35}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="study-legend">
                <span><i style={{background:"#4f8cff"}}/>Python</span>
                <span><i style={{background:"#a78bfa"}}/>Data Structures</span>
                <span><i style={{background:"#34d399"}}/>Machine Learning</span>
                <span><i style={{background:"#fbbf24"}}/>Mathematics</span>
              </div>
            </div>
          </section>
        </div> : <div className="content inner-page"><div className="eyebrow"><Sparkles size={13}/> CAREERBLOOM WORKSPACE</div><h1>{page}</h1><p className="inner-intro">Make your next career move with clarity and confidence.</p>
          {page==="Dream Career"&&<section className="panel inner-panel"><h3>Choose your dream career</h3><p>Search for a role and set your career goal.</p><div className="career-search"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search careers, e.g. AI Engineer"/></div><div className="career-options">{["Generative AI Engineer","Machine Learning Engineer","Software Engineer","Data Scientist","Cloud AI Engineer","AI Researcher"].filter(c=>c.toLowerCase().includes(search.toLowerCase())).map(c=><button key={c} className={`career-option ${career===c?"selected":""}`} onClick={()=>{setCareer(c);localStorage.setItem("cb-career",c)}}><span className="feature-icon"><BrainCircuit size={18}/></span><span><b>{c}</b><small>Explore skills and learning paths</small></span>{career===c?<CheckCircle2 size={19}/>:<ChevronRight size={18}/>}</button>)}</div><button className="primary-btn" onClick={()=>setPage("Learning Roadmap")}>Build my roadmap <ArrowRight size={16}/></button></section>
}{page==="Dream Career"&&<section className="panel inner-panel dream-career-details">
  <div className="eyebrow"><BrainCircuit size={14}/> YOUR SELECTED DREAM CAREER</div>
  <h2>{career || "Choose a career"}</h2>
  <p>{getCareerDetails(career).description}</p>
  <div className="dream-career-facts">
    <div className="dream-career-fact"><b>Career focus</b><span>{localStorage.getItem("cb-career-branch") || "Selected career path"}</span></div>
    <div className="dream-career-fact"><b>Salary insight</b><span>{getCareerDetails(career).salary}</span></div>
  </div>
  <h3>Companies to explore</h3>
  <p>These are examples of employers with relevant technology roles; openings and requirements vary.</p>
  <div className="dream-career-tags">{getCareerDetails(career).companies.map(company=><span key={company}>{company}</span>)}</div>
  <h3>Skills to build</h3>
  <div className="dream-career-tags">{getCareerDetails(career).skills.map(skill=><span key={skill}>{skill}</span>)}</div>
  <h3>Certifications and learning</h3>
  <ul>{getCareerDetails(career).certifications.map(item=><li key={item}>{item}</li>)}</ul>
  <h3>Portfolio projects</h3>
  <ul>{getCareerDetails(career).projects.map(item=><li key={item}>{item}</li>)}</ul>
  <div className="dream-career-tip"><b>Career tip</b><p>{getCareerDetails(career).tip}</p></div>
</section>}
          {page==="Skill Gap Analyzer"&&<section className="panel inner-panel"><h3>Your current skill profile</h3><p>Use these starter estimates to identify what to focus on next.</p>{skills.map(s=><div className="gap-row" key={s.name}><div><b>{s.name}</b><span>{s.value}%</span></div><div className="skill-bar"><span style={{width:s.value+"%",background:s.color}}/></div><small>{s.value<50?"Priority: practice and build a project":"Keep practising and demonstrate your skills"}</small></div>)}<button className="primary-btn" onClick={()=>setPage("Learning Roadmap")}>View learning roadmap <ArrowRight size={16}/></button></section>}
          {page==="Learning Roadmap"&&<section className="panel inner-panel career-roadmap">
  <div className="eyebrow"><Sparkles size={14}/> PERSONALIZED CAREER PLAN</div>
  <h2>My Roadmap to {career || "Your Dream Career"}</h2>
  <p>Follow these milestones in order. Each stage builds skills needed for your selected career.</p>
  {(career==="Generative AI Engineer" ? [
    ["01","Programming Foundations","Python, Git, GitHub, DSA basics, NumPy and Pandas","Build a Python utility and publish it on GitHub."],
    ["02","ML and Deep Learning","Statistics, scikit-learn, model evaluation and PyTorch","Train and evaluate a machine-learning model."],
    ["03","Generative AI and RAG","LLMs, embeddings, vector databases, retrieval, prompting and evaluation","Build a document-based RAG chatbot with source citations."],
    ["04","AI Engineering and Azure","APIs, FastAPI, Azure AI, deployment, security and testing","Deploy an AI application and document its architecture."],
    ["05","Portfolio and Internship","GitHub portfolio, DSA practice, resume, interview preparation and applications","Publish 2-3 polished projects and apply to relevant internships."]
  ] : career==="Machine Learning Engineer" ? [
    ["01","Python and Mathematics","Python, NumPy, Pandas, probability, statistics and linear algebra","Complete a data analysis project."],
    ["02","Core Machine Learning","Scikit-learn, feature engineering, model selection and metrics","Compare multiple models on a real dataset."],
    ["03","Deep Learning","PyTorch, neural networks, computer vision or NLP","Train and evaluate a deep-learning model."],
    ["04","Deployment and MLOps","FastAPI, Docker basics, cloud deployment and model monitoring","Deploy a prediction API."],
    ["05","Portfolio and Interviews","GitHub, DSA, ML interview questions, resume and internship applications","Publish end-to-end ML projects."]
  ] : career==="Software Engineer" ? [
    ["01","Programming and DSA","C++ or Java, arrays, strings, linked lists and complexity","Solve and explain foundational coding problems."],
    ["02","Core Computer Science","OOP, DBMS, operating systems and computer networks","Build a database-backed application."],
    ["03","Development Skills","Git, APIs, testing, SQL and frontend/backend fundamentals","Build a full-stack application with authentication."],
    ["04","Engineering Practices","Debugging, system design basics, deployment and code reviews","Deploy a tested application and document its design."],
    ["05","Placement Preparation","DSA revision, resume, mock interviews and applications","Maintain a portfolio and apply for internships."]
  ] : career==="Data Scientist" ? [
    ["01","Python and Statistics","Python, SQL, Pandas, probability and descriptive statistics","Explore and clean a real dataset."],
    ["02","Analytics and Visualisation","SQL queries, charts, hypothesis testing and storytelling","Create an interactive analytics dashboard."],
    ["03","Machine Learning","Feature engineering, regression, classification and evaluation","Build a churn or forecasting model."],
    ["04","Applied Data Science","Experiment design, model interpretation and deployment basics","Present a project with clear business recommendations."],
    ["05","Portfolio and Interviews","Case studies, SQL practice, resume and internship applications","Publish reproducible projects and prepare interview explanations."]
  ] : career==="AI Researcher" ? [
    ["01","Math and Research Foundations","Linear algebra, probability, calculus and Python","Implement core mathematical concepts in Python."],
    ["02","Deep Learning","PyTorch, neural networks, optimisation and evaluation","Train and compare baseline models."],
    ["03","Read and Reproduce Papers","Paper reading, experiment design and reproducibility","Reproduce a paper's key result and document differences."],
    ["04","Specialise in AI","Choose NLP, vision, generative AI or another research area","Run controlled experiments and analyse results."],
    ["05","Research Portfolio","Technical reports, GitHub, research collaboration and relevant applications","Publish a reproducible report; investigate research internship requirements."]
  ] : [
    ["01","Foundations","Programming, problem-solving and Git","Build a small project relevant to your career."],
    ["02","Core Skills","Learn the tools and concepts required for the selected role","Complete a focused practical assignment."],
    ["03","Applied Project","Build, test and document a role-specific project","Publish the project on GitHub."],
    ["04","Deployment and Practice","Use relevant tools, testing and deployment methods","Create a working demo and project documentation."],
    ["05","Career Preparation","Resume, interview practice and internship applications","Prepare a portfolio aligned with current job descriptions."]
  ]).map((m,i)=><div className="milestone career-roadmap-step" key={m[0]}>
    <span className={`milestone-number ${i===0?"milestone-active":""}`}>{m[0]}</span>
    <div className="career-roadmap-copy">
      <b>{m[1]}</b>
      <p>{m[2]}</p>
      <small><strong>Milestone:</strong> {m[3]}</small>
    </div>
    <span className="milestone-status">{i===0?"Start here":"Upcoming"}</span>
  </div>)}
  <div className="dream-career-tip">
    <b>Your next action</b>
    <p>Start with Stage 01. Practise consistently, save your work on GitHub, and move forward when you can demonstrate the skills through a project.</p>
  </div>
</section>}
          {page==="Daily Planner"&&<section className="panel inner-panel"><div className="panel-heading"><div><h3>Today's action plan</h3><p>Check off each step as you finish it.</p></div><span className="stat-icon purple"><Zap size={18}/></span></div>{tasks.map((t,i)=><label className={`task planner-task ${t.done?"task-done":""}`} key={t.name}><input type="checkbox" checked={t.done} onChange={()=>setTasks(prev=>prev.map((x,j)=>j===i?{...x,done:!x.done}:x))}/><span className="fake-check">{t.done&&<CheckCircle2 size={16}/>}</span><span>{t.name}</span><span className="task-time"><Clock size={14}/> {i+1} hr</span></label>)}<div className="planner-summary"><CheckCircle2 size={19}/>{tasks.filter(t=>t.done).length} of {tasks.length} tasks completed. Keep going!</div></section>}
          {page==="AI Career Coach"&&<section className="panel chat-panel"><div className="chat-heading"><span className="coach-avatar"><Sparkles size={22}/></span><div><h3>Your AI Career Coach</h3><p><span className="online-dot"/> Ready to help you plan</p></div></div><div className="chat-messages">{chat.map((c,i)=><div key={i} className={`chat-bubble ${c.role==="user"?"user-bubble":""}`}>{c.text}</div>)}</div><div className="chat-input"><input value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} placeholder="Ask about your career, skills or interviews..."/><button className="primary-btn" onClick={sendChat}><ArrowRight size={18}/></button></div><small className="chat-disclaimer">Starter demo responses; connect an AI service for live personalized coaching.</small></section>}
        </div>}
      </main>
    </div>
  );
}

export default App;











