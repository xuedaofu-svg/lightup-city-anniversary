(() => {
  'use strict';
  const main = document.getElementById('home');
  const layerRoot = document.getElementById('layers');
  const feedback = document.getElementById('feedback');
  const key = 'lynk-city-lightup-h5-v1';
  const catalog = window.CityLocations;
  const shanghai = catalog?.get('CN-SH') || {id: 'CN-SH', name: '上海', en: 'Shanghai'};
  const state = {lit: false, litAt: null, poster: null, location: shanghai, territoryJoined: false, joinedTerritoryId: null};
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '{}');
    if (saved && typeof saved === 'object') {
      state.lit = saved.lit === true;
      state.litAt = saved.litAt || null;
      state.location = catalog?.get(saved.location?.id) || shanghai;
      state.joinedTerritoryId = catalog?.get(saved.joinedTerritoryId)?.id
        || (saved.territoryJoined === true ? state.location.id : null);
      state.territoryJoined = state.joinedTerritoryId === state.location.id;
      if (state.lit && window.PosterUI.isValidMessage(saved.poster?.message)) {
        state.poster = {...saved.poster, message: window.PosterUI.normalizeMessage(saved.poster.message)};
      }
    }
  } catch { /* A fresh tab can run the prototype even without browser storage. */ }

  const layers = [];
  let cleanupHome;
  let dirty = true;
  let savedScroll = 0;
  let toastTimer;
  let releasingGate = false;
  const gateFlag = 'lynkCityModal';

  function persist() {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch { /* The session stays usable. */ }
    dirty = true;
  }
  function toast(message) {
    feedback.textContent = String(message);
    feedback.classList.add('active');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { feedback.classList.remove('active'); }, 1500);
  }
  function drawHome() {
    if (!dirty) return;
    if (typeof cleanupHome === 'function') cleanupHome();
    main.replaceChildren();
    cleanupHome = window.renderHome(main, api);
    dirty = false;
  }
  function syncVisibility() {
    main.inert = layers.length > 0;
    document.body.classList.toggle('has-layer', layers.length > 0);
    // Underlying screens remain visible through a transparent sheet backdrop.
    layers.forEach((layer, index) => {
      layer.element.inert = index !== layers.length - 1;
      if (index === layers.length - 1) layer.element.removeAttribute('aria-hidden');
      else layer.element.setAttribute('aria-hidden', 'true');
    });
  }
  function pushGate() {
    if (!history.state?.[gateFlag]) history.pushState({[gateFlag]: true}, '');
  }
  function releaseGateWhenIdle() {
    queueMicrotask(() => {
      if (!layers.length && history.state?.[gateFlag] && !releasingGate) {
        releasingGate = true;
        history.back();
      }
    });
  }
  function popLayer() {
    const old = layers.pop();
    if (!old) return;
    old.onDispose?.();
    old.element.remove();
    syncVisibility();
    if (!layers.length) {
      drawHome();
      window.scrollTo({top: savedScroll, behavior: 'instant'});
    }
    if (old.origin?.isConnected && !old.origin.closest('[inert]')) {
      old.origin.focus({preventScroll: true});
    }
  }
  function close() {
    popLayer();
    releaseGateWhenIdle();
  }
  function requestClose() {
    if (!layers.at(-1)?.onBack?.()) close();
  }
  function home() {
    while (layers.length) popLayer();
    drawHome();
    releaseGateWhenIdle();
  }
  function show(html, options = {}) {
    const origin = document.activeElement;
    if (!layers.length) savedScroll = window.scrollY;
    if (options.replace && layers.length) {
      const replaced = layers.pop();
      replaced.onDispose?.();
      replaced.element.remove();
    }
    const element = document.createElement('div');
    element.className = 'app-layer' + (options.sheet ? ' app-layer--sheet' : options.modal ? ' app-layer--modal' : '');
    const surface = document.createElement('section');
    surface.className = 'app-layer__surface';
    surface.setAttribute('role', 'dialog');
    surface.setAttribute('aria-modal', 'true');
    surface.tabIndex = -1;
    surface.innerHTML = html;
    surface.setAttribute('aria-label', surface.querySelector('h1,h2,h3')?.textContent?.trim() || options.title || '活动详情');
    element.append(surface);
    layerRoot.append(element);
    layers.push({element, origin, onBack: options.onBack, onDispose: options.onDispose});
    if (options.modal || options.sheet) element.addEventListener('click', e => {
      if (e.target === element && element === layers.at(-1)?.element) requestClose();
    });
    syncVisibility();
    pushGate();
    surface.focus({preventScroll: true});
    return surface;
  }
  window.addEventListener('popstate', () => {
    if (releasingGate) releasingGate = false;
    else if (layers.length && !layers.at(-1).onBack?.()) popLayer();
    if (layers.length) pushGate();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && layers.length) { e.preventDefault(); requestClose(); }
    if (e.key !== 'Tab' || !layers.length) return;
    const focusable = [...layers.at(-1).element.querySelectorAll('button:not(:disabled), a[href], textarea, input, [tabindex="0"]')]
      .filter(n => n.getClientRects().length);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  function ask(title, message, confirmLabel, confirm) {
    const surface = show('<div class="app-question"><h2></h2><p></p><button data-ok type="button"></button><button data-cancel type="button">再逛逛</button></div>', {modal: true, title});
    surface.setAttribute('aria-label', title);
    surface.querySelector('h2').textContent = title;
    surface.querySelector('p').textContent = message;
    surface.querySelector('[data-ok]').textContent = confirmLabel;
    surface.querySelector('[data-cancel]').onclick = close;
    surface.querySelector('[data-ok]').onclick = () => { close(); confirm(); };
  }
  function goToLight() {
    home();
    main.querySelector('[data-ignite-city]')?.scrollIntoView({block: 'center', behavior: 'auto'});
    main.querySelector('[data-ignite-city]')?.click();
  }
  function ownWish() {
    home();
    if (state.poster) return window.PosterUI.view(api, 'mine');
    if (state.lit) return window.PosterUI.edit(api);
    ask('先点亮你的城市', '点亮后，即可制作属于你的十周年祝福海报。', '去点亮', goToLight);
  }
  const api = {
    state, show, close, home, toast, ownWish,
    prepareIgnite() {
      const light = () => main.dispatchEvent(new Event('lightup:confirmed'));
      if (!catalog) {
        ask('点亮我的城市', '当前位置为上海，点亮后即可领取十周年限定勋章。', '点亮上海', light);
        return;
      }
      catalog.open({
        current: state.location, show, close, light,
        save(location) {
          state.location = location;
          state.territoryJoined = state.joinedTerritoryId === location.id;
          persist();
          drawHome();
        }
      });
    },
    ignite() {
      if (!state.lit) {
        state.lit = true;
        state.litAt = new Date().toISOString();
        persist();
      }
      window.ExtraUI.success(api);
    },
    savePoster(poster) {
      if (!state.lit || state.poster || !window.PosterUI.isValidMessage(poster?.message)) return false;
      state.poster = {...poster, message: window.PosterUI.normalizeMessage(poster.message)};
      persist();
      return true;
    },
    openPoster(who) {
      if (who === 'mine' && !state.poster) return ownWish();
      return window.PosterUI.view(api, who);
    },
    invite() {
      if (state.poster) return window.PosterUI.share(api);
      if (!state.lit) return ownWish();
      ask('留下祝福并分享', '制作你的十周年祝福海报，邀请好友一起点亮城市。', '制作祝福海报', ownWish);
    },
    prizes() { return window.ExtraUI.prizes(api); },
    rules() { return window.ExtraUI.rules(api); },
    territory() { return window.ExtraUI.territory(api); },
    joinTerritory() {
      state.territoryJoined = true;
      state.joinedTerritoryId = state.location.id;
      persist();
      home();
      toast('已加入' + state.location.name + '领地');
    },
    goToLight,
    back() {
      if (layers.length) return close();
      if (document.referrer && history.length > 1) { history.back(); return; }
      if (window.scrollY > 0) window.scrollTo({top: 0, behavior: 'smooth'});
      else toast('已在活动首页');
    }
  };
  if (history.state?.[gateFlag]) history.replaceState(null, '');
  drawHome();
  window.PosterUI.openShared?.(api);
})();
