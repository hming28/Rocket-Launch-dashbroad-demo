function updateContextModules(s) {
  const box = $('ctx-box');
  if (!box) return;

  // 根据当前 t 和 DASH 规则（或布局覆盖）筛选出应显示的情境模块
  const needed = new Set();
  DASH.forEach(rule => {
    if (rule.zone === 'L' && rule.mod !== 'eng1' && rule.mod !== 'prop1') {
      if (t >= rule.win[0] && t < rule.win[1]) needed.add(rule.mod);
    }
  });

  // 如果用户在布局编辑器中指定了 fixed 部件，做合并处理
  userLayout.left.forEach(slot => {
    if (slot.mode === 'fixed') {
      if (['g', 'thr', 'heat', 'brk', 'verdict'].includes(slot.widget)) needed.add(slot.widget);
    }
  });

  // 1. 移除已过期的模块
  lastMountedMods.forEach(modId => {
    if (!needed.has(modId)) {
      const el = $(`mod-${modId}`);
      if (el) {
        el.classList.add('mod-exit');
        setTimeout(() => { if (el.parentNode) el.remove(); }, 150);
      }
      lastMountedMods.delete(modId);
    }
  });

  // 2. 添加新增的模块
  needed.forEach(modId => {
    if (!lastMountedMods.has(modId)) {
      const el = document.createElement('div');
      el.id = `mod-${modId}`;
      el.className = 'ctx-mod mod-enter';
      el.innerHTML = buildModHtml(modId, s);
      box.appendChild(el);
      requestAnimationFrame(() => {
        el.classList.remove('mod-enter');
      });
      lastMountedMods.add(modId);
    }
  });

  // 3. 更新已有模块数据
  needed.forEach(modId => {
    const el = $(`mod-${modId}`);
    if (el) updModHtml(modId, el, s);
  });
}

