"use strict";

// Avoid retrying a known broken image on every dialog open; refresh allows a retry.
const failedProjectImages = new Set();

document.addEventListener("DOMContentLoaded", () => {
  getProjectDialog();
  loadProjects();
});

async function loadProjects(url = "./data/projects.json") {
  const container = document.getElementById("projects-list");
  const status = document.getElementById("projects-status");
  if (!container || !status) return;
  status.hidden = false;
  status.textContent = "프로젝트 목록을 불러오는 중입니다.";

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Project request failed: ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.projects)) throw new Error("Expected a projects array.");
    renderProjects(data.projects.filter(p => p.group !== "additional"), container);
    renderAdditionalExperience(data.projects.filter(p => p.group === "additional"));
    renderEvidence(data.projects);
    status.hidden = container.childElementCount > 0;
    status.textContent = "프로젝트 사례를 준비 중입니다.";
  } catch (error) {
    container.replaceChildren();
    status.hidden = false;
    status.textContent = window.location.protocol === "file:"
      ? "파일을 직접 열면 프로젝트 데이터를 불러올 수 없습니다. 로컬 웹 서버 또는 배포된 사이트 주소로 열어 주세요."
      : "프로젝트 목록을 불러오지 못했습니다. 새로고침 후에도 계속되면 배포 파일과 데이터 경로를 확인해 주세요.";
    console.error("Unable to load projects:", error);
  }
}

function renderEvidence(projects) {
  document.querySelectorAll("[data-evidence-for]").forEach(container => {
    const items = projects.flatMap(project => (Array.isArray(project.evidence) ? project.evidence : [])
      .filter(item => item.competency === container.dataset.evidenceFor)
      .map(item => ({ project, label: item.label })));
    if (!items.length) return;
    container.replaceChildren(projectText("p", "evidence-label", "Related Case / 관련 사례"));
    items.forEach(({ project, label }) => {
      const button = projectText("button", "evidence-button", label);
      button.type = "button";
      button.setAttribute("aria-haspopup", "dialog");
      button.setAttribute("aria-controls", "project-dialog");
      button.addEventListener("click", () => openProjectDialog(project, button));
      container.append(button);
    });
  });
}

function renderProjects(projects, container) {
  const fragment = document.createDocumentFragment();
  const ids = new Set();
  [...projects].sort((a, b) => Number(b?.featured === true) - Number(a?.featured === true)).forEach((project) => {
    if (!project || typeof project.title !== "string" || !project.title.trim() ||
        typeof project.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.id) || ids.has(project.id)) return;
    ids.add(project.id);
    fragment.append(createProjectCard(project));
  });
  container.replaceChildren(fragment);
}

function createProjectCard(project) {
  const article = document.createElement("article");
  article.className = "project-card";
  if (project.featured === true) article.classList.add("project-card-featured");
  article.id = `project-${project.id}`;
  article.dataset.projectId = project.id;
  const titleId = `${article.id}-title`;
  article.setAttribute("aria-labelledby", titleId);
  const category = projectText("p", "project-category", project.category);
  if (project.featured === true) category.prepend(projectText("span", "project-featured-label", "Featured Case Study · "));
  const title = projectText("h3", "project-title", project.title);
  title.id = titleId;
  if (project.thesis && project.subtitle) title.append(projectText("span", "title-ko", project.subtitle));
  if (project.titleEn) title.append(projectText("span", "term-en", project.titleEn));
  const role = document.createElement("p");
  role.className = "project-role";
  role.append(projectText("span", "project-label", "Role / 역할"), document.createTextNode(project.role || "역할 정보 준비 중"));
  const summary = projectText("p", "project-summary", project.summary);
  const skillsLabel = projectText("p", "project-label", "Key Skills / 핵심 역량");
  const skills = document.createElement("ul");
  skills.className = "project-skills";
  skills.setAttribute("aria-label", "핵심 역량");
  skills.setAttribute("role", "list");
  (Array.isArray(project.skills) ? project.skills : []).forEach((skill) => {
    if (typeof skill === "string" && skill.trim()) skills.append(projectText("li", "", skill));
  });

  const button = projectText("button", "project-case-button", "View Case Study");
  button.type = "button";
  button.setAttribute("aria-label", `${project.title} — View Case Study`);
  button.setAttribute("aria-haspopup", "dialog");
  button.setAttribute("aria-controls", "project-dialog");
  button.addEventListener("click", () => {
    openProjectDialog(project, button);
  });
  const hero = createHeroImage(project.heroImage);
  if (hero) article.append(hero);
  article.append(category, title);
  if (project.period) article.append(projectText("p", "project-period", project.period));
  if (project.role) {
    if (project.roleEn) role.append(projectText("span", "term-en", project.roleEn));
    article.append(role);
  }
  if (project.recognition) article.append(createRecognition(project));
  article.append(summary);
  if (skills.childElementCount) article.append(skillsLabel, skills);
  if (project.featured && project.results?.length) {
    article.append(createResultHeading(project), projectText("p", "card-result-scope", project.resultScope), createMetrics(project.results));
    if (project.resultNote) article.append(projectText("p", "result-note", project.resultNote));
  }
  article.append(button);
  return article;
}

