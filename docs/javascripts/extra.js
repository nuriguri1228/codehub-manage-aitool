/* Mermaid 초기화 + 다이어그램 클릭 확대 (스크롤 줌 지원) */
(function () {
  /* ── Mermaid 초기화 ── */
  function getTheme() {
    var scheme = document.body.getAttribute("data-md-color-scheme");
    return scheme === "slate" ? "dark" : "default";
  }

  function prepareMermaidElements() {
    document.querySelectorAll("pre.mermaid").forEach(function (pre) {
      var code = pre.querySelector("code");
      if (code) {
        pre.textContent = code.textContent;
      }
    });
  }

  function markZoomTargets() {
    document.querySelectorAll(".mermaid svg").forEach(function (svg) {
      if (!svg.closest("[data-zoom-bound]")) {
        var container = svg.closest(".mermaid");
        if (container) container.setAttribute("data-zoom-bound", "");
      }
    });
  }

  function initMermaid() {
    if (typeof mermaid === "undefined") return;
    prepareMermaidElements();

    var elements = document.querySelectorAll("pre.mermaid:not([data-processed])");
    if (elements.length === 0) return;

    mermaid.initialize({ startOnLoad: false, theme: getTheme() });
    mermaid.run({ nodes: elements })
      .then(function () { markZoomTargets(); })
      .catch(function (err) {
        console.warn("Mermaid render error:", err);
      });
  }

  // 초기 로드
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMermaid);
  } else {
    initMermaid();
  }

  // navigation.instant: 페이지 전환 시 재실행
  if (typeof document$ !== "undefined") {
    document$.subscribe(function () {
      initMermaid();
    });
  } else {
    var lastUrl = location.href;
    new MutationObserver(function () {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(initMermaid, 200);
      }
    }).observe(document.querySelector("title") || document.head, {
      childList: true,
      subtree: true,
    });
  }

  // 테마 전환 감지 → Mermaid 재렌더링
  new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].attributeName === "data-md-color-scheme") {
        document.querySelectorAll("[data-processed]").forEach(function (el) {
          el.removeAttribute("data-processed");
        });
        initMermaid();
        break;
      }
    }
  }).observe(document.body, { attributes: true });

  /* ── 다이어그램 클릭 확대 (이벤트 위임) ── */
  document.addEventListener("click", function (e) {
    if (e.target.closest(".diagram-overlay")) return;

    // SVG 직접 클릭 또는 SVG 내부 요소 클릭
    var svg = e.target.closest("svg");
    if (!svg) return;

    // .mermaid 컨테이너 내부이거나, mermaid ID 패턴을 가진 SVG
    var isMermaid =
      svg.closest(".mermaid") ||
      (svg.id && svg.id.match(/^mermaid-/)) ||
      svg.closest("[data-processed]");
    if (!isMermaid) return;

    e.preventDefault();
    e.stopPropagation();
    openOverlay(svg);
  });

  /* ── 오버레이 열기 (스크롤 줌 지원) ── */
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

    // ── 줌 상태 ──
    var scale = 1;
    var minScale = 0.3;
    var maxScale = 5;
    var translateX = 0;
    var translateY = 0;
    var isDragging = false;
    var dragStartX = 0;
    var dragStartY = 0;
    var lastTranslateX = 0;
    var lastTranslateY = 0;

    function applyTransform() {
      cloned.style.transform =
        "translate(" + translateX + "px, " + translateY + "px) scale(" + scale + ")";
    }

    // ── 스크롤 줌 ──
    overlay.addEventListener(
      "wheel",
      function (e) {
        e.preventDefault();
        var delta = e.deltaY > 0 ? -0.15 : 0.15;
        var newScale = Math.min(maxScale, Math.max(minScale, scale + delta * scale));

        // 마우스 포인터 기준 줌
        var rect = cloned.getBoundingClientRect();
        var cx = e.clientX - rect.left - rect.width / 2;
        var cy = e.clientY - rect.top - rect.height / 2;
        var factor = newScale / scale;
        translateX = translateX - cx * (factor - 1);
        translateY = translateY - cy * (factor - 1);

        scale = newScale;
        applyTransform();
      },
      { passive: false }
    );

    // ── 드래그 이동 (확대 시) ──
    content.addEventListener("mousedown", function (e) {
      if (scale <= 1) return;
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      lastTranslateX = translateX;
      lastTranslateY = translateY;
      content.style.cursor = "grabbing";
      e.preventDefault();
    });

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    function onMouseMove(e) {
      if (!isDragging) return;
      translateX = lastTranslateX + (e.clientX - dragStartX);
      translateY = lastTranslateY + (e.clientY - dragStartY);
      applyTransform();
    }

    function onMouseUp() {
      if (!isDragging) return;
      isDragging = false;
      content.style.cursor = scale > 1 ? "grab" : "";
    }

    // ── 오버레이 바깥 클릭으로 닫기 ──
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeOverlay(overlay, cleanup);
    });

    // ── ESC로 닫기 ──
    function onKey(e) {
      if (e.key === "Escape") closeOverlay(overlay, cleanup);
    }
    document.addEventListener("keydown", onKey);

    // ── 정리 함수 ──
    function cleanup() {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }
  }

  function closeOverlay(overlay, cleanup) {
    overlay.classList.remove("active");
    document.body.style.overflow = "";
    if (cleanup) cleanup();
    setTimeout(function () {
      overlay.remove();
    }, 200);
  }
})();
