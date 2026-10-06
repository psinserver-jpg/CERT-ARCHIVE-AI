// 대진전자통신고등학교 학과 및 자격증 데이터

export interface Certification {
  id: string;
  name: string;
  level: '기능사' | '산업기사' | '기사' | '기타';
  category: string;
  issuer: string;
  description: string;
  examType: string;
  difficulty: 1 | 2 | 3 | 4 | 5; // 1=매우쉬움 5=매우어려움
  passRate: string;
  examPeriods: string;
  applyUrl: string;
  tags: string[];
}

export interface Department {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgGradient: string;
  description: string;
  subjects: string[];
  requiredCertIds: string[];
  recommendedCertIds: string[];
  careers: string[];
}

// ────────────────────────────────────────
// 자격증 마스터 데이터
// ────────────────────────────────────────
export const CERTIFICATIONS: Record<string, Certification> = {
  'computer-usage-1': {
    id: 'computer-usage-1',
    name: '컴퓨터활용능력 1급',
    level: '기타',
    category: 'IT 공통',
    issuer: '대한상공회의소',
    description: '스프레드시트(엑셀), 데이터베이스(액세스) 활용 능력 검정. 사무 자동화의 핵심 자격증.',
    examType: '필기 + 실기',
    difficulty: 3,
    passRate: '약 40%',
    examPeriods: '연중 상시(필기), 분기별(실기)',
    applyUrl: 'https://www.dataq.or.kr',
    tags: ['엑셀', '액세스', '사무자동화', '상시시험'],
  },
  'computer-usage-2': {
    id: 'computer-usage-2',
    name: '컴퓨터활용능력 2급',
    level: '기타',
    category: 'IT 공통',
    issuer: '대한상공회의소',
    description: '스프레드시트(엑셀) 활용 능력 검정. 취업 필수 기본 자격증.',
    examType: '필기 + 실기',
    difficulty: 2,
    passRate: '약 55%',
    examPeriods: '연중 상시(필기), 분기별(실기)',
    applyUrl: 'https://www.dataq.or.kr',
    tags: ['엑셀', '사무자동화', '입문'],
  },
  'info-processing-craftsman': {
    id: 'info-processing-craftsman',
    name: '정보처리기능사',
    level: '기능사',
    category: '소프트웨어',
    issuer: '한국산업인력공단',
    description: '전산 시스템의 운용 및 관리, 프로그래밍 기초 능력 검정. IT 분야 입문 자격증.',
    examType: '필기 + 실기',
    difficulty: 2,
    passRate: '약 50%',
    examPeriods: '연 4회 (3, 6, 9, 11월)',
    applyUrl: 'https://www.q-net.or.kr',
    tags: ['프로그래밍', '데이터베이스', 'OS', '네트워크'],
  },
  'info-processing-engineer': {
    id: 'info-processing-engineer',
    name: '정보처리기사',
    level: '기사',
    category: '소프트웨어',
    issuer: '한국산업인력공단',
    description: '정보시스템 개발, 데이터베이스, 네트워크, 보안 전반의 고급 자격증. IT 취업 핵심.',
    examType: '필기 + 실기',
    difficulty: 4,
    passRate: '약 20%',
    examPeriods: '연 3회 (3, 6, 9월)',
    applyUrl: 'https://www.q-net.or.kr',
    tags: ['소프트웨어공학', '데이터베이스', '보안', '알고리즘'],
  },
  'electronic-device': {
    id: 'electronic-device',
    name: '전자기기기능사',
    level: '기능사',
    category: '전자',
    issuer: '한국산업인력공단',
    description: '전자회로 설계 및 전자기기 제작·수리 능력 검정. 전자과 핵심 자격증.',
    examType: '필기 + 실기',
    difficulty: 3,
    passRate: '약 45%',
    examPeriods: '연 4회',
    applyUrl: 'https://www.q-net.or.kr',
    tags: ['전자회로', '납땜', '측정기기', '트랜지스터'],
  },
  'electronic-cad': {
    id: 'electronic-cad',
    name: '전자캐드기능사',
    level: '기능사',
    category: '전자',
    issuer: '한국산업인력공단',
    description: '전자 회로도 CAD 설계 및 PCB 기판 설계 능력 검정.',
    examType: '필기 + 실기',
    difficulty: 2,
    passRate: '약 60%',
    examPeriods: '연 4회',
    applyUrl: 'https://www.q-net.or.kr',
    tags: ['CAD', 'PCB', '회로도', '설계'],
  },
  'info-comm-craftsman': {
    id: 'info-comm-craftsman',
    name: '정보통신기능사',
    level: '기능사',
    category: '통신',
    issuer: '한국산업인력공단',
    description: '정보통신 설비 설치·유지보수 능력 검정. 통신과 필수 자격증.',
    examType: '필기 + 실기',
    difficulty: 3,
    passRate: '약 40%',
    examPeriods: '연 4회',
    applyUrl: 'https://www.q-net.or.kr',
    tags: ['통신설비', '네트워크', '광케이블', '무선통신'],
  },
  'network-manager-2': {
    id: 'network-manager-2',
    name: '네트워크관리사 2급',
    level: '기타',
    category: '네트워크',
    issuer: '한국정보통신자격협회',
    description: '네트워크 구축·운영 및 관리 능력 검정. 실무에서 인정받는 자격증.',
    examType: '필기 + 실기',
    difficulty: 3,
    passRate: '약 35%',
    examPeriods: '연 4회 (짝수월)',
    applyUrl: 'https://www.icqa.or.kr',
    tags: ['TCP/IP', '라우팅', '스위칭', 'LAN'],
  },
  'linux-master-2': {
    id: 'linux-master-2',
    name: 'Linux마스터 2급',
    level: '기타',
    category: '소프트웨어',
    issuer: '한국정보통신자격협회',
    description: '리눅스 운영체제 설치·운영 및 서버 관리 능력 검정.',
    examType: '필기 + 실기',
    difficulty: 3,
    passRate: '약 50%',
    examPeriods: '연 2회 (3, 9월)',
    applyUrl: 'https://www.icqa.or.kr',
    tags: ['Linux', '서버', 'Shell', '시스템관리'],
  },
  'itq-excel': {
    id: 'itq-excel',
    name: 'ITQ (엑셀)',
    level: '기타',
    category: 'IT 공통',
    issuer: '한국생산성본부',
    description: '엑셀 활용 능력 검정. A등급 취득 권장.',
    examType: '실기',
    difficulty: 1,
    passRate: '약 70%',
    examPeriods: '매월 시행',
    applyUrl: 'https://www.itq.or.kr',
    tags: ['엑셀', '사무', '입문', '매월'],
  },
  'itq-ppt': {
    id: 'itq-ppt',
    name: 'ITQ (파워포인트)',
    level: '기타',
    category: 'IT 공통',
    issuer: '한국생산성본부',
    description: '파워포인트 프레젠테이션 제작 능력 검정.',
    examType: '실기',
    difficulty: 1,
    passRate: '약 75%',
    examPeriods: '매월 시행',
    applyUrl: 'https://www.itq.or.kr',
    tags: ['PPT', '프레젠테이션', '입문'],
  },
  'electrical-craftsman': {
    id: 'electrical-craftsman',
    name: '전기기능사',
    level: '기능사',
    category: '전기',
    issuer: '한국산업인력공단',
    description: '전기 설비의 설치·점검·유지보수 능력 검정. 취업률 높은 자격증.',
    examType: '필기 + 실기',
    difficulty: 2,
    passRate: '약 55%',
    examPeriods: '연 4회',
    applyUrl: 'https://www.q-net.or.kr',
    tags: ['전기배선', '전력설비', '안전', '실용'],
  },
  'iot-craftsman': {
    id: 'iot-craftsman',
    name: '사물인터넷개발기능사',
    level: '기능사',
    category: 'AI·IoT',
    issuer: '한국산업인력공단',
    description: 'IoT 디바이스 설계, 네트워크 연결, 플랫폼 활용 능력 검정.',
    examType: '필기 + 실기',
    difficulty: 3,
    passRate: '약 45%',
    examPeriods: '연 4회',
    applyUrl: 'https://www.q-net.or.kr',
    tags: ['IoT', '아두이노', '라즈베리파이', '센서'],
  },
};

