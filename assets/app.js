(function () {
  "use strict";

  var content = document.getElementById("content");
  var toc = document.getElementById("toc");
  var sidebarButton = document.getElementById("sidebar-toc-btn");
  var backToTop = document.getElementById("back-to-top");

  function slugify(text, index) {
    var slug = text.trim().toLowerCase()
      .replace(/[`~!@#$%^&*()+=\[\]{}\\|;:'",.<>/?，。；：「」『』（）]/g, "")
      .replace(/\s+/g, "-");
    return slug || "section-" + index;
  }

  function prepareHeadings() {
    var used = Object.create(null);
    content.querySelectorAll("h1, h2, h3").forEach(function (heading, index) {
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
    content.querySelectorAll("h2, h3").forEach(function (heading) {
      var link = document.createElement("a");
      link.href = "#" + heading.id;
      link.textContent = heading.textContent;
      link.className = "toc-" + heading.tagName.toLowerCase();
      fragment.appendChild(link);
    });
    toc.replaceChildren(fragment);
  }

  function namespaceSvgIds(container, index) {
    var svg = container.querySelector("svg");
    if (!svg) { return; }
    var prefix = "knowledgeMap" + index + "-";
    var mapping = Array.from(svg.querySelectorAll("[id]")).map(function (element) {
      return { element: element, oldId: element.id, newId: prefix + element.id };
    }).sort(function (left, right) { return right.oldId.length - left.oldId.length; });

    mapping.forEach(function (item) { item.element.id = item.newId; });
    Array.from(svg.querySelectorAll("*")).concat([svg]).forEach(function (element) {
      Array.from(element.attributes).forEach(function (attribute) {
        var value = attribute.value;
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

  function prepareMermaid() {
    content.querySelectorAll("pre > code.language-mermaid").forEach(function (code) {
      var diagram = document.createElement("div");
      diagram.className = "mermaid";
      diagram.textContent = code.textContent;
      code.parentElement.replaceWith(diagram);
    });
    if (!window.mermaid) { return Promise.resolve(); }

    window.mermaid.initialize({
      startOnLoad: false,
      theme: "neutral",
      securityLevel: "strict",
      flowchart: { htmlLabels: true, curve: "basis" }
    });
    return Array.from(content.querySelectorAll(".mermaid")).reduce(function (chain, diagram, index) {
      return chain.then(function () {
        return window.mermaid.render("knowledgeDiagram" + index, diagram.textContent).then(function (result) {
          diagram.innerHTML = result.svg;
          namespaceSvgIds(diagram, index);
          if (result.bindFunctions) { result.bindFunctions(diagram); }
        });
      });
    }, Promise.resolve()).catch(function (error) {
      console.error("Mermaid render failed", error);
      content.insertAdjacentHTML("afterbegin", '<p class="render-warning">部分學習地圖無法繪製；所有文字與連結仍可正常閱讀。</p>');
    });
  }

  function observeSections() {
    var links = Array.from(toc.querySelectorAll("a"));
    if (!("IntersectionObserver" in window)) { return; }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        links.forEach(function (link) {
          link.classList.toggle("active", link.hash === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-15% 0px -75% 0px" });
    content.querySelectorAll("h2, h3").forEach(function (heading) { observer.observe(heading); });
  }

  function scrollToInitialHash() {
    if (!window.location.hash) { return; }
    var id;
    try { id = decodeURIComponent(window.location.hash.slice(1)); }
    catch (error) { id = window.location.hash.slice(1); }
    var target = document.getElementById(id);
    if (!target) { return; }
    var previousBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    target.scrollIntoView({ block: "start" });
    window.requestAnimationFrame(function () {
      document.documentElement.style.scrollBehavior = previousBehavior;
    });
  }

  function toggleSidebar(force) {
    var open = typeof force === "boolean" ? force : !document.body.hasAttribute("html-show-sidebar-toc");
    document.body.toggleAttribute("html-show-sidebar-toc", open);
    sidebarButton.setAttribute("aria-expanded", String(open));
  }

  sidebarButton.addEventListener("click", function () { toggleSidebar(); });
  document.addEventListener("click", function (event) {
    if (window.innerWidth <= 760 && document.body.hasAttribute("html-show-sidebar-toc") &&
        !document.getElementById("sidebar").contains(event.target) && event.target !== sidebarButton) {
      toggleSidebar(false);
    }
  });
  window.addEventListener("scroll", function () {
    backToTop.classList.toggle("visible", window.scrollY > 700);
  }, { passive: true });

  if (!window.marked) {
    content.innerHTML = '<p class="render-error">Markdown renderer 載入失敗。請直接閱讀 <a href="README.md">README.md</a>。</p>';
    return;
  }

  fetch("README.md", { cache: "no-cache" })
    .then(function (response) {
      if (!response.ok) { throw new Error("HTTP " + response.status); }
      return response.text();
    })
    .then(function (markdown) {
      content.innerHTML = window.marked.parse(markdown, { gfm: true });
      prepareHeadings();
      buildToc();
      return prepareMermaid();
    })
    .then(function () {
      observeSections();
      scrollToInitialHash();
    })
    .catch(function (error) {
      content.innerHTML = '<p class="render-error">無法載入知識庫（' + error.message + '）。請直接閱讀 <a href="README.md">README.md</a>。</p>';
    });
}());