let projectDialog;
let dialogTrigger;
let savedScrollY = 0;
let savedBodyStyle = null;

function getProjectDialog() {
  if (projectDialog) return projectDialog;
  const dialog = document.createElement("dialog");
  dialog.id = "project-dialog";
  dialog.className = "project-dialog";
  dialog.setAttribute("aria-labelledby", "project-dialog-title");
  const shell = document.createElement("div");
  shell.className = "modal-shell";
  const toolbar = document.createElement("div");
  toolbar.className = "modal-toolbar";
  toolbar.append(projectText("span", "eyebrow", "Case Study"));
  const close = projectText("button", "modal-close", "Close ×");
  close.type = "button";
  close.setAttribute("aria-label", "Close × — 상세 사례 닫기");
  close.addEventListener("click", () => dialog.close());
  toolbar.append(close);
  const content = document.createElement("div");
  content.className = "modal-content";
  shell.append(toolbar, content);
  dialog.append(shell);
  document.body.append(dialog);

  // Native modal dialogs make the rest of the page inert, including on Escape.
  let startedOutside = false;
  const outside = (event) => {
    const rect = dialog.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  };
  dialog.addEventListener("pointerdown", event => { startedOutside = event.target === dialog && outside(event); });
  dialog.addEventListener("click", event => {
    if (startedOutside && event.target === dialog && outside(event)) dialog.close();
    startedOutside = false;
  });
  dialog.addEventListener("keydown", event => {
    if (event.key !== "Tab") return;
    const controls = [...dialog.querySelectorAll('button:not([disabled]), a[href], [tabindex="0"]')].filter(element => element.getClientRects().length);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (!controls.includes(document.activeElement) || (event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last)) {
      event.preventDefault();
      (event.shiftKey ? last : first)?.focus();
    }
  });
  dialog.addEventListener("close", () => {
    if (savedBodyStyle === null) document.body.removeAttribute("style");
    else document.body.setAttribute("style", savedBodyStyle);
    window.scrollTo({ top: savedScrollY, behavior: "instant" });
    if (dialogTrigger?.isConnected) dialogTrigger.focus({ preventScroll: true });
    content.replaceChildren();
  });
  projectDialog = dialog;
  return dialog;
}

function openProjectDialog(project, trigger) {
  const dialog = getProjectDialog();
  if (dialog.open) return;
  const content = dialog.querySelector(".modal-content");
  const header = document.createElement("header");
  header.className = "modal-project-header";
  const title = projectText("h2", "modal-title", project.title);
  title.id = "project-dialog-title";
  title.tabIndex = -1;
  if (project.thesis && project.subtitle) title.append(projectText("span", "title-ko", project.subtitle));
  if (project.titleEn) title.append(projectText("span", "term-en", project.titleEn));
  header.append(projectText("p", "project-category", project.category), title);
  const hero = createHeroImage(project.heroImage);
  if (hero) header.append(hero);
  content.replaceChildren(header, createCaseStudy(project));
  dialogTrigger = trigger;
  savedScrollY = window.scrollY;
  savedBodyStyle = document.body.getAttribute("style");
  // Fixed positioning also prevents background touch scrolling on mobile.
  Object.assign(document.body.style, { position: "fixed", top: `-${savedScrollY}px`, width: "100%", overflow: "hidden" });
  dialog.showModal();
  content.scrollTop = 0;
  title.focus({ preventScroll: true });
}