function buildModHtml(modId, s, isRight) {
  if (modId === 'g') {
    const vId = isRight ? 'g-val-r' : 'g-val', bId = isRight ? 'g-bar-r' : 'g-bar';
    return `
      <div class="ctx-title">${L('过载', 'G-LOAD')}</div>
      <div class="ctx-val" id="${vId}">${s.nG.toFixed(1)} G</div>
      <div class="ctx-bar">
        <div class="ctx-bar-fill" id="${bId}" style="width:${cl(s.nG/6*100,0,100)}%"></div>
        <div class="ctx-tick" style="left:75%;background:var(--wn)" title="4.5G"></div>
        <div class="ctx-tick" style="left:91.7%;background:var(--cr)" title="5.5G"></div>
      </div>
      <div class="ctx-sub">0–6 G</div>`;
  }
  if (modId === 'thr') {
    const vId = isRight ? 'thr-val-r' : 'thr-val', bId = isRight ? 'thr-bar-r' : 'thr-bar';
    return `
      <div class="ctx-title" style="color:var(--ac)">${L('节流深度', 'THROTTLE')}</div>
      <div class="ctx-val" id="${vId}" style="color:var(--ac)">−${Math.round(s.depth)}%</div>
      <div class="ctx-bar"><div class="ctx-bar-fill" id="${bId}" style="width:${(s.depth/30)*100}%;background:var(--ac)"></div></div>
      <div class="ctx-sub" style="color:var(--ac)">${L('Max-Q 通过中', 'Max-Q Throttling')}</div>`;
  }
  if (modId === 'heat') {
    const vId = isRight ? 'heat-val-r' : 'heat-val';
    return `
      <div class="ctx-title">${L('热流', 'HEAT FLUX')}</div>
      <div class="ctx-val" id="${vId}">${Math.round(s.heat)} <small style="font-size:11px">kW/m²</small></div>
      <div class="ctx-bar" style="background:linear-gradient(to right, #6b0000, #ff4500, #ffa500, #ffffaa)">
        <div class="ctx-bar-fill" style="background:transparent"></div>
      </div>
      <div class="ctx-sub">${s.heat > 120 ? L('高温注意', 'HIGH HEAT') : L('黑体辐射', 'Radiative')}</div>`;
  }
  if (modId === 'brk') {
    const b0 = mg(s, t)[0];
    const vId = isRight ? 'brk-val-r' : 'brk-val', bId = isRight ? 'brk-bar-r' : 'brk-bar', sId = isRight ? 'brk-sub-r' : 'brk-sub';
    return `
      <div class="ctx-title">${L('制动余量', 'BRAKE MARGIN')}</div>
      <div class="ctx-val" id="${vId}">${b0.v}</div>
      <div class="ctx-bar"><div class="ctx-bar-fill" id="${bId}" style="width:${b0.p}%;background:${b0.s === 2 ? 'var(--cr)' : b0.s === 1 ? 'var(--wn)' : 'var(--ac)'}"></div></div>
      <div class="ctx-sub" id="${sId}">${b0.s === 2 ? L('不足', 'CRITICAL') : b0.s === 1 ? L('偏低', 'LOW') : L('充足', 'NOMINAL')}</div>`;
  }
  if (modId === 'verdict') {
    const bad = s.pg > 4.5 || short;
    const vId = isRight ? 'vd-val-r' : 'vd-val';
    return `
      <div class="ctx-title">${L('判定结果', 'VERDICT')}</div>
      <div class="ctx-val" id="${vId}" style="color:${bad ? 'var(--cr)' : 'var(--ac)'}">${bad ? L('坠毁', 'LOST') : L('成功', 'LANDED')}</div>
      <div class="ctx-sub">${s.tdv.toFixed(1)} m/s · ${s.pg.toFixed(1)} G</div>
      <div class="ctx-sub">${L('缓冲行程', 'Stroke')} ${cfg.stroke.toFixed(2)} m</div>`;
  }
  if (modId === 'q') {
    const vId = isRight ? 'q-val-r' : 'q-val', bId = isRight ? 'q-bar-r' : 'q-bar';
    return `
      <div class="ctx-title" style="color:var(--ac)">${L('动压 Q', 'DYN. Q')}</div>
      <div class="ctx-val" id="${vId}" style="color:var(--ac)">${s.q.toFixed(1)} <small style="font-size:11px">kPa</small></div>
      <div class="ctx-bar"><div class="ctx-bar-fill" id="${bId}" style="width:${cl(s.q/30*100,0,100)}%;background:var(--ac)"></div></div>
      <div class="ctx-sub">${L('峰值 26.9 kPa', 'Peak 26.9 kPa')}</div>`;
  }
  if (modId === 'mach') {
    const vId = isRight ? 'mach-val-r' : 'mach-val', bId = isRight ? 'mach-bar-r' : 'mach-bar', sId = isRight ? 'mach-sub-r' : 'mach-sub';
    return `
      <div class="ctx-title">${L('马赫数', 'MACH')}</div>
      <div class="ctx-val" id="${vId}">M ${s.M.toFixed(2)}</div>
      <div class="ctx-bar"><div class="ctx-bar-fill" id="${bId}" style="width:${cl(s.M/8*100,0,100)}%"></div></div>
      <div class="ctx-sub" id="${sId}">${s.M > 1 ? L('超声速', 'SUPERSONIC') : L('亚声速', 'SUBSONIC')}</div>`;
  }
  if (modId === 'cd') {
    const isTrans = Math.abs(s.M - 1.1) < .28;
    const vId = isRight ? 'cd-val-r' : 'cd-val', bId = isRight ? 'cd-bar-r' : 'cd-bar', sId = isRight ? 'cd-sub-r' : 'cd-sub';
    return `
      <div class="ctx-title">${L('阻力系数', 'DRAG CD')}</div>
      <div class="ctx-val" id="${vId}">${s.Cd.toFixed(3)}${isTrans ? ' ▲' : ''}</div>
      <div class="ctx-bar"><div class="ctx-bar-fill" id="${bId}" style="width:${cl(s.Cd/0.9*100,0,100)}%"></div></div>
      <div class="ctx-sub" id="${sId}">${isTrans ? L('跨声速峰', 'Transonic Peak') : L('正常气动', 'Nominal')}</div>`;
  }
  if (modId === 'margin') {
    const m0 = mg(s, t)[0];
    const vId = isRight ? 'mg-val-r' : 'mg-val', bId = isRight ? 'mg-bar-r' : 'mg-bar', sId = isRight ? 'mg-sub-r' : 'mg-sub';
    return `
      <div class="ctx-title">${L('最紧裕度', 'TIGHTEST MARGIN')}</div>
      <div class="ctx-val" id="${vId}" style="font-size:15px">${m0.v}</div>
      <div class="ctx-bar"><div class="ctx-bar-fill" id="${bId}" style="width:${m0.p}%;background:${m0.s===2?'var(--cr)':m0.s===1?'var(--wn)':'var(--ac)'}"></div></div>
      <div class="ctx-sub" id="${sId}">${L(m0.z, m0.e)}</div>`;
  }
  return '';
}

