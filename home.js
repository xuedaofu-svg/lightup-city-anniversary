(() => {
  'use strict';

  const stars = [
    [506, 1096, -0.32], [174, 540, -3.84], [619, 621, -1.76],
    [74, 677, -2.48], [537, 482, -1.03], [618, 760, -4.54], [142, 1020, -3.15]
  ];
  const profiles = {
    xiaoming: ['小明', '十周年快乐！', '浙江'],
    xingxing: ['星星', '一起点亮未来', '广东'],
    alex: ['Alex', 'Happy 10th', '德国']
  };
  const standings = [
    ['浙江', '12,580'], ['广东', '10,230'], ['上海', '8,960'], ['四川', '7,450'],
    ['北京', '6,890'], ['江苏', '6,120'], ['山东', '5,580'], ['湖北', '4,920'],
    ['福建', '4,380'], ['德国', '3,150']
  ];
  let ignitionModule;
  function loadIgnition() {
    if (!ignitionModule) {
      ignitionModule = import('./assets/home-ignite.mjs?v=city-location-1').catch(() => {
        ignitionModule = null;
        return null;
      });
    }
    return ignitionModule;
  }
  // The complete, approved hero travels with the first HTML response. Keep its
  // source through home re-renders (including returning from the success sheet).
  const firstPaintSrc = document.getElementById('home-first-paint')?.src || './assets/home-city.webp';

  function icon(name) {
    const paths = {
      back: '<path d="m14.5 4-8 8 8 8"/>',
      gift: '<rect x="3" y="8.7" width="18" height="4.7" rx="1.2"/><path d="M5 13.4v7h14v-7M12 8.7v11.7"/><path d="M12 8.8C9.1 9.3 5 7.9 5.5 5.2c.6-3.2 5.9-1.9 6.5 3.6Zm0 0c2.9.5 7-1 6.5-3.6-.6-3.2-5.9-1.9-6.5 3.6Z"/>',
      rules: '<rect x="4" y="2.8" width="16" height="18.4" rx="2.3"/><path d="M8 8h8m-8 4h8m-8 4h5"/>'
    };
    return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">' + paths[name] + '</svg>';
  }

  function makeTicker(container, state) {
    const hasMine = Boolean(state.poster && state.poster.message);
    const lanes = [
      ['xiaoming', 'xingxing', 'alex'],
      hasMine ? ['xiaoming', 'mine', 'xingxing', 'alex'] : ['xingxing', 'alex', 'xiaoming'],
      ['alex', 'xiaoming', 'xingxing']
    ];
    lanes.forEach((ids, laneIndex) => {
      const lane = document.createElement('div');
      lane.className = 'home-ticker-lane';
      const track = document.createElement('div');
      track.className = 'home-ticker-track';
      for (let copy = 0; copy < 4; copy++) {
        const group = document.createElement('div');
        group.className = 'home-ticker-group';
        if (copy) group.setAttribute('aria-hidden', 'true');
        ids.forEach(id => {
          const mine = id === 'mine';
          const [name, text, region] = mine
            ? ['我', state.poster.message.replace(/\s+/g, ' ').trim(), state.location?.name || '上海']
            : profiles[id];
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'home-tick' + (mine ? ' home-tick-mine' : '');
          button.dataset.posterId = id;
          button.setAttribute('aria-label', (mine ? '查看我的祝福海报' : '查看' + name + '的祝福海报') + '，' + text);
          if (copy) button.tabIndex = -1;
          const author = document.createElement('span');
          author.className = 'home-tick-author';
          author.textContent = mine ? '✦ 我' : name;
          const body = document.createElement('span');
          body.className = 'home-tick-body';
          body.textContent = text;
          const location = document.createElement('span');
          location.className = 'home-tick-region';
          location.textContent = region;
          button.append(author, body, location);
          group.appendChild(button);
        });
        track.appendChild(group);
      }
      lane.dataset.lane = String(laneIndex);
      lane.appendChild(track);
      container.appendChild(lane);
    });
  }

  // Pins in the approved artwork are measured on the uncropped 750-wide canvas.
  // Regions with an existing landmark reuse that star. Others use the open foreground.
  const regionPins = {'CN-SH':0, 'CN-ZJ':1, 'CN-GD':2, 'CN-BJ':3, GB:4, 'CN-FJ':6};
  const personalPin = [407,1061,-.48];
  function setPersonalPin(city, location, index, target) {
    if (index === 0) return;
    const pins = city.querySelector('.home-depth-pins');
    const image = pins.querySelector('img');
    const fallback = document.createElement('div');
    fallback.className = 'home-fallback-pins';
    city.querySelector('.home-city-image').after(fallback);
    // Remove just the old labels from the transparent, high-resolution pin layer.
    let holes = 'M531 896h182v46H531z';
    if (index !== undefined) {
      const [x,y] = target;
      holes += 'M'+(x+24)+' '+(y-178-22)+'h92v44h-92z';
    }
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1052"><path fill="white" fill-rule="evenodd" d="M0 0H750V1052H0Z'+holes+'"/></svg>';
    const mask = 'url("data:image/svg+xml,'+encodeURIComponent(svg)+'")';
    image.style.maskImage = mask;
    image.style.webkitMaskImage = mask;
    image.style.maskSize = image.style.webkitMaskSize = '100% 100%';

    function label(host, text, x, y, width, own) {
      const tag = document.createElement('span');
      tag.className = 'home-place-label' + (own ? ' is-personal' : '');
      tag.textContent = text;
      tag.title = text;
      tag.style.left = x/750*100+'%';
      tag.style.top = (y-178)/1052*100+'%';
      tag.style.width = width/750*100+'%';
      host.append(tag);
    }
    // The very first inline JPEG has baked-in labels. Cover its old personal pill
    // until the separate artwork layers have decoded, including on a slow phone.
    label(fallback,'上海',531,1096,178,false);
    label(pins,'上海',532,1096,77,false);
    const [x,y] = target;
    const width = Math.min(265, Math.max(151, 106 + location.name.length*21));
    const left = x+25+width > 744 ? x-25-width : x+25;
    for (const layer of [fallback,pins]) {
      if (index === undefined) {
        const star = document.createElement('i');
        star.className = 'home-new-pin';
        star.style.left = (x-25)/750*100+'%';
        star.style.top = (y-178-24)/1052*100+'%';
        layer.append(star);
      }
      label(layer,location.name+' | 我的城市',left,y,width,true);
    }
    city.querySelector('.home-city-image').alt = '点亮你的城市，我的点亮位置：'+location.name+'。';
  }

  function rankFor(region) {
    const index = standings.findIndex(([city]) => city === region);
    return index < 0 ? null : {rank:String(index+1).padStart(2,'0'), count:standings[index][1]};
  }
  window.getHomeRegionRank = rankFor;

  function rows(joined, region) {
    return standings.map(([city, count], index) => {
      const mine = joined && city === region;
      const rank = String(index + 1).padStart(2, '0');
      return '<tr class="' + (index < 3 ? 'home-podium home-podium-' + rank : '') +
        (mine ? ' home-ranked-mine' : '') + '"><td><span class="home-rank-number">' + rank +
        '</span></td><td>' + city + '领地' +
        (mine ? '<span class="home-rank-tag">✦ 我的领地</span>' : '') +
        '</td><td>' + count + '</td></tr>';
    }).join('');
  }

  window.renderHome = function renderHome(container, api) {
    const state = api.state;
    const joined = Boolean(state.territoryJoined);
    const location = state.location || {id:'CN-SH',name:'上海'};
    const regionRank = joined && rankFor(location.name);
    const pinIndex = regionPins[location.id];
    const targetPin = stars[pinIndex] || personalPin;
    const root = document.createElement('div');
    root.className = 'home-screen';
    root.innerHTML = `
      <nav class="home-nav" aria-label="活动导航">
        <button type="button" class="home-back" aria-label="返回" data-home-action="back">${icon('back')}</button>
        <button type="button" class="home-motion-toggle" hidden><span class="home-motion-glyph" aria-hidden="true"></span><span data-motion-label>重力感应</span></button>
        <div class="home-nav-links">
          <button type="button" data-home-action="prizes">${icon('gift')}我的奖品</button>
          <button type="button" data-home-action="rules">${icon('rules')}活动规则</button>
        </div>
      </nav>
      <div class="home-city">
        <h1 class="home-sr-only">点亮你的城市</h1>
        <img class="home-city-image" width="750" height="1052" alt="点亮你的城市，查看超人气新星。城市星标包括上海、北京、杭州、广州、宁波、厦门和伦敦。">
        <div class="home-depth" aria-hidden="true">
          <img class="home-depth-scene" src="./assets/home-scene.jpg" width="1125" height="1578" fetchpriority="high" alt="">
          <img class="home-depth-heading" src="./assets/home-heading.png" width="1500" height="2104" alt="">
          <div class="home-depth-pins"><img src="./assets/home-pins.png" width="1500" height="2104" alt=""></div>
        </div>
        <svg class="home-facade-reflections" viewBox="0 0 750 1052" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="home-glass-sweep" x1=".4" y1=".2" x2=".49" y2=".83">
              <stop offset=".28" stop-color="#d0fff4" stop-opacity="0"/>
              <stop offset=".44" stop-color="#d9fff7" stop-opacity=".26"/>
              <stop offset=".53" stop-color="#fff" stop-opacity=".7"/>
              <stop offset=".565" stop-color="#f2fffc" stop-opacity=".46"/>
              <stop offset=".72" stop-color="#c3fff0" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <g fill="url(#home-glass-sweep)">
            <path d="M364 280 L420 279 C414 311 398 381 392 429 Q391 436 390 436 C387 405 375 342 364 280Z M390 496 C392 526 415 577 418 614 C423 648 410 682 401 712 C396 729 392 747 390 757 C387 732 377 699 368 670 C357 633 359 613 363 590 C368 562 384 521 390 496Z"/>
            <path opacity=".8" d="M428 307 L429 592 C425 567 413 534 407 510 C395 465 399 435 404 405Z"/>
            <path opacity=".75" d="M250 505 H278 V618 L270 613 H250Z M282 506 H306 V604 L295 625 L282 617Z"/>
            <path opacity=".84" d="M448 457 L472 459 V802 L464 801 V725 L448 720Z"/>
            <path opacity=".64" d="M515 631 L543 608 V669 L541 670 V808 L515 806Z"/>
          </g>
        </svg>
        <div class="home-star-lights" aria-hidden="true"></div>
        <canvas class="home-ignition" width="750" height="1052" aria-hidden="true" hidden></canvas>
        <span class="home-quiet-light" hidden aria-hidden="true"></span>
      </div>
      <section class="home-participation" aria-label="点亮活动">
        <div class="home-counters">
          <div><strong>70,260</strong><span>总点亮人数</span></div>
          <div><strong>7</strong><span>已点亮地区</span></div>
        </div>
        <div class="home-buttons">
          <button type="button" class="home-primary" data-home-action="ignite" data-ignite-city>${state.lit ? '重播点亮' : '点亮热爱'}</button>
          <button type="button" data-home-action="ownWish">我的祝福</button>
          <button type="button" data-home-action="invite">邀请好友</button>
        </div>
      </section>
      <section class="home-messages" aria-labelledby="home-messages-title">
        <div class="home-section-title">
          <h2 id="home-messages-title">让祝福，汇成一片<span>星河</span></h2>
          <p>每一份热爱，都在这里闪闪发光</p>
        </div>
        <div class="home-ticker" aria-label="祝福弹幕"></div>
      </section>
      <section class="home-ranking" aria-labelledby="home-rank-title">
        <header class="home-ranking-header"><h2 id="home-rank-title">Co客领地热力榜</h2><span>TOP 10</span></header>
        <p class="home-update">每天10:00更新前一日数据</p>
        <table class="home-rank-table">
          <thead><tr><th scope="col">排名</th><th scope="col">Co客领地</th><th scope="col">已点亮人数</th></tr></thead>
          <tbody>${rows(joined, location.name)}</tbody>
        </table>
        <div class="home-my-rank"><span>${regionRank ? regionRank.rank : '—'}</span><strong>我的领地</strong><span>${regionRank ? regionRank.count : joined ? '未上榜' : '待加入'}</span></div>
        <button type="button" class="home-join" data-home-action="territory">${joined ? '查看我的领地' : '加入领地'}</button>
      </section>
      <footer class="home-footer">十年同行，热爱成光</footer>`;

    const city = root.querySelector('.home-city');
    const canvas = root.querySelector('.home-ignition');
    const primary = root.querySelector('[data-home-action="ignite"]');
    const fallback = city.querySelector('.home-city-image');
    fallback.src = firstPaintSrc;
    setPersonalPin(city, location, pinIndex, targetPin);
    if (joined) root.querySelector('.home-my-rank strong').textContent = location.name+'领地';
    const lights = city.querySelector('.home-star-lights');
    const quietLight = city.querySelector('.home-quiet-light');
    quietLight.style.left = targetPin[0] / 750 * 100 + '%';
    quietLight.style.top = (targetPin[1]-178) / 1052 * 100 + '%';
    const visibleStars = pinIndex === undefined ? [...stars,personalPin] : stars;
    visibleStars.forEach(([x, y, delay]) => {
      const star = document.createElement('span');
      star.className = 'home-glint';
      star.setAttribute('aria-hidden', 'true');
      star.style.left = (x / 750 * 100) + '%';
      star.style.top = ((y - 178) / 1052 * 100) + '%';
      star.style.animationDelay = delay + 's';
      lights.append(star);
    });
    makeTicker(root.querySelector('.home-ticker'), state);
    container.replaceChildren(root);
    const artwork = [...city.querySelectorAll('.home-depth img')];
    function revealLayers() {
      if (artwork.every(image => image.complete && image.naturalWidth > 0)) {
        city.classList.add('home-depth-ready');
      }
    }
    artwork.forEach(image => image.addEventListener('load', revealLayers, {once: true}));
    revealLayers();
    const motionButton = root.querySelector('.home-motion-toggle');
    const tilt = window.attachCityMotion?.(city, motionButton, api, primary);
    if (tilt) motionButton.hidden = false;

    let active = true;
    let animationFrame = 0;
    let playing = false, playback = 0, quietTimer = 0;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    loadIgnition();
    function cancelIgnition() {
      playback++;
      cancelAnimationFrame(animationFrame);
      clearTimeout(quietTimer);
      animationFrame = 0;
      playing = false;
      primary.disabled = false;
      primary.textContent = api.state.lit ? '重播点亮' : '点亮热爱';
      canvas.hidden = true;
      quietLight.hidden = true;
      city.classList.remove('is-igniting');
      tilt?.resume();
    }
    async function playIgnition() {
      if (!active || playing) return;
      const replay = api.state.lit;
      const run = ++playback;
      playing = true;
      tilt?.pause();
      primary.disabled = true;
      primary.textContent = replay ? '重播中…' : '正在点亮…';
      // Warm the reward artwork while the city lights up on slower connections.
      new Image().src = './assets/extra-medal-earned.png';
      if (!reducedMotion.matches) new Image().src = './assets/poster-anniversary.png';
      const box = city.getBoundingClientRect();
      if (box.top < 0 || box.bottom > innerHeight) {
        city.scrollIntoView({block:box.height > innerHeight ? 'end' : 'center', behavior:'instant'});
      }
      city.classList.add('is-igniting');
      function finish() {
        if (!active || run !== playback) return;
        cancelIgnition();
        api.ignite();
      }
      function showQuietLight() {
        canvas.hidden = true;
        quietLight.hidden = false;
        quietTimer = setTimeout(finish, 650);
      }
      if (reducedMotion.matches || !canvas.getContext('2d')) { showQuietLight(); return; }
      // A slow module request must not leave the action locked on a phone.
      quietTimer = setTimeout(showQuietLight, 2400);
      const motion = await loadIgnition();
      if (!active || run !== playback || !quietLight.hidden) return;
      clearTimeout(quietTimer);
      if (!motion) { showQuietLight(); return; }
      canvas.hidden = false;
      const start = performance.now();
      function tick(now) {
        if (!active || run !== playback) return;
        if (reducedMotion.matches) { showQuietLight(); return; }
        const elapsed = (now - start) / 1000;
        if (elapsed < motion.IGNITION_DURATION) {
          motion.drawCityIgnition(canvas, elapsed, targetPin);
          animationFrame = requestAnimationFrame(tick);
        } else {
          finish();
        }
      }
      animationFrame = requestAnimationFrame(tick);
    }
    container.addEventListener('lightup:confirmed', playIgnition);
    root.addEventListener('click', event => {
      const target = event.target.closest('button');
      if (!target || target.disabled) return;
      if (target.dataset.posterId) {
        cancelIgnition();
        api.openPoster(target.dataset.posterId);
        return;
      }
      const action = target.dataset.homeAction;
      if (action === 'ignite') {
        if (api.state.lit) playIgnition();
        else if (typeof api.prepareIgnite === 'function') api.prepareIgnite(playIgnition);
        else playIgnition();
      } else if (action && typeof api[action] === 'function') {
        cancelIgnition();
        api[action]();
      }
    });
    return function cleanHome() {
      container.removeEventListener('lightup:confirmed', playIgnition);
      active = false;
      cancelIgnition();
      tilt?.destroy();
    };
  };
})();
