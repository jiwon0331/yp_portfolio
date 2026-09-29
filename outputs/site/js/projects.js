"use strict";

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
    renderProjects(data.projects, container);
    renderEvidence(data.projects);
    status.hidden = container.childElementCount > 0;
    status.textContent = "프로젝트 사례를 준비 중입니다.";
  } catch (error) {
    container.replaceChildren();
    status.hidden = false;
    status.textContent = "프로젝트 목록을 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.";
    console.error("Unable to load projects:", error);
  }
}

function renderEvidence(projects) {
  document.querySelectorAll("[data-evidence-for]").forEach(container => {
    const items = projects.flatMap(project => (Array.isArray(project.evidence) ? project.evidence : [])
      .filter(item => item.competency === container.dataset.evidenceFor)
      .map(item => ({ project, label: item.label })));
    if (!items.length) return;
    container.replaceChildren(projectText("p", "evidence-label", "Evidence"));
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
  const role = document.createElement("p");
  role.className = "project-role";
  role.append(projectText("span", "project-label", "Role"), document.createTextNode(project.role || "역할 정보 준비 중"));
  const summary = projectText("p", "project-summary", project.summary);
  const skillsLabel = projectText("p", "project-label", "Key Skills");
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
  article.append(category, title, role, summary, skillsLabel, skills);
  if (project.featured && project.results?.length) {
    article.append(projectText("p", "card-result-scope", project.resultScope), createMetrics(project.results));
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
  header.append(projectText("p", "project-category", project.category), title, projectText("p", "modal-role", project.role));
  content.replaceChildren(header, project.overview ? createCaseStudy(project) : projectText("p", "placeholder", "상세 사례를 준비 중입니다."));
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

  const addSection = (key, heading) => {
    const section = document.createElement("section");
    section.className = "case-section";
    const title = projectText("h3", "case-heading", heading);
    title.id = `project-${project.id}-${key}`;
    title.lang = "en";
    section.setAttribute("aria-labelledby", title.id);
    section.append(title);
    panel.append(section);
    return section;
  };
  const overview = addSection("overview", "OVERVIEW");
  const facts = document.createElement("dl");
  facts.className = "case-facts";
  [["Location", project.location], ["Period", project.period], ["Role", project.role]].forEach(([label, value]) => {
    if (typeof value !== "string" || !value.trim()) return;
    const row = document.createElement("div");
    row.append(projectText("dt", "project-label", label), projectText("dd", "", value));
    facts.append(row);
  });
  overview.append(facts, projectText("p", "", project.overview));

  if (project.context || project.challenge) {
    const context = addSection("context", "CONTEXT");
    if (project.context) context.append(projectText("p", "", project.context));
    if (project.challenge) {
      context.append(projectText("h4", "case-subheading", "CHALLENGE"), projectText("p", "", project.challenge));
    }
  }

  const role = addSection("role", "MY ROLE");
  role.append(projectText("p", "", project.role));
  if (project.responsibilities?.length || project.actions?.length || project.actionStructure?.length) {
    const action = addSection("action", "RESPONSIBILITIES / ACTIONS");
    if (project.responsibilities?.length) action.append(projectList(project.responsibilities));
    if (project.actions?.length) action.append(projectList(project.actions));
    if (project.actionStructure?.length) action.append(projectList(project.actionStructure, "case-structure"));
  }

  if (project.methods?.items?.length) {
    addSection("methods", project.methods.title || "METHODS").append(projectList(project.methods.items));
  }

  const metrics = createMetrics(project.results);
  if (metrics.childElementCount) {
    const result = addSection("result", "RESULT");
    if (project.resultScope) result.append(projectText("p", "case-result-scope", project.resultScope));
    result.append(metrics);
  }
  if (project.lessons) addSection("lessons", "WHAT I LEARNED").append(projectText("p", "", project.lessons));
  if (project.contribution || project.transferable?.length) {
    const contribution = addSection("transferable", "HOW THIS EXPERIENCE CAN CONTRIBUTE");
    if (project.contribution) contribution.append(projectText("p", "", project.contribution));
    if (project.transferable?.length) contribution.append(projectText("h4", "case-subheading", "TRANSFERABLE SKILLS"), projectList(project.transferable, "case-transferable"));
  }
  const gallery = createProjectGallery(project.images);
  if (gallery) addSection("gallery", "GALLERY").append(gallery);
  return panel;
}

function createMetrics(results) {
  const metrics = document.createElement("dl");
  metrics.className = "case-metrics";
  (Array.isArray(results) ? results : []).forEach(metric => {
    if (!metric || typeof metric.value !== "string" || typeof metric.label !== "string") return;
    const item = document.createElement("div");
    const label = projectText("dt", "metric-label", metric.label);
    label.lang = "en";
    item.append(label, projectText("dd", "metric-value", metric.value));
    metrics.append(item);
  });
  return metrics;
}

function createProjectGallery(images) {
  const entries = (Array.isArray(images) ? images : []).filter(item => {
    if (!item || typeof item.src !== "string" || typeof item.alt !== "string" || !item.alt.trim()) return false;
    try {
      const url = new URL(item.src, document.baseURI);
      return ["http:", "https:"].includes(url.protocol) && url.origin === window.location.origin;
    } catch { return false; }
  }).slice(0, 5);
  if (!entries.length) return null;
  const gallery = document.createElement("div");
  gallery.className = "case-gallery";
  entries.forEach((item, index) => {
    const figure = document.createElement("figure");
    figure.className = index === 0 ? "gallery-image gallery-image-primary" : "gallery-image";
    const img = document.createElement("img");
    img.alt = item.alt;
    img.loading = index === 0 ? "eager" : "lazy";
    img.decoding = "async";
    img.src = item.src;
    img.addEventListener("error", () => {
      figure.remove();
      if (!gallery.childElementCount) gallery.closest(".case-section")?.remove();
    }, { once: true });
    figure.append(img);
    if (typeof item.caption === "string" && item.caption.trim()) figure.append(projectText("figcaption", "", item.caption));
    gallery.append(figure);
  });
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