function updModHtml(modId, el, s, isRight) {
  if (modId === 'g') {
    const vId = isRight ? '#g-val-r' : '#g-val', bId = isRight ? '#g-bar-r' : '#g-bar';
    const val = el.querySelector(vId), bar = el.querySelector(bId);
    if (val) {
      val.textContent = s.nG.toFixed(1) + ' G';
      val.style.color = s.nG >= 5.5 ? 'var(--cr)' : s.nG >= 4.5 ? 'var(--wn)' : 'var(--tx)';
    }
    if (bar) {
      bar.style.width = cl(s.nG / 6 * 100, 0, 100) + '%';
      bar.style.background = s.nG >= 5.5 ? 'var(--cr)' : s.nG >= 4.5 ? 'var(--wn)' : 'var(--ac)';
    }
  } else if (modId === 'thr') {
    const vId = isRight ? '#thr-val-r' : '#thr-val', bId = isRight ? '#thr-bar-r' : '#thr-bar';
    const val = el.querySelector(vId), bar = el.querySelector(bId);
    if (val) val.textContent = `−${Math.round(s.depth)}%`;
    if (bar) bar.style.width = `${(s.depth / 30) * 100}%`;
  } else if (modId === 'heat') {
    const vId = isRight ? '#heat-val-r' : '#heat-val';
    const val = el.querySelector(vId);
    if (val) val.innerHTML = `${Math.round(s.heat)} <small style="font-size:11px">kW/m²</small>`;
  } else if (modId === 'brk') {
    const b0 = mg(s, t)[0];
    const vId = isRight ? '#brk-val-r' : '#brk-val', bId = isRight ? '#brk-bar-r' : '#brk-bar', sId = isRight ? '#brk-sub-r' : '#brk-sub';
    const val = el.querySelector(vId), bar = el.querySelector(bId), sub = el.querySelector(sId);
    if (val) {
      val.textContent = b0.v;
      val.style.color = b0.s === 2 ? 'var(--cr)' : b0.s === 1 ? 'var(--wn)' : 'var(--tx)';
    }
    if (bar) {
      bar.style.width = b0.p + '%';
      bar.style.background = b0.s === 2 ? 'var(--cr)' : b0.s === 1 ? 'var(--wn)' : 'var(--ac)';
    }
    if (sub) sub.textContent = b0.s === 2 ? L('不足', 'CRITICAL') : b0.s === 1 ? L('偏低', 'LOW') : L('充足', 'NOMINAL');
  } else if (modId === 'verdict') {
    const bad = s.pg > 4.5 || short;
    const vId = isRight ? '#vd-val-r' : '#vd-val';
    const val = el.querySelector(vId);
    if (val) {
      val.textContent = bad ? L('坠毁', 'LOST') : L('成功', 'LANDED');
      val.style.color = bad ? 'var(--cr)' : 'var(--ac)';
    }
  } else if (modId === 'q') {
    const vId = isRight ? '#q-val-r' : '#q-val', bId = isRight ? '#q-bar-r' : '#q-bar';
    const val = el.querySelector(vId), bar = el.querySelector(bId);
    if (val) val.innerHTML = `${s.q.toFixed(1)} <small style="font-size:11px">kPa</small>`;
    if (bar) bar.style.width = cl(s.q / 30 * 100, 0, 100) + '%';
  } else if (modId === 'mach') {
    const vId = isRight ? '#mach-val-r' : '#mach-val', bId = isRight ? '#mach-bar-r' : '#mach-bar', sId = isRight ? '#mach-sub-r' : '#mach-sub';
    const val = el.querySelector(vId), bar = el.querySelector(bId), sub = el.querySelector(sId);
    if (val) val.textContent = `M ${s.M.toFixed(2)}`;
    if (bar) bar.style.width = cl(s.M / 8 * 100, 0, 100) + '%';
    if (sub) sub.textContent = s.M > 1 ? L('超声速', 'SUPERSONIC') : L('亚声速', 'SUBSONIC');
  } else if (modId === 'cd') {
    const isTrans = Math.abs(s.M - 1.1) < .28;
    const vId = isRight ? '#cd-val-r' : '#cd-val', bId = isRight ? '#cd-bar-r' : '#cd-bar', sId = isRight ? '#cd-sub-r' : '#cd-sub';
    const val = el.querySelector(vId), bar = el.querySelector(bId), sub = el.querySelector(sId);
    if (val) val.textContent = s.Cd.toFixed(3) + (isTrans ? ' ▲' : '');
    if (bar) bar.style.width = cl(s.Cd / 0.9 * 100, 0, 100) + '%';
    if (sub) sub.textContent = isTrans ? L('跨声速峰', 'Transonic Peak') : L('正常气动', 'Nominal');
  } else if (modId === 'margin') {
    const m0 = mg(s, t)[0];
    const vId = isRight ? '#mg-val-r' : '#mg-val', bId = isRight ? '#mg-bar-r' : '#mg-bar', sId = isRight ? '#mg-sub-r' : '#mg-sub';
    const val = el.querySelector(vId), bar = el.querySelector(bId), sub = el.querySelector(sId);
    if (val) val.textContent = m0.v;
    if (bar) {
      bar.style.width = m0.p + '%';
      bar.style.background = m0.s === 2 ? 'var(--cr)' : m0.s === 1 ? 'var(--wn)' : 'var(--ac)';
    }
    if (sub) sub.textContent = L(m0.z, m0.e);
  }
}

