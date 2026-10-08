"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DEPARTMENTS,
  CERTIFICATIONS,
  Certification,
} from "@/lib/data/school";

export default function HomePage() {
  const [selectedDeptId, setSelectedDeptId] = useState<string>("electrical-electronics");
  const [activeCertModal, setActiveCertModal] = useState<Certification | null>(null);

  const currentDept = DEPARTMENTS.find((d) => d.id === selectedDeptId) || DEPARTMENTS[0];

  const primaryCerts = currentDept.primaryCertIds
    .map((id) => CERTIFICATIONS[id])
    .filter(Boolean);

  const recommendedCerts = currentDept.recommendedCertIds
    .map((id) => CERTIFICATIONS[id])
    .filter(Boolean);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px 100px" }}>
      {/* ───────────────── Hero Section (Nixtio Typography Style) ───────────────── */}
      <section style={{ padding: "40px 0 60px", maxWidth: "960px" }}>
        <div className="section-label">
          <span className="section-label-dot" />
          대진전자통신고등학교 공식 자격증 아카이브
        </div>

        <h1 className="title-huge" style={{ marginTop: "12px", marginBottom: "24px" }}>
          미래를 설계하는 <br />
          <span
            style={{
              background: "linear-gradient(to right, var(--text-main) 40%, var(--text-secondary) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            학과별 공인 자격증 & AI 진로
          </span>
        </h1>

        <p
          style={{
            fontSize: "1.15rem",
            color: "var(--text-secondary)",
            maxWidth: "680px",
            lineHeight: 1.6,
            marginBottom: "36px",
          }}
        >
          전기전자과, AI소프트웨어과, 스마트콘텐츠과, 산업디자인과까지. <br />
          전공 연계 자격증을 살펴보고, 내 취득 현황을 기록하며, Claude AI와 함께 진로를 탐색하세요.
        </p>

        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
          <Link href="/my-certs" className="nixtio-btn nixtio-btn-primary">
            내 자격증 등록하기 →
          </Link>
          <Link href="/career-mentor" className="nixtio-btn nixtio-btn-outline">
            Claude AI 진로 추천 & 퀴즈
          </Link>
        </div>
      </section>

      {/* ───────────────── Stats Marquee Bar ───────────────── */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1px",
          background: "var(--border-subtle)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          marginBottom: "70px",
        }}
      >
        {[
          { label: "개설 학과", val: "4개 학과", desc: "전기전자·AI소프트웨어·스마트콘텐츠·산업디자인" },
          { label: "등록 자격증", val: `${Object.keys(CERTIFICATIONS).length}종`, desc: "국가기술·공인·등록민간" },
          { label: "AI 모델", val: "Claude Haiku 5.5", desc: "DGX Spark · Claude Code CLI" },
          { label: "인증 방식", val: "소셜 로그인", desc: "Google · GitHub" },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              background: "var(--bg-surface)",
              padding: "24px 28px",
            }}
          >
            <div style={{ fontSize: "0.78rem", color: "var(--text-dim)", fontWeight: 700, textTransform: "uppercase" }}>
              {stat.label}
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)", margin: "6px 0 2px" }}>
              {stat.val}
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              {stat.desc}
            </div>
          </div>
        ))}
      </section>

      {/* ───────────────── Department Switcher ───────────────── */}
      <section style={{ marginBottom: "60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div className="section-label">
              <span className="section-label-dot" style={{ background: "var(--accent-purple)", boxShadow: "0 0 10px var(--accent-purple)" }} />
              학과별 자격증 커리큘럼
            </div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
              전공에 최적화된 로드맵
            </h2>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {DEPARTMENTS.map((dept) => {
              const active = dept.id === selectedDeptId;
              return (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDeptId(dept.id)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "var(--radius-pill)",
                    background: active ? "var(--selection-bg)" : "var(--bg-pill)",
                    color: active ? "var(--selection-color)" : "var(--text-secondary)",
                    border: active ? "1px solid var(--selection-border)" : "1px solid var(--border-subtle)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span style={{ marginRight: "6px" }}>{dept.emoji}</span>
                  {dept.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Department Showcase Card */}
        <div
          className="nixtio-card"
          style={{
            padding: "36px",
            marginBottom: "40px",
            background: "linear-gradient(145deg, rgba(16, 20, 28, 0.8) 0%, rgba(8, 10, 15, 0.9) 100%)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "24px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <span style={{ fontSize: "2.4rem" }}>{currentDept.emoji}</span>
                <div>
                  <h3 style={{ fontSize: "1.7rem", fontWeight: 800 }}>{currentDept.name}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                    {currentDept.description}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "16px" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-dim)", alignSelf: "center", marginRight: "6px" }}>
                  주요 전공 교과:
                </span>
                {currentDept.subjects.map((sub) => (
                  <span key={sub} className="tag-badge">
                    {sub}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.78rem", color: "var(--text-dim)", fontWeight: 700, marginBottom: "8px" }}>
                주요 진출 진로
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                {currentDept.careers.map((career) => (
                  <span
                    key={career}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "var(--radius-pill)",
                      background: "rgba(56, 189, 248, 0.08)",
                      border: "1px solid rgba(56, 189, 248, 0.25)",
                      color: "var(--accent-cyan)",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                    }}
                  >
                    {career}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────── Dual Columns: Required vs Recommended ─────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px" }}>
          {/* Required */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#f87171",
                  boxShadow: "0 0 10px #f87171",
                }}
              />
              <h4 style={{ fontSize: "1.2rem", fontWeight: 800 }}>
                우선 추천 자격증 ({primaryCerts.length})
              </h4>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {primaryCerts.map((cert) => (
                <CertRowCard
                  key={cert.id}
                  cert={cert}
                  badgeText="우선 추천"
                  badgeColor="#f87171"
                  onSelect={() => setActiveCertModal(cert)}
                />
              ))}
            </div>
          </div>

          {/* Recommended */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "var(--accent-green)",
                  boxShadow: "0 0 10px var(--accent-green)",
                }}
              />
              <h4 style={{ fontSize: "1.2rem", fontWeight: 800 }}>
                함께 준비하면 좋은 자격증 ({recommendedCerts.length})
              </h4>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {recommendedCerts.map((cert) => (
                <CertRowCard
                  key={cert.id}
                  cert={cert}
                  badgeText="추천"
                  badgeColor="var(--accent-green)"
                  onSelect={() => setActiveCertModal(cert)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── Modal Details ───────────────── */}
      {activeCertModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(16px)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setActiveCertModal(null)}
        >
          <div
            className="nixtio-card"
            style={{
              padding: "36px",
              maxWidth: "580px",
              width: "100%",
              background: "var(--bg-surface)",
              boxShadow: "0 25px 60px -15px rgba(0,0,0,0.9)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <span className="tag-badge" style={{ color: "var(--accent-cyan)", borderColor: "rgba(56, 189, 248, 0.3)", marginBottom: "8px" }}>
                  {activeCertModal.category} · {activeCertModal.issuer}
                </span>
                <h3 style={{ fontSize: "1.6rem", fontWeight: 800, marginTop: "6px" }}>
                  {activeCertModal.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveCertModal(null)}
                style={{
                  background: "var(--bg-pill-hover)",
                  border: "none",
                  color: "var(--text-main)",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "24px" }}>
              {activeCertModal.description}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "12px",
                background: "var(--bg-pill)",
                padding: "16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
                marginBottom: "28px",
              }}
            >
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>시험 형식</div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{activeCertModal.examType}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>평균 합격률</div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{activeCertModal.passRate}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>검정 일정</div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{activeCertModal.examPeriods}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>난이도</div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--accent-cyan)" }}>
                  {"★".repeat(activeCertModal.difficulty)}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <a
                href={activeCertModal.applyUrl}
                target="_blank"
                rel="noreferrer"
                className="nixtio-btn nixtio-btn-primary"
                style={{ flex: 1, textDecoration: "none" }}
              >
                원서 접수처 바로가기 ↗
              </a>
              <Link
                href={`/career-mentor?cert=${encodeURIComponent(activeCertModal.name)}`}
                className="nixtio-btn nixtio-btn-outline"
                style={{ textDecoration: "none" }}
              >
                AI 모의 퀴즈 풀기
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CertRowCard({
  cert,
  badgeText,
  badgeColor,
  onSelect,
}: {
  cert: Certification;
  badgeText: string;
  badgeColor: string;
  onSelect: () => void;
}) {
  return (
    <div
      className="nixtio-card"
      onClick={onSelect}
      style={{
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "pointer",
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "0.7rem",
              fontWeight: 800,
              background: `${badgeColor}18`,
              color: badgeColor,
              border: `1px solid ${badgeColor}33`,
            }}
          >
            {badgeText}
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
            {cert.category} · {cert.issuer}
          </span>
        </div>
        <div style={{ fontSize: "1.05rem", fontWeight: 700 }}>{cert.name}</div>
        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>
          합격률 {cert.passRate} · {cert.examType}
        </div>
      </div>

      <div style={{ color: "var(--text-dim)", fontSize: "1.1rem" }}>→</div>
    </div>
  );
}
