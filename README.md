# 문지원 | International Development Portfolio

국제개발협력 사업수행기관 YP 및 신입급 지원을 위한 정적 포트폴리오입니다. HTML, CSS, Vanilla JavaScript만 사용하며 사이트 런타임에는 외부 라이브러리·폰트·백엔드가 없습니다.

## Version History

### v2.1

졸업논문 실제 내용, KOICA 개인 수행과 팀 성과 구분, Skills 한국어 우선, 이메일 전용 Contact, 사진 연결 구조를 반영했습니다. 최신 검수 기록은 `outputs/V2.1-FINAL-QA.md`입니다.

### v2 · 2026-09-30

- Korean / English bilingual information structure
- Experience Journey restructuring
- Expanded evidence-based competencies
- Expanded Featured Projects
- Skills and Learning section update
- Contact information update
- Project image architecture added

위 목록은 v2의 전체 개편 범위입니다. STEP 1에서는 한영 병기, 상위 섹션 01–06, Journey 내부 번호 제거, 메뉴·Hero·Quick Profile 개편을 반영했습니다. STEP 2에서는 4개 역량의 구체적 Evidence와 4단계 Experience Journey(학회·학생회, 교환학생 강의, 봉사단 기간 포함)를 반영했습니다. 설문 연구 주제와 우수 졸업논문 선정 사실은 별개로 표기하며 당시 미확정이었던 졸업논문 제목·상세 내용은 이후 사용자 제공 정보로 보완했습니다. STEP 3에서 주요 프로젝트 4개·추가 경험 4개, 정확한 홍보 수치와 사진 연결 구조를 반영했습니다. STEP 4에서 Skills를 언어·콘텐츠·OA·생성형 AI 활용·조사 데이터로 정리하고 제공된 수준 및 자격 근거를 반영했습니다. Learning은 현재 기여 역량 4개와 앞으로 배우고 싶은 영역 5개로 구분했습니다. STEP 5에서 About 원문을 유지하고 연락처 링크와 작은 한영 AI 제작 안내를 추가했습니다. 이후 Contact는 이메일만 표시하도록 수정했습니다. 사진 연결 이전의 기록입니다. 현재는 기존 JSON 이미지 구조를 유지하면서 실제 사진·자료 22장과 수동 순환 갤러리를 연결했습니다.

## 프로젝트 구조

- `index.html`: 소개, 경험 흐름, 역량, Skills, Learning, About, Contact 및 SEO 메타데이터
- `css/style.css`, `css/responsive.css`: 디자인 변수와 모바일 우선 레이아웃
- `js/main.js`: 모바일 메뉴, 앵커 스크롤, 현재 위치 표시
- `js/projects.js`: JSON 카드·Evidence·상세 dialog·Gallery 렌더링
- `data/projects.json`: 주요 프로젝트 4개·추가 경험 4개의 콘텐츠
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
4. 배포 결과 URL에서 모바일 화면, 내비게이션, 프로젝트 상세, 공유 미리보기를 다시 확인합니다.

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
- Evidence: `evidence`에 `{ "competency": "research-data", "label": "자료조사·SPSS 통계분석 경험" }`. 기존 4개 역량 키에 맞춰 연결하면 해당 사례 모달이 열립니다.

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

갤러리는 파일명에 numeric sorting을 적용해 1 → 2 → … → 10 순서로 표시하며 장수 제한이 없습니다. 2장 이상이면 이전·다음 버튼과 현재 위치를 표시하고 양방향으로 순환합니다. 자동 재생은 없으며 각 사진은 처음 선택할 때 로드합니다. 1장이면 버튼을 숨기고, 이미지가 없거나 모두 로드에 실패하면 Gallery 제목과 영역을 제거합니다. 같은 사이트 출처의 이미지 경로만 지원하고, 갤러리 alt가 비어 있으면 프로젝트명 기반의 일반적인 설명을 사용합니다. 사진은 고정 비율 영역에서 object-fit: contain으로 전체 표시합니다. 현재 6개 프로젝트에 사진·자료 22장을 연결했으며 학생회와 공연장 경험은 이미지가 없습니다.

## 상호작용과 접근성

960px 미만은 Menu 버튼, 이상은 가로 메뉴입니다. Experience·Projects·Skills·Learning·About·Contact를 각각 표시하며 도입부에서는 활성 메뉴를 표시하지 않습니다. 브랜드 링크로 처음으로 이동합니다. 모달은 ESC·배경 클릭·Close 버튼으로 닫고, 초점과 페이지 스크롤을 원래 위치로 복원합니다. 동작 줄이기 설정에서는 부드러운 스크롤과 색상 전환을 끕니다.

375·430·768·1024·1440px 로컬 브라우저 검수를 수행했습니다. 배포 하위 경로, 메뉴, 긴 문자열, 터치 영역, 지표, 모달, Evidence 연결, Gallery 임시 데이터, 콘솔 오류·내부 파일 요청을 확인했습니다. 주요 텍스트 대비는 최소 5.30:1입니다. 실제 모바일 기기·스크린리더와 배포 서버 검증은 별도입니다.

