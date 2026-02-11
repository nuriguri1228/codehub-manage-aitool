/* Mermaid 다이어그램 클릭 확대 기능 */
document.addEventListener("DOMContentLoaded", function () {
  // Mermaid 렌더링 완료 후 실행하기 위해 지연
  var timer = setInterval(function () {
    var diagrams = document.querySelectorAll("pre.mermaid");
    if (diagrams.length === 0) return;
    clearInterval(timer);
    initZoom(diagrams);
  }, 500);

  // 10초 후 폴링 중단
  setTimeout(function () {
    clearInterval(timer);
  }, 10000);
});

function initZoom(diagrams) {
  diagrams.forEach(function (el) {
    el.addEventListener("click", function () {
      openOverlay(el);
    });
  });
}

function openOverlay(sourceEl) {
  var overlay = document.createElement("div");
  overlay.className = "diagram-overlay";

  var hint = document.createElement("span");
  hint.className = "close-hint";
  hint.textContent = "ESC 또는 클릭으로 닫기";

  var content = document.createElement("div");
  content.className = "diagram-content";
  content.innerHTML = sourceEl.innerHTML;

  overlay.appendChild(hint);
  overlay.appendChild(content);
  document.body.appendChild(overlay);

  // 애니메이션 트리거
  requestAnimationFrame(function () {
    overlay.classList.add("active");
  });

  // 콘텐츠 내부 클릭은 닫지 않음
  content.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  // 오버레이 배경 클릭으로 닫기
  overlay.addEventListener("click", function () {
    closeOverlay(overlay);
  });

  // ESC 키로 닫기
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
  setTimeout(function () {
    overlay.remove();
  }, 200);
}
