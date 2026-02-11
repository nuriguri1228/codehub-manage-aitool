/* Mermaid 초기화 + 다이어그램 클릭 확대 */
(function () {
  /* ── Mermaid 초기화 ── */
  function getTheme() {
    var scheme = document.body.getAttribute("data-md-color-scheme");
    return scheme === "slate" ? "dark" : "default";
  }

  function prepareMermaidElements() {
    // fence_code_format: <pre class="mermaid"><code>...</code></pre>
    // <code> 래퍼를 제거하고 textContent로 HTML 엔티티 디코딩
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
    mermaid.run({ nodes: elements }).catch(function (err) {
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
  // Mermaid가 렌더링 후 원본 요소를 교체할 수 있으므로
  // 개별 요소가 아닌 document 레벨에서 클릭을 감지
  document.addEventListener("click", function (e) {
    // 이미 오버레이가 열려 있으면 무시
    if (e.target.closest(".diagram-overlay")) return;

    // 클릭한 곳에서 가장 가까운 SVG를 포함하는 mermaid 컨테이너 찾기
    var svg = e.target.closest("svg");
    if (!svg) return;

    var container = svg.closest(".mermaid") || svg.parentElement;
    if (!container || !container.classList.contains("mermaid")) return;

    e.preventDefault();
    e.stopPropagation();
    openOverlay(svg);
  });

  function openOverlay(svg) {
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