## 공개 전 사용자 확인

- Contact에는 제공된 이메일만 연결했습니다. Resume 메뉴·버튼·placeholder는 제거했습니다.
- KOICA 활동 기간, 연구 프로젝트명·기간 등 공개할 정확한 정보
- 60개 콘텐츠, 92,207 조회, 2,599 프로필 방문, 200 팔로워, 약 2배 이상의 팔로워 증가의 집계 기간·출처·비교 기준과 팀/개인 기여 범위
- 전시물·콘텐츠·운영표 등 공개 가능한 실제 결과물과 이미지 설명
- 외국어·도구 및 각 분석 방법의 실제 활용 수준과 설명 가능 여부
- GitHub 저장소 및 최종 배포 주소

채용 제출용으로는 위 확인을 마친 뒤 공개하는 것이 적절합니다. 기술적으로 배포 가능한 상태와 채용 제출 콘텐츠 완성은 구분합니다.

## v1 Lighthouse 기록 (v2 측정 아님)

로컬 Edge 모바일 에뮬레이션에서 Lighthouse 13.5.0 최종 결과는 Performance 64, Accessibility 100, Best Practices 100, SEO 100입니다. Performance 90+ 목표는 미달이며, 실제 배포 후 재측정이 필요합니다. 로컬 서버는 압축·캐시를 설정하지 않은 검수용 서버입니다. `outputs/lighthouse-report.html`과 `outputs/FINAL-REVIEW.md`에 상세 결과를 보관합니다.

## v2 경험 DB와 사진 연결

모든 경험은 `projects` 배열에 보관합니다. `group: "main"`은 주요 카드, `group: "additional"`은 하단의 작은 경험 목록입니다. `featured: true`는 KOICA 대표 사례에만 적용합니다. 기존 연구 ID `research-data-analysis`와 공연장 ID `field-service-operations`를 유지했습니다.

사진 폴더는 아래 표를 기준으로 사용합니다. 데이터 ID와 폴더 이름이 달라도 `src`에 실제 경로를 지정하면 정상 연결됩니다. 기존 ID와 폴더는 호환성을 위해 보존했습니다. 사진 파일을 넣은 뒤 해당 경험의 `heroImage` 또는 `images`에 경로·설명을 등록하면 자동 배치됩니다. 정적 사이트는 폴더에 넣은 파일을 스스로 검색하지 않습니다. 추후 사진을 전달하면 ID별 연결 데이터를 함께 수정할 수 있습니다.

```json
{
  "heroImage": {
    "src": "assets/images/projects/koica-paraguay/campaign-01.webp",
    "alt": "만성질환 인식개선 캠페인 활동",
    "caption": "만성질환 인식개선 캠페인"
  },
  "images": []
}
```

`heroImage` 기본값은 `null`, `images`는 빈 배열이며 이 경우 이미지 영역은 표시하지 않습니다. 같은 사이트 경로와 alt가 필요합니다. 대표 사진은 카드에서 3:2로 중앙 crop하고 모달에서는 전체 비율을 보존합니다. 갤러리는 고정 비율 영역 안에서 원본 전체를 표시하며 모든 등록 이미지를 수동 순환합니다. 추가 경험에도 두 속성을 사용할 수 있습니다.

추가 필드: `titleEn`, `roleEn`, `resultsTitle`, `resultsTitleKo`, `resultNote`, 지표의 `detail`, `researchTitle`, `process`, `thesis`. `titleEn`은 기존 제목의 병기용 번역이며 기존 영문 제목에는 한국어를 담을 수 있습니다. 논문 TBD 4개는 사용자 제공 제목·연구 질문·방법·결과로 교체했습니다. 공식 영문 논문 제목은 제공되지 않아 표시하지 않습니다. 대표 설문 연구와 우수 졸업논문이 동일하다고 연결하지 않습니다.

## v2 최종 QA · 2026-09-30

5개 화면 너비에서 메뉴·모달·키보드·프로젝트 순서·갤러리 및 내부 경로를 검수했습니다. 추가 경험의 이미지 로드 실패 시 빈 갤러리를 제거하도록 수정했습니다. 상세 결과와 미확정 자료는 `outputs/V2-FINAL-QA.md`에 정리했습니다. 이 검수는 v2 Lighthouse 점수를 포함하지 않습니다.

## v2 보정 · 졸업논문 상세 완성

`thesis` 프로젝트의 선정 사실과 2025.02 표기를 유지하고 실제 한글 제목·부제, 질문 2개, 인터뷰·분석 방법, 분석 구성요소 3개, 결과 3개, 연구 과정 6단계 및 전이 역량을 반영했습니다. `thesis` 객체는 `questions`, `method`, `components`, `findings`, `scope`, `process`로 구성합니다. 연구 기간을 새로 추정하지 않았으며, 2명 대상 탐색적 결과의 범위를 명시했습니다. 이전 QA 문서의 TBD 목록은 당시 기록입니다.

## v2 보정 · Journey와 KOICA 성과 범위

