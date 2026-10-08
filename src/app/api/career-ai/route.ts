import { NextResponse } from 'next/server';

type QuizQuestionData = {
  id: number;
  topic: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

const FALLBACK_QUIZ_QUESTIONS: QuizQuestionData[] = [
  {
    id: 1,
    topic: '기본키와 관계형 데이터베이스',
    question: '다음 중 관계형 데이터베이스의 기본키가 만족해야 하는 성질로 옳은 것은?',
    options: ['유일성과 최소성', '중복성과 가변성', 'Null 허용과 중복성', '최대성과 순서성'],
    answerIndex: 0,
    explanation: '기본키는 각 행을 구별하는 유일성과 꼭 필요한 속성만 사용하는 최소성을 만족해야 합니다.',
  },
  {
    id: 2,
    topic: 'OSI 전송 계층',
    question: 'OSI 7계층 중 종단 간 신뢰성 있는 데이터 전송을 담당하는 계층은?',
    options: ['물리 계층', '데이터링크 계층', '전송 계층', '표현 계층'],
    answerIndex: 2,
    explanation: '전송 계층은 포트 번호를 사용하고 종단 간 흐름 제어와 오류 제어를 수행합니다.',
  },
  {
    id: 3,
    topic: 'C 언어 포인터',
    question: 'C 언어에서 변수의 메모리 주소를 저장하는 데 사용하는 자료형은?',
    options: ['포인터', '구조체', '열거형', '공용체'],
    answerIndex: 0,
    explanation: '포인터 변수는 다른 변수나 메모리 영역의 주소를 저장합니다.',
  },
  {
    id: 4,
    topic: 'SQL 검색 조건',
    question: 'SQL에서 특정 조건을 만족하는 행만 조회할 때 사용하는 절은?',
    options: ['ORDER BY', 'WHERE', 'GROUP BY', 'CREATE'],
    answerIndex: 1,
    explanation: 'WHERE 절은 조회·수정·삭제 대상 행을 조건에 따라 필터링합니다.',
  },
  {
    id: 5,
    topic: '스택 자료구조',
    question: '스택 자료구조의 데이터 처리 방식으로 옳은 것은?',
    options: ['먼저 들어온 데이터가 먼저 나간다', '나중에 들어온 데이터가 먼저 나간다', '항상 오름차순으로 나간다', '임의의 위치에서만 꺼낼 수 있다'],
    answerIndex: 1,
    explanation: '스택은 LIFO(Last In, First Out) 방식으로 동작합니다.',
  },
  {
    id: 6,
    topic: 'TCP 연결 설정',
    question: 'TCP 연결을 시작할 때 사용하는 3-way handshake의 올바른 순서는?',
    options: ['ACK → SYN → FIN', 'SYN → SYN-ACK → ACK', 'FIN → ACK → SYN', 'SYN → FIN → SYN-ACK'],
    answerIndex: 1,
    explanation: '클라이언트의 SYN, 서버의 SYN-ACK, 클라이언트의 ACK 순서로 연결을 설정합니다.',
  },
  {
    id: 7,
    topic: '2진수 변환',
    question: '2진수 1010을 10진수로 변환한 값은?',
    options: ['8', '9', '10', '12'],
    answerIndex: 2,
    explanation: '1010₂는 1×2³ + 0×2² + 1×2¹ + 0×2⁰이므로 10입니다.',
  },
  {
    id: 8,
    topic: '함수와 모듈화',
    question: '프로그램에서 함수를 사용하는 가장 적절한 이유는?',
    options: ['모든 변수를 전역으로 만들기 위해', '기능을 나누어 재사용과 유지보수를 쉽게 하기 위해', '컴파일을 생략하기 위해', '메모리 주소를 고정하기 위해'],
    answerIndex: 1,
    explanation: '함수는 기능을 모듈화하여 코드 재사용성과 가독성, 유지보수성을 높입니다.',
  },
  {
    id: 9,
    topic: '외래키 참조 무결성',
    question: '관계형 데이터베이스에서 외래키의 주된 역할은?',
    options: ['다른 테이블의 행과 관계를 연결하고 참조 무결성을 유지한다', '테이블의 모든 행을 암호화한다', '조회 결과를 자동 정렬한다', '열의 자료형을 변환한다'],
    answerIndex: 0,
    explanation: '외래키는 다른 테이블의 키를 참조하여 테이블 간 관계와 참조 무결성을 유지합니다.',
  },
  {
    id: 10,
    topic: '데이터베이스 정규화',
    question: '데이터베이스 정규화의 주된 목적은?',
    options: ['데이터 중복을 늘리는 것', '모든 테이블을 하나로 합치는 것', '조회 조건을 없애는 것', '중복과 갱신 이상을 줄이는 것'],
    answerIndex: 3,
    explanation: '정규화는 데이터 중복을 줄이고 삽입·수정·삭제 과정의 이상 현상을 예방합니다.',
  },
];

function normalizeForComparison(value: string) {
  return value.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
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

function normalizeQuizQuestions(value: unknown): QuizQuestionData[] {
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
    const isDuplicate = uniqueQuestions.some((existing) =>
      isNearDuplicate(existing.topic, topic, 0.72) ||
      isNearDuplicate(existing.question, question, 0.84),
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
    const { action, jobTitle, certName, level, answers } = body;

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
      prompt = `대진전자통신고등학교 학생들을 위한 기술 자격증 모의고사 출제자입니다.
자격증명: "${certName}"
난이도: "${level || '중'}"

해당 자격증의 필기/실기 핵심 이론을 바탕으로 4지선다형 객관식 퀴즈를 만들어주세요.
반드시 서로 다른 핵심 개념을 다루는 문제를 최소 10개, 기본적으로 정확히 10개 출제하세요.
같은 개념을 문장만 바꾸어 반복하지 말고, 출제 영역과 정답 근거가 서로 겹치지 않도록 구성하세요.
각 문항에 한 줄짜리 고유한 "topic"을 포함하고, 10개 topic은 서로 달라야 합니다.
다른 설명이나 마크다운 백틱(\`\`\`) 없이 순수 JSON만 응답하세요:
{
  "certName": "${certName}",
  "level": "${level || '중'}",
  "quizzes": [
    {
      "id": 1,
      "topic": "서로 다른 출제 개념",
      "question": "문제 내용",
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
          model: 'claude-3-5-haiku-20241022',
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
          const generatedQuestions = normalizeQuizQuestions(parsed.quizzes);
          const combinedQuestions = normalizeQuizQuestions([
            ...generatedQuestions,
            ...FALLBACK_QUIZ_QUESTIONS,
          ]).slice(0, 10);
          const quizzes = combinedQuestions.length >= 10
            ? combinedQuestions
            : FALLBACK_QUIZ_QUESTIONS;

          return NextResponse.json({
            success: true,
            source: generatedQuestions.length >= 10 ? 'claude-cli-dgx' : 'claude-cli-dgx+smart-template-engine',
            data: {
              ...parsed,
              certName: parsed.certName || certName || '정보처리기능사',
              level: parsed.level || level || '중',
              quizzes,
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

    // 로컬 백엔드 서버가 아직 실행되지 않았을 때를 위한 스마트 폴백
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
        success: true,
        source: 'smart-template-engine',
        data: {
          certName: certName || '정보처리기능사',
          level: level || '중',
          quizzes: FALLBACK_QUIZ_QUESTIONS,
        },
      });
    }

    return NextResponse.json({ error: '지원하지 않는 요청입니다.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '서버 오류 발생' }, { status: 500 });
  }
}
