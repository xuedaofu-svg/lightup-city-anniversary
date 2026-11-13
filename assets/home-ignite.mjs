// All coordinates refer to the approved 750-wide homepage artwork before its hero crop.
const WIDTH = 750;
const HEIGHT = 1052;
const CROP_TOP = 178;
const SHANGHAI = [506, 1096];
const IMPACT = 1.73;
export const IGNITION_DURATION = 3.45;

const clamp = value => Math.min(1, Math.max(0, value));
const smooth = value => { const u = clamp(value); return u * u * (3 - 2 * u); };
const mix = (from, to, t) => from + (to - from) * t;
const fade = (t, start, end) => smooth((t - start) / (end - start));
const mint = '30,241,198', ice = '224,255,249', violet = '78,50,168';
const ink = '48,29,114';
const rgba = (rgb, alpha) => 'rgba(' + rgb + ',' + alpha + ')';

function glow(ctx, x, y, radius, rgb, alpha) {
  if (alpha <= 0 || radius < 1) return;
  const g = ctx.createRadialGradient(x,y,0,x,y,radius);
  g.addColorStop(0,rgba(rgb,alpha));
  g.addColorStop(.32,rgba(rgb,alpha*.55));
  g.addColorStop(1,rgba(rgb,0));
  ctx.fillStyle = g;
  ctx.fillRect(x-radius,y-radius,radius*2,radius*2);
}

function glint(ctx,x,y,r,alpha) {
  if (r <= 0 || alpha <= 0) return;
  ctx.save();
  ctx.translate(x,y);
  ctx.globalAlpha *= alpha;
  ctx.beginPath(); ctx.moveTo(0,-r);
  ctx.quadraticCurveTo(r*.10,-r*.13,r*.8,0);
  ctx.quadraticCurveTo(r*.10,r*.13,0,r);
  ctx.quadraticCurveTo(-r*.10,r*.13,-r*.8,0);
  ctx.quadraticCurveTo(-r*.10,-r*.13,0,-r);
  ctx.fillStyle='#fcffff'; ctx.fill();
  ctx.lineWidth=1.4; ctx.strokeStyle='#9aaff6'; ctx.stroke();
  ctx.restore();
}

// Equal-distance samples keep the tracer moving evenly through the foreground turn.
function makeTrack(segments) {
  const points=[];
  let distance=0;
  for(const [a,b,c,d] of segments) {
    for(let i=points.length ? 1 : 0; i<=72; i++) {
      const u=i/72, v=1-u;
      const x=v*v*v*a[0]+3*v*v*u*b[0]+3*v*u*u*c[0]+u*u*u*d[0];
      const y=v*v*v*a[1]+3*v*v*u*b[1]+3*v*u*u*c[1]+u*u*u*d[1];
      const previous=points.at(-1);
      if(previous) distance+=Math.hypot(x-previous.x,y-previous.y);
      points.push({x,y,distance});
    }
  }
  return {points,length:distance};
}
const flight = makeTrack([
  [[713,438],[643,466],[569,481],[426,539]],
  [[426,539],[213,622],[17,712],[49,824]],
  [[49,824],[76,914],[346,1027],SHANGHAI]
]);
// The ring echoes travel in opposite directions along the near edge of the road.
const frontArc = makeTrack([
  [[613,1000],[446,1007],[116,951],[38,850]],
  [[38,850],[0,805],[3,777],[31,749]]
]);
const farArc = makeTrack([
  [[613,1000],[743,1003],[760,965],[685,929]]
]);

function pointAt(track,distance) {
  const pts=track.points, d=Math.max(0,Math.min(distance,track.length));
  let lo=0, hi=pts.length-1;
  while(hi-lo>1) {
    const mid=(lo+hi)>>1;
    if(pts[mid].distance<=d) lo=mid; else hi=mid;
  }
  const a=pts[lo],b=pts[hi],u=(d-a.distance)/(b.distance-a.distance||1);
  return {x:mix(a.x,b.x,u),y:mix(a.y,b.y,u)};
}

