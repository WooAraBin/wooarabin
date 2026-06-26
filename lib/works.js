// 루카이든 작업물 데이터 (베럴독은 완성 후 추가 예정)
// 스크린샷은 /public/works/<slug>/ 에 넣고 gallery 배열에 추가하면 상세 페이지에 표시됩니다.

export const works = [
  {
    slug: 'lenz',
    title: 'LENZ',
    tagline: '글로벌 시장을 한 화면에서 읽는 AI 분석 에이전트',
    year: '2026',
    tags: ['Web', 'AI', 'PWA'],
    cover: '/works/lenz.png',
    overview:
      '국내·해외 주식과 암호화폐 시세를 한곳에 모아 실시간으로 추적하고, AI가 매일 시장 상황을 브리핑해주는 개인 투자 대시보드입니다. 관심 종목만 모아 보는 워치리스트부터 내 자산 관리, AI 시황 분석까지 — 모바일 앱처럼 홈 화면에 설치해 쓸 수 있는 PWA로 만들었습니다.',
    features: [
      'AI 시장 브리핑 — 매일의 시장 동향을 자동 요약',
      '실시간 시세 — 국내·미국 주식, 암호화폐 워치리스트',
      '내 자산 관리 — 보유 종목과 수익률 추적',
      '시장 뉴스 피드',
      'PWA — 홈 화면에 설치해 앱처럼 사용',
    ],
    tech: ['HTML · JavaScript', 'PWA (Service Worker)', '실시간 시세 API', 'AI 분석'],
    screenshots: [
      '/works/lenz/lenz-01.png', '/works/lenz/lenz-02.png', '/works/lenz/lenz-03.png',
      '/works/lenz/lenz-04.png', '/works/lenz/lenz-05.png', '/works/lenz/lenz-06.png',
      '/works/lenz/lenz-07.png', '/works/lenz/lenz-08.png', '/works/lenz/lenz-09.png',
      '/works/lenz/lenz-10.png',
    ],
  },
  {
    slug: 'meetlog',
    title: 'MeetLog',
    tagline: '녹음만 하면 회의록이 완성되는 AI 회의 비서',
    year: '2026',
    tags: ['Web', 'AI'],
    cover: '/works/meetlog.png',
    overview:
      '브라우저에서 바로 녹음하거나 음성 파일을 올리면 Google Gemini가 음성을 텍스트로 변환하고 회의 내용을 자동으로 정리해주는 무료 회의록 웹앱입니다. 제목·일자·참석자부터 주제별 논의 흐름, 핵심 발언, 확정된 결정 사항까지 한 번에 추출합니다.',
    features: [
      '실시간 녹음 & 음성 파일 업로드 (MP3·MP4·WAV·M4A 등, 최대 200MB)',
      '회의 정보 자동 추출 — 제목·일자·참석자',
      '주제별 회의 내용 — 배경 → 논의 → 결론 구조로 정리',
      '핵심 발언 추출 (실제 발언 원문 기반)',
      '확정 결정 사항만 선별 (모호한 항목 제외)',
    ],
    tech: ['Google Gemini 2.5 Flash', 'Web Audio (브라우저 녹음)', 'Vercel'],
    screenshots: [],
  },
  {
    slug: 'misikrok',
    title: '미식록 · 美食錄',
    tagline: '우리 가족만의 맛집 아카이브',
    year: '2026',
    tags: ['Web', 'App', 'Map'],
    cover: '/works/misikrok.png',
    overview:
      '스쳐 가는 맛의 기억을 옛 문헌처럼 정갈하게 남기는 나만의 미식 실록. 카카오맵으로 맛집을 검색해 등록하고, 지도 위에서 위치·반경으로 필터링하며 평점과 리뷰로 정리합니다. 미슐랭 가게 모아보기와 근처 맛집 추천까지 — 모든 기록은 노션에 저장됩니다.',
    features: [
      '카카오맵 맛집 검색 & 등록',
      '위치 기준 필터 — 반경 1·3·5·10km',
      '근처 맛집 추천',
      '미슐랭 가게 모아보기',
      '평점·리뷰·카테고리·태그로 정리',
      'Notion 연동 저장',
    ],
    tech: ['카카오맵 API', 'Notion API', 'PWA'],
    screenshots: [
      '/works/misikrok/misikrok-01.png', '/works/misikrok/misikrok-02.png', '/works/misikrok/misikrok-03.png',
      '/works/misikrok/misikrok-04.png', '/works/misikrok/misikrok-05.png', '/works/misikrok/misikrok-06.png',
      '/works/misikrok/misikrok-07.png',
    ],
  },
  {
    slug: 'quicknote',
    title: 'Quick Note',
    tagline: '떠오른 생각을 한 번에 노션으로',
    year: '2026',
    tags: ['Web', 'App'],
    cover: '/works/quicknote.png',
    overview:
      '메모 앱을 따로 열 필요 없이, 떠오르는 생각을 빠르게 적어 곧바로 Notion에 저장하는 퀵 캡처 도구입니다. 카테고리를 골라 한 번에 정리하고, 어디서든 홈 화면에서 바로 기록할 수 있습니다.',
    features: [
      'Notion 연동 — 작성 즉시 노션 DB에 저장',
      '카테고리 선택으로 분류 정리',
      '군더더기 없는 빠른 캡처 UI',
    ],
    tech: ['Notion API', 'PWA', 'Vercel'],
    screenshots: [],
  },
]

export function getWork(slug) {
  return works.find((w) => w.slug === slug)
}
