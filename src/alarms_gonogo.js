// Alarm Engine (Section 8.1) and GO/NO-GO Board with Auto-Polling (Section 8.2)
module.exports = `
// ==================== 报警引擎 (Section 8.1) ====================
let isStale = false;
let testStaleForced = false;
let rngOverrideGo = true;
let wxOverrideGo = true;

const Alarms = (function() {
  const alarms = []; // 所有报警记录
  const lastTriggered = {}; // { rule: wallTime } 5秒防抖
  const clearTimers = {}; // { id: wallTime } 2秒回差清除
  const triggerHistory = []; // 用于 10秒内 >10条报警泛滥检测
  let outOfBandStartTime = null;

  function evaluate(s, curT, wallNow) {
    const activeRules = [];
    const margins = mg(s, curT);
    const pm = (s.pr - getNeed(curT, s.alt)) * 5.2;
    const br = margins[0].r;
    const ca = margins[2].p;
    const planned = planSet(curT);
    const failedPlanned = planned.filter(i => fl[i]);
    const anyFailed = failedPlanned.length > 0;

    // A01 发动机故障
    if (anyFailed) {
      const isCrit = failedPlanned.length >= 3 || (curT >= 395 && fl[0]);
      activeRules.push({
        rule: 'A01', priority: isCrit ? 1 : 2, root: 'ENG',
        msg: { zh: \`一级发动机 \${failedPlanned.join(',')} 故障\`, en: \`S1 Engine \${failedPlanned.join(',')} failed\` },
        advice: { zh: '检查推力与推重比', en: 'Check thrust & TWR' }, respondWithin: 10
      });
    }

    // A02 控制权限低 (<50% P3, <30% P2)
    if (ca < 30) {
      activeRules.push({
        rule: 'A02', priority: 2, root: anyFailed ? 'ENG' : 'GNC',
        msg: { zh: \`控制权限极低 (\${Math.round(ca)}%)\`, en: \`Critical low control auth (\${Math.round(ca)}%)\` },
        advice: { zh: '评估姿态余量', en: 'Assess attitude margin' }, respondWithin: 15
      });
    } else if (ca < 50) {
      activeRules.push({
        rule: 'A02', priority: 3, root: anyFailed ? 'ENG' : 'GNC',
        msg: { zh: \`控制权限偏低 (\${Math.round(ca)}%)\`, en: \`Low control auth (\${Math.round(ca)}%)\` },
        advice: { zh: '评估姿态余量', en: 'Assess attitude margin' }, respondWithin: 15
      });
    }

    // A03 推进剂余量 (<5t P3, <0 P1)
    if (pm < 0) {
      activeRules.push({
        rule: 'A03', priority: 1, root: 'PROP',
        msg: { zh: \`推进剂透支 (\${pm.toFixed(1)} t)\`, en: \`Propellant deficit (\${pm.toFixed(1)} t)\` },
        advice: { zh: '评估回收预留', en: 'Assess recovery reserve' }, respondWithin: 10
      });
    } else if (pm < 5) {
      activeRules.push({
        rule: 'A03', priority: 3, root: 'PROP',
        msg: { zh: \`推进剂余量偏低 (\${pm.toFixed(1)} t)\`, en: \`Low prop reserve (\${pm.toFixed(1)} t)\` },
        advice: { zh: '评估回收预留', en: 'Assess recovery reserve' }, respondWithin: 10
      });
    }

    // A04 过载 (>=5.5G P1, >=4.5G P3)
    if (s.nG >= nG_crit) {
      activeRules.push({
        rule: 'A04', priority: 1, root: 'LOAD',
        msg: { zh: \`临界超载 (\${s.nG.toFixed(1)} G)\`, en: \`Critical overload (\${s.nG.toFixed(1)} G)\` },
        advice: { zh: '评估节流', en: 'Assess throttle' }, respondWithin: 5
      });
    } else if (s.nG >= nG_caution) {
      activeRules.push({
        rule: 'A04', priority: 3, root: 'LOAD',
        msg: { zh: \`过载注意 (\${s.nG.toFixed(1)} G)\`, en: \`High overload (\${s.nG.toFixed(1)} G)\` },
        advice: { zh: '评估节流', en: 'Assess throttle' }, respondWithin: 5
      });
    }

    // A05 动压 (>1.5x P2, >1.25x P3)
    if (s.q > q_crit) {
      activeRules.push({
        rule: 'A05', priority: 2, root: 'LOAD',
        msg: { zh: \`动压超限 (\${s.q.toFixed(1)} kPa)\`, en: \`Critical Dyn. Q (\${s.q.toFixed(1)} kPa)\` },
        advice: { zh: '评估节流', en: 'Assess throttle' }, respondWithin: 10
      });
    } else if (s.q > q_caution) {
      activeRules.push({
        rule: 'A05', priority: 3, root: 'LOAD',
        msg: { zh: \`动压偏高 (\${s.q.toFixed(1)} kPa)\`, en: \`High Dyn. Q (\${s.q.toFixed(1)} kPa)\` },
        advice: { zh: '评估节流', en: 'Assess throttle' }, respondWithin: 10
      });
    }

    // A06 热流 (>1.5x P2, >1.25x P3)
    if (s.heat > heat_crit) {
      activeRules.push({
        rule: 'A06', priority: 2, root: 'LOAD',
        msg: { zh: \`极高热流 (\${Math.round(s.heat)} kW/m²)\`, en: \`Critical heat flux (\${Math.round(s.heat)} kW/m²)\` },
        advice: { zh: '评估再入姿态', en: 'Assess reentry attitude' }, respondWithin: 10
      });
    } else if (s.heat > heat_caution) {
      activeRules.push({
        rule: 'A06', priority: 3, root: 'LOAD',
        msg: { zh: \`热流注意 (\${Math.round(s.heat)} kW/m²)\`, en: \`High heat flux (\${Math.round(s.heat)} kW/m²)\` },
        advice: { zh: '评估再入姿态', en: 'Assess reentry attitude' }, respondWithin: 10
      });
    }

    // A07 制动余量 (<0 P1, <50m P2, <150m P3)
    if (br != null) {
      if (br < 0) {
        activeRules.push({
          rule: 'A07', priority: 1, root: 'REC',
          msg: { zh: \`制动余量透支 (\${Math.round(br)} m)\`, en: \`Negative brake margin (\${Math.round(br)} m)\` },
          advice: { zh: '保持满推力', en: 'Maintain full thrust' }, respondWithin: 5
        });
      } else if (br < 50 && s.alt > 100) {
        activeRules.push({
          rule: 'A07', priority: 2, root: 'REC',
          msg: { zh: \`制动余量极低 (\${Math.round(br)} m)\`, en: \`Low brake margin (\${Math.round(br)} m)\` },
          advice: { zh: '保持满推力', en: 'Maintain full thrust' }, respondWithin: 5
        });
      } else if (br < 150 && s.alt > 200) {
        activeRules.push({
          rule: 'A07', priority: 3, root: 'REC',
          msg: { zh: \`制动余量注意 (\${Math.round(br)} m)\`, en: \`Brake margin caution (\${Math.round(br)} m)\` },
          advice: { zh: '评估着陆点火', en: 'Assess landing burn' }, respondWithin: 5
        });
      }
    }

    // A08 轨迹偏差 (持续 >3s 出带 P3, 出 2倍带 P2)
    const s_nom = S_nom(curT);
    const band_h = Math.max(300, s_nom.alt * 0.05);
    const band_v = Math.max(20, s_nom.v * 0.04);
    const isOut = Math.abs(s.e_h) > band_h || Math.abs(s.e_v) > band_v;
    const isOut2x = Math.abs(s.e_h) > band_h * 2 || Math.abs(s.e_v) > band_v * 2;
    if (isOut) {
      if (outOfBandStartTime == null) outOfBandStartTime = curT;
      if (curT - outOfBandStartTime >= 3.0) {
        activeRules.push({
          rule: 'A08', priority: isOut2x ? 2 : 3, root: 'FIDO',
          msg: { zh: \`轨迹偏差超出容差带 (\${s.e_v < 0 ? 'Δv ' + Math.round(s.e_v) + ' m/s' : 'Δh ' + Math.round(s.e_h) + ' m'})\`, en: \`Trajectory out of tolerance (\${Math.round(s.e_v)} m/s)\` },
          advice: { zh: '评估落点', en: 'Assess impact point' }, respondWithin: 20
        });
      }
    } else {
      outOfBandStartTime = null;
    }

    // A09 预测触地过载 (>4.5G P2)
    if (curT >= 330 && s.pg > 4.5) {
      activeRules.push({
        rule: 'A09', priority: 2, root: 'REC',
        msg: { zh: \`预测触地过载超限 (\${s.pg.toFixed(1)} G)\`, en: \`Predicted touchdown G high (\${s.pg.toFixed(1)} G)\` },
        advice: { zh: '检查缓冲行程', en: 'Check stroke' }, respondWithin: 10
      });
    }

    // A10 数据过期 (STALE P2)
    if (isStale) {
      activeRules.push({
        rule: 'A10', priority: 2, root: 'DATA',
        msg: { zh: '数据链路中断 (STALE)', en: 'Telemetry link stale' },
        advice: { zh: '检查数据链路', en: 'Check data link' }, respondWithin: 5
      });
    }

    // A11 ABORT (P1)
    if (ab) {
      activeRules.push({
        rule: 'A11', priority: 1, root: 'ABORT',
        msg: { zh: '飞行中止序列已触发', en: 'Abort sequence triggered' },
        advice: { zh: '执行终止规程', en: 'Execute termination' }, respondWithin: 0
      });
    }

    // A12 席位 NO-GO (点名期间或点名结果)
    const pollInfo = GoNoGo.getPollInfo();
    if (pollInfo.pollActive || (pollInfo.pollSummary && pollInfo.pollSummary.includes('NO-GO'))) {
      const seatStates = GoNoGo.getStates(s, curT);
      const evaluated = pollInfo.pollActive ? Array.from(pollInfo.pollEvaluatedSeats) : Object.keys(seatStates);
      const noGoSeats = evaluated.filter(st => !seatStates[st].go);
      if (noGoSeats.length > 0) {
        activeRules.push({
          rule: 'A12', priority: 3, root: noGoSeats[0],
          msg: { zh: \`席位 \${noGoSeats.join('/')} NO-GO\`, en: \`Seat \${noGoSeats.join('/')} NO-GO\` },
          advice: { zh: '按席位提示处置', en: 'Follow seat guidance' }, respondWithin: 10
        });
      }
    }

    // 处理触发与根因合并 (§8.1)
    const activeRuleMap = new Map();
    activeRules.forEach(r => activeRuleMap.set(r.rule, r));

    activeRules.forEach(req => {
      const existing = alarms.find(a => a.root === req.root && a.state !== 'cleared');
      if (existing) {
        // 合并到已有根因项
        if (existing.rule !== req.rule) {
          existing.derivedCount = (existing.derivedCount || 0) + 1;
        }
        if (req.priority < existing.priority) {
          existing.priority = req.priority;
          existing.msg = req.msg;
          existing.advice = req.advice;
        }
        delete clearTimers[existing.id];
      } else {
        // 新报警：5 秒防抖 (首次触发无延迟)
        const lastT = lastTriggered[req.rule];
        if (lastT == null || wallNow - lastT >= 5000) {
          lastTriggered[req.rule] = wallNow;
          triggerHistory.push(wallNow);
          const newAlarm = {
            id: req.rule + '-' + req.root + '-' + Math.round(curT),
            rule: req.rule, priority: req.priority, root: req.root,
            state: 'active', tRaised: curT, tCleared: null,
            msg: req.msg, advice: req.advice, respondWithin: req.respondWithin,
            derivedCount: 0, createdAtWall: wallNow
          };
          alarms.unshift(newAlarm);
        }
      }
    });

    // 清除检查 (持续 2.0s 满足清除条件)
    alarms.forEach(a => {
      if (a.state === 'cleared') return;
      const isStillActive = activeRules.some(r => r.root === a.root);
      if (!isStillActive) {
        if (!clearTimers[a.id]) {
          clearTimers[a.id] = wallNow;
        } else if (wallNow - clearTimers[a.id] >= 2000) {
          a.state = 'cleared';
          a.tCleared = curT;
          delete clearTimers[a.id];
        }
      } else {
        delete clearTimers[a.id];
      }
    });

    // 报警泛滥保护: 10秒内 >10条
    const recentTriggers = triggerHistory.filter(tWall => wallNow - tWall <= 10000);
    const isFlooded = recentTriggers.length >= 10;

    return { alarms: alarms.filter(a => a.state !== 'cleared'), isFlooded };
  }

  function acknowledge(id) {
    const a = alarms.find(item => item.id === id);
    if (a && a.state === 'active') a.state = 'ack';
  }

  function reset() {
    alarms.length = 0;
    triggerHistory.length = 0;
    outOfBandStartTime = null;
    for (let k in lastTriggered) delete lastTriggered[k];
    for (let k in clearTimers) delete clearTimers[k];
  }

  function getActive() {
    return alarms.filter(a => a.state !== 'cleared');
  }

  return { evaluate, acknowledge, reset, getActive };
})();

// ==================== GO/NO-GO 席位板与点名 (Section 8.2) ====================
const GoNoGo = (function() {
  const SEATS = ['FIDO', 'GNC', 'PROP', 'LOAD', 'REC', 'RNG', 'WX'];
  let pollActive = false;
  let pollEventName = '';
  let pollStartSimT = 0;
  let pollSummary = '';
  const pollEvaluatedSeats = new Set();
  const pollCompletedEvents = new Set();

  function getStates(s, curT) {
    const s_nom = S_nom(curT);
    const band_h = Math.max(300, s_nom.alt * 0.05);
    const band_v = Math.max(20, s_nom.v * 0.04);
    const fidoGo = Math.abs(s.e_h) <= band_h && Math.abs(s.e_v) <= band_v;
    
    const margins = mg(s, curT);
    const gncGo = margins[2].p > 50;
    
    const planned = planSet(curT);
    const hasFailed = planned.some(i => fl[i]);
    const pm = (s.pr - getNeed(curT, s.alt)) * 5.2;
    const propGo = pm > 5 && !hasFailed;

    const loadGo = s.nG < nG_caution && s.q < q_caution && s.heat < heat_caution;
    const br = margins[0].r;
    const recGo = br == null ? true : (s.alt > 200 ? br > 150 : br >= 0);

    return {
      FIDO: { go: fidoGo, desc: fidoGo ? '轨迹名义' : '轨迹超带' },
      GNC: { go: gncGo, desc: gncGo ? '权限充足' : '权限偏低' },
      PROP: { go: propGo, desc: propGo ? '余量充足' : (hasFailed ? '引擎故障' : '推进剂低') },
      LOAD: { go: loadGo, desc: loadGo ? '载荷名义' : '载荷偏高' },
      REC: { go: recGo, desc: recGo ? '制动充足' : '余量偏低' },
      RNG: { go: rngOverrideGo, desc: rngOverrideGo ? '靶场净空' : '靶场不具备' },
      WX: { go: wxOverrideGo, desc: wxOverrideGo ? '气象良好' : '超限红线' }
    };
  }

  // 事件前 10s 自动点名检查 (§8.2)
  // MECO: 150s (poll 140s); Sep: 156s (poll 146s); Entry: 330s (poll 320s); Landing: 395s (poll 385s)
  const POLL_SCHEDULE = [
    { targetT: 150, pollT: 140, name: 'MECO' },
    { targetT: 156, pollT: 146, name: 'STAGE SEP' },
    { targetT: 330, pollT: 320, name: 'ENTRY' },
    { targetT: 395, pollT: 385, name: 'LANDING' }
  ];

  function updatePoll(s, curT) {
    if (!pollActive) {
      for (const item of POLL_SCHEDULE) {
        if (curT >= item.pollT && curT < item.targetT && !pollCompletedEvents.has(item.name)) {
          pollActive = true;
          pollEventName = item.name;
          pollStartSimT = curT;
          pollSummary = '';
          pollEvaluatedSeats.clear();
          break;
        }
      }
    }

    if (pollActive) {
      const elapsed = curT - pollStartSimT;
      // 席位每 400ms (0.4s) 依次点名
      const stepIdx = Math.floor(elapsed / 0.4);
      for (let i = 0; i <= stepIdx && i < SEATS.length; i++) {
        pollEvaluatedSeats.add(SEATS[i]);
      }
      if (stepIdx >= SEATS.length) {
        // 点名完成
        const states = getStates(s, curT);
        const bad = SEATS.filter(st => !states[st].go);
        pollSummary = bad.length === 0 ? L('全部 GO', 'ALL GO') : \`\${bad.join('/')} NO-GO\`;
        if (elapsed >= 5.0 || curT >= 428) {
          pollActive = false;
          pollCompletedEvents.add(pollEventName);
        }
      }
    }
  }

  function reset() {
    pollActive = false;
    pollEventName = '';
    pollStartSimT = 0;
    pollSummary = '';
    pollEvaluatedSeats.clear();
    pollCompletedEvents.clear();
  }

  function triggerManualPoll(name) {
    pollActive = true;
    pollEventName = name || 'MANUAL';
    pollStartSimT = t;
    pollSummary = '';
    pollEvaluatedSeats.clear();
  }

  return { getStates, updatePoll, reset, triggerManualPoll, isPolling: () => pollActive, getPollInfo: () => ({ pollActive, pollEventName, pollSummary, pollEvaluatedSeats }) };
})();
`;
