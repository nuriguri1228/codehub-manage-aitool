/* Mermaid 초기화 + 다이어그램 클릭 확대 (스크롤 줌 지원) */
(function () {
  "use strict";

  /* ── 1. Mermaid 자동 실행 즉시 차단 ── */
  /* mermaid v11은 window.load에서 자동 렌더링함.                */
  /* extra.js가 로드되는 시점(load 전)에 즉시 비활성화해야 함.   */
  try {
    if (typeof mermaid !== "undefined" && mermaid.initialize) {
      mermaid.initialize({ startOnLoad: false });
    }
  } catch (e) {
    console.warn("[extra.js] mermaid.initialize failed:", e);
  }

  /* ── 2. 유틸리티 ── */
  function getTheme() {
    var scheme = document.body.getAttribute("data-md-color-scheme");
    return scheme === "slate" ? "dark" : "default";
  }

  /* ── 3. Mermaid 렌더링 ── */
  function initMermaid() {
    if (typeof mermaid === "undefined" || !mermaid.run) {
      console.warn("[extra.js] mermaid not available");
      return;
    }

    /* <code> 래퍼 제거: fence_code_format이 만든 <pre class=mermaid><code>…</code></pre> */
    document.querySelectorAll("pre.mermaid code").forEach(function (code) {
      var pre = code.parentElement;
      if (pre && pre.tagName === "PRE") {
        pre.innerHTML = code.innerHTML;
      }
    });

    var elements = document.querySelectorAll("pre.mermaid:not([data-processed])");
    if (elements.length === 0) return;

    console.info("[extra.js] Rendering " + elements.length + " mermaid diagrams");

    try {
      mermaid.initialize({ startOnLoad: false, theme: getTheme() });
    } catch (e) {
      console.warn("[extra.js] mermaid.initialize error:", e);
    }

    /* requestAnimationFrame으로 DOM 페인트 후 렌더링                     */
    /* → mermaid 내부 getBoundingClientRect 호출 시 요소가 레이아웃 완료됨 */
    requestAnimationFrame(function () {
      renderDiagrams(elements);
    });
  }

  /* 다이어그램을 하나씩 순차 렌더링 — 하나의 실패가 나머지를 중단하지 않음 */
  async function renderDiagrams(elements) {
    var rendered = 0;
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      if (el.getAttribute("data-processed")) continue;
      try {
        await mermaid.run({ nodes: [el] });
        rendered++;
      } catch (err) {
        console.warn("[extra.js] Diagram " + i + " error:", err.message || err);
      }
    }
    console.info("[extra.js] Rendered " + rendered + "/" + elements.length + " diagrams");
    /* 줌 커서 힌트 설정 */
    document.querySelectorAll("pre.mermaid[data-processed] svg").forEach(function (svg) {
      svg.style.cursor = "zoom-in";
    });
  }

  /* ── 4. 초기 로드 + navigation.instant 대응 ── */
  /* MkDocs Material은 window.document$ (RxJS Observable)를 전역으로 노출 */
  function setupInit() {
    /* document$가 있으면 모든 페이지 전환에 대응 가능 (초기 로드 포함) */
    if (typeof window.document$ !== "undefined") {
      window.document$.subscribe(function () {
        initMermaid();
      });
    } else {
      /* document$가 없으면 DOMContentLoaded + URL 변경 감시 */
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initMermaid);
      } else {
        initMermaid();
      }
      /* instant navigation fallback */
      var lastUrl = location.href;
      new MutationObserver(function () {
        if (location.href !== lastUrl) {
          lastUrl = location.href;
          setTimeout(initMermaid, 300);
        }
      }).observe(document.querySelector("title") || document.head, {
        childList: true,
        subtree: true,
      });
    }
  }

  /* bundle.js가 먼저 로드되어 document$를 설정해야 하므로             */
  /* 스크립트 실행 시점에 document$가 있으면 바로 사용, 없으면 대기    */
  if (typeof window.document$ !== "undefined") {
    setupInit();
  } else {
    /* bundle.js가 아직 document$를 설정하지 않았을 수 있음 */
    /* 짧은 대기 후 재시도, 그래도 없으면 DOMContentLoaded 사용 */
    setTimeout(function () {
      setupInit();
    }, 0);
  }

  /* 테마 전환 감지 → Mermaid 재렌더링 */
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

  /* ── 5. 다이어그램 클릭 확대 (이벤트 위임) ── */
  /* 문서 레벨에서 클릭을 감지하므로 동적으로 추가된 SVG도 처리 가능 */
  document.addEventListener("click", function (e) {
    if (e.target.closest(".diagram-overlay")) return;

    var svg = e.target.closest("svg");
    if (!svg) return;

    /* mermaid가 렌더한 SVG인지 판별 — 여러 조건으로 최대한 넓게 감지 */
    var isDiagram =
      svg.closest("pre.mermaid") ||
      svg.closest("div.mermaid") ||
      svg.closest(".mermaid") ||
      svg.closest("[data-processed]") ||
      (svg.id && /^mermaid/i.test(svg.id)) ||
      svg.getAttribute("aria-roledescription") === "flowchart-v2" ||
      svg.getAttribute("aria-roledescription") === "graph" ||
      svg.getAttribute("aria-roledescription") === "block" ||
      svg.getAttribute("aria-roledescription") === "stateDiagram" ||
      svg.getAttribute("aria-roledescription") === "sequence" ||
      svg.getAttribute("aria-roledescription") === "classDiagram" ||
      svg.getAttribute("aria-roledescription") === "gantt" ||
      svg.getAttribute("aria-roledescription") === "er" ||
      (svg.querySelector(".clusters") && svg.querySelector(".edgePaths"));

    if (!isDiagram) return;

    e.preventDefault();
    e.stopPropagation();
    openOverlay(svg);
  });

  /* ── 6. 오버레이 (스크롤 줌 + 드래그 이동) ── */
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
