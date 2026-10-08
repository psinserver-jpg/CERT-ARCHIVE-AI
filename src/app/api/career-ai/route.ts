import { NextResponse } from 'next/server';

type QuizQuestionData = {
  id: number;
  topic: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

const QUIZ_TARGET_COUNT = 10;
const QUIZ_CANDIDATE_COUNT = 16;
const QUIZ_STOP_WORDS = new Set([
  '다음', '중', '무엇', '옳은', '설명', '가장', '적절한', '경우', '대해', '때',
  '사용하는', '사용할', '올바른', '것으로', '것은', '기능', '역할', '방법', '문제',
  '해당', '보기', '모두', '알맞은', '바르게', '고르시오', '있는', '어떤', '의미',
]);

function normalizeForComparison(value: string) {
  return value.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
}

function getSignificantTokens(value: string) {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .split(/\s+/u)
    .map((token) => token.replace(/(?:은|는|이|가|을|를|에서|에게|으로|로|와|과|의|도|만|부터|까지|보다)$/u, ''))
    .filter((token) => token.length > 1 && !QUIZ_STOP_WORDS.has(token));
}

function isNearDuplicate(first: string, second: string, threshold: number) {
  const firstText = normalizeForComparison(first);
  const secondText = normalizeForComparison(second);
  if (!firstText || !secondText) return false;
  if (firstText === secondText) return true;

  const makeTrigrams = (text: string) => {
    if (text.length < 3) return new Set([text]);
    return new Set(Array.from({ length: text.length - 2 }, (_, index) => text.slice(index, index + 3)));
  };
  const firstGrams = makeTrigrams(firstText);
  const secondGrams = makeTrigrams(secondText);
  const intersectionSize = [...firstGrams].filter((gram) => secondGrams.has(gram)).length;
  const unionSize = new Set([...firstGrams, ...secondGrams]).size;

  return intersectionSize / unionSize >= threshold;
}

function tokenSimilarity(first: string, second: string) {
  const firstTokens = new Set(getSignificantTokens(first));
  const secondTokens = new Set(getSignificantTokens(second));
  if (!firstTokens.size || !secondTokens.size) return 0;

  const intersectionSize = [...firstTokens].filter((token) => secondTokens.has(token)).length;
  return intersectionSize / new Set([...firstTokens, ...secondTokens]).size;
}

function isDuplicateQuestion(first: Pick<QuizQuestionData, 'topic' | 'question'>, second: Pick<QuizQuestionData, 'topic' | 'question'>) {
  return isNearDuplicate(first.topic, second.topic, 0.7) ||
    isNearDuplicate(first.question, second.question, 0.82) ||
    tokenSimilarity(first.topic, second.topic) >= 0.5 ||
    tokenSimilarity(`${first.topic} ${first.question}`, `${second.topic} ${second.question}`) >= 0.58;
}

function normalizeQuizQuestions(value: unknown, previousQuestions: Array<Pick<QuizQuestionData, 'topic' | 'question'>> = []): QuizQuestionData[] {
  if (!Array.isArray(value)) return [];

  const uniqueQuestions: QuizQuestionData[] = [];
  for (const candidate of value) {
    if (typeof candidate !== 'object' || candidate === null || Array.isArray(candidate)) continue;

    const item = candidate as Record<string, unknown>;
    if (
      typeof item.question !== 'string' ||
      !item.question.trim() ||
      !Array.isArray(item.options) ||
      item.options.length !== 4 ||
      item.options.some((option) => typeof option !== 'string') ||
      !Number.isInteger(item.answerIndex) ||
      (item.answerIndex as number) < 0 ||
      (item.answerIndex as number) > 3 ||
      typeof item.explanation !== 'string' ||
      !item.explanation.trim()
    ) {
      continue;
    }

    const question = item.question.trim();
    const topic = typeof item.topic === 'string' && item.topic.trim() ? item.topic.trim() : question;
    const candidateQuestion = { topic, question };
    const isDuplicate = [...previousQuestions, ...uniqueQuestions].some((existing) =>
      isDuplicateQuestion(existing, candidateQuestion),
    );
    if (isDuplicate) continue;

    uniqueQuestions.push({
      id: uniqueQuestions.length + 1,
      topic,
      question,
      options: item.options as string[],
      answerIndex: item.answerIndex as number,
      explanation: item.explanation.trim(),
    });
  }

  return uniqueQuestions;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, jobTitle, certName, level } = body;
    const previousQuestions: Array<Pick<QuizQuestionData, 'topic' | 'question'>> = Array.isArray(body.previousQuestions)
      ? body.previousQuestions.slice(-50).flatMap((candidate: unknown) => {
        if (typeof candidate !== 'object' || candidate === null || Array.isArray(candidate)) return [];
        const item = candidate as Record<string, unknown>;
        if (typeof item.topic !== 'string' || typeof item.question !== 'string') return [];
        return [{ topic: item.topic.trim().slice(0, 120), question: item.question.trim().slice(0, 180) }];
      })
      : [];

    // 백엔드 Claude CLI Wrapper 서버 URL (DGX Spark 또는 로컬 포워딩)
    const LLM_API_URL = process.env.CLAUDE_API_URL || 'http://100.91.11.68:8088/api/claude';
    const LLM_API_KEY = process.env.CLAUDE_API_KEY || 'certvault-spark-key-2026';

    let prompt = '';

    if (action === 'career-recommend') {
      prompt = `대진전자통신고등학교 학생들을 위한 진로/자격증 멘토입니다.
희망 직업: "${jobTitle}"

다음 형식의 JSON으로만 정확히 응답해 주세요. 다른 설명이나 마크다운 백틱(\`\`\`) 없이 순수 JSON만 반환하세요:
{
  "job": "${jobTitle}",
  "summary": "해당 직업에 대한 대진전자통신고 학생 맞춤형 2~3줄 설명",
  "requiredCerts": [
    {
      "name": "필수 자격증명",
      "reason": "필요한 핵심 이유",
      "difficulty": "난이도(상/중/하)",
      "applyUrl": "관련 큐넷 또는 접수처 URL"
    }
  ],
  "recommendedCerts": [
    {
      "name": "우대/추천 자격증명",
      "reason": "취업이나 역량 확장에 유리한 이유",
      "difficulty": "난이도(상/중/하)",
      "applyUrl": "접수처 URL"
    }
  ],
  "studyRoadmap": [
    "1단계: 고1~고2 추천 로드맵",
    "2단계: 고2~고3 추천 실무 및 자격증 취득",
    "3단계: 고3 취업 및 포트폴리오 준비"
  ],
  "tips": "대진전자통신고등학교 실습실이나 방과후 과정을 활용할 수 있는 현실적인 팁"
}`;
    } else if (action === 'generate-quiz') {
      const previousQuestionsJson = JSON.stringify(previousQuestions);
      prompt = `대진전자통신고등학교 학생들을 위한 기술 자격증 모의고사 출제자입니다.
자격증명: "${certName}"
난이도: "${level || '중'}"

이 자격증의 실제 출제 범위에 맞는 4지선다형 문제 후보를 ${QUIZ_CANDIDATE_COUNT}개 만들어주세요. 최종 사용자는 이 중 중복을 제거한 10개를 풉니다.
먼저 출제 범위를 서로 다른 세부 영역으로 나눈 뒤, 후보마다 하나의 고유한 핵심 개념/기능만 평가하세요. 같은 정의나 정답 근거를 문장만 바꿔 반복하지 마세요.
암기형에 치우치지 않도록 개념 확인, 상황 판단, 결과 해석, 순서/절차, 계산 또는 오류 찾기 등 자격증에 맞는 여러 출제 형식을 섞으세요.
각 문항의 "topic"은 구체적인 핵심 개념을 짧게 표시하고, 서로 겹치지 않게 하세요. 자격증 범위 밖의 일반 IT 상식은 내지 마세요.
이전 회차의 주제/문제(유사한 개념도 금지): ${previousQuestionsJson}
이전 회차 문제를 단어만 바꿔 재사용하지 말고 다른 세부 영역에서 새로운 문제를 출제하세요. 이전 기록이 비어 있으면 이를 무시하세요.
후보 문제는 모두 서로 달라야 하며, 정답은 하나만 명확히 성립하고 해설에는 정답의 근거를 설명하세요.
다른 설명이나 마크다운 백틱(\`\`\`) 없이 순수 JSON만 응답하세요:
{
  "certName": "${certName}",
  "level": "${level || '중'}",
  "quizzes": [
    {
      "id": 1,
      "topic": "고유한 세부 출제 영역",
      "question": "해당 자격증 범위 내의 구체적인 문제",
      "options": ["1번 보기", "2번 보기", "3번 보기", "4번 보기"],
      "answerIndex": 0,
      "explanation": "해설 및 핵심 개념 정리"
    }
  ]
}`;
    } else {
      return NextResponse.json({ error: '유효하지 않은 요청 액션입니다.' }, { status: 400 });
    }

    // Claude CLI 백엔드 서버 호출 시도
    let data;
    try {
      const response = await fetch(LLM_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': LLM_API_KEY,
        },
        body: JSON.stringify({
          prompt,
          effort: 'medium',
        }),
        signal: AbortSignal.timeout(15000), // 15초 타임아웃
      });

      if (response.ok) {
        data = await response.json();
      }
    } catch {
      // 서버 미연결 시 모의 응답(Fallback) 제공하여 UI 정상 작동 보장
      console.log('Claude CLI 서버 응답 대기 초과 또는 미실행. 내장 AI 템플릿 엔진으로 응답합니다.');
    }

    if (data && data.result) {
      try {
        const cleaned = data.result.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (action === 'generate-quiz' && typeof parsed === 'object' && parsed !== null) {
          const generatedQuestions = normalizeQuizQuestions(parsed.quizzes, previousQuestions);
          if (generatedQuestions.length < QUIZ_TARGET_COUNT) {
            return NextResponse.json({
              success: false,
              error: `서로 다른 문제를 ${QUIZ_TARGET_COUNT}개 확보하지 못했습니다. 잠시 후 다시 생성해 주세요.`,
              generatedCount: generatedQuestions.length,
            }, { status: 502 });
          }

          return NextResponse.json({
            success: true,
            source: 'claude-cli-dgx',
            data: {
              ...parsed,
              certName: parsed.certName || certName || '정보처리기능사',
              level: parsed.level || level || '중',
              quizzes: generatedQuestions.slice(0, QUIZ_TARGET_COUNT),
            },
          });
        }
        return NextResponse.json({ success: true, source: 'claude-cli-dgx', data: parsed });
      } catch {
        if (action !== 'generate-quiz') {
          return NextResponse.json({ success: true, source: 'claude-cli-dgx-raw', data: data.result });
        }
      }
    }

    // 퀴즈는 임의의 범용 문항으로 채우면 자격증과 무관하거나 매번 같은 문제가 되므로 성공으로 위장하지 않는다.
    if (action === 'career-recommend') {
      return NextResponse.json({
        success: true,
        source: 'smart-template-engine',
        data: {
          job: jobTitle,
          summary: `${jobTitle}은(는) 대진전자통신고등학교의 실습 인프라와 하드웨어/소프트웨어 융합 교육을 통해 뛰어난 경쟁력을 가질 수 있는 유망 직무입니다.`,
          requiredCerts: [
            {
              name: '정보처리기능사',
              reason: '전산 논리와 기본 알고리즘 및 소프트웨어 구성 이해를 입증하는 필수 자격',
              difficulty: '중',
              applyUrl: 'https://www.q-net.or.kr',
            },
            {
              name: '전자계산기기능사',
              reason: '하드웨어 구조와 마이크로프로세서 제어를 파악하기 위한 기초 기술 검증',
              difficulty: '중',
              applyUrl: 'https://www.q-net.or.kr',
            },
          ],
          recommendedCerts: [
            {
              name: '네트워크관리사 2급',
              reason: '시스템 간 통신 프로토콜과 인프라 구축 능력을 어필할 수 있어 취업 시 우대',
              difficulty: '중',
              applyUrl: 'https://www.icqa.or.kr',
            },
            {
              name: '리눅스마스터 2급',
              reason: '서버 및 임베디드 리눅스 실무 환경 적응을 위한 공인 자격증',
              difficulty: '하',
              applyUrl: 'https://www.ihd.or.kr',
            },
          ],
          studyRoadmap: [
            '1단계 (고1): 전공 교과서 기본 개념 마스터 및 정보처리기능사 필기/실기 취득',
            '2단계 (고2): 실습실 방과후 동아리를 통한 프로젝트 구현 및 네트워크관리사 취득',
            '3단계 (고3): 기업 맞춤형 포트폴리오 제작 및 산업기사 과정평가형/의무검정 응시',
          ],
          tips: '대진전자통신고 실습실 기자재와 방과후 전공심화동아리(기능반/앱개발반)를 적극 활용하세요!',
        },
      });
    }

    if (action === 'generate-quiz') {
      return NextResponse.json({
        success: false,
        error: 'AI 문제 생성 서버에 연결할 수 없습니다. 서버 상태를 확인한 뒤 다시 시도해 주세요.',
      }, { status: 503 });
    }

    return NextResponse.json({ error: '지원하지 않는 요청입니다.' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '서버 오류 발생';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