function updateRightZone(s) {
  const wrap = $('rContentWrap');
  if (!wrap) return;

  const rHdr = $('rZoneHdr');
  if (rHdr) {
    rHdr.textContent = t < 156 ? L('一级飞行细节 · FLIGHT DETAIL', 'STAGE 1 FLIGHT DETAIL') : L('二级动力细节 · STAGE 2 DETAIL', 'STAGE 2 PROP & FLIGHT');
  }
  const lHdr = $('lZoneHdr');
  if (lHdr) {
    lHdr.textContent = t < 156 ? L('一级箭体 · STAGE 1', 'STAGE 1') : L('一级返回状态 · BOOSTER RECOVERY', 'BOOSTER RECOVERY');
  }

  const isDefaultOrAuto = userLayout.preset === 'default' || (userLayout.right[0].mode === 'auto' && userLayout.right[1].mode === 'auto');
  const mode = isDefaultOrAuto ? (t < 156 ? 's1d' : 's2') : ('custom-' + userLayout.preset + '-' + userLayout.right.map(r => r.widget).join('-'));

  if (mode !== lastRightMode) {
    if (isDefaultOrAuto) {
      if (mode === 's1d') {
        wrap.innerHTML = `
          <div class="dash-cards-row" id="mod-s1d">
            <!-- 小部件 1: 推力 (Thrust Widget) -->
            <div class="dash-card ctx-mod" id="card-s1d-thrust">
              <div class="ctx-title">${L('推力', 'THRUST')}</div>
              <div class="ctx-val" id="s1d-thrust">0<small> kN</small></div>
              <div class="ctx-bar">
                <div class="ctx-bar-fill" id="s1d-thrust-bar" style="width:0%"></div>
              </div>
              <div class="ctx-sub" id="s1d-thrust-sub">${L('9台合力', '9 ENGINES')}</div>
            </div>

            <!-- 小部件 2: 马赫 (Mach Widget) -->
            <div class="dash-card ctx-mod" id="card-s1d-mach">
              <div class="ctx-title">${L('马赫', 'MACH')}</div>
              <div class="ctx-val" id="s1d-mach">0.00</div>
              <div class="ctx-bar">
                <div class="ctx-bar-fill" id="s1d-mach-bar" style="width:0%"></div>
                <div class="ctx-tick" style="left:18%;background:var(--wn)" title="Mach 1 音障"></div>
              </div>
              <div class="ctx-sub" id="s1d-mach-sub">${L('亚音速', 'SUBSONIC')}</div>
            </div>

            <!-- 小部件 3: 动压 Q (Dynamic Pressure Q Widget) -->
            <div class="dash-card ctx-mod ${t >= 64 && t < 92 ? 'card-highlight-q highlight-q' : ''}" id="s1d-q-box">
              <div class="ctx-title">${L('动压 Q', 'DYN. Q')}</div>
              <div class="ctx-val" id="s1d-q">0.0<small> kPa</small></div>
              <div class="ctx-bar">
                <div class="ctx-bar-fill" id="s1d-q-bar" style="width:0%"></div>
                <div class="ctx-tick" style="left:75%;background:var(--cr)" title="Max-Q 极限"></div>
              </div>
              <div class="ctx-sub" id="s1d-q-sub">${L('峰值', 'PEAK')}</div>
            </div>

            <!-- 小部件 4: 阻力 CD (Drag Coefficient Widget) -->
            <div class="dash-card ctx-mod" id="card-s1d-cd">
              <div class="ctx-title">${L('阻力 CD', 'DRAG CD')}</div>
              <div class="ctx-val" id="s1d-cd">0.300</div>
              <div class="ctx-bar">
                <div class="ctx-bar-fill" id="s1d-cd-bar" style="width:33%"></div>
              </div>
              <div class="ctx-sub" id="s1d-cd-sub">${L('气动阻力', 'DRAG')}</div>
            </div>
          </div>`;
      } else {
        wrap.innerHTML = `
          <div class="s2-badge-flash">STAGE 2</div>
          <div class="s2-group" id="mod-eng2">
            <div class="mvac-svg-box" id="mvacSvgBox"></div>
            <div class="s2-info">
              <div class="s2-title-row">
                <span class="lb">${L('二级发动机 (MVac)', 'STAGE 2 MVAC')}</span>
                <span class="sim-badge">SIM</span>
              </div>
              <div class="s2-status" id="s2-stat">待命 / STANDBY</div>
              <div class="s2-chk-list" id="s2-chk">
                <div id="chk1">○ ${L('MECO 确认 (t=150s)', 'MECO Confirmed')}</div>
                <div id="chk2">○ ${L('分离指令 (t=152s)', 'Sep Command')}</div>
                <div id="chk3">○ ${L('分离确认 (t=156s)', 'Stage Sep Confirmed')}</div>
                <div id="chk4">○ ${L('SES-1 点火 (t=162s)', 'SES-1 Ignition')}</div>
              </div>
            </div>
            <div class="prop2-card" id="mod-prop2">
              <div class="prop-hdr">
                <span class="lb">${L('二级推进', 'S2 PROP')}</span>
                <span class="sim-badge">SIM</span>
              </div>
              <div class="prop-bar-box">
                <div class="prop-bar-fill" id="p2-fill" style="width:100%"></div>
              </div>
              <div class="prop-margin" id="p2-pct">100.0%</div>
            </div>
          </div>`;
        buildMvacRing($('mvacSvgBox'));
      }
    } else {
      // 自定义右侧槽位布局
      let html = '';
      userLayout.right.forEach(slot => {
        const w = slot.widget;
        if (w === 's1d') {
          html += `
            <div class="s1d-grid" id="mod-s1d" style="flex:1">
              <div class="s1d-cell"><span class="lb">${L('推力', 'THRUST')}</span><span class="m" id="s1d-thrust">0 kN</span></div>
              <div class="s1d-cell"><span class="lb">${L('马赫', 'MACH')}</span><span class="m" id="s1d-mach">0.00</span></div>
              <div class="s1d-cell" id="s1d-q-box">
                <span class="lb">${L('动压 Q', 'DYN. Q')}</span>
                <span class="m" id="s1d-q">0.0 kPa</span>
                <span class="sub">${L('峰值 26.9', 'Peak 26.9')}</span>
              </div>
              <div class="s1d-cell"><span class="lb">${L('阻力系数 Cd', 'DRAG CD')}</span><span class="m" id="s1d-cd">0.300</span></div>
            </div>`;
        } else if (w === 'eng2') {
          html += `
            <div class="s2-group" id="mod-eng2" style="flex:1">
              <div class="mvac-svg-box" id="mvacSvgBox"></div>
              <div class="s2-info">
                <div class="s2-title-row">
                  <span class="lb">${L('二级发动机', 'STAGE 2')}</span>
                  <span class="sim-badge">SIM</span>
                </div>
                <div class="s2-status" id="s2-stat" style="font-size:11px">STANDBY</div>
              </div>
            </div>`;
        } else if (w === 'prop2') {
          html += `
            <div class="prop2-card" id="mod-prop2" style="width:90px">
              <div class="prop-hdr">
                <span class="lb">${L('二级推进', 'S2 PROP')}</span>
                <span class="sim-badge">SIM</span>
              </div>
              <div class="prop-bar-box">
                <div class="prop-bar-fill" id="p2-fill" style="width:100%"></div>
              </div>
              <div class="prop-margin" id="p2-pct">100.0%</div>
            </div>`;
        } else if (w !== 'none') {
          html += `<div class="ctx-mod" id="mod-${w}-r">${buildModHtml(w, s, true)}</div>`;
        }
      });
      wrap.innerHTML = html;
      if ($('mvacSvgBox')) buildMvacRing($('mvacSvgBox'));
    }
    lastRightMode = mode;
  }

  // 更新当前右侧区域内部数值
  if ($('mod-s1d')) {
    const th = $('s1d-thrust'), ma = $('s1d-mach'), qBox = $('s1d-q-box'), qVal = $('s1d-q'), cd = $('s1d-cd');
    if (th) th.innerHTML = Math.round(s.kN).toLocaleString() + '<small> kN</small>';
    const thBar = $('s1d-thrust-bar');
    if (thBar) thBar.style.width = Math.min(100, (s.kN / 7607) * 100).toFixed(1) + '%';
    
    if (ma) ma.innerHTML = s.M.toFixed(2);
    const maBar = $('s1d-mach-bar');
    if (maBar) maBar.style.width = Math.min(100, (s.M / 5.5) * 100).toFixed(1) + '%';
    const maSub = $('s1d-mach-sub');
    if (maSub) maSub.textContent = s.M >= 1.0 ? L('超音速', 'SUPERSONIC') : L('亚音速', 'SUBSONIC');

    if (qVal) qVal.innerHTML = s.q.toFixed(1) + '<small> kPa</small>';
    const qBar = $('s1d-q-bar');
    if (qBar) qBar.style.width = Math.min(100, (s.q / 30.0) * 100).toFixed(1) + '%';
    const isQPeak = t >= 64 && t < 92;
    if (qBox) {
      qBox.classList.toggle('highlight-q', isQPeak);
      qBox.classList.toggle('card-highlight-q', isQPeak);
    }
    const qSub = $('s1d-q-sub');
    if (qSub) qSub.textContent = isQPeak ? L('Max-Q 峰值', 'MAX-Q PEAK') : L('动压载荷', 'DYNAMIC LOAD');

    const isTrans = Math.abs(s.M - 1.1) < .28;
    if (cd) cd.innerHTML = s.Cd.toFixed(2) + (isTrans ? ' ▲' : '');
    const cdBar = $('s1d-cd-bar');
    if (cdBar) cdBar.style.width = Math.min(100, (s.Cd / 0.85) * 100).toFixed(1) + '%';
    const cdSub = $('s1d-cd-sub');
    if (cdSub) cdSub.textContent = isTrans ? L('跨音速峰', 'TRANSONIC') : L('气动阻力', 'DRAG');
  }
  if ($('mod-eng2')) {
    const s2 = getStage2State(t);
    const stat = $('s2-stat'), plm = $('c_s2_plume'), core = $('c_s2_core');
    if (stat) stat.textContent = L(s2.statusTextZh, s2.statusTextEn);
    if (plm) plm.style.opacity = s2.plumeOp;
    if (core) core.setAttribute('fill', s2.thrust > 0 ? '#4FD1FF' : 'transparent');

    const c1 = $('chk1'), c2 = $('chk2'), c3 = $('chk3'), c4 = $('chk4');
    if (c1) { c1.className = t >= 150 ? 'done' : ''; c1.innerHTML = (t >= 150 ? '✓ ' : '○ ') + L('MECO 确认', 'MECO Verified'); }
    if (c2) { c2.className = t >= 152 ? 'done' : ''; c2.innerHTML = (t >= 152 ? '✓ ' : '○ ') + L('分离指令', 'Sep Command'); }
    if (c3) { c3.className = t >= 156 ? 'done' : ''; c3.innerHTML = (t >= 156 ? '✓ ' : '○ ') + L('分离确认', 'Stage Sep'); }
    if (c4) { c4.className = t >= 162 ? 'done' : ''; c4.innerHTML = (t >= 162 ? '✓ ' : '○ ') + L('SES-1 点火 (934 kN)', 'SES-1 (934 kN)'); }
  }
  if ($('mod-prop2')) {
    const s2 = getStage2State(t);
    const p2Fill = $('p2-fill'), p2Pct = $('p2-pct');
    if (p2Fill) p2Fill.style.width = s2.pr2.toFixed(1) + '%';
    if (p2Pct) p2Pct.textContent = s2.pr2.toFixed(1) + '%';
  }
  // 更新自定义右侧槽位中的小部件
  if (!isDefaultOrAuto) {
    userLayout.right.forEach(slot => {
      const w = slot.widget;
      if (!['s1d', 'eng2', 'prop2', 'none'].includes(w)) {
        const el = $(`mod-${w}-r`);
        if (el) updModHtml(w, el, s, true);
      }
    });
  }
}


// ==================== 线性时间轴渲染 ====================
