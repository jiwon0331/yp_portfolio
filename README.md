# 문지원 | International Development Portfolio

국제개발협력 사업수행기관 YP 및 신입급 지원을 위한 정적 포트폴리오입니다. HTML, CSS, Vanilla JavaScript만 사용하며 사이트 런타임에는 외부 라이브러리·폰트·백엔드가 없습니다.

## 프로젝트 구조

- `index.html`: 소개, 경험 흐름, 역량, Skills, Learning, About, Contact 및 SEO 메타데이터
- `css/style.css`, `css/responsive.css`: 디자인 변수와 모바일 우선 레이아웃
- `js/main.js`: 모바일 메뉴, 앵커 스크롤, 현재 위치 표시
- `js/projects.js`: JSON 카드·Evidence·상세 dialog·Gallery 렌더링
- `data/projects.json`: 프로젝트 3개의 콘텐츠
- `assets/favicon.svg`, `assets/images/og-image.png`: 파비콘 및 1200×630 공유 이미지
- `assets/documents/`: 이력서 PDF 등을 추가할 위치
- `scripts/build.mjs`: 공개 파일만 `outputs/site`로 복사하고 배포 주소 반영
- `.github/workflows/pages.yml`: 수동 실행 GitHub Pages 배포 워크플로
- `outputs/verification-archive.zip`: 검수 코드·스크린샷 보관본 (사이트 운영에 불필요)
- `outputs/`: 배포본·검수 보고서·보관 ZIP (Git 제외)

## 로컬 확인

프로젝트 폴더를 HTTP 정적 서버로 엽니다. `file://`로 열면 브라우저 보안 정책에 의해 JSON 요청이 실패할 수 있습니다.

Node.js가 있는 환경에서는 다음 명령으로 배포본을 만들 수 있습니다. 추가 패키지 설치는 필요하지 않습니다.

```text
node scripts/build.mjs
```

`outputs/site`는 생성 파일 전용 폴더입니다. 로컬 빌드에서는 공유 이미지가 상대 경로이며, 실제 배포에서는 `SITE_URL` 환경변수로 절대 주소를 주입합니다. 실제 주소가 정해지면 canonical·og:url·sitemap.xml도 함께 생성됩니다. 사이트를 실행하는 데 Node.js는 필요하지 않습니다.

## GitHub Pages 배포

1. GitHub 저장소를 만들고 이 폴더의 소스 파일을 업로드합니다. `work`, `outputs`, `node_modules`는 업로드하지 않습니다. ZIP 제공본을 사용할 경우 압축 안의 파일을 저장소 루트에 넣습니다. 숨김 폴더 `.github`도 포함해야 합니다.
2. 저장소 Settings → Pages에서 Source를 **GitHub Actions**로 설정합니다.
3. 아래 콘텐츠 확인 항목을 마친 후 Actions → **Deploy portfolio to GitHub Pages** → **Run workflow**를 실행합니다.
4. 배포 결과 URL에서 모바일 화면, Resume, 프로젝트 상세, 공유 미리보기를 다시 확인합니다.

워크플로는 `workflow_dispatch`로만 실행하며 단순 업로드·push로 배포하지 않습니다. `configure-pages`가 반환한 실제 사이트 주소를 사용하고, `outputs/site`만 업로드합니다. 이 작업에서는 원격 저장소 생성·push·배포를 수행하지 않았습니다.