function createCaseStudy(project) {
  const panel = document.createElement("div");
  panel.className = "project-case-preview case-study";
  const compactResearch = Boolean(project.researchTitle);
  const roleFocused = Boolean(project.thesis || compactResearch);

  const addSection = (key, heading, subtitle, koreanFirst = true) => {
    const section = document.createElement("section");
    section.className = "case-section";
    const title = projectText("h3", "case-heading", heading);
    title.id = `project-${project.id}-${key}`;
    const subtitles = { overview: "개요", context: "활동 배경", role: "나의 역할", action: "담당 업무·실행", methods: "분석 방법", result: "결과", lessons: "배운 점", transferable: "YP 실무 기여", gallery: "활동 이미지", process: "연구 과정", questions: "연구 질문", methodology: "연구 방법", components: "분석에서 도출한 구성요소", findings: "핵심 결과", research: "대표 연구" };
    const korean = subtitle || subtitles[key] || "";
    if (koreanFirst) {
      const english = projectText("span", "term-en", heading);
      english.lang = "en";
      title.replaceChildren(projectText("span", "", korean), english);
    } else {
      title.replaceChildren(projectText("span", "", heading), projectText("span", "title-ko", korean));
      title.firstElementChild.lang = "en";
    }
    section.setAttribute("aria-labelledby", title.id);
    section.append(title);
    panel.append(section);
    return section;
  };
  const overview = project.thesis
    ? addSection("overview", "Overview", "연구 개요", true)
    : compactResearch ? addSection("overview", "Overview", "프로젝트 개요", true) : addSection("overview", "Overview", "기본 정보");
  const facts = document.createElement("dl");
  facts.className = "case-facts";
  [["Location / 장소", project.location], [project.thesis ? "Recognition Date / 선정 시기" : "Period / 기간", project.period], ["Role / 역할", roleFocused ? "" : project.role]].forEach(([label, value]) => {
    if (typeof value !== "string" || !value.trim()) return;
    const row = document.createElement("div");
    row.append(projectText("dt", "project-label", label), projectText("dd", "", value));
    if (label === "Role / 역할" && project.roleEn) {
      const englishRole = projectText("span", "term-en", project.roleEn);
      englishRole.lang = "en";
      row.lastElementChild.append(englishRole);
    }
    facts.append(row);
  });
  if (facts.childElementCount) overview.append(facts);
  if (compactResearch) overview.append(projectText("p", "case-subheading", project.researchTitle));
  const overviewText = project.overview || project.summary;
  if (overviewText) overview.append(projectText("p", "", overviewText));
  if (project.recognition) overview.append(createRecognition(project));
  if (!facts.childElementCount && !overviewText) overview.remove();
  else if (project.group === "additional" && !overviewText) {
    // Short experiences need only compact facts, not a separate empty overview section.
    panel.append(facts);
    overview.remove();
  }

  if (project.context || project.challenge) {
    const context = addSection("context", "CONTEXT");
    if (project.context) context.append(projectText("p", "", project.context));
    if (project.challenge) {
      context.append(projectText("h4", "case-subheading", "CHALLENGE"), projectText("p", "", project.challenge));
    }
  }

  if (roleFocused && project.role) {
    const role = addSection("role", "My Role", "담당 역할");
    role.append(projectText("p", "", project.role));
    if (project.roleEn) role.append(projectText("p", "term-en", project.roleEn));
    if (roleFocused && project.responsibilities?.length) role.append(projectList(project.responsibilities));
  }
  if (project.process?.length) addSection("process", "PROCESS").append(projectList(project.process, "research-process"));
  if (project.thesis) {
    const thesis = project.thesis;
    if (thesis.questions?.length) addSection("questions", "RESEARCH QUESTIONS").append(projectList(thesis.questions));
    if (thesis.process?.length) {
      const flow = document.createElement("ol");
      flow.className = "thesis-process";
      thesis.process.forEach(step => {
        const item = document.createElement("li");
        const english = projectText("span", "", step.en); english.lang = "en";
        item.append(english, projectText("span", "title-ko", step.ko)); flow.append(item);
      });
      addSection("process", "RESEARCH PROCESS").append(flow);
    }
    if (thesis.method?.length) addSection("methodology", "METHOD").append(projectList(thesis.method));
    if (thesis.components?.length) addSection("components", "ANALYSIS COMPONENTS").append(projectList(thesis.components));
    if (thesis.findings?.length) {
      const findings = addSection("findings", "Key Findings", "연구 결과", true);
      if (thesis.scope) findings.append(projectText("p", "case-result-scope", thesis.scope));
      findings.append(projectList(thesis.findings));
    }
  }
  if (!roleFocused && (project.responsibilities?.length || project.actions?.length || project.actionStructure?.length)) {
    const action = addSection("action", project.actionTitle || "Key Activities", project.actionTitleKo || "주요 활동");
    if (project.responsibilities?.length) action.append(projectList(project.responsibilities));
    if (project.actions?.length) action.append(projectList(project.actions));
    if (project.actionStructure?.length) action.append(projectList(project.actionStructure, "case-structure"));
  }

  if (project.methods?.items?.length) {
    const methods = addSection(compactResearch ? "analysis" : "methods", project.methods.title || "METHODS", project.methods.titleKo, compactResearch);
    if (project.methods.tool) methods.append(projectText("p", "", `Tool: ${project.methods.tool}`));
    if (compactResearch) methods.append(projectText("p", "project-label", "Analysis"));
    methods.append(projectList(project.methods.items));
  }

  const metrics = createMetrics(project.results);
  if (metrics.childElementCount) {
    const result = addSection("result", project.resultsTitle || "RESULT", project.resultsTitleKo);
    if (project.resultNote) result.append(projectText("p", "result-note", project.resultNote));
    if (project.resultScope) result.append(projectText("p", "case-result-scope", project.resultScope));
    result.append(metrics);
  }
  if (project.lessons) addSection("lessons", "Learning").append(projectText("p", "", project.lessons));
  if (project.contribution || project.transferable?.length) {
    const contribution = addSection("transferable", "Transferable Skills", "활용 가능한 역량");
    if (project.contribution) contribution.append(projectText("p", "", project.contribution));
    if (project.transferable?.length) {
      contribution.append(projectList(project.transferable, "case-transferable"));
    }
  }
  const gallery = createProjectGallery(project.images, project.title);
  if (gallery) {
    const section = addSection("gallery", "Gallery");
    section.hidden = true;
    section.append(gallery);
  }
  return panel;
}

