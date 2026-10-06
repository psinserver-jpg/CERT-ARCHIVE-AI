import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: "대진전자통신고등학교 자격증 허브 & AI 진로 멘토",
  description: "대진전자통신고 학과별 필수·추천 자격증 가이드 및 Claude AI 기반 커리어 추천 & 기출 퀴즈",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <div className="nixtio-bg" />
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
