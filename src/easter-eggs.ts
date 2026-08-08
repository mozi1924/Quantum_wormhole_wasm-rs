/**
 * 彩蛋（Easter Eggs）模块 —— 由旧版 JS 实现 (.upstream_repo/index.mjs) 迁移而来。
 *
 * 规则：当“姓名”输入命中某个条件时，点击画布会打开对应的隐藏链接。
 * 条件与旧版保持兼容，并修复了旧版 Win11 正则写法的 bug
 * （旧版把字符串 "/(?:win|windows)11/g" 当成正则用，永远无法匹配）。
 */
import type { MessageKey } from './i18n';

/** 彩蛋唯一标识（同时作为 i18n 中 egg.<id> 文案的键）。 */
export type EasterEggId =
  | 'ybb'
  | 'hanjian'
  | 'jiaxin'
  | 'hetongxue'
  | 'win11'
  | 'ceylan'
  | 'yuanban'
  | 'danmu';

export interface EasterEgg {
  /** 唯一标识，同时作为 i18n 中 egg.<id> 文案的键 */
  id: EasterEggId;
  /** 命中条件 */
  condition: (input: string) => boolean;
  /** 跳转地址 */
  redirectURL: string;
}

/** 兼容旧版行为的条件重定向表。 */
export const EASTER_EGGS: readonly EasterEgg[] = [
  {
    id: 'ybb',
    condition: (input) =>
      input.toLowerCase() === 'ybb' || input.includes('海子'),
    redirectURL: 'https://www.bilibili.com/video/BV1wo4y1X7Tk',
  },
  {
    id: 'hanjian',
    condition: (input) => input.includes('罕见'),
    redirectURL: 'https://www.bilibili.com/video/BV1p64y1X7j2',
  },
  {
    id: 'jiaxin',
    condition: (input) => input.includes('嘉心糖') || input.includes('嘉然'),
    redirectURL: 'https://www.bilibili.com/video/BV1FX4y1g7u8',
  },
  {
    id: 'hetongxue',
    condition: (input) => input.includes('何同学'),
    redirectURL: 'https://www.bilibili.com/video/BV1244y1p7kt',
  },
  {
    id: 'win11',
    condition: (input) => /win(?:dows)?11/i.test(input),
    redirectURL: 'https://www.bilibili.com/video/BV1yb4y1x7Ky',
  },
  {
    id: 'ceylan',
    condition: (input) =>
      input.toLowerCase().includes('ceylan') || input.includes('锡兰'),
    redirectURL: 'https://www.youtube.com/user/CeylanLC/featured',
  },
  {
    id: 'yuanban',
    condition: (input) => input.toLowerCase() === '原版',
    redirectURL: 'https://youtu.be/pKKlGQtc_ss',
  },
  {
    id: 'danmu',
    condition: (input) => ['弹幕付', '弹幕附'].includes(input),
    redirectURL: 'https://youtu.be/jfTK-Om5wiY',
  },
];

/**
 * 根据姓名输入查找命中的彩蛋（返回第一个匹配项，与旧版一致）。
 * @param input 姓名输入
 */
export function findEasterEgg(input: string): EasterEgg | null {
  return EASTER_EGGS.find((egg) => egg.condition(input)) ?? null;
}