function createMetrics(results) {
  const metrics = document.createElement("dl");
  metrics.className = "case-metrics";
  (Array.isArray(results) ? results : []).forEach(metric => {
    if (!metric || typeof metric.value !== "string" || typeof metric.label !== "string") return;
    const item = document.createElement("div");
    const label = projectText("dt", "metric-label", metric.label);
    if (metric.labelKo) {
      label.textContent = metric.labelKo;
      const english = projectText("span", "term-en", metric.label);
      english.lang = "en";
      label.append(english);
    } else label.lang = "en";
    item.append(label, projectText("dd", "metric-value", metric.value));
    if (metric.detail) item.append(projectText("dd", "metric-detail", metric.detail));
    metrics.append(item);
  });
  return metrics;
}

function createProjectGallery(images, projectTitle = "프로젝트") {
  const entries = (Array.isArray(images) ? images : [])
    .map(item => item && ({ ...item, alt: typeof item.alt === "string" && item.alt.trim() ? item.alt : `${projectTitle} 활동 사진·자료` }))
    .filter(validProjectImage)
    .sort((a, b) => {
      const filename = item => new URL(item.src, document.baseURI).pathname.split("/").pop();
      return filename(a).localeCompare(filename(b), undefined, { numeric: true, sensitivity: "base" });
    });
  if (!entries.length) return null;
  const gallery = document.createElement("div");
  gallery.className = "case-gallery";
  gallery.hidden = true;
  gallery.setAttribute("role", "region");
  gallery.setAttribute("aria-label", `${projectTitle} 사진·자료`);
  gallery.setAttribute("aria-roledescription", "이미지 갤러리");
  const viewport = document.createElement("div");
  viewport.className = "gallery-viewport";
  const controls = document.createElement("div");
  controls.className = "gallery-controls";
  const previous = projectText("button", "gallery-button", "←");
  const next = projectText("button", "gallery-button", "→");
  previous.type = next.type = "button";
  previous.setAttribute("aria-label", "이전 사진");
  next.setAttribute("aria-label", "다음 사진");
  const counter = projectText("p", "gallery-counter", "");
  counter.setAttribute("role", "status");
  counter.setAttribute("aria-live", "polite");
  counter.setAttribute("aria-atomic", "true");
  controls.append(previous, counter, next);
  gallery.append(viewport, controls);
  let current = 0;
  const slides = entries.map(item => {
    const figure = document.createElement("figure");
    figure.className = "gallery-image";
    figure.hidden = true;
    figure.setAttribute("role", "group");
    figure.setAttribute("aria-roledescription", "슬라이드");
    const frame = document.createElement("div");
    frame.className = "gallery-frame";
    const img = document.createElement("img");
    img.alt = item.alt;
    img.decoding = "async";
    const slide = { item, figure, img };
    img.addEventListener("load", () => {
      gallery.hidden = false;
      const section = gallery.closest(".case-section");
      if (section) section.hidden = false;
    }, { once: true });
    img.addEventListener("error", () => {
      failedProjectImages.add(new URL(item.src, document.baseURI).href);
      const failedIndex = slides.indexOf(slide);
      if (failedIndex < 0) return;
      slides.splice(failedIndex, 1);
      figure.remove();
      if (!slides.length) {
        if (gallery.contains(document.activeElement)) focusGalleryFallback();
        const section = gallery.closest(".case-section");
        if (section) section.remove();
        else gallery.remove();
        return;
      }
      if (failedIndex < current) current -= 1;
      show(current % slides.length);
    }, { once: true });
    frame.append(img);
    figure.append(frame);
    if (typeof item.caption === "string" && item.caption.trim()) figure.append(projectText("figcaption", "", item.caption));
    viewport.append(figure);
    return slide;
  });
  function focusGalleryFallback() {
    const target = gallery.closest("dialog")?.querySelector(".modal-title") || gallery.closest("article");
    if (target) {
      if (!target.hasAttribute("tabindex")) target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
  }
  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, position) => {
      slide.figure.hidden = position !== current;
      slide.figure.setAttribute("aria-label", `${position + 1} / ${slides.length}`);
    });
    const singleImage = slides.length < 2;
    if (singleImage && controls.contains(document.activeElement)) focusGalleryFallback();
    controls.hidden = singleImage;
    counter.textContent = `${current + 1} / ${slides.length}`;
    const active = slides[current];
    // Load a slide only when requested; keep successfully loaded slides for revisits.
    if (!active.img.hasAttribute("src")) active.img.src = active.item.src;
  }
  previous.addEventListener("click", () => show(current - 1));
  next.addEventListener("click", () => show(current + 1));
  show(0);
  return gallery;
}

