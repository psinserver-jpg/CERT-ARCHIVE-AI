import { NextResponse } from "next/server";

const NEIS_ENDPOINT = "https://open.neis.go.kr/hub/hisTimetable";
const BUSAN_OFFICE_CODE = "C10";
const DAEJIN_SCHOOL_CODE = "7150597";

type TimetableRow = {
  ALL_TI_YMD?: string;
  GRADE?: string;
  CLASS_NM?: string;
  PERIO?: string;
  ITRT_CNTNT?: string;
  CLRM_NM?: string;
};

type NeisResult = {
  CODE?: string;
  MESSAGE?: string;
};

type NeisBlock = {
  head?: Array<{ RESULT?: NeisResult }>;
  row?: TimetableRow[];
};

type NeisResponse = {
  hisTimetable?: NeisBlock[];
};

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? "";
  const grade = Number(searchParams.get("grade"));
  const classNumber = Number(searchParams.get("class"));

  if (!isValidDate(date)) {
    return NextResponse.json({ success: false, error: "날짜를 확인해 주세요." }, { status: 400 });
  }
  if (!Number.isInteger(grade) || grade < 1 || grade > 3) {
    return NextResponse.json({ success: false, error: "학년은 1~3학년으로 선택해 주세요." }, { status: 400 });
  }
  if (!Number.isInteger(classNumber) || classNumber < 1 || classNumber > 10) {
    return NextResponse.json({ success: false, error: "반은 1~10반으로 선택해 주세요." }, { status: 400 });
  }

  const apiKey = process.env.NEIS_API_KEY?.trim();
  const endpoint = new URL(NEIS_ENDPOINT);
  endpoint.searchParams.set("Type", "json");
  endpoint.searchParams.set("pIndex", "1");
  endpoint.searchParams.set("pSize", "100");
  endpoint.searchParams.set("ATPT_OFCDC_SC_CODE", BUSAN_OFFICE_CODE);
  endpoint.searchParams.set("SD_SCHUL_CODE", DAEJIN_SCHOOL_CODE);
  endpoint.searchParams.set("ALL_TI_YMD", date.replaceAll("-", ""));
  endpoint.searchParams.set("GRADE", String(grade));
  endpoint.searchParams.set("CLASS_NM", String(classNumber));
  if (apiKey) endpoint.searchParams.set("KEY", apiKey);

  try {
    const response = await fetch(endpoint, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: "나이스 시간표를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." },
        { status: 502 },
      );
    }

    const payload = (await response.json()) as NeisResponse;
    const blocks = payload.hisTimetable ?? [];
    const result = blocks.flatMap((block) => block.head ?? []).find((item) => item.RESULT)?.RESULT;

    if (result?.CODE && result.CODE !== "INFO-000" && result.CODE !== "INFO-200") {
      return NextResponse.json(
        { success: false, error: "나이스 시간표 조회 중 오류가 발생했습니다." },
        { status: 502 },
      );
    }

    const rows = blocks
      .flatMap((block) => block.row ?? [])
      .filter((row) => row.ITRT_CNTNT?.trim())
      .sort((first, second) => Number(first.PERIO ?? 0) - Number(second.PERIO ?? 0));

    return NextResponse.json({ success: true, rows, limited: !apiKey });
  } catch {
    return NextResponse.json(
      { success: false, error: "나이스 연결이 지연되고 있습니다. 잠시 후 다시 시도해 주세요." },
      { status: 502 },
    );
  }
}
