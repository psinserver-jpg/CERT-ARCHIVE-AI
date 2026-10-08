"use client";

import { useEffect, useState } from "react";

type TimetableRow = {
  ALL_TI_YMD?: string;
  GRADE?: string;
  CLASS_NM?: string;
  PERIO?: string;
  ITRT_CNTNT?: string;
  CLRM_NM?: string;
};

type TimetableResult = {
  requestKey: string;
  rows: TimetableRow[];
  limited: boolean;
  error?: string;
};

type TimetableApiResponse = {
  success: boolean;
  rows?: TimetableRow[];
  limited?: boolean;
  error?: string;
};

function todayInSeoul() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export default function TimetablePage() {
  const [date, setDate] = useState(todayInSeoul);
  const [grade, setGrade] = useState(1);
  const [classNumber, setClassNumber] = useState(1);
  const [result, setResult] = useState<TimetableResult | null>(null);
  const requestKey = `${date}:${grade}:${classNumber}`;
  const loading = result?.requestKey !== requestKey;

  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({ date, grade: String(grade), class: String(classNumber) });

    fetch(`/api/timetable?${query.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = (await response.json()) as TimetableApiResponse;
        if (!response.ok || !payload.success) {
          throw new Error(payload.error || "시간표를 불러오지 못했습니다.");
        }
        setResult({
          requestKey,
          rows: payload.rows ?? [],
          limited: payload.limited ?? false,
        });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setResult({
          requestKey,
          rows: [],
          limited: false,
          error: error instanceof Error ? error.message : "시간표를 불러오지 못했습니다.",
        });
      });

    return () => controller.abort();
  }, [date, grade, classNumber, requestKey]);

  const displayedDate = new Date(`${date}T12:00:00`).toLocaleDateString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
  const currentResult = result?.requestKey === requestKey ? result : null;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px 100px" }}>
      <section style={{ marginBottom: "36px" }}>
        <div className="section-label">
          <span className="section-label-dot" />
          DAEJIN SCHOOL TIMETABLE
        </div>
        <h1 className="title-huge" style={{ fontSize: "clamp(2.2rem, 5vw, 3.4rem)", marginBottom: "14px" }}>
          우리 학교 시간표
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
          날짜와 학년·반을 선택하면 나이스에 등록된 수업 시간표를 확인할 수 있습니다.
        </p>
      </section>

      <section className="nixtio-card" style={{ padding: "24px", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "14px", flexWrap: "wrap" }}>
          <label style={{ display: "grid", gap: "7px", color: "var(--text-secondary)", fontSize: "0.84rem" }}>
            날짜
            <input
              type="date"
              className="timetable-select"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>
          <label style={{ display: "grid", gap: "7px", color: "var(--text-secondary)", fontSize: "0.84rem" }}>
            학년
            <select className="timetable-select" value={grade} onChange={(event) => setGrade(Number(event.target.value))}>
              {[1, 2, 3].map((value) => <option key={value} value={value}>{value}학년</option>)}
            </select>
          </label>
          <label style={{ display: "grid", gap: "7px", color: "var(--text-secondary)", fontSize: "0.84rem" }}>
            반
            <select className="timetable-select" value={classNumber} onChange={(event) => setClassNumber(Number(event.target.value))}>
              {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                <option key={value} value={value}>{value}반</option>
              ))}
            </select>
          </label>
          <button type="button" className="nixtio-btn nixtio-btn-outline" onClick={() => setDate(todayInSeoul())}>
            오늘
          </button>
        </div>
      </section>

      {currentResult?.limited && (
        <div
          role="note"
          style={{
            padding: "14px 16px",
            marginBottom: "20px",
            borderRadius: "var(--radius-md)",
            color: "var(--text-secondary)",
            background: "rgba(245, 158, 11, 0.09)",
            border: "1px solid rgba(245, 158, 11, 0.24)",
            fontSize: "0.86rem",
          }}
        >
          나이스 인증키가 연결되지 않아 샘플 시간표(최대 5건)를 표시 중입니다. 전체 시간표를 보려면 배포 환경에
          <code style={{ margin: "0 4px" }}>NEIS_API_KEY</code>를 등록해야 합니다.
        </div>
      )}

      <section className="nixtio-card" aria-live="polite">
        <div style={{ padding: "22px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-main)" }}>
            {grade}학년 {classNumber}반
          </div>
          <div style={{ marginTop: "3px", color: "var(--text-secondary)", fontSize: "0.88rem" }}>
            {displayedDate}
          </div>
        </div>

        {loading ? (
          <p style={{ padding: "44px 24px", textAlign: "center", color: "var(--text-secondary)" }}>
            시간표를 불러오는 중…
          </p>
        ) : currentResult?.error ? (
          <p role="alert" style={{ padding: "44px 24px", textAlign: "center", color: "var(--accent-orange)" }}>
            {currentResult.error}
          </p>
        ) : currentResult?.rows.length ? (
          <div>
            {currentResult.rows.map((row, index) => (
              <div className="timetable-row" key={`${row.PERIO ?? index}-${row.ITRT_CNTNT ?? "subject"}`}>
                <span className="tag-badge" style={{ justifyContent: "center", color: "var(--accent-cyan)" }}>
                  {row.PERIO ?? index + 1}교시
                </span>
                <span style={{ color: "var(--text-main)", fontWeight: 700 }}>
                  {row.ITRT_CNTNT}
                </span>
                <span className="timetable-room" style={{ color: "var(--text-dim)" }}>
                  {row.CLRM_NM ? `교실 ${row.CLRM_NM}` : ""}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: "44px 24px", textAlign: "center" }}>
            <p style={{ color: "var(--text-main)", fontWeight: 700, marginBottom: "5px" }}>
              등록된 시간표가 없습니다.
            </p>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
              주말·공휴일이거나 나이스에 해당 반 시간표가 등록되지 않았을 수 있습니다.
            </p>
          </div>
        )}
      </section>

      <p style={{ marginTop: "16px", color: "var(--text-dim)", fontSize: "0.8rem", textAlign: "right" }}>
        자료: <a href="https://open.neis.go.kr/" target="_blank" rel="noreferrer" style={{ color: "var(--accent-cyan)" }}>
          나이스 교육정보 개방포털
        </a>
      </p>
    </div>
  );
}
