/* Mermaid 초기화 + 다이어그램 클릭 확대 */
(function () {
  /* ── Mermaid 초기화 ── */
  function getTheme() {
    var scheme = document.body.getAttribute("data-md-color-scheme");
    return scheme === "slate" ? "dark" : "default";
  }

  function initMermaid() {
    if (typeof mermaid === "undefined") return;
    mermaid.initialize({ startOnLoad: false, theme: getTheme() });
    mermaid.run({ querySelector: ".mermaid" }).then(function () {
      initZoom();
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
    // document$ 미사용 폴백: popstate + MkDocs instant nav 감지
    var lastUrl = location.href;
    new MutationObserver(function () {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(initMermaid, 100);
      }
    }).observe(document.querySelector("title") || document.head, {
      childList: true,
      subtree: true,
    });
  }

  // 테마 전환 감지 → Mermaid 다시 렌더링
  new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].attributeName === "data-md-color-scheme") {
        initMermaid();
        break;
      }
    }
  }).observe(document.body, { attributes: true });

  /* ── 다이어그램 클릭 확대 ── */
  function initZoom() {
    document.querySelectorAll(".mermaid").forEach(function (el) {
      if (!el.querySelector("svg") || el.dataset.zoomBound) return;
      el.dataset.zoomBound = "true";
      el.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        openOverlay(el);
      });
    });
  }

  function openOverlay(sourceEl) {
    var svg = sourceEl.querySelector("svg");
    if (!svg) return;

    var overlay = document.createElement("div");
    overlay.className = "diagram-overlay";

    var hint = document.createElement("span");
    hint.className = "close-hint";
    hint.textContent = "ESC 또는 바깥 영역 클릭으로 닫기";

    var content = document.createElement("div");
    content.className = "diagram-content";
    var cloned = svg.cloneNode(true);
    cloned.removeAttribute("width");
    cloned.removeAttribute("height");
    cloned.removeAttribute("style");
    cloned.style.width = "100%";
    cloned.style.height = "auto";
    content.appendChild(cloned);

    overlay.appendChild(hint);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    requestAnimationFrame(function () {
      overlay.classList.add("active");
    });

    content.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    overlay.addEventListener("click", function () {
      closeOverlay(overlay);
    });

    function onKey(e) {
      if (e.key === "Escape") {
        closeOverlay(overlay);
        document.removeEventListener("keydown", onKey);
      }
    }
    document.addEventListener("keydown", onKey);
  }

  function closeOverlay(overlay) {
    overlay.classList.remove("active");
    document.body.style.overflow = "";
    setTimeout(function () {
      overlay.remove();
    }, 200);
  }
})();