// ────────────────────────────────────────
// 학과 데이터
// ────────────────────────────────────────
export const DEPARTMENTS: Department[] = [
  {
    id: 'smart-electronics',
    name: '스마트전자과',
    emoji: '⚡',
    color: '#6384ff',
    bgGradient: 'linear-gradient(135deg, rgba(99,132,255,0.15) 0%, rgba(99,132,255,0.05) 100%)',
    description: '전자회로 설계, 마이크로컨트롤러, 스마트 기기 개발을 학습합니다.',
    subjects: ['전자회로', '디지털공학', '마이크로컨트롤러', '자동제어', '전자캐드'],
    requiredCertIds: ['electronic-device', 'computer-usage-2'],
    recommendedCertIds: ['electronic-cad', 'electrical-craftsman', 'computer-usage-1', 'itq-excel'],
    careers: ['전자제품 개발자', '임베디드 개발자', '자동화 엔지니어', '품질관리 기술자'],
  },
  {
    id: 'info-comm',
    name: '정보통신과',
    emoji: '📡',
    color: '#a78bfa',
    bgGradient: 'linear-gradient(135deg, rgba(167,139,250,0.15) 0%, rgba(167,139,250,0.05) 100%)',
    description: '네트워크, 통신 시스템, 무선통신 기술을 심화 학습합니다.',
    subjects: ['통신이론', '네트워크', '무선통신', '광통신', '정보보안 기초'],
    requiredCertIds: ['info-comm-craftsman', 'computer-usage-2'],
    recommendedCertIds: ['network-manager-2', 'info-processing-craftsman', 'computer-usage-1', 'itq-excel'],
    careers: ['네트워크 엔지니어', '통신 기술자', '시스템 관리자', '보안 관제 요원'],
  },
  {
    id: 'software',
    name: '소프트웨어과',
    emoji: '💻',
    color: '#34d399',
    bgGradient: 'linear-gradient(135deg, rgba(52,211,153,0.15) 0%, rgba(52,211,153,0.05) 100%)',
    description: '프로그래밍, 앱 개발, 데이터베이스, 인공지능 기초를 학습합니다.',
    subjects: ['파이썬', '자바', '웹개발', '데이터베이스', 'AI 기초'],
    requiredCertIds: ['info-processing-craftsman', 'computer-usage-2'],
    recommendedCertIds: ['computer-usage-1', 'linux-master-2', 'info-processing-engineer', 'itq-excel'],
    careers: ['소프트웨어 개발자', '앱 개발자', '웹 개발자', '데이터 분석가'],
  },
  {
    id: 'ai-iot',
    name: 'AI·IoT과',
    emoji: '🤖',
    color: '#fb923c',
    bgGradient: 'linear-gradient(135deg, rgba(251,146,60,0.15) 0%, rgba(251,146,60,0.05) 100%)',
    description: '인공지능, 사물인터넷, 임베디드 시스템, 빅데이터 기초를 학습합니다.',
    subjects: ['AI 기초', 'IoT 시스템', '빅데이터', '임베디드', '클라우드 기초'],
    requiredCertIds: ['iot-craftsman', 'info-processing-craftsman'],
    recommendedCertIds: ['electronic-device', 'network-manager-2', 'computer-usage-1', 'linux-master-2'],
    careers: ['AI 엔지니어', 'IoT 개발자', '데이터 사이언티스트', '스마트팩토리 전문가'],
  },
];

export const ALL_CERT_IDS = Object.keys(CERTIFICATIONS);

export function getCertById(id: string): Certification | undefined {
  return CERTIFICATIONS[id];
}

export function getDepartmentById(id: string): Department | undefined {
  return DEPARTMENTS.find((d) => d.id === id);
}

export function getCertsByIds(ids: string[]): Certification[] {
  return ids.map((id) => CERTIFICATIONS[id]).filter(Boolean) as Certification[];
}

export const CATEGORY_COLORS: Record<string, string> = {
  'IT 공통': '#6384ff',
  '소프트웨어': '#34d399',
  '전자': '#fbbf24',
  '통신': '#a78bfa',
  '네트워크': '#f87171',
  '전기': '#60a5fa',
  'AI·IoT': '#fb923c',
};