function projectList(items, className = "case-list") {
  const list = document.createElement("ul");
  list.className = className;
  list.setAttribute("role", "list");
  (Array.isArray(items) ? items : []).forEach((item) => {
    if (typeof item === "string" && item.trim()) list.append(projectText("li", "", item));
  });
  return list;
}

function projectText(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = typeof text === "string" ? text : "";
  return element;
}

function validProjectImage(item) {
  if (!item || typeof item.src !== "string" || !item.src.trim() || typeof item.alt !== "string" || !item.alt.trim()) return false;
  try { const url = new URL(item.src, document.baseURI); return ["http:", "https:"].includes(url.protocol) && url.origin === location.origin && !failedProjectImages.has(url.href); } catch { return false; }
}
function createHeroImage(item) {
  if (!validProjectImage(item)) return null;
  const figure = document.createElement("figure"); figure.className = "project-hero-image";
  const img = document.createElement("img"); img.src = item.src; img.alt = item.alt; img.loading = "lazy"; img.decoding = "async";
  img.addEventListener("error", () => {
    failedProjectImages.add(new URL(item.src, document.baseURI).href);
    figure.remove();
  }, { once: true }); figure.append(img);
  if (item.caption) figure.append(projectText("figcaption", "", item.caption));
  return figure;
}
function createResultHeading(project) {
  const heading = projectText("p", "digital-results-heading", project.resultsTitle || "Results");
  if (project.resultsTitleKo) heading.append(projectText("span", "title-ko", project.resultsTitleKo));
  return heading;
}
function renderAdditionalExperience(projects) {
  const container = document.getElementById("additional-list");
  const region = document.getElementById("additional-experience");
  if (!container || !region) return;
  container.replaceChildren();
  projects.forEach(project => {
    const article = document.createElement("article"); article.className = "additional-item"; article.id = "project-" + project.id;
    const title = projectText("h4", "", project.title);
    if (project.titleEn) title.append(projectText("span", "term-en", project.titleEn));
    article.append(title);
    if (project.period) article.append(projectText("p", "project-period", project.period));
    const hero = createHeroImage(project.heroImage); if (hero) article.append(hero);
    if (project.summary) article.append(projectText("p", "", project.summary));
    if (project.responsibilities?.length) article.append(projectList(project.responsibilities));
    const gallery = createProjectGallery(project.images, project.title); if (gallery) article.append(gallery);
    const button = projectText("button", "additional-case-button", "View Case Study");
    button.type = "button";
    button.setAttribute("aria-label", `${project.title} — View Case Study`);
    button.setAttribute("aria-haspopup", "dialog");
    button.setAttribute("aria-controls", "project-dialog");
    button.addEventListener("click", () => openProjectDialog(project, button));
    article.append(button);
    container.append(article);
  });
  region.hidden = !container.childElementCount;
}

function createRecognition(project) {
  const note = projectText("p", "project-recognition", project.recognition);
  if (project.recognitionEn) {
    const english = projectText("span", "term-en", project.recognitionEn); english.lang = "en"; note.append(english);
  }
  return note;
}