Sweden Exchange의 단독 SDGs 태그만 제거했습니다. KOICA 상세는 `actionTitle`·`actionTitleKo`로 주요 활동 / Key Activities를 한국어 우선으로 표시하고 그 다음 Team Communication Results / 팀 홍보 운영 성과를 배치합니다. 주요 활동은 5개 항목이며, 활동 배경·운영 구조 태그·YP 실무 기여 섹션은 표시하지 않습니다. 콘텐츠 60개·조회 92,207·방문 2,599·팔로워 약 2배 이상은 채널의 팀 성과이며 200 Followers는 보조 정보입니다. `results[].labelKo`로 지표명을 병기합니다.

## v2 보정 · Skills 한국어 우선 및 이메일 전용 Contact

Skills 내부 제목·활용 수준·근거를 한국어 우선으로 수정했습니다. Claude Code를 제거하고 Codex 활용 문구를 반영했으며 질적 인터뷰 분석을 추가했습니다. 자격증은 한국어 명칭을 유지했습니다. Contact의 전화번호·tel 링크를 제거하고 이메일만 유지합니다. 상위 제목·번호와 다른 섹션 구조는 유지했습니다.

## v2.1 이미지 폴더 안내

| 프로젝트 ID | 권장 폴더 (`assets/images/projects/` 아래) |
|---|---|
| koica-paraguay | koica-paraguay/ |
| welfare-practicum | welfare-practicum/ |
| research-data-analysis | research/ |
| thesis | thesis/ |
| community-welfare | community-project/ |
| student-council | student-council/ |
| medical-social-welfare | medicla-social-welfare/ (현재 실제 폴더명) |
| field-service-operations | field-service-operations/ |

기존 `research-data-analysis/`, `community-welfare/`도 계속 사용할 수 있습니다. `heroImage`와 `images`는 모두 `{src, alt, caption}` 형식의 이미지 객체를 지원하며 `caption`은 선택입니다. 빈 경로는 이미지로 렌더링하지 않습니다. 갤러리의 빈 alt는 프로젝트명 기반 설명으로 보완하며, 대표 이미지의 alt는 필수입니다. 사진 파일을 넣고 JSON 경로만 연결하면 카드 대표 사진·상세 갤러리에 배치되며, 이미지가 없어도 프로젝트 내용과 지표는 유지됩니다.

## 사진 연결 및 순환 갤러리 · 2026-10-03

실제 경로는 assets/images/projects/입니다. KOICA 11장, 복지관 실습 5장, 정량 연구 2장, 졸업논문 1장, 지역사회복지론 팀 프로젝트 2장, 의료사회사업연구학회 1장을 연결했습니다. 기존 파일명과 폴더명을 보존했습니다. 카드에는 대표 이미지를 추가하지 않았으며, 추가 경험에도 상세 보기 버튼이 있습니다. 기존 주요 카드 4개와 추가 경험 4개의 텍스트 표시는 이미지 유무와 독립적입니다.

## 졸업논문 역할 중심 정리

졸업논문 상세는 연구 개요 → 담당 역할 → 연구 결과 → 활용 가능한 역량 순서입니다. 연구 질문·과정·방법·분석 구성요소의 독립 섹션을 제거하고 역할과 주요 활동을 5개 항목으로 통합했습니다. 공동논문 참여 역할과 참여자 2명의 탐색적 연구 범위를 명시하며, 논문 제목·부제·선정 정보·기존 이미지는 유지합니다. 앞선 v2 기록의 연구 설명 구조는 개편 이전 상태입니다.

## 조사·데이터 분석 상세 축소

Research & Data Analysis는 프로젝트 개요 → 담당 역할 → 분석 경험 → 활용 가능한 역량 순서로 표시합니다. 대표 연구 주제와 팀 연구 설명을 개요에 통합하고, 실제 역할은 자료조사·전공 선택 동기의 이론적 배경 정리·통계분석 3개로 제한했습니다. 분석 경험은 SPSS의 회귀분석과 매개효과 분석만 표시합니다. 활동 배경·연구 과정·담당업무 및 실행·분석 방법의 기존 독립 섹션과 긴 학습·YP 기여 문구는 제거했습니다. 기존 제목·기간·사진 2장은 유지합니다.

## 공연장 경험 및 프로젝트 상세 UI 정리

공연장 안내원 근무 / Venue Usher Experience는 2022.02~로 표시하고, 기본 정보의 공연장 안내원 / Venue Usher 역할과 주요 업무 4개, 경험 의미 한 문장만 남겼습니다. 장소·활동 배경·별도 역할·긴 YP 기여 설명은 표시하지 않습니다. 전체 상세 소제목은 한국어 우선·영어 보조로 통일하고, 기본 정보와 반복되던 역할 제목을 제거했습니다. 연구 2개는 구체적인 담당 역할 목록을 유지합니다. 복지관의 YP 기여 제목은 짧은 활용 가능한 역량으로 바꾸고, 짧은 추가 경험의 기간은 별도 Overview 제목 없이 표시합니다. 기존 성과·내용·사진은 유지합니다.
