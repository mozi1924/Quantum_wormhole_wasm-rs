/**
 * 轻量 Toast 通知：用于彩蛋触发、音效开关等轻量反馈。
 * 自动创建/复用单个容器，避免在 HTML 中散落多个提示节点。
 */

const TOAST_MS = 3200;

let container: HTMLDivElement | null = null;
let hideTimer: number | null = null;

function ensureContainer(): HTMLDivElement {
  if (container && container.isConnected) return container;

  container = document.createElement('div');
  container.className = 'app-toast';
  container.setAttribute('role', 'status');
  document.body.appendChild(container);
  return container;
}

/** 显示一条 toast 消息，自动淡出。 */
export function showToast(message: string, durationMs = TOAST_MS): void {
  const el = ensureContainer();
  el.textContent = message;
  // 强制重排，保证连续调用时动画能重新触发
  void el.offsetWidth;
  el.classList.add('show');

  if (hideTimer !== null) window.clearTimeout(hideTimer);
  hideTimer = window.setTimeout(() => {
    el.classList.remove('show');
  }, durationMs);
}
