/**
 * 音效模块 —— 由旧版 JS 实现 (.upstream_repo/canvas.mjs) 迁移而来。
 *
 * 点击已生成的画布时，用“种子化随机数”从 audio/a0.wav .. a2.wav 中挑选
 * 一个播放，与旧版行为一致（同一哈希种子 → 同一播放序列，点击后种子自增）。
 */

/** 音效文件数量 */
const AUDIO_COUNT = 3;

/** 根据种子生成 [0, 1) 的确定性随机数（与旧版 getRandomBase 一致）。 */
function randomBase(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/** 根据种子生成 [min, max) 的确定性随机整数（与旧版 getRandomInt 一致）。 */
function randomInt(seed: number, max: number, min = 0): number {
  return Math.floor(randomBase(seed) * max) + min;
}

export class AudioManager {
  private cache = new Map<string, HTMLAudioElement>();
  private pickCount = 0;

  constructor(private readonly baseUrl = 'audio/') {}

  /**
   * 播放一个由 seed 决定的声音。
   * @param seed 外部种子（如姓名+生日哈希）；内部叠加点击次数让每次点击有变化
   */
  playRandom(seed: number): void {
    const idx = randomInt(seed + this.pickCount * 997, AUDIO_COUNT);
    this.pickCount++;

    this.play(`audio/a${idx}.wav`);
  }

  /** 播放指定音效，缓存 Audio 元素并支持重播（rewind）。 */
  play(src: string): void {
    let audio = this.cache.get(src);
    if (!audio) {
      audio = new Audio(src);
      this.cache.set(src, audio);
    }
    audio.currentTime = 0;
    // 浏览器自动播放策略：在用户手势内调用，失败静默忽略
    void audio.play().catch(() => {
      /* ignore autoplay restrictions */
    });
  }
}
