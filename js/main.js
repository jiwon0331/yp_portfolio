"use strict";

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initSmoothScroll();
  initNavigation();
});

function initMobileMenu() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("primary-navigation");
  const desktop = window.matchMedia("(min-width: 960px)");
  const setOpen = (open, returnFocus = false) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Menu — 주요 메뉴 닫기" : "Menu — 주요 메뉴 열기");
    toggle.querySelector("span").textContent = open ? "−" : "+";
    nav.dataset.open = String(open);
    nav.hidden = !desktop.matches && !open;
    if (returnFocus) toggle.focus();
  };
  const sync = () => {
    const focusWasInside = nav.contains(document.activeElement);
    toggle.hidden = desktop.matches;
    setOpen(false, !desktop.matches && focusWasInside);
  };
  sync();
  desktop.addEventListener("change", sync);
  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", event => {
    if (!desktop.matches && event.target.closest("a")) setOpen(false);
  }, true);
  header.addEventListener("keydown", event => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      event.preventDefault();
      setOpen(false, true);
    }
  });
  document.addEventListener("pointerdown", event => {
    if (!header.contains(event.target) && toggle.getAttribute("aria-expanded") === "true") setOpen(false, nav.contains(document.activeElement));
  });
  header.addEventListener("focusout", event => {
    if (event.relatedTarget && !header.contains(event.relatedTarget)) setOpen(false);
  });
}

function initSmoothScroll() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href");
      if (!hash || hash === "#" || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const target = document.getElementById(hash.slice(1));
      if (!target) return;

      event.preventDefault();
      if (window.location.hash !== hash) history.pushState(null, "", hash);
      target.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "start" });
      // Keep keyboard and screen reader focus aligned with the destination.
      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
        target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
      }
      target.focus({ preventScroll: true });
      setActiveNav(hash);
    });
  });
}

function initNavigation() {
  const header = document.querySelector(".site-header");
  const sections = [...document.querySelectorAll("main > section[id]")];
  const groups = {
    hero: "hero", "quick-profile": "hero", competencies: "hero", journey: "journey",
    "featured-projects": "featured-projects", skills: "skills", learning: "learning", about: "about", contact: "contact"
  };
  let scheduled = false;
  const update = () => {
    scheduled = false;
    if (document.querySelector("dialog[open]")) return;
    const threshold = header.getBoundingClientRect().height + 32;
    let current = sections[0];
    sections.forEach(section => { if (section.getBoundingClientRect().top <= threshold) current = section; });
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) current = sections[sections.length - 1];
    setActiveNav(`#${groups[current.id]}`);
  };
  const schedule = () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  };
  new ResizeObserver(() => {
    document.documentElement.style.setProperty("--anchor-offset", `${header.getBoundingClientRect().height + 16}px`);
    schedule();
  }).observe(header);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  window.addEventListener("hashchange", schedule);
  window.addEventListener("popstate", schedule);
  schedule();
}

function setActiveNav(hash) {
  document.querySelectorAll("[data-nav-link]").forEach((link) => {
    if (link.getAttribute("href") === hash) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

