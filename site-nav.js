"use strict";

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

if (menuToggle && mainNav) {
  const navIcons = {
    "/": {
      color: "#2483ff",
      className: "fa-house",
      path: "M12 3 2.5 11h2v9h6v-6h3v6h6v-9h2L12 3z"
    },
    "/hell-et": {
      color: "#fff200",
      className: "fa-calculator",
      path: "M5 2h14a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm1 3v4h12V5zm1 7v2h2v-2zm4 0v2h2v-2zm4 0v2h2v-2zm-8 4v2h2v-2zm4 0v2h2v-2zm4 0v2h2v-2z"
    },
    "/movzular": {
      color: "#ff253f",
      className: "fa-book-open",
      path: "M3 4a2 2 0 0 1 2-2h5a3 3 0 0 1 2 1 3 3 0 0 1 2-1h5a2 2 0 0 1 2 2v15a1 1 0 0 1-1 1h-6a3 3 0 0 0-2 1 3 3 0 0 0-2-1H4a1 1 0 0 1-1-1zm2 0v13h4a5 5 0 0 1 2 0V5a1 1 0 0 0-1-1zm14 0h-5a1 1 0 0 0-1 1v12a5 5 0 0 1 2 0h4z"
    },
    "/oyunlar": {
      color: "#25d366",
      className: "fa-gamepad",
      path: "M7 6h10a5 5 0 0 1 4.8 3.6l1.1 4.1a3.3 3.3 0 0 1-5.5 3.2l-1.6-1.5H8.2l-1.6 1.5a3.3 3.3 0 0 1-5.5-3.2l1.1-4.1A5 5 0 0 1 7 6zm1 3H6v2H4v2h2v2h2v-2h2v-2H8zm7 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm3 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"
    },
    "/sinaq": {
      color: "#f32ec8",
      className: "fa-clipboard-check",
      path: "M9 2h6a2 2 0 0 1 2 2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2-2zm0 2v2h6V4zm1 12 2 2 4-5-1.5-1.2-2.6 3.2-1-1zM7 9h10v2H7zm0 8h2v2H7z"
    },
    "/haqqimda": {
      color: "#a78bfa",
      className: "fa-user",
      path: "M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5c0-3-4-5.5-9-5.5z"
    },
    "/elaqe": {
      color: "#ff9a50",
      className: "fa-comment-dots",
      path: "M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-8l-6 4v-4H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm3 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm5 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm5 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"
    }
  };
  const svgNamespace = "http://www.w3.org/2000/svg";
  const navList = document.createElement("ul");
  navList.className = "nav-menu";

  mainNav.querySelectorAll("a.nav-link").forEach(link => {
    const route = new URL(link.href, window.location.href).pathname.replace(/\/+$/, "") || "/";
    const iconData = navIcons[route];
    if (!iconData) return;

    const item = document.createElement("li");
    item.style.setProperty("--clr", iconData.color);
    if (link.classList.contains("active")) item.classList.add("active");

    const icon = document.createElement("i");
    icon.className = `fa-solid ${iconData.className}`;
    icon.setAttribute("aria-hidden", "true");
    const svg = document.createElementNS(svgNamespace, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    const path = document.createElementNS(svgNamespace, "path");
    path.setAttribute("d", iconData.path);
    svg.append(path);
    icon.append(svg);

    const label = document.createElement("span");
    label.textContent = link.textContent.trim();
    link.replaceChildren(icon, label);
    item.append(link);
    navList.append(item);
  });

  mainNav.replaceChildren(navList);

  function closeMenu() {
    menuToggle.setAttribute("aria-expanded", "false");
    mainNav.classList.remove("open");
  }

  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(isExpanded));
    mainNav.classList.toggle("open", isExpanded);
  });

  mainNav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });
}
