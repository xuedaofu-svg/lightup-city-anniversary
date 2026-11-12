// Approved building sweeps and the meteor trajectory, rendered above the live city artwork.
const W = 750;
const H = 1648;
const TIMING = { departure: 0.3, arrival: 2.30, buildings: 0.65 };

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const mix = (a, b, t) => a + (b-a)*t;
const smooth = t => { t=clamp(t); return t*t*(3-2*t); };

function bezier(t) {
  const q=1-t;
  return {x:q*q*q*698+3*q*q*t*782+3*q*t*t*754+t*t*t*548,
    y:q*q*q*375+3*q*q*t*700+3*q*t*t*1480+t*t*t*1096};
}
const path = [{...bezier(0),length:0}];
for(let i=1;i<=1000;i++) {
  const p=bezier(i/1000),prev=path[i-1];
  path.push({...p,length:prev.length+Math.hypot(p.x-prev.x,p.y-prev.y)});
}
const totalLength=path.at(-1).length;
function pointAt(distance) {
  const d=clamp(distance,0,totalLength);
  let lo=0,hi=path.length-1;
  while(hi-lo>1){const mid=(lo+hi)>>1;if(path[mid].length<d)lo=mid;else hi=mid;}
  const a=path[lo],b=path[hi],p=(d-a.length)/(b.length-a.length||1);
  return {x:mix(a.x,b.x,p),y:mix(a.y,b.y,p)};
}
function polygon(ctx,points){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();}
function glow(ctx,x,y,r,color,alpha){
  if(alpha<=0||r<=0)return;
  const g=ctx.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,`rgba(${color},${alpha})`);g.addColorStop(.32,`rgba(${color},${alpha*.46})`);g.addColorStop(1,`rgba(${color},0)`);
  ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
}
// Same inset facade masks and three staggered sweeps as the accepted building animation.
const facades=[
 {p:[[354,461],[420,459],[429,967],[351,959]],delay:0},
 {p:[[252,686],[277,686],[277,784],[252,782]],delay:100},
 {p:[[243,806],[270,821],[270,934],[243,927]],delay:100},
 {p:[[450,642],[473,636],[473,969],[450,966]],delay:55},
 {p:[[547,861],[579,882],[579,979],[547,977]],delay:55}
];
const stages=[
 [0,1020,0,0], [.1,1020,0,0], [.34,835,.9,.035], [.35,835,.9,.035],
 [.65,650,.9,.065], [.66,650,.9,.065], [.96,475,.9,.09], [.97,475,.9,.09],
 [1.27,340,.8,.12],[1.47,340,.8,.12],[1.83,230,.2,.06],[2.03,230,.2,.06],
 [2.33,150,0,0],[2.55,150,0,0],[2.79,150,0,0]
];
function lightState(t){
  if(t<=0)return stages[0].slice(1);
  for(let i=1;i<stages.length;i++)if(t<stages[i][0]){
    const a=stages[i-1],b=stages[i],u=smooth((t-a[0])/(b[0]-a[0]));
    return [mix(a[1],b[1],u),mix(a[2],b[2],u),mix(a[3],b[3],u)];
  }
  return stages.at(-1).slice(1);
}
function buildings(ctx,t){
  const age=t-TIMING.buildings,[y,opacity,ambient]=lightState(age);
  if(opacity>0||ambient>0){
    for(const f of facades){
      ctx.save();polygon(ctx,f.p);ctx.clip();
      ctx.fillStyle=`rgba(30,241,198,${ambient})`;ctx.fillRect(0,0,W,H);
      const top=y+f.delay,g=ctx.createLinearGradient(0,top,0,top+170);
      g.addColorStop(0,'rgba(30,241,198,0)');
      g.addColorStop(.20,`rgba(30,241,198,${.12*opacity})`);
      g.addColorStop(.47,`rgba(255,255,255,${.70*opacity})`);
      g.addColorStop(.58,`rgba(30,241,198,${.36*opacity})`);
      g.addColorStop(1,'rgba(30,241,198,0)');
      ctx.fillStyle=g;ctx.fillRect(0,top,W,170);ctx.restore();
    }
  }
  const roof=smooth((age-1.10)/.20)*(1-smooth((age-1.65)/.43));
  if(roof>0){
    glow(ctx,389,458,35,'30,241,198',roof*.3);
    const g=ctx.createLinearGradient(349,0,427,0);
    g.addColorStop(0,'rgba(30,241,198,0)');g.addColorStop(.5,`rgba(255,255,255,${roof})`);g.addColorStop(1,'rgba(30,241,198,0)');
    ctx.fillStyle=g;ctx.fillRect(349,456,78,3);
  }
}
function trail(ctx,d,length,p,alpha){
  // Draw back-to-front tapered curved ribbons. No noisy particle field or blurred base image.
  const steps=64;
  for(let pass=0;pass<3;pass++){
    const color=pass===0?'81,95,208':pass===1?'30,241,198':'243,255,255';
    for(let i=0;i<steps;i++){
      const u=i/steps,v=(i+1)/steps;
      const a=pointAt(d-length*(1-u)),b=pointAt(d-length*(1-v));
      const width=(pass===0?10:pass===1?6:2.6)*(.28+.72*p)*Math.pow(v,.72);
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
      ctx.lineWidth=Math.max(.1,width);ctx.lineCap='round';
      ctx.strokeStyle=`rgba(${color},${alpha*Math.pow(v,1.8)*(pass===0?.15:pass===1?.7:.96)})`;ctx.stroke();
    }
  }
}
function meteor(ctx,t){
  const flight=TIMING.arrival-TIMING.departure,age=t-TIMING.departure;
  if(age<0||age>flight+.28)return;
  const u=clamp(age/flight),p=Math.pow(u,1.5),d=totalLength*p;
  const fade=smooth(age/.14)*(1-smooth((age-flight)/.24));
  const tailLength=mix(16,128,Math.pow(p,.85));
  const head=pointAt(d),behind=pointAt(d-5),angle=Math.atan2(head.y-behind.y,head.x-behind.x);
  trail(ctx,d,tailLength,p,fade);
  glow(ctx,head.x,head.y,mix(8,25,Math.pow(p,3)),'30,241,198',.6*fade);
  ctx.save();ctx.translate(head.x,head.y);ctx.rotate(angle);ctx.globalAlpha=fade;
  ctx.fillStyle='#1EF1C6';ctx.beginPath();ctx.ellipse(0,0,mix(3,10,p),mix(1.7,4.8,p),0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#FFFFFF';ctx.beginPath();ctx.ellipse(.5,0,mix(1.5,6,p),mix(.8,2.7,p),0,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

export function drawCityIgnition(canvas, time) {
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save();
  context.translate(0, -178);
  buildings(context, time);
  meteor(context, time);
  const elapsed = time - TIMING.arrival;
  if (elapsed >= 0 && elapsed < 0.66) {
    const strength = Math.pow(1 - elapsed / 0.66, 1.8);
    context.strokeStyle = 'rgba(30,241,198,' + strength * 0.95 + ')';
    context.lineWidth = 2.2;
    context.beginPath();
    context.arc(688, 1096, 20, -Math.PI / 2, Math.PI / 2);
    context.arc(554, 1096, 20, Math.PI / 2, Math.PI * 1.5);
    context.closePath();
    context.stroke();
    glow(context, 548, 1096, 22, '30,241,198', strength * 0.35);
  }
  context.restore();
}
