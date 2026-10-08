"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import SchoolMark from "./SchoolMark";

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [authResolved, setAuthResolved] = useState(() => !supabase);

  useEffect(() => {
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthResolved(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fullName = user?.user_metadata?.full_name;
  const username = user?.user_metadata?.user_name;
  const metadataName =
    typeof fullName === "string" && fullName.length > 0
      ? fullName
      : typeof username === "string" && username.length > 0
        ? username
        : null;
  const provider = user?.app_metadata?.provider;
  const accountLabel = user
    ? user.email ?? metadataName ?? (typeof provider === "string" ? `${provider} 계정` : "로그인됨")
    : authResolved
      ? "로그인"
      : "확인 중…";

  const links = [
    { href: "/", label: "학과 로드맵" },
    { href: "/my-certs", label: "내 자격증" },
    { href: "/career-mentor", label: "AI 진로 & 퀴즈" },
  ];

  return (
    <div className="floating-header-container">
      <header className="floating-header">
        {/* Brand */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            color: "#fff",
          }}
        >
          <SchoolMark />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.92rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              대진전자통신고
            </span>
            <span style={{ fontSize: "0.68rem", color: "var(--text-dim)", fontWeight: 600 }}>
              CERT ARCHIVE & AI
            </span>
          </div>
        </Link>

        {/* Navigation Pills */}
        <nav style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link-pill ${isActive ? "active" : ""}`}
              >
                {isActive && (
                  <span
                    style={{
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      backgroundColor: "var(--accent-cyan)",
                      boxShadow: "0 0 8px var(--accent-cyan)",
                    }}
                  />
                )}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Button */}
        <div>
          <Link
            href="/auth"
            className="nixtio-btn nixtio-btn-primary"
            title={user ? accountLabel : undefined}
            aria-label={user ? `현재 로그인 계정: ${accountLabel}` : accountLabel}
            style={{
              padding: "8px 18px",
              fontSize: "0.82rem",
              maxWidth: "min(260px, 45vw)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {accountLabel}
          </Link>
        </div>
      </header>
    </div>
  );
}
