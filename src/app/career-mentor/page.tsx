"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CERTIFICATIONS } from "@/lib/data/school";

interface QuizQuestion {
  id: number;
  topic?: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

interface CareerResult {
  job: string;
  summary: string;
  requiredCerts?: Array<{ name: string; reason: string }>;
  recommendedCerts?: Array<{ name: string; reason: string }>;
  studyRoadmap?: string[];
  tips?: string;
}

export default function CareerMentorPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-dim)" }}>로딩 중...</div>}>
      <CareerMentorContent />
    </Suspense>
  );
}

function CareerMentorContent() {
  const searchParams = useSearchParams();
  const initialCert = searchParams.get("cert") || "";

  const [activeTab, setActiveTab] = useState<"career" | "quiz">(initialCert ? "quiz" : "career");

  // 진로 추천 상태
  const [jobInput, setJobInput] = useState<string>("");
  const [careerLoading, setCareerLoading] = useState<boolean>(false);
  const [careerResult, setCareerResult] = useState<CareerResult | null>(null);

  // 퀴즈 상태
  const [quizCertName, setQuizCertName] = useState<string>(initialCert || "정보처리기능사");
  const [quizLevel, setQuizLevel] = useState<string>("중");
  const [quizLoading, setQuizLoading] = useState<boolean>(false);
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  const handleCareerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobInput.trim()) return;

    setCareerLoading(true);
    setCareerResult(null);

    try {
      const res = await fetch("/api/career-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "career-recommend",
          jobTitle: jobInput.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCareerResult(data.data);
      } else {
        alert("분석 결과를 불러오지 못했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("서버 통신 오류가 발생했습니다.");
    } finally {
      setCareerLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setQuizLoading(true);
    setQuizSubmitted(false);
    setSelectedAnswers({});
    setQuizzes([]);

    try {
      const res = await fetch("/api/career-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-quiz",
          certName: quizCertName,
          level: quizLevel,
        }),
      });
      const data = await res.json();
      if (
        data.success &&
        Array.isArray(data.data?.quizzes) &&
        data.data.quizzes.length >= 10
      ) {
        setQuizzes(data.data.quizzes);
      } else {
        alert("중복을 제외한 10문항을 만들지 못했습니다. 다시 시도해 주세요.");
      }
    } catch (err) {
      console.error(err);
      alert("서버 통신 오류가 발생했습니다.");
    } finally {
      setQuizLoading(false);
    }
  };

  const handleSelectOption = (quizId: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [quizId]: optionIdx }));
  };

  const calculateScore = () => {
    let score = 0;
    quizzes.forEach((q) => {
      if (selectedAnswers[q.id] === q.answerIndex) {
        score += 1;
      }
    });
    return score;
  };

  const popularJobs = [
    "임베디드 엔지니어",
    "네트워크 보안 관제사",
    "웹/앱 프론트엔드 개발자",
    "IoT 스마트팩토리 기술자",
    "하드웨어 회로 설계사",
    "AI 머신러닝 개발자",
  ];

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px 100px" }}>
      {/* ───────────────── Hero Title ───────────────── */}
      <div style={{ marginBottom: "40px" }}>
        <div className="section-label">
          <span className="section-label-dot" />
          DGX Spark · Claude Code CLI · Claude Haiku 5.5
        </div>
        <h1 className="title-huge" style={{ fontSize: "2.4rem", marginBottom: "12px" }}>
          AI 맞춤형 진로 & 모의 퀴즈
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
          희망하는 직무를 입력해 로드맵을 확인하고, 자격증 기출 문제를 즉시 풀어보세요.
        </p>
      </div>

      {/* ───────────────── Pill Switcher ───────────────── */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "36px" }}>
        <button
          onClick={() => setActiveTab("career")}
          style={{
            padding: "10px 22px",
            borderRadius: "var(--radius-pill)",
            background: activeTab === "career" ? "var(--selection-bg)" : "var(--bg-pill)",
            color: activeTab === "career" ? "var(--selection-color)" : "var(--text-secondary)",
            border: activeTab === "career" ? "1px solid var(--selection-border)" : "1px solid var(--border-subtle)",
            fontWeight: 700,
            fontSize: "0.88rem",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          직업별 자격증 추천
        </button>
        <button
          onClick={() => setActiveTab("quiz")}
          style={{
            padding: "10px 22px",
            borderRadius: "var(--radius-pill)",
            background: activeTab === "quiz" ? "var(--selection-bg)" : "var(--bg-pill)",
            color: activeTab === "quiz" ? "var(--selection-color)" : "var(--text-secondary)",
            border: activeTab === "quiz" ? "1px solid var(--selection-border)" : "1px solid var(--border-subtle)",
            fontWeight: 700,
            fontSize: "0.88rem",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          AI 모의고사 퀴즈
        </button>
      </div>

      {/* ───────────────── Tab 1: Career ───────────────── */}
      {activeTab === "career" && (
        <div>
          <div className="nixtio-card" style={{ padding: "32px", marginBottom: "36px" }}>
            <form onSubmit={handleCareerSubmit}>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "10px" }}>
                목표 직업 또는 전공 분야
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <input
                  type="text"
                  placeholder="예: 클라우드 엔지니어, 반도체 회로 개발자, 백엔드 개발자..."
                  value={jobInput}
                  onChange={(e) => setJobInput(e.target.value)}
                  className="nixtio-input"
                  style={{ flex: 1, minWidth: "260px" }}
                />
                <button
                  type="submit"
                  disabled={careerLoading || !jobInput.trim()}
                  className="nixtio-btn nixtio-btn-primary"
                  style={{ whiteSpace: "nowrap" }}
                >
                  {careerLoading ? "AI 분석 중..." : "로드맵 생성 →"}
                </button>
              </div>
            </form>

            <div style={{ marginTop: "16px", display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-dim)", marginRight: "4px" }}>추천 키워드:</span>
              {popularJobs.map((job) => (
                <button
                  key={job}
                  onClick={() => setJobInput(job)}
                  style={{
                    background: "var(--bg-pill)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-pill)",
                    padding: "4px 12px",
                    color: "var(--text-secondary)",
                    fontSize: "0.78rem",
                    cursor: "pointer",
                  }}
                >
                  {job}
                </button>
              ))}
            </div>
          </div>

          {/* AI Result Card */}
          {careerResult && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="nixtio-card" style={{ padding: "32px" }}>
                <div className="section-label">
                  <span className="section-label-dot" />
                  맞춤형 진로 분석
                </div>
                <h3 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "8px" }}>
                  {careerResult.job}
                </h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {careerResult.summary}
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                {/* Required */}
                <div className="nixtio-card" style={{ padding: "28px" }}>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "16px", color: "#f87171" }}>
                    ● 취업 필수 자격증
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {careerResult.requiredCerts?.map((c, i) => (
                      <div
                        key={i}
                        style={{
                          background: "var(--bg-pill)",
                          border: "1px solid var(--border-subtle)",
                          padding: "16px",
                          borderRadius: "var(--radius-md)",
                        }}
                      >
                        <div style={{ fontWeight: 800, fontSize: "1rem" }}>{c.name}</div>
                        <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "4px", lineHeight: 1.4 }}>
                          {c.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended */}
                <div className="nixtio-card" style={{ padding: "28px" }}>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "16px", color: "var(--accent-green)" }}>
                    ● 가산점 추천 자격증
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {careerResult.recommendedCerts?.map((c, i) => (
                      <div
                        key={i}
                        style={{
                          background: "var(--bg-pill)",
                          border: "1px solid var(--border-subtle)",
                          padding: "16px",
                          borderRadius: "var(--radius-md)",
                        }}
                      >
                        <div style={{ fontWeight: 800, fontSize: "1rem" }}>{c.name}</div>
                        <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "4px", lineHeight: 1.4 }}>
                          {c.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Roadmap */}
              <div className="nixtio-card" style={{ padding: "32px" }}>
                <h4 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "16px" }}>
                  3개년 단계별 학습 로드맵
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                  {careerResult.studyRoadmap?.map((step: string, i: number) => (
                    <div
                      key={i}
                      style={{
                        padding: "14px 18px",
                        borderRadius: "var(--radius-sm)",
                        background: "var(--bg-pill)",
                        border: "1px solid var(--border-subtle)",
                        fontSize: "0.9rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {step}
                    </div>
                  ))}
                </div>

                {careerResult.tips && (
                  <div
                    style={{
                      background: "rgba(56, 189, 248, 0.05)",
                      border: "1px solid rgba(56, 189, 248, 0.2)",
                      padding: "16px 20px",
                      borderRadius: "var(--radius-md)",
                      fontSize: "0.88rem",
                      color: "var(--accent-cyan)",
                    }}
                  >
                    💡 <strong>학교 활용 조언:</strong> {careerResult.tips}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ───────────────── Tab 2: Quiz ───────────────── */}
      {activeTab === "quiz" && (
        <div>
          <div className="nixtio-card" style={{ padding: "32px", marginBottom: "36px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 160px auto", gap: "16px", alignItems: "flex-end" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-dim)", marginBottom: "6px" }}>
                  시험 종목 선택
                </label>
                <select
                  value={quizCertName}
                  onChange={(e) => setQuizCertName(e.target.value)}
                  className="nixtio-input"
                >
                  {Object.values(CERTIFICATIONS).map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-dim)", marginBottom: "6px" }}>
                  출제 난이도
                </label>
                <select
                  value={quizLevel}
                  onChange={(e) => setQuizLevel(e.target.value)}
                  className="nixtio-input"
                >
                  <option value="기초">기초 (하)</option>
                  <option value="중">실전 (중)</option>
                  <option value="심화">고난도 (상)</option>
                </select>
              </div>

              <button
                onClick={handleGenerateQuiz}
                disabled={quizLoading}
                className="nixtio-btn nixtio-btn-primary"
                style={{ height: "48px" }}
              >
                {quizLoading ? "출제 중..." : "10문항 출제 →"}
              </button>
            </div>
            <p style={{ marginTop: "14px", color: "var(--text-dim)", fontSize: "0.82rem" }}>
              서로 다른 출제 주제로 구성된 10문항을 제공합니다.
            </p>
          </div>

          {quizzes.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {quizzes.map((quiz, qIdx) => (
                <div key={quiz.id} className="nixtio-card" style={{ padding: "28px" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "18px" }}>
                    <span
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: "var(--selection-bg)",
                        color: "var(--selection-color)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "0.85rem",
                        flexShrink: 0,
                      }}
                    >
                      {qIdx + 1}
                    </span>
                    <div>
                      {quiz.topic && (
                        <span
                          className="tag-badge"
                          style={{
                            marginBottom: "8px",
                            color: "var(--accent-cyan)",
                            borderColor: "rgba(56, 189, 248, 0.25)",
                          }}
                        >
                          {quiz.topic}
                        </span>
                      )}
                      <h4 style={{ fontSize: "1.05rem", fontWeight: 700, lineHeight: 1.5 }}>
                        {quiz.question}
                      </h4>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {quiz.options.map((option, optIdx) => {
                      const isSelected = selectedAnswers[quiz.id] === optIdx;
                      let bg = "var(--bg-pill)";
                      let border = "1px solid var(--border-subtle)";

                      if (quizSubmitted) {
                        if (optIdx === quiz.answerIndex) {
                          bg = "rgba(52, 211, 153, 0.15)";
                          border = "1px solid var(--accent-green)";
                        } else if (isSelected && optIdx !== quiz.answerIndex) {
                          bg = "rgba(248, 113, 113, 0.15)";
                          border = "1px solid #f87171";
                        }
                      } else if (isSelected) {
                        bg = "var(--bg-pill-hover)";
                        border = "1px solid var(--selection-border)";
                      }

                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelectOption(quiz.id, optIdx)}
                          style={{
                            padding: "14px 18px",
                            borderRadius: "var(--radius-sm)",
                            background: bg,
                            border,
                            cursor: quizSubmitted ? "default" : "pointer",
                            fontSize: "0.92rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <span style={{ color: "var(--text-dim)", fontSize: "0.8rem", fontWeight: 700 }}>
                            {optIdx + 1}.
                          </span>
                          <span>{option}</span>
                          {quizSubmitted && optIdx === quiz.answerIndex && (
                            <span style={{ marginLeft: "auto", color: "var(--accent-green)", fontWeight: 700, fontSize: "0.85rem" }}>
                              정답 ✓
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div
                      style={{
                        marginTop: "16px",
                        padding: "14px",
                        borderRadius: "var(--radius-sm)",
                        background: "var(--bg-pill)",
                        borderLeft: "3px solid var(--accent-cyan)",
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <strong style={{ color: "var(--text-main)" }}>해설:</strong> {quiz.explanation}
                    </div>
                  )}
                </div>
              ))}

              <div style={{ textAlign: "center", marginTop: "16px" }}>
                {!quizSubmitted ? (
                  <button
                    onClick={() => setQuizSubmitted(true)}
                    disabled={Object.keys(selectedAnswers).length < quizzes.length}
                    className="nixtio-btn nixtio-btn-primary"
                    style={{ padding: "14px 44px" }}
                  >
                    채점하기 →
                  </button>
                ) : (
                  <div className="nixtio-card" style={{ padding: "28px", textAlign: "center" }}>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "8px" }}>
                      결과: {calculateScore()} / {quizzes.length} 정답
                    </h3>
                    <button onClick={handleGenerateQuiz} className="nixtio-btn nixtio-btn-outline" style={{ marginTop: "12px" }}>
                      새로운 문제 생성하기
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
