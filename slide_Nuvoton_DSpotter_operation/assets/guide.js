(function () {
  "use strict";
  var viewer = document.getElementById("image-viewer");
  var full = document.getElementById("image-full");
  var caption = document.getElementById("image-caption");
  var original = document.getElementById("image-original");
  var opener = null;

  // Image anchors remain usable when the dialog API is unavailable.
  window.addEventListener("guide:ready", function () {
    document.querySelectorAll("#content a > img").forEach(function (image) {
      var link = image.parentElement;
      link.classList.add("image-link");
      link.setAttribute("aria-label", "放大圖片：" + image.alt);
      if (typeof viewer.showModal !== "function") return;
      link.setAttribute("aria-haspopup", "dialog");
      link.addEventListener("click", function (event) {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        opener = link;
        full.src = image.src;
        full.alt = image.alt;
        caption.textContent = image.alt;
        original.href = image.src;
        viewer.showModal();
      });
    });
  });
  document.getElementById("image-close").addEventListener("click", function () { viewer.close(); });
  viewer.addEventListener("click", function (event) {
    if (event.target !== viewer) return;
    var rect = viewer.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) viewer.close();
  });
  viewer.addEventListener("close", function () { if (opener) opener.focus(); });
}());
