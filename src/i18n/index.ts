/**
 * 轻量级 i18n 核心：
 *  - 类型安全的 t()（键集合由 zh-CN 基准 locale 推导）
 *  - 浏览器语言检测 + localStorage 持久化
 *  - data-i18n* 属性驱动的 DOM 翻译绑定
 *  - Intl 驱动的日期格式（与语言环境联动）
 */
import { zhCN, type MessageKey, type Messages } from './locales/zh-CN';
import { en } from './locales/en';
import { ja } from './locales/ja';
import { zhHK } from './locales/zh-HK';
import { zhTW } from './locales/zh-TW';

export type { MessageKey };

export const LOCALES = ['zh-CN', 'en', 'ja', 'zh-HK', 'zh-TW'] as const;
export type AppLocale = (typeof LOCALES)[number];

const LOCALE_STORAGE_KEY = 'qw.locale';

const catalog: Record<AppLocale, Messages> = {
  'zh-CN': zhCN,
  en,
  ja,
  'zh-HK': zhHK,
  'zh-TW': zhTW,
};

export const LOCALE_NAMES: Record<AppLocale, string> = {
  'zh-CN': '简体中文',
  en: 'English',
  ja: '日本語',
  'zh-HK': '繁體中文（香港）',
  'zh-TW': '繁體中文（台灣）',
};

function isAppLocale(v: string | null): v is AppLocale {
  return !!v && (LOCALES as readonly string[]).includes(v);
}

/** 根据浏览器语言猜测最合适的 locale。 */
function detectLocale(): AppLocale {
  const nav = navigator.language ?? navigator.languages?.[0] ?? '';
  const lang = nav.toLowerCase();
  if (lang.startsWith('zh')) {
    if (lang.includes('hant') || lang.startsWith('zh-hk') || lang.startsWith('zh-tw')) {
      return lang.startsWith('zh-hk') ? 'zh-HK' : 'zh-TW';
    }
    return 'zh-CN';
  }
  if (lang.startsWith('ja')) return 'ja';
  return 'en';
}

let currentLocale: AppLocale = isAppLocale(localStorage.getItem(LOCALE_STORAGE_KEY))
  ? (localStorage.getItem(LOCALE_STORAGE_KEY) as AppLocale)
  : detectLocale();

/** 返回当前语言环境。 */
export function getLocale(): AppLocale {
  return currentLocale;
}

/** 切换语言环境（不自动刷新 DOM，请配合 applyTranslations 使用）。 */
export function setLocale(locale: AppLocale): void {
  currentLocale = locale;
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

/** 类型安全的翻译函数。 */
export function t(key: MessageKey): string {
  return catalog[currentLocale]?.[key] ?? catalog['zh-CN'][key] ?? key;
}

/**
 * 将 DOM 中所有带 data-i18n* 属性的节点翻译为当前语言。
 *  - data-i18n="key"              → textContent / 组件 label 属性
 *  - data-i18n-placeholder="key"  → placeholder 属性（含 MD 组件）
 *  - data-i18n-supporting="key"   → supportingText 属性（MD 组件）
 *  - data-i18n-title="key"        → title 属性
 *  - data-i18n-aria="key"         → aria-label 属性
 */
export function applyTranslations(root: ParentNode = document): void {
  document.documentElement.lang = currentLocale;
  document.title = t('app.title');

  root.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n as MessageKey;
    const value = t(key);
    // Material Web 组件（md-outlined-text-field / md-outlined-select 等）
    // 通过响应式 label 属性渲染，普通元素直接写 textContent。
    if ('label' in el && typeof (el as Record<string, unknown>).label === 'string') {
      (el as unknown as { label: string }).label = value;
    } else {
      el.textContent = value;
    }
  });

  root
    .querySelectorAll<HTMLElement>('[data-i18n-placeholder]')
    .forEach((el) => {
      (el as unknown as { placeholder: string }).placeholder = t(
        el.dataset.i18nPlaceholder as MessageKey,
      );
    });

  root
    .querySelectorAll<HTMLElement>('[data-i18n-supporting]')
    .forEach((el) => {
      (el as unknown as { supportingText: string }).supportingText = t(
        el.dataset.i18nSupporting as MessageKey,
      );
    });

  root.querySelectorAll<HTMLElement>('[data-i18n-title]').forEach((el) => {
    el.title = t(el.dataset.i18nTitle as MessageKey);
  });

  root.querySelectorAll<HTMLElement>('[data-i18n-aria]').forEach((el) => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria as MessageKey));
  });
}

/* ------------------------------------------------------------------ */
/* Intl 日期格式（跟随当前语言环境）                                    */
/* ------------------------------------------------------------------ */

const monthYearFmtCache = new Map<AppLocale, Intl.DateTimeFormat>();
const headlineFmtCache = new Map<AppLocale, Intl.DateTimeFormat>();

function monthYearFormatter(): Intl.DateTimeFormat {
  let fmt = monthYearFmtCache.get(currentLocale);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(currentLocale, {
      year: 'numeric',
      month: 'long',
    });
    monthYearFmtCache.set(currentLocale, fmt);
  }
  return fmt;
}

function headlineFormatter(): Intl.DateTimeFormat {
  let fmt = headlineFmtCache.get(currentLocale);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(currentLocale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    headlineFmtCache.set(currentLocale, fmt);
  }
  return fmt;
}

/** 例：zh-CN → "2000年1月"；en → "January 2000"。 */
export function formatMonthYear(year: number, monthIndex: number): string {
  return monthYearFormatter().format(new Date(year, monthIndex, 1));
}

/** 例：zh-CN → "2000年1月1日星期六"；en → "Saturday, January 1, 2000"。 */
export function formatHeadlineDate(d: Date): string {
  return headlineFormatter().format(d);
}

/** 日历时表头（周日..周六）的短名称，例如 en → ["Sun", ...]，zh-CN → ["周日", ...]。 */
export function weekdayShortNames(): string[] {
  const fmt = new Intl.DateTimeFormat(currentLocale, { weekday: 'short' });
  // 基准日为 2024-01-07（周日），依次 +1 天得到周一..周六
  const base = new Date(2024, 0, 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base.getTime() + i * 86_400_000);
    return fmt.format(d).replace(/[.。]$/, '');
  });
}

/** 年份格式化：zh-CN/ja → "2000年"，en → "2000"。 */
export function formatYear(year: number): string {
  return new Intl.DateTimeFormat(currentLocale, { year: 'numeric' }).format(
    new Date(year, 0, 1),
  );
}
