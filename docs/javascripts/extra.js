/* Mermaid 초기화 + 다이어그램 클릭 확대 */
(function () {
  /* ── Mermaid 초기화 ── */
  function getTheme() {
    var scheme = document.body.getAttribute("data-md-color-scheme");
    return scheme === "slate" ? "dark" : "default";
  }

  function prepareMermaidElements() {
    // fence_code_format이 생성하는 <pre class="mermaid"><code>...</code></pre>에서
    // <code> 래퍼를 제거하고 textContent를 pre에 직접 설정
    // textContent는 HTML 엔티티(&lt; &gt; &amp;)를 자동 디코딩하므로
    // Mermaid가 올바른 --> 화살표와 <br/> 태그를 받을 수 있음
    document.querySelectorAll("pre.mermaid").forEach(function (pre) {
      var code = pre.querySelector("code");
      if (code) {
        pre.textContent = code.textContent;
      }
    });
  }

  function initMermaid() {
    if (typeof mermaid === "undefined") return;
    prepareMermaidElements();

    var elements = document.querySelectorAll("pre.mermaid:not([data-processed])");
    if (elements.length === 0) return;

    mermaid.initialize({ startOnLoad: false, theme: getTheme() });
    mermaid.run({ nodes: elements }).then(function () {
      initZoom();
    }).catch(function (err) {
      console.warn("Mermaid render error:", err);
      initZoom();
    });
  }

  // 초기 로드
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMermaid);
  } else {
    // script가 body 하단에 있으므로 DOM은 이미 준비됨
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

  // 테마 전환 감지 → Mermaid 다시 렌더링
  new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].attributeName === "data-md-color-scheme") {
        // data-processed 제거하여 재렌더링 허용
        document.querySelectorAll("pre.mermaid[data-processed]").forEach(function (el) {
          el.removeAttribute("data-processed");
          el.removeAttribute("data-zoom-bound");
        });
        initMermaid();
        break;
      }
    }
  }).observe(document.body, { attributes: true });

  /* ── 다이어그램 클릭 확대 ── */
  function initZoom() {
    document.querySelectorAll("pre.mermaid").forEach(function (el) {
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
