(() => {
  'use strict';

  // Keep the user's choice when the home screen is redrawn after lighting a city.
  let enabled = true;
  let permission = 'unknown';
  const clamp = value => Math.max(-1, Math.min(1, value));
  const degrees = Math.PI / 180;

  window.attachCityMotion = function attachCityMotion(city, button, api, primary) {
    const label = button.querySelector('[data-motion-label]');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const orientation = window.DeviceOrientationEvent;
    const requiresTap = typeof orientation?.requestPermission === 'function';
    const hasSensor = !!orientation && window.isSecureContext;
    let active = false, paused = false, visible = true, departed = false, destroyed = false;
    let neutral = null, waiting = false, sensorReady = false, requested = false;
    let sensorX = 0, sensorY = 0, targetX = 0, targetY = 0, x = 0, y = 0;
    let frame = 0, previousTime = 0, waitTimer = 0, pointer = null;
    let sweepTimer = 0, lastSweepPosition = 0;

    function updateSweep() {
      if (!primary) return;
      const position = clamp(x + y * 0.32);
      primary.style.setProperty('--sheen-x', (position * 47).toFixed(2) + '%');
      // Accumulate small movements, but keep the reflection quiet at rest.
      if (!active || Math.abs(position - lastSweepPosition) < 0.025) return;
      lastSweepPosition = position;
      primary.setAttribute('data-sweeping', '');
      clearTimeout(sweepTimer);
      sweepTimer = setTimeout(() => primary.removeAttribute('data-sweeping'), 175);
    }

    function paint() {
      city.style.setProperty('--city-x', (x * 3).toFixed(2) + 'px');
      city.style.setProperty('--city-y', (y * 3).toFixed(2) + 'px');
      city.style.setProperty('--pins-x', (x * 10).toFixed(2) + 'px');
      city.style.setProperty('--pins-y', (y * 10).toFixed(2) + 'px');
      updateSweep();
    }
    function step(now) {
      frame = 0;
      const elapsed = previousTime ? Math.min(now - previousTime, 64) : 16;
      previousTime = now;
      const gain = 1 - Math.exp(-elapsed / 75);
      x += (targetX - x) * gain;
      y += (targetY - y) * gain;
      if (Math.max(Math.abs(targetX - x), Math.abs(targetY - y)) > 0.003) {
        frame = requestAnimationFrame(step);
      } else {
        x = targetX; y = targetY; previousTime = 0;
      }
      paint();
    }
    function aim(nextX, nextY) {
      targetX = clamp(nextX); targetY = clamp(nextY);
      if (!frame && active && (x !== targetX || y !== targetY)) frame = requestAnimationFrame(step);
    }
    function clearPose() {
      cancelAnimationFrame(frame);
      frame = 0; previousTime = 0;
      sensorX = sensorY = targetX = targetY = x = y = 0;
      pointer = null;
      neutral = null;
      lastSweepPosition = 0;
      clearTimeout(sweepTimer);
      primary?.removeAttribute('data-sweeping');
      paint();
    }

    function renderControl() {
      let mode = 'drag', text = '拖动看景深', action = '关闭拖动景深';
      if (reduce.matches) {
        mode = 'reduced'; text = '动态已减弱'; action = text;
      } else if (requested) {
        mode = 'requesting'; text = '等待授权'; action = text;
      } else if (!enabled || (hasSensor && requiresTap && permission === 'unknown')) {
        mode = 'off';
        text = hasSensor && permission !== 'denied' ? '开启重力感应' : '开启拖动景深';
        action = text;
      } else if (sensorReady || waiting) {
        mode = sensorReady ? 'live' : 'waiting';
        text = sensorReady ? '重力感应已开' : '感应连接中';
        action = '关闭重力感应';
      }
      button.dataset.motionState = city.dataset.motionState = mode;
      if (label) label.textContent = text;
      button.title = action;
      button.disabled = reduce.matches || requested;
      button.setAttribute('aria-label', action);
      button.setAttribute('aria-pressed', String(['live','waiting','drag'].includes(mode)));
    }

    function onTilt(event) {
      if (!active || !Number.isFinite(event.beta) || !Number.isFinite(event.gamma)) return;
      // Compare the screen's facing direction with its axes at rest. This keeps
      // the same feel when the user starts upright, reclined or in landscape.
      const pitch = event.beta * degrees, roll = event.gamma * degrees;
      const yaw = (Number.isFinite(event.alpha) ? event.alpha : 0) * degrees;
      const cb = Math.cos(pitch), sb = Math.sin(pitch), cg = Math.cos(roll), sg = Math.sin(roll);
      const ca = Math.cos(yaw), sa = Math.sin(yaw);
      const nx = ca * sg + sa * sb * cg, ny = sa * sg - ca * sb * cg, nz = cb * cg;
      if (!neutral) {
        neutral = {
          right:[ca * cg - sa * sb * sg, sa * cg + ca * sb * sg, -cb * sg],
          top:[-sa * cb, ca * cb, sb]
        };
      }
      const project = axis => nx * axis[0] + ny * axis[1] + nz * axis[2];
      const side = Math.asin(clamp(project(neutral.right))) / degrees;
      const down = -Math.asin(clamp(project(neutral.top))) / degrees;
      const angle = (screen.orientation?.angle ?? window.orientation ?? 0) * degrees;
      sensorX = clamp((side * Math.cos(angle) + down * Math.sin(angle)) / 18);
      sensorY = clamp((down * Math.cos(angle) - side * Math.sin(angle)) / 18);
      if (!sensorReady) {
        clearTimeout(waitTimer);
        sensorReady = true; waiting = false;
        renderControl();
      }
      if (!pointer?.dragging) aim(sensorX, sensorY);
    }
    function syncActivity() {
      const next = !destroyed && enabled && !paused && visible && !departed && !document.hidden
        && !reduce.matches && !document.body.classList.contains('has-layer');
      if (next !== active) {
        active = next;
        window.removeEventListener('deviceorientation', onTilt);
        clearTimeout(waitTimer);
        clearPose();
        waiting = sensorReady = false;
        if (active && hasSensor && permission !== 'denied' && (!requiresTap || permission === 'granted')) {
          window.addEventListener('deviceorientation', onTilt, {passive:true});
          waiting = true;
          waitTimer = setTimeout(() => { waiting = false; renderControl(); }, 2500);
        }
      }
      renderControl();
    }

    async function toggle() {
      if (requested || reduce.matches) return;
      if (hasSensor && requiresTap && permission === 'unknown') {
        requested = true;
        renderControl();
        try {
          // Safari requires this call inside the original user-activation handler.
          permission = (await orientation.requestPermission()) === 'granted' ? 'granted' : 'denied';
        } catch { permission = 'denied'; }
        if (destroyed) return;
        requested = false;
        if (permission === 'denied') api.toast('可以左右拖动画面体验景深');
        enabled = true;
        active = false; // Restart using the newly resolved permission.
      } else {
        enabled = !enabled;
      }
      syncActivity();
    }
    function down(event) {
      if (!active || pointer || !event.isPrimary || event.button !== 0 || event.target.closest('button,a')) return;
      pointer = {id:event.pointerId, x:event.clientX, y:event.clientY, dragging:false};
    }
    function move(event) {
      if (!active || !pointer || event.pointerId !== pointer.id) return;
      const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
      if (!pointer.dragging) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 5) return;
        if (event.pointerType === 'touch' && Math.abs(dy) > Math.abs(dx)) {
          pointer = null; return;
        }
        pointer.dragging = true;
        city.setPointerCapture?.(event.pointerId);
      }
      aim(dx / 65, dy / 70);
    }
    function release(event) {
      if (pointer?.id !== event.pointerId) return;
      pointer = null; aim(sensorX, sensorY);
    }
    const resetAxis = () => { if (active) clearPose(); };
    const leave = () => { departed = true; syncActivity(); };
    const enter = () => { departed = false; syncActivity(); };
    const observer = new MutationObserver(syncActivity);
    observer.observe(document.body, {attributes:true, attributeFilter:['class']});
    const inView = new Set();
    const viewport = window.IntersectionObserver && new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) inView.add(entry.target);
        else inView.delete(entry.target);
      }
      visible = inView.size > 0;
      syncActivity();
    });
    viewport?.observe(city);
    if (primary) viewport?.observe(primary);
    const bindings = [
      [button,'click',toggle], [city,'pointerdown',down], [city,'pointermove',move],
      [window,'pointerup',release], [window,'pointercancel',release], [city,'lostpointercapture',release],
      [document,'visibilitychange',syncActivity], [window,'pagehide',leave], [window,'pageshow',enter],
      [window,'orientationchange',resetAxis]
    ];
    if (screen.orientation?.addEventListener) bindings.push([screen.orientation,'change',resetAxis]);
    for (const [el,type,fn] of bindings) el.addEventListener(type,fn,{passive:true});
    if (reduce.addEventListener) reduce.addEventListener('change',syncActivity);
    else reduce.addListener(syncActivity);
    syncActivity();
    return {
      pause() { paused = true; syncActivity(); },
      resume() { paused = false; syncActivity(); },
      destroy() {
        destroyed = true;
        observer.disconnect(); viewport?.disconnect();
        for (const [el,type,fn] of bindings) el.removeEventListener(type,fn);
        if (reduce.removeEventListener) reduce.removeEventListener('change',syncActivity);
        else reduce.removeListener(syncActivity);
        window.removeEventListener('deviceorientation',onTilt);
        clearTimeout(waitTimer); clearPose();
      }
    };
  };
})();
