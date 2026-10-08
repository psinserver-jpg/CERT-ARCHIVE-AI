"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CERTIFICATIONS, DEPARTMENTS } from "@/lib/data/school";
import { supabase } from "@/lib/supabase";

export default function MyCertsPage() {
  const [selectedCertIds, setSelectedCertIds] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"acquired" | "available">("acquired");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    // 1. 로컬 스토리지 불러오기
    const saved = localStorage.getItem("my_acquired_certs");
    if (saved) {
      try {
        setSelectedCertIds(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Supabase 유저 세션 확인 및 DB 동기화
    const client = supabase;
    if (client) {
      client.auth.getSession().then(async ({ data: { session } }) => {
        const currentUser = session?.user;
        setUser(currentUser ?? null);

        if (currentUser) {
          // Supabase user_certificates 테이블에서 불러오기 시도
          const { data, error } = await client
            .from("user_certificates")
            .select("cert_id")
            .eq("user_id", currentUser.id);

          if (!error && data && data.length > 0) {
            const dbCertIds = data.map((d: any) => d.cert_id);
            setSelectedCertIds((prev) => {
              const merged = Array.from(new Set([...prev, ...dbCertIds]));
              localStorage.setItem("my_acquired_certs", JSON.stringify(merged));
              return merged;
            });
          }
        }
      });
    }
  }, []);

  const toggleCert = async (id: string) => {
    let next: string[];
    const isRemoving = selectedCertIds.includes(id);

    if (isRemoving) {
      next = selectedCertIds.filter((item) => item !== id);
    } else {
      next = [...selectedCertIds, id];
    }
    setSelectedCertIds(next);
    localStorage.setItem("my_acquired_certs", JSON.stringify(next));

    // Supabase DB 동기화 (로그인 시)
    if (supabase && user) {
      if (isRemoving) {
        await supabase
          .from("user_certificates")
          .delete()
          .eq("user_id", user.id)
          .eq("cert_id", id);
      } else {
        await supabase
          .from("user_certificates")
          .upsert({ user_id: user.id, cert_id: id });
      }
    }
  };

  const allCerts = Object.values(CERTIFICATIONS);

  const getCertsForDept = (deptId: string) => {
    if (deptId === "all") return allCerts;
    const dept = DEPARTMENTS.find((d) => d.id === deptId);
    if (!dept) return allCerts;
    const ids = new Set([...dept.primaryCertIds, ...dept.recommendedCertIds]);
    return allCerts.filter((c) => ids.has(c.id));
  };

  const filteredCerts = getCertsForDept(selectedDeptFilter).filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const acquiredCerts = allCerts.filter((c) => selectedCertIds.includes(c.id));

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 100px" }}>
      {/* ───────────────── Top Showcase Banner ───────────────── */}
      <div
        className="nixtio-card"
        style={{
          padding: "36px",
          marginBottom: "40px",
          background: "var(--archive-banner)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "24px",
        }}
      >
        <div>
          <div className="section-label">
            <span className="section-label-dot" />
            개인 자격증 아카이브
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
            내 취득 자격증 보관함
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", marginTop: "4px" }}>
            번거로운 인증 없이 체크만으로 간편 등록 및 관리할 수 있습니다.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>
              보유 중인 자격증
            </div>
            <div style={{ fontSize: "2.4rem", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.1 }}>
              {selectedCertIds.length} <span style={{ fontSize: "1rem", color: "var(--text-dim)" }}>/ {allCerts.length}</span>
            </div>
          </div>
          <Link href="/auth" className="nixtio-btn nixtio-btn-primary" style={{ padding: "10px 20px" }}>
            계정 로그인 동기화 ↗
          </Link>
        </div>
      </div>

      {/* ───────────────── Pill Switcher ───────────────── */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "32px" }}>
        <button
          onClick={() => setActiveTab("acquired")}
          style={{
            padding: "10px 22px",
            borderRadius: "var(--radius-pill)",
            background: activeTab === "acquired" ? "var(--selection-bg)" : "var(--bg-pill)",
            color: activeTab === "acquired" ? "var(--selection-color)" : "var(--text-secondary)",
            border: activeTab === "acquired" ? "1px solid var(--selection-border)" : "1px solid var(--border-subtle)",
            fontWeight: 700,
            fontSize: "0.88rem",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          취득 완료 목록 ({acquiredCerts.length})
        </button>
        <button
          onClick={() => setActiveTab("available")}
          style={{
            padding: "10px 22px",
            borderRadius: "var(--radius-pill)",
            background: activeTab === "available" ? "var(--selection-bg)" : "var(--bg-pill)",
            color: activeTab === "available" ? "var(--selection-color)" : "var(--text-secondary)",
            border: activeTab === "available" ? "1px solid var(--selection-border)" : "1px solid var(--border-subtle)",
            fontWeight: 700,
            fontSize: "0.88rem",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          + 전체 자격증 선택 및 등록
        </button>
      </div>

      {/* ───────────────── Tab 1: Acquired List ───────────────── */}
      {activeTab === "acquired" && (
        <div>
          {acquiredCerts.length === 0 ? (
            <div
              className="nixtio-card"
              style={{
                padding: "80px 24px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "2.4rem", marginBottom: "16px", opacity: 0.8 }}>📑</div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px" }}>
                등록된 자격증이 없습니다
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "24px" }}>
                취득 완료한 자격증이나 학습 중인 종목을 찾아 체크해 보세요.
              </p>
              <button onClick={() => setActiveTab("available")} className="nixtio-btn nixtio-btn-primary">
                자격증 둘러보기
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
              {acquiredCerts.map((cert) => (
                <div
                  key={cert.id}
                  className="nixtio-card"
                  style={{
                    padding: "24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
                      <span className="tag-badge" style={{ color: "var(--accent-green)", borderColor: "rgba(52, 211, 153, 0.3)" }}>
                        ✓ 취득 완료
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>{cert.issuer}</span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>{cert.name}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                      {cert.category} · {cert.examType}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleCert(cert.id)}
                    style={{
                      background: "rgba(248, 113, 113, 0.1)",
                      border: "1px solid rgba(248, 113, 113, 0.25)",
                      color: "#f87171",
                      borderRadius: "var(--radius-pill)",
                      padding: "6px 14px",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ───────────────── Tab 2: Available Certs to Check ───────────────── */}
      {activeTab === "available" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <button
                onClick={() => setSelectedDeptFilter("all")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "var(--radius-pill)",
                  fontSize: "0.8rem",
                  background: selectedDeptFilter === "all" ? "var(--selection-bg)" : "transparent",
                  color: selectedDeptFilter === "all" ? "var(--selection-color)" : "var(--text-secondary)",
                  border: "1px solid var(--border-subtle)",
                  cursor: "pointer",
                }}
              >
                전체
              </button>
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDeptFilter(dept.id)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "var(--radius-pill)",
                    fontSize: "0.8rem",
                    background: selectedDeptFilter === dept.id ? "var(--selection-bg)" : "transparent",
                    color: selectedDeptFilter === dept.id ? "var(--selection-color)" : "var(--text-secondary)",
                    border: "1px solid var(--border-subtle)",
                    cursor: "pointer",
                  }}
                >
                  {dept.name}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="자격증명 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="nixtio-input"
              style={{ width: "240px", padding: "10px 16px", fontSize: "0.85rem" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
            {filteredCerts.map((cert) => {
              const isSelected = selectedCertIds.includes(cert.id);
              return (
                <div
                  key={cert.id}
                  onClick={() => toggleCert(cert.id)}
                  className="nixtio-card"
                  style={{
                    padding: "24px",
                    cursor: "pointer",
                    border: isSelected ? "1px solid var(--accent-cyan)" : undefined,
                    background: isSelected ? "rgba(56, 189, 248, 0.05)" : undefined,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginBottom: "4px" }}>
                      {cert.category} · {cert.issuer}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: "1.05rem" }}>{cert.name}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                      난이도: {"★".repeat(cert.difficulty)} · 합격률 {cert.passRate}
                    </div>
                  </div>

                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      border: isSelected ? "none" : "2px solid var(--border-hover)",
                      background: isSelected ? "var(--selection-bg)" : "transparent",
                      color: isSelected ? "var(--selection-color)" : "var(--text-main)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "0.85rem",
                    }}
                  >
                    {isSelected ? "✓" : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
