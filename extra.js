/* Auxiliary activity views for the mobile prototype. */
(() => {
  'use strict';

  const badge = (earned, className) =>
    `<img class="${className}" alt="${earned ? '已点亮' : '待点亮'}的十周年星轨勋章" src="./assets/extra-medal-${earned ? 'earned' : 'pending'}.png" width="320" height="320">`;

  function header(title) {
    return `<header class="extra-nav">
      <button class="extra-back" data-action="back" type="button" aria-label="返回活动首页"><span aria-hidden="true"></span></button>
      <h1>${title}</h1>
    </header>`;
  }

  function bind(container, actions) {
    for (const button of container.querySelectorAll('[data-action]')) {
      const handler = actions[button.dataset.action];
      if (handler) button.addEventListener('click', handler);
    }
  }

  function localTime(value) {
    if (value === null || value === undefined || value === '') return '';
    const d = new Date(value);
    if (!Number.isFinite(d.getTime())) return '';
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function success(api) {
    const el = api.show(`<section class="extra-dialog extra-success" aria-labelledby="extra-light-title">
      <span class="extra-success-badge">${badge(true, 'extra-success-badge-image')}</span>
      <h2 id="extra-light-title">点亮成功</h2>
      <p class="extra-success-city">你的热爱之地 <span aria-hidden="true">·</span> </p>
      <dl class="extra-record"><dt>点亮序号</dt><dd>NO. 070260</dd></dl>
      <p class="extra-success-note">十周年勋章已收入「我的奖品」</p>
      <button class="extra-btn extra-primary" data-action="wish" type="button">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m10 3 2.2 6.8L19 12l-6.8 2.2L10 21l-2.2-6.8L1 12l6.8-2.2L10 3Z"/><path d="M19 2v6m-3-3h6" stroke-linecap="round"/></svg>
        留下祝福并分享
      </button>
      <button class="extra-btn extra-plain" data-action="later" type="button">关闭</button>
    </section>`, {modal:true});
    el.querySelector('.extra-success-city').append(document.createTextNode(api.state.location?.name || '上海'));
    el.classList.add('extra-success-surface');
    bind(el, {wish:() => api.ownWish(), later:() => api.home()});
  }

  function prizes(api) {
    const earned = Boolean(api.state.lit);
    const time = localTime(api.state.litAt);
    const content = earned
      ? `<div class="extra-award">
          <div class="extra-award-copy"><h2>十周年限定勋章</h2><p>${time || '已获得'}</p></div>
          ${badge(true, 'extra-award-badge')}
        </div>`
      : `<section class="extra-empty">
          <div class="extra-empty-art">${badge(false, 'extra-empty-badge')}</div>
          <h2>你的热爱，还未被点亮</h2>
          <p>点亮你的城市<br>收下一枚专属十周年勋章</p>
          <button class="extra-btn extra-primary" data-action="start" type="button">去点亮热爱</button>
        </section>`;
    const el = api.show(`<main class="extra-page">${header('我的奖品')}${content}</main>`);
    bind(el, {back:() => api.close(), start:() => api.goToLight()});
  }

  const rulesCopy = [
    ['活动时间', '点亮及贺卡制作时间为 10 月 18 日 00:00 至 10 月 26 日 00:00。'],
    ['点亮规则', '用户登录并授权定位后，可按中国省级或海外国家级地区点亮一次。多端使用同一用户 ID 合并。'],
    ['贺卡规则', '每位用户仅能制作一张贺卡，保存后不可修改。祝福语最多 50 字，校验通过后进入祝福滚动区。'],
    ['勋章规则', '成功点亮后，系统实时发放十周年勋章，可在「我的奖品」中查看。'],
    ['排行榜', '排行榜每天 10:00 更新截至前一日 24:00 的数据。排行榜奖励由运营在活动结束后发放。'],
    ['其他', '活动最终解释以官方公告为准。']
  ];
  function rules(api) {
    const list = rulesCopy.map(([title, body], index) =>
      `<section><h3><span>${String(index + 1).padStart(2, '0')}</span>${title}</h3><p>${body}</p></section>`
    ).join('');
    const el = api.show(`<main class="extra-page">${header('活动规则')}
      <article class="extra-rules"><h2>点亮你的城市活动规则</h2>${list}</article>
      <p class="extra-demo-note">原型体验使用演示数据，个人进度保存在当前浏览器。</p>
    </main>`);
    bind(el, {back:() => api.close()});
  }

  function territory(api) {
    const joined = Boolean(api.state.territoryJoined);
    const region = api.state.location?.name || '上海';
    const standing = window.getHomeRegionRank(region);
    const el = api.show(`<section class="extra-dialog extra-territory" aria-labelledby="extra-territory-title">
      <h2 id="extra-territory-title">我的领地</h2>
      <p>加入后，在领地热力榜中查看自己的领地。</p>
      <div class="extra-territory-row"><b>${standing?.rank || '—'}</b><strong></strong><span>${standing ? '<b>'+standing.count+'</b> 人点亮' : '暂未上榜'}</span></div>
      <button type="button" data-action="join" class="extra-btn extra-primary">${joined ? '回到热力榜' : '加入领地'}</button>
      ${joined ? '' : '<button type="button" data-action="back" class="extra-btn extra-plain">留在活动</button>'}
    </section>`, {modal:true});
    if (!joined) el.querySelector('h2').textContent = '加入'+region+'领地';
    if (joined) el.querySelector('p').textContent = region+'领地'+(standing ? '已上榜' : '暂未上榜')+'，和同行的 Co 客一起点亮热爱。';
    el.querySelector('.extra-territory-row strong').textContent = region+'领地';
    bind(el, {join:() => joined ? api.home() : api.joinTerritory(), back:() => api.close()});
  }

  window.ExtraUI = {success, prizes, rules, territory};
})();
