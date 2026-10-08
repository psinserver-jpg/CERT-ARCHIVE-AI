"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import SchoolMark from "../components/SchoolMark";

export default function AuthPage() {
  const [loadingProvider, setLoadingProvider] = useState<"google" | "github" | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleOAuthLogin = async (provider: "google" | "github") => {
    setLoadingProvider(provider);
    setErrorMsg(null);

    if (!supabase) {
      // Supabase 환경변수가 아직 설정되지 않았을 때의 안내 및 시뮬레이션
      setTimeout(() => {
        setLoadingProvider(null);
        setErrorMsg("Supabase URL과 공개 키가 설정되어야 소셜 로그인을 사용할 수 있습니다.");
      }, 800);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/my-certs` : undefined,
        },
      });

      if (error) {
        throw error;
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(
        err instanceof Error
          ? err.message
          : `${provider === "google" ? "Google" : "GitHub"} 로그인 요청 중 오류가 발생했습니다.`,
      );
      setLoadingProvider(null);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "440px" }}>
        {/* Logo / Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <SchoolMark variant="auth" />
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "8px" }}>
            {user ? "환영합니다!" : "로그인 & 동기화"}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem" }}>
            {user
              ? `${user.email} 계정으로 로그인되어 있습니다.`
              : "대진전자통신고 포털 — 구글 계정으로 자격증을 저장하세요"}
          </p>
        </div>

        {/* Card */}
        <div className="nixtio-card" style={{ padding: "36px" }}>
          {user ? (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  background: "rgba(56, 189, 248, 0.08)",
                  border: "1px solid rgba(56, 189, 248, 0.25)",
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "20px",
                }}
              >
                <div style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>현재 로그인 계정</div>
                <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#fff", marginTop: "4px" }}>
                  {user.email}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Link href="/my-certs" className="nixtio-btn nixtio-btn-primary" style={{ textDecoration: "none" }}>
                  내 자격증 보관함으로 이동 →
                </Link>
                <button onClick={handleLogout} className="nixtio-btn nixtio-btn-outline">
                  로그아웃
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <button
                  onClick={() => handleOAuthLogin("google")}
                  disabled={loadingProvider !== null}
                  className="nixtio-btn"
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "#ffffff",
                    color: "#1f2937",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    boxShadow: "0 4px 15px rgba(255,255,255,0.15)",
                  }}
                >
                  {loadingProvider === "google" ? (
                    "Google 연결 중..."
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                      </svg>
                      Google 계정으로 계속하기
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleOAuthLogin("github")}
                  disabled={loadingProvider !== null}
                  className="nixtio-btn"
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "#161b22",
                    color: "#f0f6fc",
                    border: "1px solid rgba(240, 246, 252, 0.18)",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                  }}
                >
                  {loadingProvider === "github" ? (
                    "GitHub 연결 중..."
                  ) : (
                    <>
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.3 9.4 7.87 10.92.58.11.79-.25.79-.56 0-.27-.01-.99-.02-1.94-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.43-2.71 5.41-5.29 5.69.42.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
                      </svg>
                      GitHub 계정으로 계속하기
                    </>
                  )}
                </button>
              </div>

              {errorMsg && (
                <div
                  style={{
                    marginTop: "16px",
                    padding: "12px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(251, 146, 60, 0.1)",
                    border: "1px solid rgba(251, 146, 60, 0.3)",
                    color: "var(--accent-orange)",
                    fontSize: "0.82rem",
                    lineHeight: 1.5,
                  }}
                >
                  {errorMsg}
                </div>
              )}

              <div
                style={{
                  height: "1px",
                  background: "var(--border-subtle)",
                  margin: "24px 0",
                }}
              />

              <p style={{ textAlign: "center", fontSize: "0.78rem", color: "var(--text-dim)", lineHeight: 1.6 }}>
                Supabase Auth를 통해 안전하게 암호화 처리되며, <br />
                불필요한 주민번호나 실명 인증 절차를 거치지 않습니다.
              </p>
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <Link href="/" style={{ color: "var(--text-dim)", fontSize: "0.85rem", textDecoration: "none" }}>
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
