"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SchoolMark from "./SchoolMark";

export default function Header() {
  const pathname = usePathname();

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
            style={{
              padding: "8px 18px",
              fontSize: "0.82rem",
            }}
          >
            구글 로그인
          </Link>
        </div>
      </header>
    </div>
  );
}
