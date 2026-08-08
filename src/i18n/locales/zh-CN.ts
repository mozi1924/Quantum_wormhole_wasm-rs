/**
 * 简体中文 (zh-CN) — 基准 locale。
 * 其他 locale 必须实现与本文件相同的键集合（MessageKey 由本文件推导）。
 */
export const zhCN = {
  'app.title': 'Quantum Wormhole Generator - 量子虫洞生成器',
  'app.langLabel': '语言 / Language',
  'app.soundOff': '关闭音效',
  'app.soundOn': '开启音效',

  'standby.title': '量子计算引擎待机中',
  'standby.desc': '请配置个人特征参数，点击下方启动引擎即可运行 WASM 计算',

  'loader.text': '编译 Rust WASM 物理核心...',
  'loader.failed': 'WASM 引擎初始化失败',

  'hud.status.standby': '待机',
  'hud.status.running': '运行中',

  'name.label': '姓名 (Name)',
  'name.placeholder': '请输入您的姓名',
  'name.supporting': '用于生成量子特征哈希',

  'dob.label': '出生日期 (Date of Birth)',
  'dob.supporting': '点击选择时间维度的时空坐标',

  'engine.start': '启动量子引擎',
  'engine.stop': '停止引擎',
  'engine.save': '导出高清图',

  'tuning.title': '量子场调控参数 (Quantum Field Controls)',
  'tuning.warp': '引力弯曲度 (Spacetime Warp)',
  'tuning.flux': '量子涨落 (Quantum Flux)',
  'tuning.speed': '吸积盘旋转速率 (Spin Speed)',

  'tele.horizon': 'Event Horizon Radius',
  'tele.energy': 'Singularity Energy',
  'tele.doppler': 'Doppler Redshift',

  'datepicker.sub': '选择出生日期',
  'datepicker.modeTitle': '切换模式',
  'datepicker.toggleCalendar': '切换日历选择模式',
  'datepicker.toggleText': '切换文本输入模式',
  'datepicker.prevMonth': '上一月',
  'datepicker.nextMonth': '下一月',
  'datepicker.cancel': '取消',
  'datepicker.confirm': '确定',
  'datepicker.inputLabel': '日期 (YYYY-MM-DD)',
  'datepicker.inputPlaceholder': '例如 2000-01-01',
  'datepicker.inputSupporting': '请输入正确格式 (年-月-日)',

  'egg.badge': '彩蛋已解锁',
  'egg.badgeHint': '点击画布解锁隐藏链接',
  'egg.toast': '🎉 彩蛋触发',
  'egg.ybb': 'YBB の 祝福',
  'egg.hanjian': '罕见のの',
  'egg.jiaxin': '嘉心糖 · 嘉然',
  'egg.hetongxue': '何同学 · 5G',
  'egg.win11': 'Win11 之怒',
  'egg.ceylan': 'Ceylan / 锡兰',
  'egg.yuanban': '原版量子虫洞',
  'egg.danmu': '弹幕付き · 弹幕附',

  'footer.version': '版本',
  'footer.madeBy': 'Made with ❤️ by AdhesionTek · WASM 重制版',
  'footer.eggHint': '试试输入 "海子"、"嘉然"、"何同学" ...',
} as const;

export type MessageKey = keyof typeof zhCN;
export type Messages = Record<MessageKey, string>;
