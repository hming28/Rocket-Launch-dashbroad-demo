// Visual Charts (AnalogBar, Sparkline, CorridorPlot, StripChart) and Viewport3D
module.exports = `
// ==================== 可视化图表组件 (Section 4 & Section 7) ====================
let sharedCursorSimT = null; // 跨图表同步光标时刻

// DPR 缩放工具函数 (上限 2)
function setupCanvas(canvas) {
  if (!canvas) return null;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(10, Math.floor(rect.width));
  const h = Math.max(10, Math.floor(rect.height));
  if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.resetTransform ? ctx.resetTransform() : ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  return { ctx, w, h };
}

// 偏差徽标 HTML 生成 (§4.5)
function buildDevBadgeHtml(devVal, devUnit, isOut, isOut2x) {
  if (devVal == null || isNaN(devVal)) return '';
  const sign = devVal >= 0 ? '+' : '';
  const text = \`Δ \${sign}\${Math.round(devVal)} \${devUnit}\`;
  if (isOut2x) {
    return \`<span class="c-dev-badge crit">■ \${text}</span>\`;
  } else if (isOut) {
    return \`<span class="c-dev-badge warn">▲ \${text}</span>\`;
  }
  return \`<span class="c-dev-badge">\${text}</span>\`;
}

// 80x20 Sparkline 绘制 (§4.2)
function drawSparkline(canvas, dataSeries, curT, isWarn, isCrit) {
  const setup = setupCanvas(canvas);
  if (!setup) return;
  const { ctx, w, h } = setup;
  ctx.clearRect(0, 0, w, h);
  if (!dataSeries || dataSeries.length < 2) return;

  const curIdx = Math.min(4280, Math.round(curT * 10));
  const startIdx = Math.max(0, curIdx - 600); // 最近 60s (600点)
  let minV = Infinity, maxV = -Infinity;
  for (let i = startIdx; i <= curIdx; i++) {
    const v = dataSeries[i];
    if (v < minV) minV = v;
    if (v > maxV) maxV = v;
  }
  if (minV === maxV) { maxV = minV + 1; }

  ctx.strokeStyle = isCrit ? '#FF4D5E' : isWarn ? '#FFB020' : '#8A94A3';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let i = startIdx; i <= curIdx; i++) {
    const x = ((i - startIdx) / 600) * w;
    const y = h - 2 - ((dataSeries[i] - minV) / (maxV - minV)) * (h - 4);
    if (i === startIdx) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // 当前值圆点
  const curX = ((curIdx - startIdx) / 600) * w;
  const curY = h - 2 - ((dataSeries[curIdx] - minV) / (maxV - minV)) * (h - 4);
  ctx.fillStyle = isCrit ? '#FF4D5E' : isWarn ? '#FFB020' : '#FFFFFF';
  ctx.beginPath();
  ctx.arc(curX, curY, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

// CorridorPlot (走廊图: 高度-速度 与 高度-时间) (§4.3)
function drawCorridorPlot(canvas, type, curT) {
  const setup = setupCanvas(canvas);
  if (!setup) return;
  const { ctx, w, h } = setup;
  ctx.clearRect(0, 0, w, h);

  const padLeft = 40, padBottom = 24, padTop = 16, padRight = 16;
  const plotW = w - padLeft - padRight;
  const plotH = h - padTop - padBottom;

  // 坐标范围
  const maxAlt = 130000; // 130 km
  const maxV = 2400; // 2400 m/s
  const maxT = 428;

  const toX = val => padLeft + (val / (type === 'hv' ? maxV : maxT)) * plotW;
  const toY = alt => padTop + plotH - (alt / maxAlt) * plotH;

  // 网格线
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 4]);
  for (let a = 20000; a <= 120000; a += 30000) {
    const y = toY(a);
    ctx.beginPath(); ctx.moveTo(padLeft, y); ctx.lineTo(padLeft + plotW, y); ctx.stroke();
    ctx.fillStyle = '#8A94A3';
    ctx.font = '9px monospace';
    ctx.fillText((a / 1000) + 'k', 8, y + 3);
  }
  ctx.setLineDash([]);

  // 1. 容差带 (同一曲线两侧浅灰带)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.beginPath();
  // 上边界
  for (let st = 0; st <= END; st += 4) {
    const sn = S_nom(st);
    const band_h = Math.max(300, sn.alt * 0.05);
    const band_v = Math.max(20, sn.v * 0.04);
    const x = toX(type === 'hv' ? sn.v + band_v : st);
    const y = toY(sn.alt + band_h);
    if (st === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  // 下边界 (反向绘制闭合)
  for (let st = END; st >= 0; st -= 4) {
    const sn = S_nom(st);
    const band_h = Math.max(300, sn.alt * 0.05);
    const band_v = Math.max(20, sn.v * 0.04);
    const x = toX(type === 'hv' ? Math.max(0, sn.v - band_v) : st);
    const y = toY(Math.max(0, sn.alt - band_h));
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  // 2. 名义曲线 (灰实线)
  ctx.strokeStyle = '#8A94A3';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let st = 0; st <= END; st += 3) {
    const sn = S_nom(st);
    const x = toX(type === 'hv' ? sn.v : st);
    const y = toY(sn.alt);
    if (st === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // 3. 事件刻度
  const events = [
    { t: 77, name: 'MAX-Q' }, { t: 150, name: 'MECO' },
    { t: 156, name: 'SEP' }, { t: 330, name: 'ENTRY' }, { t: 395, name: 'LAND' }
  ];
  events.forEach(ev => {
    const sn = S_nom(ev.t);
    const x = toX(type === 'hv' ? sn.v : ev.t);
    const y = toY(sn.alt);
    ctx.fillStyle = '#8A94A3';
    ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.font = '9px monospace';
    ctx.fillText(ev.name, x + 4, y - 4);
  });

  // 4. 实际轨迹线与出带染色 (§4.3)
  const curIdx = Math.min(4280, Math.round(curT * 10));
  let curSegmentColor = '#FFFFFF';
  ctx.lineWidth = 2;
  for (let i = 0; i <= curIdx; i += 2) {
    const st = i * 0.1;
    const sn = S_nom(st);
    const sa = S_act(st);
    const band_h = Math.max(300, sn.alt * 0.05);
    const band_v = Math.max(20, sn.v * 0.04);
    const isOut = Math.abs(sa.e_h) > band_h || Math.abs(sa.e_v) > band_v;
    const isOut2x = Math.abs(sa.e_h) > band_h * 2 || Math.abs(sa.e_v) > band_v * 2;
    const segColor = isOut2x ? '#FF4D5E' : isOut ? '#FFB020' : '#FFFFFF';

    const x = toX(type === 'hv' ? sa.v : st);
    const y = toY(sa.alt);
    if (i === 0) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      curSegmentColor = segColor;
    } else {
      ctx.strokeStyle = curSegmentColor;
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
      curSegmentColor = segColor;
    }
  }

  // 5. 名义标记 (空心圆) 与 实际标记 (实心圆)
  const snCur = S_nom(curT);
  const nomX = toX(type === 'hv' ? snCur.v : curT);
  const nomY = toY(snCur.alt);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(nomX, nomY, 4.5, 0, Math.PI * 2);
  ctx.stroke();

  const saCur = S_act(curT);
  const actX = toX(type === 'hv' ? saCur.v : curT);
  const actY = toY(saCur.alt);
  const isOut = Math.abs(saCur.e_h) > Math.max(300, snCur.alt * 0.05) || Math.abs(saCur.e_v) > Math.max(20, snCur.v * 0.04);
  const isOut2x = Math.abs(saCur.e_h) > Math.max(600, snCur.alt * 0.1) || Math.abs(saCur.e_v) > Math.max(40, snCur.v * 0.08);
  ctx.fillStyle = isOut2x ? '#FF4D5E' : isOut ? '#FFB020' : '#FFFFFF';
  ctx.beginPath();
  ctx.arc(actX, actY, 4, 0, Math.PI * 2);
  ctx.fill();

  // 6. 右上角 Δ 数值徽标
  const dvText = \`Δv \${saCur.e_v >= 0 ? '+' : ''}\${Math.round(saCur.e_v)} m/s\`;
  const dhText = \`Δh \${saCur.e_h >= 0 ? '+' : ''}\${(saCur.e_h / 1000).toFixed(1)} km\`;
  ctx.fillStyle = isOut2x ? '#FF4D5E' : isOut ? '#FFB020' : '#8A94A3';
  ctx.font = '11px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(\`\${dvText}   \${dhText}\`, w - padRight, 14);
  ctx.textAlign = 'left';

  // 7. 同步光标指示
  if (sharedCursorSimT != null && sharedCursorSimT <= END) {
    const curSimX = toX(type === 'hv' ? S_nom(sharedCursorSimT).v : sharedCursorSimT);
    ctx.strokeStyle = 'rgba(79, 209, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(curSimX, padTop);
    ctx.lineTo(curSimX, padTop + plotH);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

// StripChart (趋势图: 60s 或 全程 0..428s) (§4.4)
function drawStripChart(canvas, cfg) {
  const setup = setupCanvas(canvas);
  if (!setup) return;
  const { ctx, w, h } = setup;
  ctx.clearRect(0, 0, w, h);

  const padLeft = 40, padBottom = 20, padTop = 16, padRight = 16;
  const plotW = w - padLeft - padRight;
  const plotH = h - padTop - padBottom;

  const isFull = cfg.mode === 'full';
  const curT = cfg.curT;
  const minT = isFull ? 0 : Math.max(0, curT - 60);
  const maxT = isFull ? 428 : Math.max(60, curT);
  const minV = cfg.minV != null ? cfg.minV : 0;
  const maxV = cfg.maxV || 100;

  const toX = tVal => padLeft + ((tVal - minT) / (maxT - minT)) * plotW;
  const toY = val => padTop + plotH - ((val - minV) / (maxV - minV)) * plotH;

  // Max-Q 浅灰带标注 (64-92s)
  if (minT <= 92 && maxT >= 64) {
    const xS = Math.max(padLeft, toX(64));
    const xE = Math.min(padLeft + plotW, toX(92));
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.fillRect(xS, padTop, xE - xS, plotH);
  }

  // 横向限值线 (注意 / 临界)
  if (cfg.limits) {
    ctx.font = '9px monospace';
    cfg.limits.forEach(lim => {
      const y = toY(lim.val);
      if (y >= padTop && y <= padTop + plotH) {
        ctx.strokeStyle = lim.type === 'crit' ? 'rgba(255, 77, 94, 0.7)' : 'rgba(255, 176, 32, 0.6)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(padLeft, y); ctx.lineTo(padLeft + plotW, y); ctx.stroke();
        ctx.fillStyle = lim.type === 'crit' ? '#FF4D5E' : '#FFB020';
        ctx.fillText(lim.label, padLeft + 6, y - 3);
      }
    });
    ctx.setLineDash([]);
  }

  // 名义曲线 (虚线叠加在后)
  if (cfg.nominalSeries) {
    ctx.strokeStyle = '#8A94A3';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    const startIdx = Math.round(minT * 10);
    const endIdx = Math.round((isFull ? END : curT) * 10);
    for (let i = startIdx; i <= endIdx; i += (isFull ? 3 : 1)) {
      const tVal = i * 0.1;
      const x = toX(tVal);
      const y = toY(cfg.nominalSeries[i]);
      if (i === startIdx) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 实际曲线 (白色/实线)
  if (cfg.actualSeries) {
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const startIdx = Math.round(minT * 10);
    const endIdx = Math.round(curT * 10);
    for (let i = startIdx; i <= endIdx; i += (isFull ? 2 : 1)) {
      const tVal = i * 0.1;
      const x = toX(tVal);
      const y = toY(cfg.actualSeries[i]);
      if (i === startIdx) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // 第二条实际曲线 (例如节流深度或角速度)
  if (cfg.secondSeries) {
    ctx.strokeStyle = '#4FD1FF';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    const startIdx = Math.round(minT * 10);
    const endIdx = Math.round(curT * 10);
    for (let i = startIdx; i <= endIdx; i += (isFull ? 2 : 1)) {
      const tVal = i * 0.1;
      const x = toX(tVal);
      const y = toY(cfg.secondSeries[i]);
      if (i === startIdx) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // 全程模式当前时间竖线
  if (isFull) {
    const curX = toX(curT);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(curX, padTop); ctx.lineTo(curX, padTop + plotH); ctx.stroke();
  }

  // 跨图表同步光标
  if (sharedCursorSimT != null && sharedCursorSimT >= minT && sharedCursorSimT <= maxT) {
    const cursorX = toX(sharedCursorSimT);
    ctx.strokeStyle = 'rgba(79, 209, 255, 0.7)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.moveTo(cursorX, padTop); ctx.lineTo(cursorX, padTop + plotH); ctx.stroke();
    ctx.setLineDash([]);

    // 悬停数值
    const sIdx = Math.min(4280, Math.round(sharedCursorSimT * 10));
    if (cfg.actualSeries) {
      const val = cfg.actualSeries[sIdx];
      ctx.fillStyle = '#4FD1FF';
      ctx.font = '10px monospace';
      ctx.fillText(val.toFixed(1) + (cfg.unit || ''), cursorX + 4, padTop + 12);
    }
  }
}

// ==================== 3D 相机预设与自动导播 (Section 7) ====================
const Viewport3D = (function() {
  let curPreset = 'pad';
  let autoDirector = true;
  const presets = ['pad', 'chase', 'sep', 'reentry', 'land', 'free'];
  const presetLabels = {
    pad: { zh: '发射全景', en: 'PAD' },
    chase: { zh: '上升跟拍', en: 'CHASE' },
    sep: { zh: '分离', en: 'SEP' },
    reentry: { zh: '再入俯视', en: 'REENTRY' },
    land: { zh: '着陆特写', en: 'LAND' },
    free: { zh: '自由机位', en: 'FREE' }
  };

  // 自动导播日程 (§7)
  function getScheduledPreset(tVal) {
    if (tVal < 6) return 'pad';
    if (tVal < 150) return 'chase';
    if (tVal < 190) return 'sep';
    if (tVal < 395) return 'reentry';
    return 'land';
  }

  function update(curT) {
    if (autoDirector) {
      const sch = getScheduledPreset(curT);
      if (sch !== curPreset) {
        curPreset = sch;
      }
    }
  }

  function setPreset(p) {
    if (presets.includes(p)) {
      curPreset = p;
      autoDirector = false; // 手动切换机位即进入手动模式 (§7)
    }
  }

  function setAuto(enable) {
    autoDirector = enable;
    if (enable) curPreset = getScheduledPreset(t);
  }

  function drawPlaceholder(canvas, curT, s) {
    const setup = setupCanvas(canvas);
    if (!setup) return;
    const { ctx, w, h } = setup;
    ctx.clearRect(0, 0, w, h);

    // 渐变天空与地平线
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#05070B');
    grad.addColorStop(0.7, '#0B1522');
    grad.addColorStop(1, '#16283A');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // 地平线 / 轨道参考线
    ctx.strokeStyle = 'rgba(79, 209, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.72);
    ctx.lineTo(w, h * 0.72);
    ctx.stroke();

    // 绘制简易火箭线框示意
    const cx = w * 0.5, cy = h * 0.5;
    const pitchRad = (s.pk - 90) * Math.PI / 180;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-pitchRad);

    // 箭体
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-6, -30, 12, 60);

    // 顶端整流罩锥体
    ctx.beginPath();
    ctx.moveTo(-6, -30);
    ctx.lineTo(0, -42);
    ctx.lineTo(6, -30);
    ctx.stroke();

    // 尾部火焰
    if (s.kN > 0) {
      ctx.fillStyle = 'rgba(79, 209, 255, 0.7)';
      ctx.beginPath();
      ctx.moveTo(-5, 30);
      ctx.lineTo(0, 30 + Math.min(35, s.kN / 220));
      ctx.lineTo(5, 30);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 机位与视角标注
    ctx.fillStyle = '#8A94A3';
    ctx.font = '10px monospace';
    ctx.fillText(\`CAM: \${curPreset.toUpperCase()} (\${autoDirector ? 'AUTO' : 'MANUAL'})\`, 10, h - 10);
    ctx.fillText(\`ALT: \${Math.round(s.alt)}m  PIT: \${s.pk.toFixed(1)}°\`, w - 150, h - 10);
  }

  return {
    getPreset: () => curPreset,
    isAuto: () => autoDirector,
    setPreset,
    setAuto,
    update,
    drawPlaceholder,
    presets,
    presetLabels
  };
})();
`;
