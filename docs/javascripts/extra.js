/* 다이어그램 클릭 확대 (스크롤 줌 + 드래그 이동) */
/* Mermaid 렌더링은 MkDocs Material 번들이 자체 처리 — 여기서는 줌만 담당 */
(function () {
  "use strict";

  /* ── 다이어그램 클릭 확대 (이벤트 위임) ── */
  document.addEventListener("click", function (e) {
    if (e.target.closest(".diagram-overlay")) return;

    var svg = e.target.closest("svg");
    if (!svg) return;

    /* mermaid가 렌더한 SVG인지 판별 */
    var isDiagram =
      svg.closest("pre.mermaid") ||
      svg.closest("div.mermaid") ||
      svg.closest(".mermaid") ||
      svg.closest("[data-processed]") ||
      (svg.id && /^mermaid/i.test(svg.id)) ||
      svg.getAttribute("aria-roledescription") ||
      (svg.querySelector(".clusters") && svg.querySelector(".edgePaths"));

    if (!isDiagram) return;

    e.preventDefault();
    e.stopPropagation();
    openOverlay(svg);
  });

  /* ── 오버레이 (스크롤 줌 + 드래그 이동) ── */
  function openOverlay(svg) {
    var overlay = document.createElement("div");
    overlay.className = "diagram-overlay";

    var hint = document.createElement("span");
    hint.className = "close-hint";
    hint.textContent = "스크롤: 확대/축소 · ESC 또는 바깥 클릭: 닫기";

    var content = document.createElement("div");
    content.className = "diagram-content";

    var cloned = svg.cloneNode(true);
    cloned.removeAttribute("width");
    cloned.removeAttribute("height");
    cloned.removeAttribute("style");
    cloned.style.transformOrigin = "center center";
    content.appendChild(cloned);

    overlay.appendChild(hint);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    requestAnimationFrame(function () {
      overlay.classList.add("active");
    });

    /* 줌 상태 */
    var scale = 1;
    var MIN = 0.3;
    var MAX = 5;
    var tx = 0;
    var ty = 0;
    var dragging = false;
    var sx, sy, ltx, lty;

    function apply() {
      cloned.style.transform =
        "translate(" + tx + "px," + ty + "px) scale(" + scale + ")";
    }

    /* 스크롤 줌 */
    overlay.addEventListener(
      "wheel",
      function (e) {
        e.preventDefault();
        var d = e.deltaY > 0 ? -0.15 : 0.15;
        var ns = Math.min(MAX, Math.max(MIN, scale + d * scale));
        var r = cloned.getBoundingClientRect();
        var cx = e.clientX - r.left - r.width / 2;
        var cy = e.clientY - r.top - r.height / 2;
        var f = ns / scale;
        tx -= cx * (f - 1);
        ty -= cy * (f - 1);
        scale = ns;
        apply();
      },
      { passive: false }
    );

    /* 드래그 이동 */
    content.addEventListener("mousedown", function (e) {
      if (scale <= 1) return;
      dragging = true;
      sx = e.clientX;
      sy = e.clientY;
      ltx = tx;
      lty = ty;
      content.style.cursor = "grabbing";
      e.preventDefault();
    });

    function onMove(e) {
      if (!dragging) return;
      tx = ltx + (e.clientX - sx);
      ty = lty + (e.clientY - sy);
      apply();
    }
    function onUp() {
      if (!dragging) return;
      dragging = false;
      content.style.cursor = scale > 1 ? "grab" : "";
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);

    /* 닫기: 바깥 클릭 */
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });

    /* 닫기: ESC */
    function onKey(e) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);

    function close() {
      overlay.classList.remove("active");
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      setTimeout(function () {
        overlay.remove();
      }, 200);
    }
  }
})();
