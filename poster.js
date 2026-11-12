(function () {
  'use strict';

  const BASE = new URL('.', document.currentScript?.src || document.baseURI);
  const asset = name => new URL('assets/poster-' + name, BASE).href;
  const general = '"PingFang SC", "Microsoft YaHei", system-ui, sans-serif';
  const display = '"FZFangJunHeiS", "PingFang SC", "Microsoft YaHei", sans-serif';
  const defaultWish = '十年同行，\n愿每一次出发都闪闪发光！';
  const placeholder = '把你的祝福，\n写给下一个闪光的十年。';
  const templates = [defaultWish, '一路热爱，一路同行。', '未来可期，\n一起驶向下一个十年！'];
  const typeset = [defaultWish,'十周年快乐！','一起点亮未来','Happy 10th',templates[1],templates[2],placeholder];
  const senders = {
    xiaoming: {name:'小明', initial:'明', region:'浙江', english:'ZHEJIANG', message:'十周年快乐！'},
    xingxing: {name:'星星', initial:'星', region:'广东', english:'GUANGDONG', message:'一起点亮未来'},
    alex: {name:'Alex', initial:'A', region:'德国', english:'GERMANY', message:'Happy 10th'}
  };
  const mine = {name:'小明', initial:'明', region:'上海', english:'SHANGHAI'};
  const count = text => Array.from(text).length;
  const clean = text => String(text || '').trim();
  const activityURL = () => {
    const url = new URL(location.href);
    url.hash = '';
    url.search = '';
    return url.href;
  };
  const sharedURL = message => activityURL() + '#wish=' + encodeURIComponent(clean(message));

  function person(api, who) {
    if (typeof who === 'object' && who && typeof who.message === 'string') return who;
    return senders[who] || {...mine, message: api.state.poster?.message || defaultWish};
  }
  function image(name) {
    return new Promise((resolve,reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(name + ' 加载失败'));
      img.src = asset(name);
    });
  }
  let materials;
  function preload() {
    if (!materials) materials = Promise.all([
      image('city.webp'), image('brand.png'), image('anniversary.png'), image('typeset.png'),
      import(asset('qr.js')).then(lib => lib.qrModules(activityURL()))
    ]).catch(error => { materials = null; throw error; });
    return materials;
  }
  function write(ctx, text, x, y, px, weight, color, align = 'left') {
    ctx.font = weight + ' ' + px + 'px ' + general;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = 'top';
    ctx.fillText(text,x,y);
  }
  function layoutLines(ctx, text, maxWidth) {
    const lines = [];
    const words = text.trim().replace(/\r\n?/g,'\n').replace(/\n{2,}/g,'\n').split('\n');
    for (const part of words) {
      let line = '';
      for (const char of part) {
        if (line && ctx.measureText(line + char).width > maxWidth) {
          lines.push(line);
          line = '';
        }
        line += char;
      }
      lines.push(line);
    }
    return lines;
  }
  function greeting(ctx, atlas, message) {
    const match = typeset.indexOf(message);
    if (match !== -1) {
      ctx.drawImage(atlas,0,294*match,1308,294,48,182,654,147);
      return;
    }
    const characters = count(message);
    let px = characters <= 10 ? 76 : characters <= 22 ? 52 : 38;
    let lines;
    let height;
    do {
      ctx.font = '600 ' + px + 'px ' + display;
      lines = layoutLines(ctx,message,654);
      height = Math.ceil(px*1.25);
      if (lines.length*height <= 196) break;
      px -= 1;
    } while (px > 17);
    // Very short hand-entered lines can exhaust the reserved title area.
    // Reflow their hard breaks if the full blessing would otherwise be cropped.
    if (lines.length*height > 196) {
      px = 38; height = 48; ctx.font = '600 38px ' + display;
      lines = layoutLines(ctx,message.replace(/\s+/g,' '),654);
    }
    ctx.textAlign = 'left';
    ctx.fillStyle = '#30243f';
    ctx.textBaseline = 'top';
    lines.forEach((line,i) => ctx.fillText(line,48,188+i*height));
  }
  function drawQR(ctx, modules) {
    const left = 597, top = 1114, size = 108;
    ctx.fillStyle='#fff'; ctx.fillRect(left,top,size,size);
    const grid = modules.length + 8;
    // Snap modules to native output pixels for a clean quiet zone at all export scales.
    const scale = ctx.getTransform().a;
    const edge = index => Math.round((index+4)*size*scale/grid)/scale;
    ctx.fillStyle='#171a2a';
    modules.forEach((row,y)=>row.forEach((dark,x)=>{
      if (dark) ctx.fillRect(left+edge(x), top+edge(y), edge(x+1)-edge(x), edge(y+1)-edge(y));
    }));
  }
  async function draw(canvas, data, full = false) {
    const [city,logo,ten,atlas,qr] = await preload();
    const scale=full?2:1;
    canvas.width=750*scale; canvas.height=1300*scale;
    const c=canvas.getContext('2d');
    c.scale(scale,scale);
    c.fillStyle='#faf9f7'; c.fillRect(0,0,750,1300);
    c.drawImage(city,0,-54,750,1640.625);
    c.drawImage(logo,48,58,174,25);
    c.drawImage(ten,616,40,86,58);
    write(c,'10TH ANNIVERSARY',602,52,13,600,'#584d65','right');
    write(c,'LIGHT UP YOUR CITY',602,70,13,600,'#584d65','right');
    write(c,data.english+'  /  '+data.region+'领地',48,141,17,550,'#554966');
    greeting(c,atlas,data.message || placeholder);
    c.save();
    c.beginPath(); c.rect(0,1080,750,220); c.clip();
    if ('filter' in c) {
      c.filter='blur('+Math.round(17*scale)+'px)';
      c.drawImage(city,-8,-54,766,1640.625);
      c.filter='none';
    }
    const glass=c.createLinearGradient(0,1080,750,1300);
    glass.addColorStop(0,'rgba(255,255,255,.81)');
    glass.addColorStop(.51,'rgba(246,243,252,.73)');
    glass.addColorStop(1,'rgba(248,250,255,.79)');
    c.fillStyle=glass; c.fillRect(0,1080,750,220);
    c.restore();
    write(c,'热爱成光',48,1128,28,650,'#30243f');
    write(c,'十年同行 · 与你点亮每一座城',186,1136,16,400,'#50455e');
    c.fillStyle='rgba(100,86,120,.26)'; c.fillRect(48,1180,484,1);
    c.beginPath(); c.arc(73,1236,25,0,Math.PI*2); c.fillStyle='#e5dfef'; c.fill();
    write(c,data.initial,73,1222,24,550,'#514165','center');
    write(c,data.name+'的十周年祝福',112,1206,23,600,'#30243f');
    const footer=data.region==='上海'?'与你同行  ·  NO. 070260':'与热爱同行  ·  点亮'+data.region;
    write(c,footer,112,1243,17,400,'#51465f');
    drawQR(c,qr);
    write(c,'扫码点亮热爱',651,1234,15,400,'#51465f','center');
  }
  const renders = new Map();
  function output(data) {
    const key=JSON.stringify(data);
    if (renders.has(key)) return renders.get(key);
    const pending=(async()=>{
      const canvas=document.createElement('canvas');
      await draw(canvas,data,true);
      const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('图片生成失败')),'image/png'));
      return {blob, url:URL.createObjectURL(blob)};
    })();
    renders.set(key,pending);
    pending.catch(()=>renders.delete(key));
    return pending;
  }
  const closeButton='<button type="button" class="p-close" data-close aria-label="关闭"></button>';
  const nav = heading => '<header class="p-nav"><h2>'+heading+'</h2>'+closeButton+'</header>';
  function listen(el, selector, handler) { el.querySelector(selector)?.addEventListener('click',handler); }
  function closeOn(el,api){ listen(el,'[data-close]',()=>api.close()); }
  function loadPhoto(el,data,api) {
    const photo=el.querySelector('[data-photo]');
    output(data).then(file=>{
      if (!el.isConnected) return;
      photo.src=file.url; photo.alt=data.name+'的十周年祝福：'+data.message;
      el.querySelector('[data-loading]')?.remove();
      const download=el.querySelector('[data-download]');
      if(download){ download.href=file.url; download.download='领克十周年-'+data.name+'的祝福.png'; download.hidden=false; }
    }).catch(()=>{
      if (!el.isConnected) return;
      const status=el.querySelector('[data-loading]');
      if(status){
        status.textContent='海报加载失败  ·  点击重试';
        status.onclick=()=>{status.textContent='正在生成海报';loadPhoto(el,data,api);};
      } else api.toast('图片生成失败，请重试');
    });
  }
  function photoFrame() {
    return '<div class="p-paper"><img data-photo alt=""><button type="button" data-loading class="p-loading" aria-live="polite">正在生成海报</button></div>';
  }
  function edit(api) {
    if(api.state.poster?.message) return view(api,'mine');
    const el=api.show('<section class="p-page">'+nav('制作祝福海报')+
      '<div class="p-editor"><canvas data-preview class="p-preview" aria-label="祝福海报预览"></canvas>'+
      '<div class="p-field"><label for="wish-text">写下你的祝福</label><textarea id="wish-text" rows="2" placeholder="把你的祝福写给下一个闪光的十年" aria-describedby="wish-count wish-error"></textarea>'+
      '<div class="p-meta"><span id="wish-error" aria-live="polite"></span><span id="wish-count"></span></div></div>'+
      '<div class="p-phrases"><button type="button" data-switch>换一句</button><button type="button" data-first>一路热爱</button><button type="button" data-next>未来可期</button></div>'+
      '<button type="button" class="p-primary p-wide" data-confirm>保存并分享</button></div></section>');
    closeOn(el,api);
    const inp=el.querySelector('textarea'), note=el.querySelector('#wish-error'), counter=el.querySelector('#wish-count'), confirm=el.querySelector('[data-confirm]');
    const canvas=el.querySelector('[data-preview]');
    let selected=0, raf=0, revision=0;
    function refresh() {
      const value=inp.value, n=count(value);
      counter.textContent=n+' / 50';
      confirm.disabled=!clean(value)||n>50;
      inp.setAttribute('aria-invalid',String(n>50));
      note.textContent=n>50?'祝福最多可写 50 个字':'';
      const id=++revision;
      cancelAnimationFrame(raf);
      raf=requestAnimationFrame(()=>preload().then(()=>{
        if(el.isConnected&&id===revision) return draw(canvas,{...mine,message:Array.from(clean(value)).slice(0,50).join('')||placeholder});
      }).catch(()=>{note.textContent='预览加载失败，可重新打开海报';}));
    }
    function select(index){ selected=index;inp.value=templates[index];refresh();}
    listen(el,'[data-switch]',()=>select((selected+1)%templates.length));
    listen(el,'[data-first]',()=>select(1)); listen(el,'[data-next]',()=>select(2));
    inp.addEventListener('input',refresh); select(0);
    confirm.addEventListener('click',()=>{
      const text=clean(inp.value); if(!text||count(inp.value)>50) return;
      if(api.state.poster?.message){ api.home();view(api,'mine');return; }
      const dialog=api.show('<section class="p-confirm"><h2>确认生成这张海报？</h2><p>保存后将无法修改祝福内容。</p>'+
        '<button type="button" class="p-primary p-wide" data-generate>确认生成海报</button>'+
        '<button type="button" class="p-secondary p-wide" data-revise>返回修改</button></section>',{modal:true});
      listen(dialog,'[data-revise]',()=>api.close());
      listen(dialog,'[data-generate]',async()=>{
        const button=dialog.querySelector('[data-generate]');
        button.disabled=true;button.textContent='正在生成…';
        try {
          await output({...mine,message:text});
          if(!dialog.isConnected) return;
          if(!api.state.poster?.message)api.savePoster({message:text});
          api.home();view(api,'mine');
        }catch{
          if(dialog.isConnected){button.disabled=false;button.textContent='重新生成';api.toast('图片生成失败');}
        }
      });
    });
  }
  function view(api, who='mine') {
    const isMine=who==='mine', data=person(api,who);
    if(isMine&&!api.state.poster?.message)return edit(api);
    const title=isMine?'我的祝福海报':data.name+'的祝福海报';
    const el=api.show('<section class="'+(isMine?'p-page':'p-guest')+'">'+nav(isMine?'我的祝福海报':'祝福海报')+
      '<div class="'+(isMine?'p-result':'p-guest-art')+'">'+photoFrame()+(isMine?'<p class="p-tip">长按海报可保存图片，分享你的热爱</p>'+
      '<div class="p-actions"><button type="button" class="p-primary" data-save>保存图片</button><button type="button" class="p-secondary" data-share>邀请好友</button></div>':'')+'</div></section>',isMine?{}:{modal:true});
    el.querySelector('h2').textContent=title;
    closeOn(el,api);loadPhoto(el,data,api);
    if(isMine){listen(el,'[data-save]',()=>save(api,'mine'));listen(el,'[data-share]',()=>share(api));}
  }
  function save(api,who='mine') {
    const data=person(api,who);
    const el=api.show('<section class="p-page">'+nav('保存祝福海报')+'<div class="p-result">'+photoFrame()+
      '<p class="p-tip">长按上方海报保存到相册，也可以下载图片</p><div class="p-actions"><a class="p-primary" data-download hidden>下载图片</a>'+
      '<button type="button" class="p-secondary" data-close-save>完成</button></div></div></section>');
    closeOn(el,api);listen(el,'[data-close-save]',()=>api.close());loadPhoto(el,data,api);
  }
  const icons={
    friend:'<svg viewBox="0 0 24 24"><path d="M10 4c-4.5 0-8 2.8-8 6.4 0 2 1 3.8 3 5l-.5 2.3 3-1.2a9 9 0 0 0 2.6.3c-.8-1.1-1.2-2.1-1.2-3.4 0-3.6 3.5-6.4 7.7-6.4h.4C15.6 5.2 13 4 10 4Z" fill="currentColor"/><path d="M22 13.4c0-2.8-2.6-5-5.8-5s-5.9 2.2-5.9 5 2.7 5 5.9 5c.8 0 1.5-.1 2.2-.3l2.7 1-.5-2.1c.9-.9 1.4-2.1 1.4-3.6Z" fill="currentColor"/><g fill="white"><circle cx="7" cy="9.2" r=".8"/><circle cx="12" cy="9.2" r=".8"/><circle cx="14" cy="12.7" r=".7"/><circle cx="18.1" cy="12.7" r=".7"/></g></svg>',
    moments:'<svg viewBox="0 0 24 24"><g fill="none" stroke-width="4" stroke-linecap="butt"><path d="M12 3a9 9 0 0 1 7.8 4.5" stroke="#faae3c"/><path d="M19.8 7.5a9 9 0 0 1 0 9" stroke="#82cb4b"/><path d="M19.8 16.5A9 9 0 0 1 12 21" stroke="#41bb98"/><path d="M12 21a9 9 0 0 1-7.8-4.5" stroke="#49abe7"/><path d="M4.2 16.5a9 9 0 0 1 0-9" stroke="#8376dd"/><path d="M4.2 7.5A9 9 0 0 1 12 3" stroke="#e0749b"/></g></svg>',
    save:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v12m-4-4 4 4 4-4M4 14v6h16v-6"/></svg>',
    link:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m9 15 6-6m-6 4-1.5 1.5a3.4 3.4 0 1 0 4.8 4.8l3.1-3.1a3.4 3.4 0 0 0 0-4.8m-.4-.2 1.5-1.5a3.4 3.4 0 0 0-4.8-4.8L8.6 8a3.4 3.4 0 0 0 0 4.8"/></svg>'
  };
  function manualCopy(el,url){
    const hint=el.querySelector('[data-hint]');
    hint.replaceChildren();
    const lbl=document.createElement('label');lbl.textContent='请长按复制活动链接';
    const field=document.createElement('input');field.type='url';field.readOnly=true;field.value=url;
    lbl.appendChild(field);hint.appendChild(lbl);field.focus();field.select();
  }
  function share(api) {
    if(!api.state.poster?.message) return edit(api);
    const data=person(api,'mine'), url=sharedURL(data.message);
    const channels=[['friend','微信好友'],['moments','分享朋友圈'],['save','保存图片'],['link','复制链接']];
    const el=api.show('<section class="p-sheet"><h2>分享到</h2><div class="p-channels">'+channels.map(([id,name])=>
      '<button type="button" data-channel="'+id+'"><span class="p-icon p-'+id+'">'+icons[id]+'</span>'+name+'</button>').join('')+
      '</div><div class="p-share-hint" data-hint aria-live="polite"></div><button type="button" class="p-cancel" data-close>取消</button></section>',{sheet:true});
    closeOn(el,api);
    async function copy(){
      try{
        if(!navigator.clipboard?.writeText) throw Error('manual');
        await navigator.clipboard.writeText(url);
        if(el.isConnected){api.close();api.toast('链接已复制');}
      }catch{if(el.isConnected)manualCopy(el,url);}
    }
    async function send(kind){
      if(kind==='save'){api.close();save(api);return;}
      if(kind==='link'){await copy();return;}
      const hint=el.querySelector('[data-hint]');
      const payload={title:'领克十周年 · '+data.name+'的祝福',url};
      if(navigator.share&&(!navigator.canShare||navigator.canShare(payload))){
        try{await navigator.share(payload);if(el.isConnected)api.close();}
        catch(e){if(e.name!=='AbortError'&&el.isConnected)hint.textContent='未能调起系统分享，可复制链接或保存海报。';}
        return;
      }
      hint.textContent=kind==='moments'?'保存海报后，可在微信朋友圈选择这张图片发布。':'复制祝福链接后，可在微信中发送给好友。';
    }
    el.querySelectorAll('[data-channel]').forEach(b=>b.addEventListener('click',()=>send(b.dataset.channel)));
  }
  function openShared(api){
    const text=clean(new URLSearchParams(location.hash.slice(1)).get('wish'));
    if(!text||count(text)>50)return false;
    view(api,{...mine,message:text});return true;
  }
  window.PosterUI={edit,view,share,save,openShared};
}());
