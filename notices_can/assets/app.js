(function () {
  "use strict";

  // Canonical runtime; deployed copies are checked by sync_web_runtime.mjs.
  window.webGuideRuntime = "2.0";

  var content = document.getElementById("content");
  var toc = document.getElementById("toc");
  var sidebarButton = document.getElementById("sidebar-toc-btn");
  var backToTop = document.getElementById("back-to-top");
  var markdownSource = document.body.getAttribute("data-markdown") || "index.md";
  var headingLinks = new Map();
  var sectionFrame = 0;
  var activeHeading;
  var imageSizes = document.getElementById("guide-image-sizes");
  imageSizes = imageSizes ? JSON.parse(imageSizes.textContent) : {};
  var navigationHash = location.hash;

  function showError(message) {
    var notice = document.createElement("p");
    notice.className = "render-error";
    notice.appendChild(document.createTextNode(message + "。原稿："));
    var link = document.createElement("a");
    link.href = markdownSource;
    link.textContent = markdownSource;
    notice.appendChild(link);
    var retry = document.createElement("button");
    retry.type = "button";
    retry.textContent = "重新載入";
    retry.addEventListener("click", function () { location.reload(); });
    notice.appendChild(retry);
    content.replaceChildren(notice);
  }

  function prepareNavigation() {
    var home = document.createElement("a");
    home.href = "/";
    home.className = "knowledge-home";
    home.textContent = "知識庫總索引";
    document.getElementById("sidebar").prepend(home);
    var guide = window.webGuideNavigation;
    if (guide) {
      var chapters = document.createElement("nav");
      chapters.className = "guide-chapters";
      chapters.setAttribute("aria-label", "指南章節");
      Object.keys(guide).forEach(function (page) {
        var link = document.createElement("a");
        link.href = page + ".html";
        link.textContent = guide[page].title;
        if (new URL(link.href).pathname === location.pathname ||
            (page === "index" && location.pathname.endsWith("/"))) {
          link.setAttribute("aria-current", "page");
        }
        chapters.appendChild(link);
      });
      toc.before(chapters);
    }
    var siteNav = document.getElementById("site-nav");
    if (siteNav) {
      document.body.classList.add("has-site-header");
      var header = document.querySelector(".site-header");
      function sizeHeader() { document.body.style.setProperty("--header-height", header.offsetHeight + "px"); }
      sizeHeader();
      if (window.ResizeObserver) { new ResizeObserver(sizeHeader).observe(header); }
      var base = /\/(roles|layers|iso|services|bootloader|implementation|references)\/(?:index\.html)?$/.test(location.pathname) ? "../" : "./";
      [["概述", ""], ["角色", "roles/"], ["分層", "layers/"], ["ISO", "iso/"],
        ["Services", "services/"], ["Bootloader", "bootloader/"],
        ["實作與測試", "implementation/"], ["來源", "references/"]].forEach(function (page) {
        var link = document.createElement("a");
        link.href = base + page[1];
        link.textContent = page[0];
        if (new URL(link.href).pathname.replace(/index\.html$/, "") === location.pathname.replace(/index\.html$/, "")) { link.className = "active"; }
        siteNav.appendChild(link);
      });
      sizeHeader();
    }
  }

  function prepareImages() {
    var viewer = document.getElementById("image-viewer");
    if (!viewer) {
      viewer = document.createElement("dialog");
      viewer.id = "image-viewer";
      viewer.setAttribute("aria-label", "圖片原尺寸檢視");
      viewer.innerHTML = '<header><span id="image-caption"></span><a id="image-original" target="_blank" rel="noopener">開啟原圖</a><button id="image-close" type="button">關閉 ×</button></header><div class="image-canvas"><img id="image-full" alt=""></div>';
      document.body.appendChild(viewer);
    }
    var opener;
    document.getElementById("image-close").addEventListener("click", function () { viewer.close(); });
    viewer.addEventListener("close", function () { if (opener) { opener.focus(); } });
    content.querySelectorAll("img").forEach(function (img) {
      img.decoding = "async";
      var link = img.closest("a");
      if (!link) {
        link = document.createElement("a");
        link.href = img.src;
        img.replaceWith(link);
        link.appendChild(img);
      }
      // Preserve links that lead to pages rather than the image itself.
      if (link.href !== img.src) { return; }
      link.classList.add("image-link");
      link.setAttribute("aria-label", "放大圖片：" + img.alt);
      if (typeof viewer.showModal !== "function") { return; }
      link.setAttribute("aria-haspopup", "dialog");
      link.addEventListener("click", function (event) {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) { return; }
        event.preventDefault();
        opener = link;
        var full = document.getElementById("image-full");
        full.src = img.src;
        full.alt = img.alt;
        document.getElementById("image-caption").textContent = img.alt;
        document.getElementById("image-original").href = img.src;
        viewer.showModal();
      });
    });
  }

  function slugify(text, index) {
    var slug = text.trim().toLowerCase()
      .replace(/[`~!@#$%^&*()+=\[\]{}\\|;:'",.<>/?，。；：「」『』（）]/g, "")
      .replace(/\s+/g, "-");
    return slug || "section-" + index;
  }

  function prepareHeadings() {
    var used = Object.create(null);
    // Allocate existing heading IDs first, so new deep links cannot rename them.
    var headings = Array.from(content.querySelectorAll("h1, h2, h3"))
      .concat(Array.from(content.querySelectorAll("h4")));
    headings.forEach(function (heading, index) {
      var previous = heading.previousElementSibling;
      var manualAnchor = previous && previous.tagName === "A" && previous.id ? previous : null;
      var anchorContainer = null;
      if (!manualAnchor && previous && previous.tagName === "P" && !previous.textContent.trim() && previous.children.length === 1) {
        manualAnchor = previous.firstElementChild.tagName === "A" && previous.firstElementChild.id ? previous.firstElementChild : null;
        anchorContainer = manualAnchor ? previous : null;
      }
      var preferred = manualAnchor ? manualAnchor.id : slugify(heading.textContent, index);
      if (manualAnchor) { manualAnchor.removeAttribute("id"); }
      if (anchorContainer) { anchorContainer.remove(); }
      var id = preferred;
      var suffix = 2;
      while (used[id] || document.getElementById(id)) {
        id = preferred + "-" + suffix++;
      }
      used[id] = true;
      if (!heading.id) { heading.id = id; }
    });
  }

  function buildToc() {
    var fragment = document.createDocumentFragment();
    var pageTitle = content.querySelector("h1");
    var group = null;
    var groupHeading = null;
    headingLinks.clear();
    content.querySelectorAll("h1, h2, h3, h4").forEach(function (heading) {
      if (heading === pageTitle) { return; }
      var link = document.createElement("a");
      link.href = "#" + heading.id;
      link.textContent = heading.textContent;
      link.className = "toc-" + heading.tagName.toLowerCase();
      headingLinks.set(heading, link);
      if (heading.tagName === "H4") {
        if (!group) {
          group = document.createElement("details");
          var summary = document.createElement("summary");
          summary.textContent = "段落";
          group.appendChild(summary);
          if (groupHeading) {
            // Keep the section link independent from the native disclosure toggle.
            groupHeading.parentNode.replaceChild(group, groupHeading);
            summary.textContent = "";
            summary.appendChild(groupHeading);
          } else { fragment.appendChild(group); }
        }
        group.appendChild(link);
      } else {
        group = null;
        groupHeading = link;
        fragment.appendChild(link);
      }
    });
    toc.replaceChildren(fragment);
  }

  function namespaceSvgIds(container, index) {
    var svg = container.querySelector("svg");
    if (!svg) { return; }
    var prefix = "canUds" + index + "-";
    var mapping = Array.from(svg.querySelectorAll("[id]")).map(function (element) {
      return { element: element, oldId: element.id, newId: prefix + element.id };
    }).sort(function (left, right) { return right.oldId.length - left.oldId.length; });

    mapping.forEach(function (item) { item.element.id = item.newId; });
    Array.from(svg.querySelectorAll("*")).concat([svg]).forEach(function (element) {
      Array.from(element.attributes).forEach(function (attribute) {
        var value = attribute.value;
        if (attribute.name === "aria-labelledby" || attribute.name === "aria-describedby") {
          value = value.split(/\s+/).map(function (id) {
            var match = mapping.find(function (item) { return item.oldId === id; });
            return match ? match.newId : id;
          }).join(" ");
        }
        mapping.forEach(function (item) {
          var escaped = item.oldId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          value = value.replace(new RegExp("#" + escaped + "(?=[^A-Za-z0-9_.:-]|$)", "g"), "#" + item.newId);
        });
        if (value !== attribute.value) { element.setAttribute(attribute.name, value); }
      });
    });
    svg.querySelectorAll("style").forEach(function (style) {
      var css = style.textContent;
      mapping.forEach(function (item) {
        var escaped = item.oldId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        css = css.replace(new RegExp("#" + escaped + "(?=[^A-Za-z0-9_.:-]|$)", "g"), "#" + item.newId);
      });
      style.textContent = css;
    });
  }

  function getMermaid() {
    if (window.mermaid) { return Promise.resolve(window.mermaid); }
    var script = document.querySelector("script[data-guide-diagrams]");
    if (!script) { return Promise.reject(new Error("流程圖元件未載入")); }
    return new Promise(function (resolve, reject) {
      function finish(error) {
        clearTimeout(timer);
        script.removeEventListener("load", loaded);
        script.removeEventListener("error", failed);
        if (error) { reject(error); } else { resolve(window.mermaid); }
      }
      function loaded() { finish(window.mermaid ? null : new Error("流程圖元件未載入")); }
      function failed() { finish(new Error("流程圖元件載入失敗")); }
      var timer = setTimeout(function () { finish(new Error("流程圖元件載入逾時")); }, 15000);
      script.addEventListener("load", loaded);
      script.addEventListener("error", failed);
    });
  }

  function prepareMermaid() {
    content.querySelectorAll("pre > code.language-mermaid").forEach(function (code) {
      var diagram = document.createElement("div");
      diagram.className = "mermaid";
      diagram.textContent = code.textContent;
      code.parentElement.replaceWith(diagram);
    });
    var diagrams = Array.from(content.querySelectorAll(".mermaid"));
    if (!diagrams.length) { return Promise.resolve(); }
    return getMermaid().then(function (mermaid) {
      mermaid.initialize({ startOnLoad: false, theme: "neutral", securityLevel: "strict", flowchart: { htmlLabels: true, curve: "basis" } });
      return diagrams.reduce(function (chain, diagram, index) {
        return chain.then(function () {
          return mermaid.render("canUdsDiagram" + index, diagram.textContent).then(function (result) {
            diagram.innerHTML = result.svg;
            namespaceSvgIds(diagram, index);
            if (result.bindFunctions) { result.bindFunctions(diagram); }
          });
        }).catch(function (error) {
          console.error("Mermaid render failed", error);
          diagram.classList.add("render-warning");
          diagram.setAttribute("aria-label", "流程圖未完成繪製，保留原始描述");
        });
      }, Promise.resolve());
    }).catch(function (error) {
      diagrams.forEach(function (diagram) {
        diagram.classList.add("render-warning");
        var notice = document.createElement("p");
        notice.textContent = error.message + "，以下保留原始描述。";
        diagram.prepend(notice);
      });
    });
  }

  function observeSections() {
    if (sectionFrame) { return; }
    sectionFrame = requestAnimationFrame(function () {
      sectionFrame = 0;
      var headings = Array.from(headingLinks.keys());
      var selected = headings[0];
      var readingLine = innerHeight * .2;
      headings.some(function (heading) {
        if (heading.getBoundingClientRect().top > readingLine) { return true; }
        selected = heading;
        return false;
      });
      if (scrollY > 0 && scrollY + innerHeight >= document.documentElement.scrollHeight - 2) {
        selected = headings[headings.length - 1];
      }
      if (activeHeading === selected) { return; }
      activeHeading = selected;
      headingLinks.forEach(function (link, heading) {
        var active = heading === selected;
        link.classList.toggle("active", active);
        if (active) { link.setAttribute("aria-current", "location"); }
        else { link.removeAttribute("aria-current"); }
      });
      toc.querySelectorAll("details").forEach(function (group) {
        group.classList.toggle("contains-active", !!group.querySelector("a.active"));
      });
    });
  }

  function scrollToInitialHash() {
    if (!window.location.hash) { return; }
    var id;
    try { id = decodeURIComponent(window.location.hash.slice(1)); }
    catch (error) { id = window.location.hash.slice(1); }
    var target = document.getElementById(id);
    if (target) {
      var link = headingLinks.get(target);
      if (link && link.parentElement.tagName === "DETAILS") { link.parentElement.open = true; }
      var previousBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      target.scrollIntoView({ block: "start" });
      window.requestAnimationFrame(function () {
        document.documentElement.style.scrollBehavior = previousBehavior;
      });
    }
  }

  function toggleSidebar(force) {
    var open = typeof force === "boolean" ? force : !document.body.hasAttribute("html-show-sidebar-toc");
    document.body.toggleAttribute("html-show-sidebar-toc", open);
    sidebarButton.setAttribute("aria-expanded", String(open));
  }

  sidebarButton.addEventListener("click", function () { toggleSidebar(); });
  sidebarButton.textContent = "≡";
  sidebarButton.setAttribute("aria-controls", "sidebar");
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && window.innerWidth <= 760) { toggleSidebar(false); sidebarButton.focus(); }
  });
  document.addEventListener("click", function (event) {
    var link = event.target.closest("#sidebar a");
    if (link && window.innerWidth <= 760 && !event.defaultPrevented && event.button === 0 &&
        !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && !link.target) {
      toggleSidebar(false);
      var destination = new URL(link.href);
      if (destination.pathname === location.pathname && destination.hash) {
        var target;
        try { target = document.getElementById(decodeURIComponent(destination.hash.slice(1))); } catch (error) { return; }
        if (target) {
          target.setAttribute("tabindex", "-1");
          target.addEventListener("blur", function () { target.removeAttribute("tabindex"); }, { once: true });
          target.focus({ preventScroll: true });
        }
      }
    }
    if (window.innerWidth <= 760 && document.body.hasAttribute("html-show-sidebar-toc") &&
        !document.getElementById("sidebar").contains(event.target) && event.target !== sidebarButton) {
      toggleSidebar(false);
    }
  });
  window.addEventListener("scroll", function () {
    backToTop.classList.toggle("visible", window.scrollY > 700);
    observeSections();
  }, { passive: true });
  var desktopSidebar = window.matchMedia("(min-width: 761px)");
  function syncSidebar(event) { toggleSidebar(event.matches); }
  syncSidebar(desktopSidebar);
  if (desktopSidebar.addEventListener) { desktopSidebar.addEventListener("change", syncSidebar); }
  else { desktopSidebar.addListener(syncSidebar); }
  prepareNavigation();
  window.addEventListener("resize", observeSections);
  window.addEventListener("hashchange", function () { navigationHash = location.hash; });
  document.addEventListener("pointerdown", function () { navigationHash = null; });
  document.addEventListener("keydown", function () { navigationHash = null; });
  document.addEventListener("wheel", function () { navigationHash = null; }, { passive: true });

  if (!window.marked) {
    showError("Markdown renderer 載入失敗");
    return;
  }

  var controller = new AbortController();
  var fetchTimer = setTimeout(function () { controller.abort(); }, 15000);
  fetch(markdownSource, { cache: "no-cache", signal: controller.signal })
    .then(function (response) {
      if (!response.ok) { throw new Error("HTTP " + response.status); }
      return response.text();
    })
    .then(function (markdown) {
      // Set loading hints before DOM insertion, so offscreen images stay deferred.
      var template = document.createElement("template");
      template.innerHTML = window.marked.parse(markdown, { gfm: true });
      template.content.querySelectorAll("img").forEach(function (img, index) {
        var size = imageSizes[img.getAttribute("src")];
        if (size) { img.width = size[0]; img.height = size[1]; }
        img.loading = index === 0 ? "eager" : "lazy";
        img.decoding = "async";
      });
      content.replaceChildren(template.content);
      prepareHeadings();
      backToTop.href = "#" + content.querySelector("h1").id;
      buildToc();
      prepareImages();
      clearTimeout(fetchTimer);
      observeSections();
      scrollToInitialHash();
      window.dispatchEvent(new Event("guide:content-ready"));
      return prepareMermaid();
    })
    .then(function () {
      observeSections();
      if (navigationHash === location.hash) { scrollToInitialHash(); }
      window.dispatchEvent(new Event("guide:ready"));
    })
    .catch(function (error) {
      clearTimeout(fetchTimer);
      showError("無法載入知識庫（" + error.message + "）");
    });
}());
