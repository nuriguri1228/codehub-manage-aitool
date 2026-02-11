/* 다이어그램 클릭 확대 (스크롤 줌 + 드래그 이동) */
/* MkDocs Material은 mermaid SVG를 closed Shadow DOM 안에 렌더링한다.        */
/* closed shadow root는 외부에서 접근 불가하므로, attachShadow를 가로채서     */
/* shadow root 참조를 보관한 뒤 클릭 시 SVG를 꺼낸다.                        */
(function () {
  "use strict";

  /* ── 1. attachShadow 가로채기 ── */
  /* extra.js는 bundle.js 다음에 로드되지만, 실제 mermaid 렌더링은          */
  /* document$ 구독 콜백에서 비동기로 실행되므로 이 시점에 패치하면 된다.     */
  var shadowMap = new WeakMap();
  var _attachShadow = Element.prototype.attachShadow;
  Element.prototype.attachShadow = function (init) {
    var root = _attachShadow.call(this, init);
    shadowMap.set(this, root);
    return root;
  };

  /* shadow host에서 SVG 가져오기 */
  function getSvgFromHost(host) {
    var root = shadowMap.get(host);
    return root ? root.querySelector("svg") : null;
  }

  /* ── 2. 다이어그램 클릭 확대 (이벤트 위임) ── */
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest(".diagram-overlay")) return;

    /* 클릭 대상이 .mermaid 컨테이너인지 확인 */
    var host = e.target.closest ? e.target.closest(".mermaid") : null;
    if (!host) return;

    /* shadow DOM 내부의 SVG 가져오기 */
    var svg = getSvgFromHost(host);
    if (!svg) return;

    e.preventDefault();
    e.stopPropagation();
    openOverlay(svg);
  });

  /* ── 3. 오버레이 (스크롤 줌 + 드래그 이동) ── */
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
    var didDrag = false;
    content.style.cursor = "grab";
    content.addEventListener("mousedown", function (e) {
      dragging = true;
      didDrag = false;
      sx = e.clientX;
      sy = e.clientY;
      ltx = tx;
      lty = ty;
      content.style.cursor = "grabbing";
      e.preventDefault();
    });

    function onMove(e) {
      if (!dragging) return;
      var dx = e.clientX - sx;
      var dy = e.clientY - sy;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag = true;
      tx = ltx + dx;
      ty = lty + dy;
      apply();
    }
    function onUp() {
      if (!dragging) return;
      dragging = false;
      content.style.cursor = "grab";
      setTimeout(function () {
        didDrag = false;
      }, 0);
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);

    /* 닫기: 바깥 클릭 (드래그가 아닌 경우에만) */
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay && !didDrag) close();
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
