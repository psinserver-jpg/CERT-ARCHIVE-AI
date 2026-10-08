# ⚡ 대진전자통신고등학교 자격증 아카이브 & AI 진로 멘토 (CERT-ARCHIVE-AI)

> 대진전자통신고 학생들을 위한 4개 학과별(스마트전자과, 정보통신과, 소프트웨어과, AI·IoT과) 필수/추천 자격증 로드맵 및 Claude 3.5 Haiku 기반 AI 커리어 멘토링 & 기출 모의고사 플랫폼.
> [Nixtio](https://nixtio.com) 스타일의 프리미엄 다크 미학 디자인 적용.

## 🌐 온라인 사이트

[CERT-ARCHIVE-AI 바로가기](https://certvault-seven.vercel.app)

---

## 🌟 주요 기능
1. **학과별 자격증 로드맵**: 대진전자통신고 4대 학과별 필수/추천 자격증(13종) 가이드 및 원서 접수처 연결
2. **내 자격증 관리함**: 번거로운 인증 없이 체크만으로 취득 자격증 간편 등록 (Supabase DB 영구 동기화 & 로컬 보관)
3. **Claude AI 커리어 멘토**: 희망 직업 입력 시 3개년 공부 로드맵, 필요 자격증, 교내 실습실 활용 팁 제공
4. **AI 실시간 모의 퀴즈**: 자격증 종목 및 난이도별(기초/중/상) 4지선다형 기출 문제 출제, 자동 채점 및 해설
5. **소셜 로그인 연동**: Supabase Auth를 통한 Google·GitHub 로그인

---

## 🛠️ 기술 스택
- **Frontend**: Next.js 16 (App Router, Turbopack), React 19, TypeScript
- **Styling**: Vanilla CSS (Nixtio-Inspired Ultra-Premium Dark Theme)
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security, Google·GitHub OAuth)
- **AI Server**: DGX Spark (100.91.11.68) + Claude Code CLI (`claude-3-5-haiku-20241022`) Wrapper (Express / Port 8088)
- **Deployment**: GitHub Actions CI/CD + PM2 상시 실행

---
