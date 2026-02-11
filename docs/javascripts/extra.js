/* Mermaid 다이어그램 클릭 확대 기능 */
(function () {
  function initZoom() {
    // MkDocs Material이 Mermaid를 렌더링한 뒤 SVG가 삽입된 요소를 찾는다
    // 가능한 구조: <pre class="mermaid">, <div class="mermaid">, 또는 SVG를 포함하는 code.language-mermaid
    var diagrams = document.querySelectorAll(
      "pre.mermaid, .mermaid svg, pre:has(> svg), code.language-mermaid"
    );

    // :has 미지원 브라우저 대비: SVG의 부모를 직접 탐색
    var svgs = document.querySelectorAll("svg");
    var targets = new Set();

    svgs.forEach(function (svg) {
      var parent = svg.closest("pre.mermaid, .mermaid, .highlight");
      if (parent && parent.querySelector("svg")) {
        targets.add(parent);
      }
    });

    diagrams.forEach(function (el) {
      if (el.querySelector && el.querySelector("svg")) {
        targets.add(el);
      }
    });

    if (targets.size === 0) return false;

    targets.forEach(function (el) {
      if (el.dataset.zoomBound) return;
      el.dataset.zoomBound = "true";
      el.style.cursor = "zoom-in";
      el.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        openOverlay(el);
      });
    });

    return true;
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

  // Mermaid 렌더링은 비동기이므로 MutationObserver + 폴링으로 감지
  var found = false;
  var observer = new MutationObserver(function () {
    if (!found) {
      found = initZoom();
    } else {
      // 이미 초기화 후에도 새 다이어그램이 추가될 수 있음 (instant navigation)
      initZoom();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // 폴백: 폴링
  var attempts = 0;
  var timer = setInterval(function () {
    attempts++;
    if (initZoom() || attempts > 20) {
      clearInterval(timer);
    }
  }, 500);
})();
