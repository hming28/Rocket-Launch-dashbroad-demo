// Layout Engine Module for Schema 2
// Pure functions for resolveLayout, validate, migrateLegacy, serialize, parse
const LayoutEngine = (function() {
const WIDGET_OPTIONS = [
  { val: 'eng1', zh: '发动机矩阵', en: 'Engine Matrix', slots: 2 },
  { val: 'prop1', zh: '一级推进剂', en: 'S1 Propellant', slots: 1 },
  { val: 'thrust', zh: '总推力', en: 'Total Thrust', slots: 1 },
  { val: 'thr', zh: '节流深度', en: 'Throttle Depth', slots: 1 },
  { val: 'g', zh: '过载', en: 'G-Load', slots: 1 },
  { val: 'q', zh: '动压 Q', en: 'Dyn. Pressure Q', slots: 1 },
  { val: 'mach', zh: '马赫数', en: 'Mach Number', slots: 1 },
  { val: 'cd', zh: '阻力系数 Cd', en: 'Drag Coeff Cd', slots: 1 },
  { val: 'heat', zh: '热流', en: 'Heat Flux', slots: 1 },
  { val: 'brk', zh: '制动余量', en: 'Brake Margin', slots: 1 },
  { val: 'att', zh: '姿态俯仰', en: 'Pitch Angle', slots: 1 },
  { val: 'mass', zh: '箭体质量', en: 'Stage Mass', slots: 1 },
  { val: 'margin', zh: '任务裕度', en: 'Task Margins', slots: 1 },
  { val: 'eng2', zh: '二级发动机 (SIM)', en: 'Stage 2 MVac (SIM)', slots: 2 },
  { val: 'prop2', zh: '二级推进 (SIM)', en: 'Stage 2 Prop (SIM)', slots: 1 }
];

const VALID_WIDGET_IDS = new Set(WIDGET_OPTIONS.map(w => w.val));
const TWO_SLOT_WIDGETS = new Set(['eng1', 'eng2']);

const DEFAULT_LAYOUT_SCHEMA2 = {
  schema: 2,
  name: '默认',
  preset: 'default',
  L: [ { m: 'a' }, { m: 'a' }, { m: 'a' }, { m: 'a' }, { m: 'a' } ],
  R: [ { m: 'a' }, { m: 'a' }, { m: 'a' }, { m: 'a' } ],
  S: [
    { m: 'a' }, { m: 'a' }, { m: 'a' }, { m: 'a' },
    { m: 'a' }, { m: 'a' }, { m: 'a' }, { m: 'a' },
    { m: 'a' }, { m: 'a' }, { m: 'a' }, { m: 'a' }
  ]
};

const PRESETS_SCHEMA2 = {
  default: DEFAULT_LAYOUT_SCHEMA2,
  launch: {
    schema: 2,
    name: '发射',
    preset: 'launch',
    L: [
      { m: 'f', w: 'eng1' },
      { m: 'a' },
      { m: 'f', w: 'prop1' },
      { m: 'f', w: 'g' },
      { m: 'f', w: 'thr' }
    ],
    R: [
      { m: 'f', w: 'thrust' },
      { m: 'f', w: 'mach' },
      { m: 'f', w: 'q' },
      { m: 'f', w: 'cd' }
    ],
    S: [
      { m: 'f', w: 'eng1' },
      { m: 'a' },
      { m: 'f', w: 'prop1' },
      { m: 'f', w: 'thrust' },
      { m: 'f', w: 'g' },
      { m: 'f', w: 'q' },
      { m: 'f', w: 'mach' },
      { m: 'f', w: 'thr' },
      { m: 'f', w: 'cd' },
      { m: 'f', w: 'att' },
      { m: 'f', w: 'mass' },
      { m: 'f', w: 'margin' }
    ]
  },
  recovery: {
    schema: 2,
    name: '回收',
    preset: 'recovery',
    L: [
      { m: 'f', w: 'eng1' },
      { m: 'a' },
      { m: 'f', w: 'prop1' },
      { m: 'f', w: 'brk' },
      { m: 'f', w: 'heat' }
    ],
    R: [
      { m: 'f', w: 'g' },
      { m: 'f', w: 'margin' },
      { m: 'f', w: 'att' },
      { m: 'f', w: 'thrust' }
    ],
    S: [
      { m: 'f', w: 'eng1' },
      { m: 'a' },
      { m: 'f', w: 'prop1' },
      { m: 'f', w: 'g' },
      { m: 'f', w: 'heat' },
      { m: 'f', w: 'brk' },
      { m: 'f', w: 'att' },
      { m: 'f', w: 'margin' },
      { m: 'f', w: 'mach' },
      { m: 'f', w: 'q' },
      { m: 'f', w: 'mass' },
      { m: 'f', w: 'thrust' }
    ]
  },
  review: {
    schema: 2,
    name: '审阅',
    preset: 'review',
    L: [
      { m: 'f', w: 'eng1' },
      { m: 'a' },
      { m: 'f', w: 'prop1' },
      { m: 'f', w: 'g' },
      { m: 'f', w: 'margin' }
    ],
    R: [
      { m: 'f', w: 'thrust' },
      { m: 'f', w: 'eng2' },
      { m: 'a' },
      { m: 'f', w: 'prop2' }
    ],
    S: [
      { m: 'f', w: 'eng1' },
      { m: 'a' },
      { m: 'f', w: 'prop1' },
      { m: 'f', w: 'thrust' },
      { m: 'f', w: 'g' },
      { m: 'f', w: 'q' },
      { m: 'f', w: 'mach' },
      { m: 'f', w: 'cd' },
      { m: 'f', w: 'thr' },
      { m: 'f', w: 'heat' },
      { m: 'f', w: 'brk' },
      { m: 'f', w: 'margin' }
    ]
  }
};

// §13.4 控制台默认自动日程
function getAutoScheduledWidgetForS(slotIdx, tVal) {
  if (slotIdx === 0) return 'eng1'; // S1: eng1 (2 slots: S1+S2)
  if (slotIdx === 1) return 'eng1_span';
  if (slotIdx === 2) return 'prop1'; // S3: prop1 [0, 428)
  if (slotIdx === 3) return 'thrust'; // S4: thrust [0, 428)
  if (slotIdx === 4) { // S5: g [0, 150) & [330, 428)
    return (tVal < 150 || tVal >= 330) ? 'g' : 'none';
  }
  if (slotIdx === 5) { // S6: q [0, 156) & [330, 395)
    return (tVal < 156 || (tVal >= 330 && tVal < 395)) ? 'q' : 'none';
  }
  if (slotIdx === 6) return 'mach'; // S7: mach [0, 428)
  if (slotIdx === 7) { // S8: thr [64, 92); heat [330, 395); brk [395, 420)
    if (tVal >= 64 && tVal < 92) return 'thr';
    if (tVal >= 330 && tVal < 395) return 'heat';
    if (tVal >= 395 && tVal < 420) return 'brk';
    return 'none';
  }
  if (slotIdx === 8) { // S9: cd [0, 156); att [156, 428)
    return tVal < 156 ? 'cd' : 'att';
  }
  if (slotIdx === 9) return 'mass'; // S10: mass [0, 428)
  if (slotIdx === 10) { // S11: margin [0, 156); eng2 [156, 428) (2 slots: S11+S12)
    return tVal < 156 ? 'margin' : 'eng2';
  }
  if (slotIdx === 11) { // S12: [0, 156) 空; [156, 428) 被 eng2 占用
    return tVal < 156 ? 'none' : 'eng2_span';
  }
  return 'none';
}

// 紧凑模式默认自动日程 (L: 5 slots, R: 4 slots)
function getAutoScheduledWidgetForCompact(zone, slotIdx, tVal) {
  if (zone === 'L') {
    if (slotIdx === 0) return 'eng1';
    if (slotIdx === 1) return 'eng1_span';
    if (slotIdx === 2) return 'prop1';
    if (slotIdx === 3) {
      return (tVal < 150 || tVal >= 330) ? 'g' : 'none';
    }
    if (slotIdx === 4) {
      if (tVal >= 420 && tVal < 428) return 'verdict';
      if (tVal >= 64 && tVal < 92) return 'thr';
      if (tVal >= 330 && tVal < 395) return 'heat';
      if (tVal >= 395 && tVal < 420) return 'brk';
      return 'none';
    }
  } else if (zone === 'R') {
    if (tVal < 156) {
      if (slotIdx === 0) return 'thrust';
      if (slotIdx === 1) return 'mach';
      if (slotIdx === 2) return 'q';
      if (slotIdx === 3) return 'cd';
    } else {
      if (slotIdx === 0) return 'eng2';
      if (slotIdx === 1) return 'eng2_span';
      if (slotIdx === 2) return 'prop2';
      if (slotIdx === 3) return 'none';
    }
  }
  return 'none';
}

// 检查阶段语义部件是否在其有意义的阶段
function isWidgetInActivePhase(widgetId, tVal) {
  if (widgetId === 'thr') return tVal >= 64 && tVal < 92;
  if (widgetId === 'heat') return tVal >= 330 && tVal < 395;
  if (widgetId === 'brk') return tVal >= 395 && tVal < 420;
  return true;
}

// 布局解析纯函数
function resolveLayout(layout, tVal) {
  const normLayout = migrateLegacy(layout);
  const result = {
    L: new Array(5).fill('none'),
    R: new Array(4).fill('none'),
    S: new Array(12).fill('none'),
    dimmed: {
      L: new Array(5).fill(false),
      R: new Array(4).fill(false),
      S: new Array(12).fill(false)
    }
  };

  // 1. 解析控制台集合 S
  const fixedS = new Set();
  const sSlots = normLayout.S || [];
  
  // 第一轮: 标记固定格和两格部件占用
  for (let i = 0; i < 12; i++) {
    const item = sSlots[i];
    if (item && item.m === 'f' && item.w && item.w !== 'none') {
      result.S[i] = item.w;
      fixedS.add(item.w);
      result.dimmed.S[i] = !isWidgetInActivePhase(item.w, tVal);
      if (TWO_SLOT_WIDGETS.has(item.w) && i + 1 < 12) {
        result.S[i + 1] = item.w + '_span';
        result.dimmed.S[i + 1] = result.dimmed.S[i];
      }
    }
  }

  // 第二轮: 解析自动格
  const resolvedInS = new Set(fixedS);
  for (let i = 0; i < 12; i++) {
    if (result.S[i] === 'none') {
      const item = sSlots[i];
      if (!item || item.m === 'a') {
        const candidate = getAutoScheduledWidgetForS(i, tVal);
        if (candidate === 'eng1_span' || candidate === 'eng2_span') {
          // 仅在前一个格确实是对应部件时生效
          const base = candidate.replace('_span', '');
          if (result.S[i - 1] === base) {
            result.S[i] = candidate;
          }
        } else if (candidate !== 'none') {
          if (TWO_SLOT_WIDGETS.has(candidate)) {
            // 需要占 2 格: 检查自身和下一格是否空闲且不属于 fixedSet
            if (i + 1 < 12 && !resolvedInS.has(candidate) && result.S[i + 1] === 'none') {
              result.S[i] = candidate;
              result.S[i + 1] = candidate + '_span';
              resolvedInS.add(candidate);
              result.dimmed.S[i] = !isWidgetInActivePhase(candidate, tVal);
              result.dimmed.S[i + 1] = result.dimmed.S[i];
            }
          } else {
            if (!resolvedInS.has(candidate)) {
              result.S[i] = candidate;
              resolvedInS.add(candidate);
              result.dimmed.S[i] = !isWidgetInActivePhase(candidate, tVal);
            }
          }
        }
      }
    }
  }

  // 2. 解析紧凑集合 (L + R)
  const fixedCompact = new Set();
  const lSlots = normLayout.L || [];
  const rSlots = normLayout.R || [];

  // 第一轮: 标记固定格
  for (let i = 0; i < 5; i++) {
    const item = lSlots[i];
    if (item && item.m === 'f' && item.w && item.w !== 'none') {
      result.L[i] = item.w;
      fixedCompact.add(item.w);
      result.dimmed.L[i] = !isWidgetInActivePhase(item.w, tVal);
      if (TWO_SLOT_WIDGETS.has(item.w) && i + 1 < 5) {
        result.L[i + 1] = item.w + '_span';
        result.dimmed.L[i + 1] = result.dimmed.L[i];
      }
    }
  }
  for (let i = 0; i < 4; i++) {
    const item = rSlots[i];
    if (item && item.m === 'f' && item.w && item.w !== 'none') {
      result.R[i] = item.w;
      fixedCompact.add(item.w);
      result.dimmed.R[i] = !isWidgetInActivePhase(item.w, tVal);
      if (TWO_SLOT_WIDGETS.has(item.w) && i + 1 < 4) {
        result.R[i + 1] = item.w + '_span';
        result.dimmed.R[i + 1] = result.dimmed.R[i];
      }
    }
  }

  // 系统覆盖: verdict 在 [420, 428) 覆盖 L 最后一格 (L4)
  if (tVal >= 420 && tVal < 428) {
    result.L[4] = 'verdict';
    result.dimmed.L[4] = false;
  }

  // 第二轮: 解析自动格
  const resolvedInCompact = new Set(fixedCompact);
  // 解析 L 自动格
  for (let i = 0; i < 5; i++) {
    if (result.L[i] === 'none') {
      const item = lSlots[i];
      if (!item || item.m === 'a') {
        const candidate = getAutoScheduledWidgetForCompact('L', i, tVal);
        if (candidate === 'eng1_span' || candidate === 'eng2_span') {
          const base = candidate.replace('_span', '');
          if (result.L[i - 1] === base) result.L[i] = candidate;
        } else if (candidate !== 'none') {
          if (TWO_SLOT_WIDGETS.has(candidate)) {
            if (i + 1 < 5 && !resolvedInCompact.has(candidate) && result.L[i + 1] === 'none') {
              result.L[i] = candidate;
              result.L[i + 1] = candidate + '_span';
              resolvedInCompact.add(candidate);
              result.dimmed.L[i] = !isWidgetInActivePhase(candidate, tVal);
              result.dimmed.L[i + 1] = result.dimmed.L[i];
            }
          } else {
            if (!resolvedInCompact.has(candidate)) {
              result.L[i] = candidate;
              resolvedInCompact.add(candidate);
              result.dimmed.L[i] = !isWidgetInActivePhase(candidate, tVal);
            }
          }
        }
      }
    }
  }

  // 解析 R 自动格
  for (let i = 0; i < 4; i++) {
    if (result.R[i] === 'none') {
      const item = rSlots[i];
      if (!item || item.m === 'a') {
        const candidate = getAutoScheduledWidgetForCompact('R', i, tVal);
        if (candidate === 'eng1_span' || candidate === 'eng2_span') {
          const base = candidate.replace('_span', '');
          if (result.R[i - 1] === base) result.R[i] = candidate;
        } else if (candidate !== 'none') {
          if (TWO_SLOT_WIDGETS.has(candidate)) {
            if (i + 1 < 4 && !resolvedInCompact.has(candidate) && result.R[i + 1] === 'none') {
              result.R[i] = candidate;
              result.R[i + 1] = candidate + '_span';
              resolvedInCompact.add(candidate);
              result.dimmed.R[i] = !isWidgetInActivePhase(candidate, tVal);
              result.dimmed.R[i + 1] = result.dimmed.R[i];
            }
          } else {
            if (!resolvedInCompact.has(candidate)) {
              result.R[i] = candidate;
              resolvedInCompact.add(candidate);
              result.dimmed.R[i] = !isWidgetInActivePhase(candidate, tVal);
            }
          }
        }
      }
    }
  }

  return result;
}

// 校验纯函数
function validate(layout) {
  function vErr(zh, en) {
    return { ok: false, valid: false, reasonZh: zh, errorZh: zh, reasonEn: en, errorEn: en };
  }

  if (!layout || typeof layout !== 'object') {
    return vErr('布局数据必须是对象', 'Layout data must be an object');
  }
  if (layout.schema !== 2) {
    return vErr('布局 Schema 必须为 2', 'Layout schema must be 2');
  }
  if (!Array.isArray(layout.L) || layout.L.length !== 5) {
    return vErr('紧凑左区 (L) 长度必须为 5', 'Compact zone L must have length 5');
  }
  if (!Array.isArray(layout.R) || layout.R.length !== 4) {
    return vErr('紧凑右区 (R) 长度必须为 4', 'Compact zone R must have length 4');
  }
  if (!Array.isArray(layout.S) || layout.S.length !== 12) {
    return vErr('控制台小部件条 (S) 长度必须为 12', 'Console strip S must have length 12');
  }

  // 校验小部件 ID 必须在 15 个库里
  const checkSlots = (slots, name) => {
    for (let i = 0; i < slots.length; i++) {
      const it = slots[i];
      if (!it || typeof it !== 'object') {
        return vErr(name + ' 第 ' + (i+1) + ' 格结构无效', name + ' slot ' + (i+1) + ' invalid structure');
      }
      if (it.m !== 'a' && it.m !== 'f') {
        return vErr(name + ' 第 ' + (i+1) + ' 格模式必须是 a 或 f', name + ' slot ' + (i+1) + ' mode must be a or f');
      }
      if (it.m === 'f') {
        if (!it.w || !VALID_WIDGET_IDS.has(it.w)) {
          return vErr(name + ' 第 ' + (i+1) + ' 格存在未知小部件: ' + it.w, name + ' slot ' + (i+1) + ' has unknown widget: ' + it.w);
        }
      }
    }
    return null;
  };

  const errL = checkSlots(layout.L, '左区 L');
  if (errL) return errL;
  const errR = checkSlots(layout.R, '右区 R');
  if (errR) return errR;
  const errS = checkSlots(layout.S, '控制台 S');
  if (errS) return errS;

  // 同一集合内不重复
  // 紧凑集合 = L + R
  const compactWidgets = new Set();
  for (let i = 0; i < layout.L.length; i++) {
    const it = layout.L[i];
    if (it.m === 'f' && it.w && it.w !== 'none') {
      if (compactWidgets.has(it.w)) {
        return vErr('紧凑模式集合 (L+R) 中存在重复小部件: ' + it.w, 'Duplicate widget in compact collection (L+R): ' + it.w);
      }
      compactWidgets.add(it.w);
    }
  }
  for (let i = 0; i < layout.R.length; i++) {
    const it = layout.R[i];
    if (it.m === 'f' && it.w && it.w !== 'none') {
      if (compactWidgets.has(it.w)) {
        return vErr('紧凑模式集合 (L+R) 中存在重复小部件: ' + it.w, 'Duplicate widget in compact collection (L+R): ' + it.w);
      }
      compactWidgets.add(it.w);
    }
  }

  // 控制台集合 = S
  const consoleWidgets = new Set();
  for (let i = 0; i < layout.S.length; i++) {
    const it = layout.S[i];
    if (it.m === 'f' && it.w && it.w !== 'none') {
      if (consoleWidgets.has(it.w)) {
        return vErr('控制台集合 (S) 中存在重复小部件: ' + it.w, 'Duplicate widget in console collection (S): ' + it.w);
      }
      consoleWidgets.add(it.w);
    }
  }

  // 2 格小部件规则: 不能放在区域最后一格, 其下一格不能是固定格; 发动机矩阵占 2 格时下一格不能有固定内容
  const checkTwoSlot = (slots, name) => {
    const lastIdx = slots.length - 1;
    if (slots[lastIdx].m === 'f' && TWO_SLOT_WIDGETS.has(slots[lastIdx].w)) {
      return vErr('2格小部件不能放在区域最后一格 (' + name + (lastIdx+1) + ')', '2-slot widget cannot be placed in the last slot of ' + name + ' (' + (lastIdx+1) + ')');
    }
    for (let i = 0; i < slots.length - 1; i++) {
      if (slots[i].m === 'f' && TWO_SLOT_WIDGETS.has(slots[i].w)) {
        if (slots[i + 1].m === 'f') {
          return vErr('2格小部件占用下一格，' + name + (i+2) + ' 不能是固定格', '2-slot widget occupies next slot; ' + name + (i+2) + ' cannot be fixed');
        }
      }
    }
    // 发动机矩阵占 2 格时，被它占掉的那一格不能再有固定内容
    if ((name === 'L' || name === 'S') && slots[0].m === 'a' && slots[1].m === 'f') {
      return vErr('发动机矩阵占 2 格时，被它占掉的那一格不能再有固定内容 (' + name + '2)', 'Engine matrix occupies 2 slots; the occupied next slot cannot have fixed content (' + name + '2)');
    }
    return null;
  };

  const errTwoL = checkTwoSlot(layout.L, 'L');
  if (errTwoL) return errTwoL;
  const errTwoR = checkTwoSlot(layout.R, 'R');
  if (errTwoR) return errTwoR;
  const errTwoS = checkTwoSlot(layout.S, 'S');
  if (errTwoS) return errTwoS;

  return { ok: true, valid: true };
}

// 迁移历史版本
function migrateLegacy(raw) {
  if (!raw || typeof raw !== 'object') {
    return JSON.parse(JSON.stringify(DEFAULT_LAYOUT_SCHEMA2));
  }

  // 已经是有效 schema 2
  if (raw.schema === 2 && Array.isArray(raw.L) && raw.L.length === 5 && Array.isArray(raw.R) && raw.R.length === 4 && Array.isArray(raw.S) && raw.S.length === 12) {
    return raw;
  }

  const result = {
    schema: 2,
    name: raw.name || '迁移布局',
    preset: raw.preset || 'custom',
    L: [ { m: 'a' }, { m: 'a' }, { m: 'a' }, { m: 'a' }, { m: 'a' } ],
    R: [ { m: 'a' }, { m: 'a' }, { m: 'a' }, { m: 'a' } ],
    S: [
      { m: 'a' }, { m: 'a' }, { m: 'a' }, { m: 'a' },
      { m: 'a' }, { m: 'a' }, { m: 'a' }, { m: 'a' },
      { m: 'a' }, { m: 'a' }, { m: 'a' }, { m: 'a' }
    ]
  };

  // 处理旧 right (4 项)
  const oldRight = Array.isArray(raw.R) ? raw.R : Array.isArray(raw.right) ? raw.right : null;
  if (oldRight && oldRight.length === 4) {
    result.R = oldRight.map(it => {
      const w = it.w || it.widget;
      const isFixed = (it.m === 'f' || it.mode === 'fixed') && w && w !== 'none';
      if (isFixed) {
        return { m: 'f', w };
      }
      return { m: 'a' };
    });
  }

  // 处理旧 left
  const oldLeft = Array.isArray(raw.L) ? raw.L : Array.isArray(raw.left) ? raw.left : null;
  if (oldLeft) {
    if (oldLeft.length === 5) {
      result.L = oldLeft.map(it => {
        const w = it.w || it.widget;
        const isFixed = (it.m === 'f' || it.mode === 'fixed') && w && w !== 'none';
        if (isFixed) return { m: 'f', w };
        return { m: 'a' };
      });
    } else if (oldLeft.length === 4) {
      const it0 = oldLeft[0] || {};
      const w0 = it0.w || it0.widget;
      const isFixed0 = (it0.m === 'f' || it0.mode === 'fixed') && w0 && w0 !== 'none';
      result.L[0] = isFixed0 ? { m: 'f', w: w0 } : { m: 'a' };
      result.L[1] = { m: 'a' }; // eng1 第二格
      for (let i = 1; i <= 3; i++) {
        const it = oldLeft[i] || {};
        const w = it.w || it.widget;
        const isFixed = (it.m === 'f' || it.mode === 'fixed') && w && w !== 'none';
        result.L[i + 1] = isFixed ? { m: 'f', w } : { m: 'a' };
      }
    }
  }

  // 处理 S: 缺 S 或非 12 项取默认自动
  if (Array.isArray(raw.S) && raw.S.length === 12) {
    result.S = raw.S.map(it => {
      const w = it.w || it.widget;
      const isFixed = (it.m === 'f' || it.mode === 'fixed') && w && w !== 'none';
      if (isFixed) return { m: 'f', w };
      return { m: 'a' };
    });
  }

  return result;
}

function serialize(layout) {
  return JSON.stringify(layout, null, 2);
}

function parse(text) {
  const obj = JSON.parse(text);
  const migrated = migrateLegacy(obj);
  const check = validate(migrated);
  if (!check.valid) {
    const err = new Error(check.errorZh + ' (' + check.errorEn + ')');
    err.validation = check;
    throw err;
  }
  return migrated;
}

  return {
    WIDGET_OPTIONS,
    VALID_WIDGET_IDS,
    TWO_SLOT_WIDGETS,
    DEFAULT_LAYOUT_SCHEMA2,
    PRESETS_SCHEMA2,
    getAutoScheduledWidgetForS,
    getAutoScheduledWidgetForCompact,
    isWidgetInActivePhase,
    resolveLayout,
    validate,
    migrateLegacy,
    serialize,
    parse
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LayoutEngine;
}

