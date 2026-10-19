import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  BookOpen,
  Award,
  BarChart3,
  Terminal,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Headphones,
  ChevronDown,
  ChevronRight,
  UserCheck,
  ShieldAlert,
  Play,
  Pause,
  RefreshCw,
  ExternalLink,
  Save,
  Zap,
} from "lucide-react";

export function meta() {
  return [
    { title: "ExamPlatform — IELTS & Quiz Studio" },
    { name: "description", content: "Fullstack IELTS Prep & Examination Platform" },
  ];
}

export default function Home() {
  // Navigation & Role State
  const [activeTab, setActiveTab] = useState<"packages" | "quiz" | "analytics" | "inspector">("packages");
  const [role, setRole] = useState<"admin" | "student">("student");
  const [token, setToken] = useState<string>("");
  const [userName, setUserName] = useState<string>("Student User");
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // IELTS Packages State
  const [packages, setPackages] = useState<any[]>([]);
  const [loadingPackages, setLoadingPackages] = useState<boolean>(false);
  const [expandedUnitId, setExpandedUnitId] = useState<number | null>(null);

  // Preview Modal State
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    document: any | null;
    previewUrl: string;
    totalPages: number;
    previewPages: number;
    currentPage: number;
    expiresAt: string;
    isPlaying: boolean;
  }>({
    isOpen: false,
    document: null,
    previewUrl: "",
    totalPages: 1,
    previewPages: 1,
    currentPage: 1,
    expiresAt: "",
    isPlaying: false,
  });

  // Quiz State
  const [exams, setExams] = useState<any[]>([]);
  const [cacheStatus, setCacheStatus] = useState<string>("MISS");
  const [loadingExams, setLoadingExams] = useState<boolean>(false);
  const [activeAttempt, setActiveAttempt] = useState<any | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [lastSaved, setLastSaved] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(3600);
  const [examResult, setExamResult] = useState<any | null>(null);

  // Analytics State
  const [analyticsExamId, setAnalyticsExamId] = useState<number>(1);
  const [statsData, setStatsData] = useState<any | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);

  // Live Inspector State
  const [inspectorLog, setInspectorLog] = useState<{
    method: string;
    endpoint: string;
    status: number;
    payload: any;
  } | null>(null);

  // GSAP Container Ref
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-login on mount or role change
  useEffect(() => {
    loginAs(role);
  }, [role]);

  // Animate tab transitions with GSAP
  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
      );
    }
  }, [activeTab]);

  // Countdown timer for active exam
  useEffect(() => {
    if (!activeAttempt || examResult) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeAttempt, examResult]);

  // Login handler
  const loginAs = async (targetRole: "admin" | "student") => {
    setAuthLoading(true);
    const email = targetRole === "admin" ? "admin@example.com" : "student@example.com";
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, password: "password123" }),
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        setUserName(data.user?.name || (targetRole === "admin" ? "Admin" : "Student"));
      }
    } catch (err) {
      console.error("Login failed", err);
    } finally {
      setAuthLoading(false);
    }
  };

  // Fetch Packages
  const fetchPackages = async () => {
    setLoadingPackages(true);
    try {
      const res = await fetch("/api/packages", {
        headers: { Accept: "application/json" },
      });
      const data = await res.json();
      setPackages(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPackages(false);
    }
  };

  // Fetch Exams
  const fetchExams = async () => {
    setLoadingExams(true);
    try {
      const res = await fetch("/api/exams", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setExams(data.data || []);
      setCacheStatus(data.cache_status || res.headers.get("X-Cache") || "MISS");
      setInspectorLog({
        method: "GET",
        endpoint: "/api/exams",
        status: res.status,
        payload: data,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingExams(false);
    }
  };

  // Load initial data on mount
  useEffect(() => {
    fetchPackages();
    fetchExams();
  }, []);

  // Request Document Preview
  const requestPreview = async (doc: any) => {
    try {
      const res = await fetch(`/api/documents/${doc.id}/preview`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setPreviewModal({
          isOpen: true,
          document: doc,
          previewUrl: data.preview_url,
          totalPages: data.total_pages || 10,
          previewPages: data.preview_pages || 3,
          currentPage: 1,
          expiresAt: data.expires_at,
          isPlaying: false,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Start Exam Attempt
  const startExam = async (examId: number) => {
    try {
      const res = await fetch(`/api/exams/${examId}/attempts`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setActiveAttempt(data);
        setTimeLeft((data.duration_minutes || 60) * 60);
        setSelectedAnswers({});
        setExamResult(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Autosave selection
  const handleAnswerSelect = async (questionId: number, optionId: number) => {
    const updated = { ...selectedAnswers, [questionId]: optionId };
    setSelectedAnswers(updated);

    if (!activeAttempt) return;

    setAutosaveStatus("saving");
    try {
      const formattedAnswers = Object.entries(updated).map(([qId, optId]) => ({
        question_id: Number(qId),
        option_id: optId,
      }));

      const res = await fetch(`/api/attempts/${activeAttempt.id}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers: formattedAnswers }),
      });

      if (res.ok) {
        setAutosaveStatus("saved");
        setLastSaved(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error("Autosave failed", err);
    }
  };

  // Submit Exam Attempt
  const submitExam = async () => {
    if (!activeAttempt) return;

    try {
      const formattedAnswers = Object.entries(selectedAnswers).map(([qId, optId]) => ({
        question_id: Number(qId),
        option_id: optId,
      }));

      const res = await fetch(`/api/attempts/${activeAttempt.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers: formattedAnswers }),
      });

      const data = await res.json();
      if (res.ok) {
        setExamResult(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Exam Statistics (Admin)
  const fetchStats = async (examId: number) => {
    setLoadingStats(true);
    try {
      const res = await fetch(`/api/admin/exams/${examId}/statistics`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setStatsData(data);
      setInspectorLog({
        method: "GET",
        endpoint: `/api/admin/exams/${examId}/statistics`,
        status: res.status,
        payload: data,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-48 bg-gradient-to-r from-indigo-600/10 via-purple-600/15 to-pink-600/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#070b14]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              ExamPlatform
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-mono">IELTS & Quiz Engine</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
                API 8080 LIVE
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab("packages")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === "packages"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            IELTS Packages
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === "quiz"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Quiz Arena
          </button>
          <button
            onClick={() => {
              setActiveTab("analytics");
              fetchStats(analyticsExamId);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === "analytics"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Analytics (Mongo)
          </button>
          <button
            onClick={() => setActiveTab("inspector")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === "inspector"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            API Inspector
          </button>
        </nav>

        {/* Role Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setRole("student")}
              className={`px-2.5 py-1 text-xs rounded font-medium transition ${
                role === "student"
                  ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Student
            </button>
            <button
              onClick={() => setRole("admin")}
              className={`px-2.5 py-1 text-xs rounded font-medium transition ${
                role === "admin"
                  ? "bg-purple-600/20 text-purple-400 border border-purple-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Admin
            </button>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium text-slate-200">{userName}</div>
            <div className="text-[10px] text-slate-500 font-mono uppercase">{role} access</div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6" ref={contentRef}>
        {/* ========================================================================= */}
        {/* TAB 1: IELTS STUDY PACKAGES & TIME-BOXED SIGNED PREVIEW */}
        {/* ========================================================================= */}
        {activeTab === "packages" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">IELTS Learning Packages</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Comprehensive IELTS units, authentic Cambridge exams, and time-boxed signed previews.
                </p>
              </div>
              <button
                onClick={fetchPackages}
                disabled={loadingPackages}
                className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-300 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingPackages ? "animate-spin" : ""}`} />
                Refresh Packages
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {packages.map((pkg) => (
                <div key={pkg.id} className="glass-card rounded-2xl p-6 transition duration-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          Full IELTS Suite
                        </span>
                        <span className="text-xs font-mono text-emerald-400 font-bold">${pkg.price}</span>
                      </div>
                      <h2 className="text-xl font-bold text-white mt-2">{pkg.title}</h2>
                      <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">{pkg.description}</p>
                    </div>
                  </div>

                  {/* Units Accordion */}
                  <div className="mt-6 border-t border-slate-800/80 pt-4 space-y-3">
                    <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Course Curriculum ({pkg.units?.length || 0} Units)
                    </h3>
                    <div className="space-y-2">
                      {pkg.units?.map((unit: any) => {
                        const isExpanded = expandedUnitId === unit.id;
                        return (
                          <div key={unit.id} className="rounded-xl border border-slate-800/80 bg-slate-900/50 overflow-hidden">
                            <button
                              onClick={() => setExpandedUnitId(isExpanded ? null : unit.id)}
                              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/40 transition"
                            >
                              <div className="flex items-center gap-3">
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-indigo-400" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-slate-500" />
                                )}
                                <div>
                                  <span className="font-semibold text-sm text-slate-200">{unit.title}</span>
                                  {unit.description && (
                                    <p className="text-xs text-slate-500 mt-0.5">{unit.description}</p>
                                  )}
                                </div>
                              </div>
                              <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                                {unit.documents?.length || 0} documents
                              </span>
                            </button>

                            {isExpanded && (
                              <div className="p-4 bg-slate-950/60 border-t border-slate-800/60 space-y-2">
                                {unit.documents?.map((doc: any) => (
                                  <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition"
                                  >
                                    <div className="flex items-center gap-3">
                                      {doc.type === "audio" ? (
                                        <div className="p-2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                          <Headphones className="w-4 h-4" />
                                        </div>
                                      ) : (
                                        <div className="p-2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                          <FileText className="w-4 h-4" />
                                        </div>
                                      )}
                                      <div>
                                        <div className="text-xs font-semibold text-slate-200">{doc.title}</div>
                                        <div className="text-[11px] text-slate-500">
                                          {doc.type.toUpperCase()} • {doc.preview_pages} pages preview limit
                                        </div>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => requestPreview(doc)}
                                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      Time-Boxed Preview
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: STUDENT QUIZ & MONGO AUTOSAVE */}
        {/* ========================================================================= */}
        {activeTab === "quiz" && (
          <div className="space-y-6">
            {!activeAttempt ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Interactive Quiz Arena</h1>
                    <p className="text-xs text-slate-400 mt-1">
                      Live cached exams from MySQL with instant MongoDB question snapshotting and answer autosave.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border ${
                        cacheStatus === "HIT"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      CACHE {cacheStatus}
                    </span>
                    <button
                      onClick={fetchExams}
                      disabled={loadingExams}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-300 transition"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingExams ? "animate-spin" : ""}`} />
                      Refresh Exams
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {exams.map((exam) => (
                    <div key={exam.id} className="glass-card rounded-2xl p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            Exam #{exam.id}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            {exam.duration_minutes} Minutes
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mt-3">{exam.title}</h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{exam.description}</p>
                        <div className="mt-4 flex items-center gap-4 text-xs text-slate-300">
                          <span>Pass Mark: <strong>{exam.passing_score}%</strong></span>
                          <span>Questions: <strong>{exam.questions?.length || 0}</strong></span>
                        </div>
                      </div>

                      <button
                        onClick={() => startExam(exam.id)}
                        className="mt-6 w-full py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/25 transition"
                      >
                        Start Exam Attempt
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* ACTIVE QUIZ SCREEN */
              <div className="space-y-6">
                {/* Active Exam Sticky Bar */}
                <div className="glass-panel sticky top-20 z-30 p-4 rounded-xl flex items-center justify-between border border-slate-700/80">
                  <div>
                    <h2 className="text-base font-bold text-white">{activeAttempt.exam_title}</h2>
                    <div className="flex items-center gap-3 text-xs mt-0.5">
                      <span className="text-slate-400">Attempt #{activeAttempt.attempt_id || activeAttempt.id}</span>
                      <span className="inline-flex items-center gap-1.5 text-emerald-400">
                        <Save className="w-3 h-3" />
                        {autosaveStatus === "saving" && "Saving to MongoDB..."}
                        {autosaveStatus === "saved" && `Autosaved to Mongo (${lastSaved})`}
                        {autosaveStatus === "idle" && "Mongo Autosave Ready"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg font-mono text-sm font-bold text-indigo-400">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      {formatTime(timeLeft)}
                    </div>
                    <button
                      onClick={submitExam}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-md shadow-emerald-600/25"
                    >
                      Finish & Submit
                    </button>
                  </div>
                </div>

                {/* Question List */}
                <div className="space-y-6">
                  {activeAttempt.questions?.map((q: any, idx: number) => (
                    <div key={q.id} className="glass-card rounded-2xl p-6 border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-indigo-400">
                          Question {idx + 1} of {activeAttempt.questions.length}
                        </span>
                        <span className="text-xs text-slate-500">{q.points} Points</span>
                      </div>
                      <h4 className="text-base font-medium text-slate-100 mt-2">{q.question_text}</h4>

                      {/* Options */}
                      <div className="mt-4 space-y-2">
                        {q.options?.map((opt: any) => {
                          const isSelected = selectedAnswers[q.id] === opt.id;
                          return (
                            <button
                              key={opt.id}
                              onClick={() => handleAnswerSelect(q.id, opt.id)}
                              className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left text-xs font-medium transition ${
                                isSelected
                                  ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/10"
                                  : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/40"
                              }`}
                            >
                              <span>{opt.option_text}</span>
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  isSelected
                                    ? "border-indigo-500 bg-indigo-500"
                                    : "border-slate-700 bg-slate-800"
                                }`}
                              >
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={submitExam}
                    className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/25 transition"
                  >
                    Submit All Answers for Server-Side Grading
                  </button>
                </div>
              </div>
            )}

            {/* Exam Results Modal */}
            {examResult && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-slate-700 text-center space-y-4">
                  <div
                    className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
                      examResult.is_passed
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {examResult.is_passed ? (
                      <CheckCircle2 className="w-8 h-8" />
                    ) : (
                      <XCircle className="w-8 h-8" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {examResult.is_passed ? "Exam Passed!" : "Exam Needs Improvement"}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Graded server-side with zero client-side answer leakage.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Score</div>
                      <div className="text-lg font-bold text-white mt-0.5">{examResult.score} / {examResult.total_points}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Percentage</div>
                      <div className="text-lg font-bold text-indigo-400 mt-0.5">{examResult.percentage}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Outcome</div>
                      <div className={`text-lg font-bold mt-0.5 ${examResult.is_passed ? "text-emerald-400" : "text-rose-400"}`}>
                        {examResult.is_passed ? "PASS" : "FAIL"}
                      </div>
                    </div>
                  </div>

                  <div className="text-left rounded-xl bg-slate-900 border border-slate-800 p-3 max-h-64 overflow-y-auto space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Incorrect answers review
                    </h4>
                    {examResult.wrong_questions?.length ? (
                      examResult.wrong_questions.map((wrong: any) => {
                        const question = activeAttempt.questions?.find(
                          (q: any) => Number(q.id) === Number(wrong.question_id),
                        );
                        const selectedOption = question?.options?.find(
                          (option: any) => Number(option.id) === Number(wrong.selected_option_id),
                        );
                        const correctOption = question?.options?.find(
                          (option: any) => Number(option.id) === Number(wrong.correct_option_id),
                        );

                        return (
                          <div
                            key={wrong.question_id}
                            className="border-t border-slate-800 pt-2 first:border-t-0 first:pt-0"
                          >
                            <p className="text-xs font-medium text-slate-200">
                              {wrong.question_text || `Question #${wrong.question_id}`}
                            </p>
                            <p className="text-[11px] text-rose-400 mt-1">
                              Your answer: {selectedOption?.option_text ?? "Not answered"}
                            </p>
                            <p className="text-[11px] text-emerald-400">
                              Correct answer: {correctOption?.option_text ?? "N/A"}
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-emerald-400">All answers are correct.</p>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setActiveAttempt(null);
                      setExamResult(null);
                      fetchExams();
                    }}
                    className="w-full py-2.5 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-white transition"
                  >
                    Return to Exam Arena
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ADMIN ANALYTICS & MONGO AGGREGATION */}
        {/* ========================================================================= */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Admin Analytics (MongoDB Aggregation)</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Aggregated statistics, top 10 leaderboard, and worst questions computed directly from the attempts collection.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={analyticsExamId}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setAnalyticsExamId(id);
                    fetchStats(id);
                  }}
                  className="bg-slate-900 border border-slate-800 text-xs rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value={1}>Exam #1: IELTS Reading 1</option>
                  <option value={2}>Exam #2: Live Assessment</option>
                  <option value={3}>Exam #3: General Knowledge</option>
                  <option value={4}>Exam #4: E2E Verified</option>
                  <option value={5}>Exam #5: France Capital Test</option>
                </select>
                <button
                  onClick={() => fetchStats(analyticsExamId)}
                  disabled={loadingStats}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-300 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? "animate-spin" : ""}`} />
                  Recalculate
                </button>
              </div>
            </div>

            {statsData && (
              <>
                {/* Stats Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="glass-card p-5 rounded-2xl border border-slate-800">
                    <div className="text-xs text-slate-400 font-medium">Average Score</div>
                    <div className="text-2xl font-bold text-indigo-400 mt-1">{statsData.average_score}</div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Mongo $avg pipeline</span>
                  </div>
                  <div className="glass-card p-5 rounded-2xl border border-slate-800">
                    <div className="text-xs text-slate-400 font-medium">Completed Attempts</div>
                    <div className="text-2xl font-bold text-white mt-1">{statsData.total_completed_attempts}</div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Filtered status=completed</span>
                  </div>
                  <div className="glass-card p-5 rounded-2xl border border-slate-800">
                    <div className="text-xs text-slate-400 font-medium">Highest Score</div>
                    <div className="text-2xl font-bold text-emerald-400 mt-1">{statsData.highest_score}</div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Mongo $max pipeline</span>
                  </div>
                  <div className="glass-card p-5 rounded-2xl border border-slate-800">
                    <div className="text-xs text-slate-400 font-medium">Lowest Score</div>
                    <div className="text-2xl font-bold text-rose-400 mt-1">{statsData.lowest_score}</div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Mongo $min pipeline</span>
                  </div>
                </div>

                {/* Leaderboard & Worst Questions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top 10 Students */}
                  <div className="glass-card p-6 rounded-2xl border border-slate-800">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                      <Award className="w-4 h-4 text-amber-400" />
                      Top 10 Students (Mongo Aggregation + MySQL Join)
                    </h3>
                    {statsData.top_students?.length > 0 ? (
                      <div className="space-y-2">
                        {statsData.top_students.map((student: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  idx === 0
                                    ? "bg-amber-400 text-slate-950"
                                    : idx === 1
                                    ? "bg-slate-300 text-slate-950"
                                    : idx === 2
                                    ? "bg-amber-700 text-white"
                                    : "bg-slate-800 text-slate-400"
                                }`}
                              >
                                {idx + 1}
                              </span>
                              <div>
                                <span className="text-xs font-semibold text-slate-200">{student.user_name}</span>
                                <span className="text-[10px] text-slate-500 block">User ID: #{student.user_id}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-indigo-400">{student.highest_score} pts</span>
                              <span className="text-[10px] text-slate-500 block">{student.attempts_count} attempt(s)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-xs text-slate-500">No completed attempts recorded yet.</div>
                    )}
                  </div>

                  {/* Most Incorrect Questions */}
                  <div className="glass-card p-6 rounded-2xl border border-slate-800">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      Most Incorrect Questions ($unwind Pipeline)
                    </h3>
                    {statsData.most_incorrect_questions?.length > 0 ? (
                      <div className="space-y-2">
                        {statsData.most_incorrect_questions.map((q: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between"
                          >
                            <div className="max-w-md">
                              <span className="text-xs font-medium text-slate-200">
                                Question #{q.question_id}: {q.question_text || "Comprehension Prompt"}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              {q.incorrect_count} Failures
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-xs text-slate-500">
                        No incorrect question data found for this exam.
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: LIVE API INSPECTOR */}
        {/* ========================================================================= */}
        {activeTab === "inspector" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Live API Inspector & cURL Explorer</h1>
              <p className="text-xs text-slate-400 mt-1">
                Inspect real HTTP status codes, headers, and payload structures from the live Laravel server.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={fetchExams}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-left hover:border-indigo-500/40 transition"
              >
                <div className="text-xs font-mono font-bold text-indigo-400">GET /api/exams</div>
                <div className="text-[11px] text-slate-400 mt-1">Tests Caching & list response</div>
              </button>
              <button
                onClick={() => fetchStats(1)}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-left hover:border-indigo-500/40 transition"
              >
                <div className="text-xs font-mono font-bold text-indigo-400">GET /api/admin/exams/1/statistics</div>
                <div className="text-[11px] text-slate-400 mt-1">Tests Mongo aggregation pipeline</div>
              </button>
              <button
                onClick={() => loginAs(role)}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-left hover:border-indigo-500/40 transition"
              >
                <div className="text-xs font-mono font-bold text-indigo-400">POST /api/login</div>
                <div className="text-[11px] text-slate-400 mt-1">Generates Sanctum Bearer Token</div>
              </button>
            </div>

            {inspectorLog && (
              <div className="glass-card rounded-2xl p-6 border border-slate-800">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded font-bold bg-indigo-500/20 text-indigo-400">
                      {inspectorLog.method}
                    </span>
                    <span className="text-slate-300">{inspectorLog.endpoint}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                      inspectorLog.status < 300
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    HTTP {inspectorLog.status}
                  </span>
                </div>
                <pre className="mt-4 p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto max-h-96">
                  {JSON.stringify(inspectorLog.payload, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* TIME-BOXED DOCUMENT PREVIEW MODAL */}
      {/* ========================================================================= */}
      {previewModal.isOpen && previewModal.document && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl rounded-2xl p-6 border border-slate-700/80 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {previewModal.document.type.toUpperCase()} PREVIEW
                  </span>
                  <span className="text-xs text-slate-400">Signed URL: Active</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">{previewModal.document.title}</h3>
              </div>
              <button
                onClick={() => setPreviewModal({ ...previewModal, isOpen: false, isPlaying: false })}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            {/* Simulated Viewer Body */}
            {previewModal.document.type === "pdf" ? (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-center space-y-4 min-h-[260px] flex flex-col justify-between">
                <div className="p-4 bg-slate-900/60 rounded-lg border border-slate-800 text-left">
                  <div className="h-4 w-3/4 bg-slate-800 rounded mb-2 animate-pulse" />
                  <div className="h-3 w-full bg-slate-800/60 rounded mb-1.5" />
                  <div className="h-3 w-5/6 bg-slate-800/60 rounded mb-1.5" />
                  <div className="h-3 w-2/3 bg-slate-800/60 rounded" />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 px-2">
                  <span>
                    Preview Page: <strong>{previewModal.currentPage}</strong> / {previewModal.previewPages} (Signed limit)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={previewModal.currentPage <= 1}
                      onClick={() =>
                        setPreviewModal((prev) => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))
                      }
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white"
                    >
                      Prev
                    </button>
                    <button
                      disabled={previewModal.currentPage >= previewModal.previewPages}
                      onClick={() =>
                        setPreviewModal((prev) => ({
                          ...prev,
                          currentPage: Math.min(prev.previewPages, prev.currentPage + 1),
                        }))
                      }
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 flex flex-col items-center justify-center space-y-4 min-h-[220px]">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Headphones className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-slate-300">IELTS Authentic Listening Track</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Streaming via temporary signed signature</div>
                </div>

                {/* Audio controls */}
                <button
                  onClick={() =>
                    setPreviewModal((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))
                  }
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                >
                  {previewModal.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {previewModal.isPlaying ? "Pause Stream" : "Play Preview Track"}
                </button>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800/80">
              <span className="font-mono text-[10px] truncate max-w-sm">
                Expires: {previewModal.expiresAt ? new Date(previewModal.expiresAt).toLocaleTimeString() : "15m"}
              </span>
              <button
                onClick={() => setPreviewModal({ ...previewModal, isOpen: false, isPlaying: false })}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