참고: [GitHub 공식 Pages 워크플로 문서](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## 콘텐츠 수정

기본 프로젝트 필드: `id`, `category`, `title`, `subtitle`, `period`, `location`, `role`, `summary`, `responsibilities`, `actions`, `results`, `skills`, `lessons`, `transferable`, `images`.

- `id`: 영문 소문자·숫자·하이픈으로 만든 고유 식별자
- 목록: `responsibilities`, `actions`, `skills`, `transferable`
- 지표: `results`에 `{ "value": "50+", "label": "Contents Published" }` 형식의 객체
- 추가 맥락: `overview`, `context`, `challenge`, `contribution`
- 운영 구조 목록: `actionStructure`
- 분석 방법: `methods`에 `{ "title": "SPSS ANALYSIS", "items": [] }`
- 성과 범위 설명: `resultScope`
- 대표 사례: `featured: true`
- Evidence: `evidence`에 `{ "competency": "research-data", "label": "조사 설계·SPSS 분석 경험" }`. 기존 4개 역량 키에 맞춰 연결하면 해당 사례 모달이 열립니다.

기간·결과·기관명 등의 미제공 정보는 만들지 않습니다. KOICA 역할은 **KOICA 프로젝트 봉사단 · 홍보/캠페인팀**입니다. 연구 경험은 데이터 기반 업무의 기초 역량, 공연장 경험은 약 4년간의 현장 안내 경험으로 표현합니다.

## 이미지 추가

`images` 배열이 비어 있으면 Gallery를 표시하지 않습니다. 실제 파일을 추가한 뒤 다음 형식을 사용합니다.

```json
{
  "src": "./assets/images/your-image.webp",
  "alt": "실제 이미지 내용을 설명하는 대체 텍스트",
  "caption": "선택 설명"
}
```

첫 이미지가 대표, 다음 최대 4장이 보조 이미지입니다. 같은 사이트 출처의 이미지 경로만 지원하며, 비어 있지 않은 `alt`가 필수입니다. 보조 이미지는 lazy loading, 모든 이미지는 비동기 디코딩을 사용합니다. 이미지 로드가 전부 실패하면 Gallery 제목도 숨깁니다. 실제 활동 이미지는 아직 추가하지 않았습니다. 공유 이미지는 제공된 문구로 만든 디자인이며 현장 사진이 아닙니다.

## 상호작용과 접근성

960px 미만은 Menu 버튼, 이상은 가로 메뉴입니다. Quick Profile·Competencies는 Home, Learning은 Skills, Contact는 About의 활성 상태에 포함됩니다. 모달은 ESC·배경 클릭·Close 버튼으로 닫고, 초점과 페이지 스크롤을 원래 위치로 복원합니다. 동작 줄이기 설정에서는 부드러운 스크롤과 색상 전환을 끕니다.

375·430·768·1024·1440px 로컬 브라우저 검수를 수행했습니다. 배포 하위 경로, 메뉴, 긴 문자열, 터치 영역, 지표, 모달, Evidence 연결, Gallery 임시 데이터, 콘솔 오류·내부 파일 요청을 확인했습니다. 주요 텍스트 대비는 최소 5.30:1입니다. 실제 모바일 기기·스크린리더와 배포 서버 검증은 별도입니다.

## 공개 전 사용자 확인

- 이력서 PDF와 연락처: Resume는 명시적인 준비 중 링크이고 Contact는 미완성입니다.
- KOICA 활동 기간, 연구 프로젝트명·기간 등 공개할 정확한 정보
- 50+ 게시물, 약 92K 조회, 약 3K 프로필 방문, 약 2배 팔로워의 집계 기간·출처·비교 기준과 팀/개인 기여 범위
- 전시물·콘텐츠·운영표 등 공개 가능한 실제 결과물과 이미지 설명
- 외국어·도구 및 각 분석 방법의 실제 활용 수준과 설명 가능 여부
- GitHub 저장소 및 최종 배포 주소

채용 제출용으로는 위 확인을 마친 뒤 공개하는 것이 적절합니다. 기술적으로 배포 가능한 상태와 채용 제출 콘텐츠 완성은 구분합니다.

## 최종 Lighthouse 기록

로컬 Edge 모바일 에뮬레이션에서 Lighthouse 13.5.0 최종 결과는 Performance 64, Accessibility 100, Best Practices 100, SEO 100입니다. Performance 90+ 목표는 미달이며, 실제 배포 후 재측정이 필요합니다. 로컬 서버는 압축·캐시를 설정하지 않은 검수용 서버입니다. `outputs/lighthouse-report.html`과 `outputs/FINAL-REVIEW.md`에 상세 결과를 보관합니다.