// A widening tapered ribbon gives the head weight even on the light sky.
function ribbon(ctx,track,head,tail,width,offset,rgb,alpha) {
  if(alpha<=0 || tail<2) return;
  const end=pointAt(track,head), start=pointAt(track,head-tail);
  const grad=ctx.createLinearGradient(start.x,start.y,end.x,end.y);
  grad.addColorStop(0,rgba(rgb,0)); grad.addColorStop(.50,rgba(rgb,alpha*.6));
  grad.addColorStop(1,rgba(rgb,alpha));
  const other=[];
  ctx.beginPath();
  for(let i=0;i<=26;i++) {
    const u=i/26, pos=Math.max(0,head-tail+tail*u);
    const p=pointAt(track,pos), q=pointAt(track,pos+1);
    const mag=Math.hypot(q.x-p.x,q.y-p.y)||1;
    const nx=-(q.y-p.y)/mag, ny=(q.x-p.x)/mag;
    const side=offset*(1-u), w=width*Math.sin(Math.PI*.82*u);
    const x=p.x+nx*(side+w), y=p.y+ny*(side+w);
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    other.push([p.x+nx*(side-w),p.y+ny*(side-w)]);
  }
  for(let i=other.length-1;i>=0;i--) ctx.lineTo(...other[i]);
  ctx.closePath(); ctx.fillStyle=grad; ctx.fill();
}
function meteor(ctx,t) {
  if(t>=IMPACT+.22) return;
  const travel=clamp((t-.14)/(IMPACT-.14));
  const u=travel*(.43+.57*travel);
  const head=flight.length*u;
  const energy=fade(t,0,.16)*(1-fade(t,IMPACT,IMPACT+.22));
  const headPoint=pointAt(flight,head), tail=Math.min(head,mix(88,285,u));
  ribbon(ctx,flight,head,tail,12+4*u,-5,ink,energy*.40);
  ribbon(ctx,flight,head,tail*.96,7.5,-2,mint,energy*.94);
  ribbon(ctx,flight,head,tail*.78,3.2,0,'255,255,255',energy);
  ribbon(ctx,flight,head,tail*.86,1.5,19,violet,energy*.66);
  glow(ctx,headPoint.x,headPoint.y,22+25*u,mint,energy*.78);
  glint(ctx,headPoint.x,headPoint.y,9+11*u,energy);
}
function impact(ctx,age) {
  if(age<0 || age>1.23) return;
  const [x,y]=SHANGHAI;
  const burst=(1-fade(age,.03,.64));
  glow(ctx,x,y,90+46*fade(age,0,.43),mint,burst*.65);
  for(const [offset,turn] of [[0,-.27],[.13,.18]]) {
    const u=clamp((age-offset)/.88);
    if(u<=0 || u>=1) continue;
    const e=1-(1-u)*(1-u), a=1-fade(u,.03,1);
    const rx=14+124*e,ry=13+45*e;
    ctx.beginPath();ctx.ellipse(x,y,rx,ry,turn,-.35,Math.PI*1.70);
    ctx.strokeStyle=rgba(offset? violet : ink,a*.55);ctx.lineWidth=mix(5,1.2,u);ctx.stroke();
    ctx.beginPath();ctx.ellipse(x,y,rx,ry,turn,.04,Math.PI*1.23);
    ctx.strokeStyle=rgba(offset? mint : ice,a);ctx.lineWidth=mix(3.6,1,u);ctx.stroke();
  }
  glint(ctx,x,y,14+27*(1-fade(age,.02,.5)),1-fade(age,.13,.72));
  // Three small reflections, like cut facets catching the impact.
  for(const [dx,dy,r] of [[-45,-26,8],[27,-42,6],[-28,22,4]]) {
    const travel=fade(age,.02,.52), a=fade(age,0,.08)*(1-fade(age,.15,.54));
    glint(ctx,x+dx*(.5+travel),y+dy*(.5+travel),r*a,a);
  }
}
function rimPulse(ctx,age) {
  for(const track of [frontArc,farArc]) {
    const u=clamp((age-.10)/1.0), a=fade(age,.10,.25)*(1-fade(age,.62,1.12));
    const head=track.length*(1-(1-u)*(1-u));
    const tail=Math.min(head,track.length*.61);
    ribbon(ctx,track,head,tail,6,0,mint,a);
    ribbon(ctx,track,head,tail*.68,2,0,'255,255,255',a);
  }
}
// The masks follow only the original visible facades; the upward light never
// paints a new skyline over the real architecture.
const towers=[
  {outline:[[543,851],[577,873],[609,867],[610,984],[541,982]],top:851,delay:.10},
  {outline:[[473,815],[508,789],[544,778],[544,979],[473,976]],top:778,delay:.10},
  {outline:[[447,636],[482,614],[512,611],[512,784],[473,813],[473,976],[447,974]],top:611,delay:.19},
  {outline:[[345,460],[424,455],[429,963],[350,960]],top:455,delay:.24},
  {outline:[[243,647],[275,647],[276,668],[306,668],[307,811],[280,830],[242,799]],top:647,delay:.28},
  {outline:[[175,724],[208,713],[228,724],[228,895],[175,883]],top:714,delay:.35},
  {outline:[[239,794],[269,810],[298,831],[298,944],[239,928]],top:794,delay:.30},
  {outline:[[544,733],[572,731],[592,736],[592,857],[544,844]],top:731,delay:.13}
];
function buildings(ctx,age) {
  for(const {outline,delay,top} of towers) {
    const u=clamp((age-delay)/.94);
    if(u<=0 || u>=1) continue;
    const y=mix(1080,top-120,u), intensity=fade(u,0,.16)*(1-fade(u,.84,1));
    ctx.save();ctx.beginPath();ctx.moveTo(...outline[0]);
    for(let i=1;i<outline.length;i++) ctx.lineTo(...outline[i]);
    ctx.closePath();ctx.clip();
    const x=outline[0][0], band=ctx.createLinearGradient(x,y-66,x+29,y+106);
    band.addColorStop(0,rgba(ice,0));band.addColorStop(.31,rgba(mint,.56*intensity));
    band.addColorStop(.42,rgba(ice,.98*intensity));band.addColorStop(.58,rgba(mint,.66*intensity));
    band.addColorStop(1,rgba(violet,0));ctx.fillStyle=band;ctx.fillRect(x-12,y-120,140,280);
    ctx.restore();
  }
  const peak=fade(age,.91,1.08)*(1-fade(age,1.10,1.65));
  glow(ctx,423,455,50,ice,peak*.86);glint(ctx,423,455,17,peak);
}
function beginFrame(canvas) {
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.save();ctx.scale(canvas.width/WIDTH,canvas.height/HEIGHT);ctx.translate(0,-CROP_TOP);
  return ctx;
}
export function drawCityIgnition(canvas,time) {
  const ctx=beginFrame(canvas);
  // A gradual local exposure shift keeps the white meteor legible on lavender.
  const focus=fade(time,0,.55)*(1-fade(time,IMPACT+.05,IGNITION_DURATION-.03));
  const dusk=ctx.createLinearGradient(0,380,0,1180);
  dusk.addColorStop(0,rgba(ink,0));dusk.addColorStop(.35,rgba(ink,.18*focus));
  dusk.addColorStop(.79,rgba(ink,.22*focus));dusk.addColorStop(1,rgba(ink,0));
  ctx.fillStyle=dusk;ctx.fillRect(0,380,WIDTH,800);
  const age=time-IMPACT;
  rimPulse(ctx,age);buildings(ctx,age);meteor(ctx,time);impact(ctx,age);
  ctx.restore();
}
