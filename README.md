# ⚡ 대진전자통신고등학교 자격증 아카이브 & AI 진로 멘토 (CERT-ARCHIVE-AI)

> 대진전자통신고 학생들을 위한 전기전자과·AI소프트웨어과·스마트콘텐츠과·산업디자인과별 자격증 추천, 학교 시간표, AI 진로 멘토링 및 모의고사 플랫폼.
> DGX Spark에서 Claude Code CLI와 Claude Haiku 5.5를 사용하며, 다크·화이트 테마를 지원합니다.

## 🌐 온라인 사이트

[CERT-ARCHIVE-AI 바로가기](https://certvault-seven.vercel.app)

---

## 🌟 주요 기능
1. **학과별 자격증 로드맵**: 대진전자통신고 4개 학과를 위한 자격증 추천 가이드 및 원서 접수처 연결
2. **내 자격증 관리함**: 번거로운 인증 없이 체크만으로 취득 자격증 간편 등록 (Supabase DB 영구 동기화 & 로컬 보관)
3. **Claude AI 커리어 멘토**: 희망 직업 입력 시 3개년 공부 로드맵, 필요 자격증, 교내 실습실 활용 팁 제공
4. **AI 실시간 모의 퀴즈**: 자격증 종목 및 난이도별(기초/중/상) 4지선다형 기출 문제 출제, 자동 채점 및 해설
5. **소셜 로그인 연동**: Supabase Auth를 통한 Google·GitHub 로그인
6. **학교 시간표**: 나이스에 공개된 학년·반별 시간표 조회

---

## 🛠️ 기술 스택
- **Frontend**: Next.js 16 (App Router, Turbopack), React 19, TypeScript
- **Styling**: Vanilla CSS (다크 기본값, 화이트 테마 전환 지원)
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security, Google·GitHub OAuth)
- **AI Server**: DGX Spark + Claude Code CLI (`claude-haiku-5-5`) Wrapper (Express / Port 8088)
- **School Data**: NEIS high-school timetable API (API key 미등록 시 샘플 결과 제한)
- **Deployment**: GitHub Actions CI/CD + PM2 상시 실행

---
