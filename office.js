/* A local, deterministic office simulation. No API, model, telemetry or external scripts. */
'use strict';
window.initOffice=function({projects}){
const $=s=>document.querySelector(s),root=$('#david-bot'),canvas=$('#office-canvas');if(!canvas)return;
const ctx=canvas.getContext('2d'),portrait=$('#office-portrait').getContext('2d'),viewport=$('#office-viewport'),world=$('#office-world');
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const projectLabels={
 'convergent':'AI brand identity',
 'evol':'Hong Kong dating campaign',
 'sable-finance':'DeFi community graphics',
 'hailstone-labs':'Brand, website & events',
 'solomission':'AI sci-fi short film',
 'wombat-exchange':'DeFi explainer animations',
 'fedex':'Animated shipping tutorial',
 'catherine-lim':'AI fashion portraits',
 'hungry-ryan':'AI food & character studies'
};
const team=[
 {id:'david',name:'David',role:'Creative direction',short:'David',department:'CREATIVE DIRECTOR',color:'#b8d3c6',skin:'#d5a67e',hair:'#252729',home:{x:170,y:237},projects:['convergent','evol'],desc:'Brand, motion and AI, connected by a clear visual idea.',quote:'「先有個好 idea，再揀工具。」',desk:'Connecting the dots',lines:['呢個方向可以再推遠啲。','Good idea. Let’s make it real.','Brand, motion, AI. Same curiosity.']},
 {id:'byte',name:'Byte',role:'Web3 & digital',short:'Web3',department:'WEB3 WORKBENCH',color:'#8caeb9',skin:'#c79b77',hair:'#293b39',home:{x:400,y:237},projects:['convergent','sable-finance'],desc:'The Web3 corner: visual identities and design that give complex protocols a clearer presence.',quote:'「複雜嘅嘢，更加要講得清楚。」',desk:'Shaping a Web3 identity',lines:['Less jargon. More clarity.','呢個 protocol 要有個樣。','Identity system, coming together.']},
 {id:'hue',name:'Hue',role:'Brand & campaigns',short:'Brand',department:'BRAND DESK',color:'#b7b9ad',skin:'#d9b28c',hair:'#5d3d32',home:{x:630,y:237},projects:['hailstone-labs','evol'],desc:'A desk full of identities, campaign ideas and colour tests. From Hailstone Labs to EVOL.',quote:'「呢個色，啱唔啱個品牌？」',desk:'Exploring a visual direction',lines:['One identity. Many applications.','試多個構圖先。','This colour feels like the idea.']},
 {id:'frame',name:'Frame',role:'AI cinema',short:'AI film',department:'AI SCREENING ROOM',color:'#c2c9c4',skin:'#caa27f',hair:'#2e303d',home:{x:170,y:447},projects:['solomission'],desc:'Imagined worlds and cinematic experiments. SoloMission lives at this desk: AI visuals, atmosphere and story.',quote:'「今次真係最後一個 render。」',desk:'Building an imagined world',lines:['One more world to imagine.','呢個鏡頭，要有電影感。','Rendering… in my imagination.']},
 {id:'loop',name:'Loop',role:'Motion & stories',short:'Motion',department:'MOTION DESK',color:'#91a99d',skin:'#bd906c',hair:'#4f3c58',home:{x:400,y:447},projects:['wombat-exchange','fedex'],desc:'Movement with a purpose. Explainers, transitions and stories that help an idea make sense.',quote:'「Timing 啱咗，成件事就啱。」',desk:'Finding the right rhythm',lines:['Ease out. Take a breath.','差兩格，就係嗰種感覺。','Motion should explain something.']},
 {id:'echo',name:'Echo',role:'AI characters',short:'AI cast',department:'CHARACTER LAB',color:'#b5abb8',skin:'#e1b590',hair:'#5a3b43',home:{x:630,y:447},projects:['catherine-lim','hungry-ryan'],desc:'An imaginary cast with a consistent look. Meet Catherine Lim and Hungry Ryan, two personal AI character experiments.',quote:'「同一個角色，唔同嘅故事。」',desk:'Exploring a digital character',lines:['Same character. New story.','角色一致性，再試一次。','What would this character do?']}
];
let selected=team[0],day=false,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,simTime=0,last=0,visible=true,zoom=1,fit=true,speech=null,quoteCounter=0;
team.forEach((a,i)=>Object.assign(a,{x:a.home.x,y:a.home.y,path:[],mode:'desk',until:6+i*6.5,step:0,index:i}));
// Pixel displays reuse existing project covers; the room palette stays independent.
const displayArt={};
const displayCrops={
 'convergent':[.22,.19,.57,.69],
 'wombat-exchange':[.27,0,.46,1],
 'solomission':[0,0,1,1]
};
function makeDisplayArt(image,crop){
 const tile=document.createElement('canvas');
 const [x,y,w,h]=crop;
 tile.width=112;
 tile.height=Math.round(tile.width*image.naturalHeight*h/(image.naturalWidth*w));
 const pixels=tile.getContext('2d');
 pixels.drawImage(image,x*image.naturalWidth,y*image.naturalHeight,w*image.naturalWidth,h*image.naturalHeight,0,0,tile.width,tile.height);
 return tile;
}
const images={};
for(const id of new Set(team.flatMap(agent=>agent.projects))){
 if(!projects[id])continue;
 const image=new Image();
 images[id]=image;
 image.onload=()=>{
  if(displayCrops[id])displayArt[id]=makeDisplayArt(image,displayCrops[id]);
  draw();
 };
 image.src=projects[id].img;
}
const pins=$('#office-pins'),roster=$('#office-team');
pins.innerHTML=team.map(a=>`<button class="office-pin" data-agent="${a.id}" aria-label="Select ${a.name}: ${a.role}" aria-pressed="${a===selected}"><span>${a.name.toUpperCase()}</span></button>`).join('');
roster.innerHTML=team.map(a=>`<button class="office-teammate" data-agent="${a.id}" aria-pressed="${a===selected}" style="--agent-color:var(--office-${a.id})"><i aria-hidden="true"></i><span><strong>${a.short}</strong></span></button>`).join('');
team.forEach(a=>a.pin=pins.querySelector(`[data-agent="${a.id}"]`));
root.querySelectorAll('[data-agent]').forEach(b=>b.addEventListener('click',()=>select(team.find(a=>a.id===b.dataset.agent))));
function say(a,text,announce=true){speech={agent:a,text,until:simTime+5};const bubble=$('#office-bubble');bubble.textContent=text;bubble.hidden=false;if(announce)$('#office-event').textContent=`${a.name}: ${text}`;positionPins();}
function stateText(a){if(paused)return 'Office paused · 按 Play 繼續';if(a.path.length)return a.mode==='check'?'Checking the team · 巡場中':a.mode==='return'?'Heading back · 返位中':a.mode==='lounge'?'Heading to the terrace · 行吓先':'Coffee run · 去飲杯啡';return a.mode==='coffee'?'At the coffee bar · 充電中':a.mode==='lounge'?'Taking a breather · 休息中':a.desk+' · 模擬中';}
function updateState(){const text=stateText(selected);$('#office-coffee').textContent=selected.mode==='desk'?'Coffee break ↗':'Back to desk ↗';if($('#office-agent-state').textContent!==text)$('#office-agent-state').textContent=text;}
function select(a,speak=true){selected=a;root.querySelectorAll('[data-agent]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.agent===a.id)));$('#office-agent-name').textContent=a.name;$('#office-agent-role').textContent=a.role;$('#office-agent-index').textContent=String(a.index+1).padStart(2,'0')+' / '+a.department;$('#office-agent-description').textContent=a.desc;$('#office-agent-quote').textContent=a.quote;$('#office-projects').innerHTML=a.projects.filter(id=>projects[id]).map(id=>{const p=projects[id];return `<a class="office-project project-link" href="#project/${id}"><img src="${escape(p.img)}" alt="" width="64" height="44" loading="lazy"><span><strong>${escape(p.title)}</strong><small>${escape(projectLabels[id]||'View project')}</small></span><b aria-hidden="true">↗</b></a>`;}).join('');portrait.clearRect(0,0,100,100);portrait.save();portrait.translate(50,90);portrait.scale(2.3,2.3);drawPerson(portrait,a,0,0,false,true);portrait.restore();updateState();if(speak)say(a,a.lines[(quoteCounter++)%a.lines.length]);if(speak&&world.clientWidth>viewport.clientWidth){const target=a.x/1000*world.clientWidth-viewport.clientWidth/2;viewport.scrollTo({left:target,behavior:'auto'});}draw();}
function point(x,y){return {x,y};}
function aisle(a){return a.y>355?500:280;}
function goCoffee(a,manual=false){const startLane=aisle(a),tx=823+(a.index%3)*41,ty=366+Math.floor(a.index/3)*34;a.mode='coffee';a.path=[point(a.x,startLane),point(727,startLane),point(727,325),point(tx,325),point(tx,ty)];a.until=0;if(manual)say(a,'Coffee first. Ideas next. ☕');}
function goLounge(a){a.mode='lounge';const lane=aisle(a);a.path=[point(a.x,lane),point(727,lane),point(727,480),point(827+a.index%3*38,480),point(827+a.index%3*38,492)];a.until=0;}
function goHome(a,manual=false){if(Math.abs(a.x-a.home.x)<2&&Math.abs(a.y-a.home.y)<2){a.mode='desk';a.path=[];a.until=simTime+18+a.index*3;if(manual)say(a,'Already on it. 返緊工喇。');return;}const lane=a.home.y>355?500:280;const outside=a.x>754;const startLane=outside?(a.y>435?480:325):aisle(a);a.mode='return';a.path=[point(a.x,startLane),point(727,startLane),point(727,lane),point(a.home.x,lane),point(a.home.x,a.home.y)];a.until=0;if(manual)say(a,'Back to the good stuff. 返位先。');}
function checkTeam(){const a=team[0];select(a,false);a.mode='check';const lane=aisle(a);a.path=[point(a.x,lane),point(727,lane),point(727,280),point(630,280),point(400,280),point(170,280),point(300,280),point(300,500),point(170,500),point(400,500),point(630,500),point(727,500),point(727,280),point(170,280),point(170,237)];a.until=0;say(a,'巡一圈先。Everyone doing okay?');updateState();}
$('#office-coffee').addEventListener('click',()=>{if(paused)return;if(selected.mode==='desk')goCoffee(selected,true);else goHome(selected,true);updateState();});$('#office-return').addEventListener('click',()=>{if(paused)return;goHome(selected,true);updateState();});$('#office-check').addEventListener('click',()=>{if(!paused)checkTeam();});
function setPaused(value){paused=value;root.dataset.paused=String(paused);$('#office-pause').setAttribute('aria-pressed',String(paused));$('#office-pause').textContent=paused?'Play ▶':'Pause Ⅱ';['#office-coffee','#office-return','#office-check'].forEach(id=>$(id).disabled=paused);updateState();draw();}
$('#office-pause').addEventListener('click',()=>{setPaused(!paused);$('#office-event').textContent=paused?'Office paused. You can still choose teammates and view their projects.':'Office running. 揀個角色，試吓叫佢飲杯啡。';});
$('#office-day').addEventListener('click',()=>{day=!day;$('#office-day').setAttribute('aria-pressed',String(day));$('#office-day').textContent=day?'Night shift ☾':'Day shift ☀';$('#office-shift-label').textContent=day?'DAY SHIFT / 日更':'AFTER HOURS / 夜更';draw();});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{if(e.matches)setPaused(true);});
function applyZoom(){world.classList.toggle('is-fit',fit);world.style.width=fit?'100%':Math.round(Math.max(viewport.clientWidth,680)*zoom)+'px';$('#office-zoom-out').disabled=fit||zoom<=1;$('#office-zoom-in').disabled=!fit&&zoom>=2;}
$('#office-zoom-in').addEventListener('click',()=>{if(fit){fit=false;zoom=1;}else zoom=Math.min(2,zoom+.25);applyZoom();select(selected,false);});$('#office-zoom-out').addEventListener('click',()=>{fit=false;zoom=Math.max(1,zoom-.25);applyZoom();});$('#office-fit').addEventListener('click',()=>{fit=true;zoom=1;applyZoom();viewport.scrollTo({left:0,top:0});});
new ResizeObserver(()=>applyZoom()).observe(viewport);
let drag=null;
viewport.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||e.target.closest('button'))return;drag={x:e.clientX,y:e.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};viewport.setPointerCapture(e.pointerId);viewport.classList.add('dragging');});viewport.addEventListener('pointermove',e=>{if(!drag)return;viewport.scrollLeft=drag.left-e.clientX+drag.x;viewport.scrollTop=drag.top-e.clientY+drag.y;});const stopDrag=()=>{drag=null;viewport.classList.remove('dragging');};viewport.addEventListener('pointerup',stopDrag);viewport.addEventListener('pointercancel',stopDrag);viewport.addEventListener('lostpointercapture',stopDrag);
viewport.addEventListener('keydown',e=>{if(e.target!==viewport)return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();viewport.scrollBy({left:e.key==='ArrowLeft'?-80:e.key==='ArrowRight'?80:0,top:e.key==='ArrowUp'?-80:e.key==='ArrowDown'?80:0});}});
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;},{rootMargin:'100px'}).observe(canvas);
let roomDrawing=false;const roomPalette=new Map();
function roomColor(color){
 if(!roomDrawing)return color;
 if(roomPalette.has(color))return roomPalette.get(color);
 if(!/^#[a-f0-9]{6}$/i.test(color))return color;
 const fixed={'#111915':'#191d20','#282c25':'#252c30','#34392e':'#30393d','#242920':'#20272b','#708369':'#7e9b8e','#92aa72':'#a9c6b7'};
 const n=parseInt(color.slice(1),16),light=((n>>16)*.2126+((n>>8)&255)*.7152+(n&255)*.0722)/255;
 const dark=[16,22,26],paper=[238,237,231];
 const out=fixed[color]||`rgb(${dark.map((value,i)=>Math.round(value+(paper[i]-value)*light)).join(',')})`;
 roomPalette.set(color,out);return out;
}
function rect(c,x,y,w,h,color){c.fillStyle=roomColor(color);c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function text(c,s,x,y,color='#d8ccb2',size=10){c.fillStyle=roomColor(color);c.font=`${size}px monospace`;c.textAlign='left';c.fillText(s,Math.round(x),Math.round(y));}
function plant(x,y,size=1){ctx.save();ctx.translate(x,y);ctx.scale(size,size);rect(ctx,-8,0,16,16,'#a8764f');rect(ctx,-10,0,20,4,'#c7986b');rect(ctx,-2,-28,4,30,'#6e8260');[[-12,-22,10,7],[-16,-13,14,7],[3,-27,12,7],[2,-14,16,8],[-7,-35,10,10]].forEach(r=>rect(ctx,...r,day?'#92aa72':'#708369'));rect(ctx,-5,4,3,10,'#c08a60');ctx.restore();}
function convergentSign(){
 ctx.fillStyle='#52615f';ctx.fillRect(216,21,342,80);
 ctx.fillStyle='#171e23';ctx.fillRect(220,25,334,72);
 if(displayArt.convergent)ctx.drawImage(displayArt.convergent,226,26,104,70);
 ctx.fillStyle='#eeede7';ctx.font='bold 23px monospace';
 ctx.fillText('CONVERGENT',340,65);
 ctx.fillStyle='#b5bfc0';ctx.font='11px monospace';
 ctx.fillText('SOLANA / VISUAL IDENTITY',341,84);
}
function wombatCabinet(x,y){
 ctx.save();ctx.translate(x,y);
 ctx.fillStyle='#171e23';ctx.fillRect(0,0,101,108);
 ctx.fillStyle='#879f93';ctx.fillRect(0,0,4,104);ctx.fillRect(97,0,4,104);ctx.fillRect(4,0,93,14);
 ctx.fillStyle='#121619';ctx.font='bold 12px monospace';ctx.fillText('WOMBAT',29,11);
 if(displayArt['wombat-exchange'])ctx.drawImage(displayArt['wombat-exchange'],10,19,81,54);
 ctx.fillStyle='#556460';ctx.fillRect(4,77,93,12);
 ctx.fillStyle='#22282c';ctx.fillRect(4,89,93,13);ctx.fillRect(23,76,3,7);
 ctx.fillStyle='#b8d3c6';ctx.fillRect(20,73,9,5);ctx.fillRect(69,81,7,3);ctx.fillRect(81,79,6,3);
 ctx.restore();
}
function soloScreen(){
 // An existing film cover becomes a small screening-room display.
 ctx.fillStyle='#101619';ctx.fillRect(784,45,159,94);
 ctx.fillStyle='#677a76';ctx.fillRect(781,42,165,3);ctx.fillRect(781,139,165,3);
 if(displayArt.solomission)ctx.drawImage(displayArt.solomission,788,49,151,85);
 ctx.fillStyle='#161d21';ctx.fillRect(788,117,151,17);
 ctx.fillStyle='#eeede7';ctx.font='bold 11px monospace';ctx.fillText('SOLO / AI FILM',799,129);
}
function skyline(){rect(ctx,38,23,697,74,day?'#d5bd89':'#20313c');for(let i=0;i<28;i++){const x=44+i*25,h=17+(i*17)%45;rect(ctx,x,92-h,21,h,day?'#81908b':'#354d51');for(let a=0;a<3;a++)for(let b=0;b<4;b++)if((i+a+b)%3!==0)rect(ctx,x+4+a*5,96-h+b*9,2,3,day?'#b6c5b1':'#b9b889');}if(!day){[[72,36],[215,30],[477,39],[631,28],[704,52]].forEach(p=>rect(ctx,p[0],p[1],2,2,'#bbcdc2'));rect(ctx,663,32,8,9,'#e8d9a6');rect(ctx,660,29,7,8,'#20313c');}else rect(ctx,663,30,18,18,'#e4c367');for(let x=38;x<=735;x+=174)rect(ctx,x,23,5,74,'#737b67');rect(ctx,33,19,707,5,'#a19b79');rect(ctx,33,96,707,7,'#a19b79');}
function desk(a){const x=a.home.x,y=a.home.y-72;rect(ctx,x-63,y+25,133,22,'#222a27');rect(ctx,x-61,y-2,124,43,'#8e805c');rect(ctx,x-58,y,118,36,'#b1a17b');rect(ctx,x-58,y+34,118,5,'#726647');rect(ctx,x-55,y+39,7,21,'#5e5c4c');rect(ctx,x+48,y+39,7,21,'#5e5c4c');rect(ctx,x-30,y-28,60,36,'#282e2d');rect(ctx,x-26,y-24,52,28,'#6c8a80');const project=a.projects[0],im=images[project];if(im?.complete&&im.naturalWidth){ctx.drawImage(displayArt[project]||im,x-24,y-22,48,24);}else{rect(ctx,x-22,y-18,44,20,a.color);rect(ctx,x-15,y-13,22,2,'#29342f');rect(ctx,x-15,y-7,30,2,'#29342f');}rect(ctx,x-3,y+8,6,5,'#444c43');rect(ctx,x-16,y+13,32,4,'#484f44');rect(ctx,x-24,y+23,43,9,'#626f61');for(let i=0;i<8;i++)rect(ctx,x-21+i*5,y+25,3,2,'#b5b69a');rect(ctx,x+29,y+23,8,11,'#d4c9a8');rect(ctx,x+45,y+13,10,12,'#e4d9b3');rect(ctx,x+47,y+14,6,3,'#705846');rect(ctx,x+55,y+16,3,6,'#c3b391');rect(ctx,x-49,y+8,13,18,'#d8ccb1');rect(ctx,x-46,y+12,7,2,a.color);if(a.id==='frame'){rect(ctx,x-82,y-13,10,18,'#50594f');rect(ctx,x-80,y-11,6,6,'#202923');rect(ctx,x-79,y-4,4,6,'#202923');}if(a.id==='hue'){for(let i=0;i<3;i++)rect(ctx,x+38+i*6,y+3,5,6,['#e1ae65','#b4c7ae','#b3a2bf'][i]);}rect(ctx,x-14,a.home.y-23,30,25,'#313a35');rect(ctx,x-12,a.home.y-25,26,7,'#75816a');rect(ctx,x-16,a.home.y+3,34,6,'#5e6a59');rect(ctx,x-2,a.home.y+9,4,7,'#7c8972');rect(ctx,x-13,a.home.y+15,26,3,'#7c8972');}
function environment(){roomDrawing=true;ctx.imageSmoothingEnabled=false;rect(ctx,0,0,1000,600,'#111915');rect(ctx,15,12,970,570,day?'#6d755c':'#4c5847');rect(ctx,25,105,720,461,day?'#596149':'#282c25');for(let y=109;y<566;y+=16){rect(ctx,25,y,720,1,day?'#656d54':'#34392e');for(let x=25+(y%32?0:40);x<745;x+=80)rect(ctx,x,y,1,16,day?'#4e5944':'#242920');}rect(ctx,755,20,219,544,day?'#657365':'#253d3b');skyline();rect(ctx,748,20,7,260,'#829075');rect(ctx,748,355,7,106,'#829075');rect(ctx,748,521,7,45,'#829075');rect(ctx,25,563,950,7,'#8b9276');rect(ctx,25,106,7,457,'#788569');rect(ctx,968,20,7,547,'#788569');
// Terrace, with harbour light beyond the rail.
rect(ctx,761,25,203,152,day?'#a8b6a3':'#193038');for(let i=0;i<9;i++){const h=15+(i*9)%32;rect(ctx,766+i*23,140-h,19,h,day?'#899b8b':'#304e50');rect(ctx,771+i*23,145-h,2,4,'#c0c5a4');}for(let i=0;i<9;i++)rect(ctx,765+i*23,142,3,33,'#8f9c7f');rect(ctx,760,140,205,4,'#b1b89a');rect(ctx,760,176,205,4,'#9b9f80');rect(ctx,774,191,178,5,'#68765c');rect(ctx,790,211,111,10,'#ab9470');rect(ctx,796,221,5,20,'#7c7e62');rect(ctx,892,221,5,20,'#7c7e62');plant(939,225,.8);plant(778,226,.7);text(ctx,'SCREENING CORNER',794,164,'#d3d1b1',10);
// Coffee bar and equipment.
rect(ctx,770,269,186,41,'#a89570');rect(ctx,770,307,186,10,'#6e6349');rect(ctx,775,317,12,26,'#7b7154');rect(ctx,937,317,12,26,'#7b7154');rect(ctx,794,243,43,30,'#27332f');rect(ctx,798,246,35,17,'#687b6d');rect(ctx,803,251,18,4,'#c6bb88');rect(ctx,806,264,7,12,'#d4cbb0');rect(ctx,857,277,31,21,'#d5c9a8');rect(ctx,860,280,25,9,'#6c7157');for(let i=0;i<4;i++){rect(ctx,902+i*11,288,7,9,'#d9cdb1');rect(ctx,903+i*11,287,5,2,'#6e5944');}text(ctx,'COFFEE / IDEAS',794,259,'#e3d4b0',9);rect(ctx,776,405,177,3,'#657362');
// Lounge.
rect(ctx,799,473,144,51,'#374739');rect(ctx,799,454,144,42,'#99835c');rect(ctx,806,461,61,34,'#b7a276');rect(ctx,875,461,61,34,'#b7a276');rect(ctx,791,465,13,45,'#83734f');rect(ctx,939,465,13,45,'#83734f');rect(ctx,818,526,102,16,'#a09473');rect(ctx,825,542,5,13,'#746b50');rect(ctx,906,542,5,13,'#746b50');rect(ctx,838,528,21,10,'#d6c4a0');text(ctx,'THE IDEA LOUNGE',791,441,'#cfc7a6',10);
// Details that make this David’s space.
convergentSign();wombatCabinet(49,246);soloScreen();plant(44,148,.9);plant(714,137,.8);plant(47,542,1.1);plant(704,547,.9);
team.forEach(desk);roomDrawing=false;
}
function drawPerson(c,a,x,y,walking=false,front=false){c.save();c.translate(Math.round(x),Math.round(y));const stride=walking?Math.sin(a.step*10)*3:0;rect(c,-10,3,22,4,'#222f28');rect(c,-6,-7,5,12+stride,'#28332f');rect(c,2,-7,5,12-stride,'#28332f');rect(c,-8,4+stride,7,3,'#d5cead');rect(c,2,4-stride,8,3,'#d5cead');rect(c,-9,-21,19,17,a.color);rect(c,-12,-19,4,12+(walking?stride:0),a.skin);rect(c,10,-19,4,12-(walking?stride:0),a.skin);rect(c,-6,-35,14,14,a.skin);rect(c,-8,-37,18,7,a.hair);rect(c,-8,-31,3,8,a.hair);rect(c,7,-31,3,7,a.hair);if(a.id==='byte'){rect(c,-10,-38,20,6,'#668f86');rect(c,-11,-33,24,3,'#87bdb5');}if(a.id==='echo'){rect(c,-12,-35,6,8,a.hair);rect(c,9,-35,6,8,a.hair);}if(a.id==='frame'){rect(c,-10,-30,4,9,'#b4bcc1');rect(c,9,-30,4,9,'#b4bcc1');}const faceFront=front||walking||a.mode!=='desk';if(faceFront){rect(c,-3,-28,2,2,'#2b2c25');rect(c,4,-28,2,2,'#2b2c25');if(a.id==='david'){rect(c,-6,-30,7,5,'#252b26');rect(c,2,-30,7,5,'#252b26');rect(c,0,-29,2,1,'#252b26');rect(c,-4,-29,3,2,'#c8c1a3');rect(c,4,-29,3,2,'#c8c1a3');}}else{rect(c,-5,-33,12,11,a.hair);rect(c,-6,-24,15,3,a.hair);}if(a.id==='david'){rect(c,-8,-20,18,14,'#30352c');rect(c,1,-18,3,9,'#b8d3c6');}if(a.mode==='coffee'&&!a.path.length){rect(c,11,-15,7,8,'#e1d2aa');rect(c,13,-17,3,2,'#af9f84');}if(a.mode==='desk'&&!paused&&!front){const hand=simTime%1<.5?0:2;rect(c,-13,-22+hand,5,4,a.skin);rect(c,11,-22-hand,5,4,a.skin);}c.restore();}
function positionPins(){for(const a of team){a.pin.style.left=a.x/10+'%';a.pin.style.top=a.y/6+'%';}if(speech){const bubble=$('#office-bubble'),a=speech.agent;bubble.style.left=Math.max(13,Math.min(87,a.x/10))+'%';bubble.style.top=(a.y-66)/6+'%';}}
function draw(){environment();[...team].sort((a,b)=>a.y-b.y).forEach(a=>{if(a===selected){rect(ctx,a.x-16,a.y+9,34,2,'#b8d3c6');rect(ctx,a.x-17,a.y+4,2,5,'#b8d3c6');rect(ctx,a.x+17,a.y+4,2,5,'#b8d3c6');}drawPerson(ctx,a,a.x,a.y,a.path.length>0);});positionPins();}
function update(dt){simTime+=dt;for(const a of team){a.step+=dt;if(a.path.length){const p=a.path[0],dx=p.x-a.x,dy=p.y-a.y,d=Math.hypot(dx,dy),move=dt*64;if(d<=move){a.x=p.x;a.y=p.y;a.path.shift();if(!a.path.length){if(a.mode==='return'||a.mode==='check'){a.mode='desk';a.until=simTime+20+a.index*4;if(a===selected)say(a,'返到位。Let’s make something good.',false);}else a.until=simTime+8+a.index;}}else{a.x+=dx/d*move;a.y+=dy/d*move;}}else if(simTime>a.until){if(a.mode==='desk'){const away=team.filter(t=>t.mode!=='desk').length;if(away<2){if(a.index%2)goCoffee(a);else goLounge(a);}else a.until=simTime+5;}else goHome(a);}}if(speech&&simTime>speech.until){speech=null;$('#office-bubble').hidden=true;}updateState();}
function frame(now){const dt=last?Math.min((now-last)/1000,.05):0;last=now;if(visible&&!document.hidden&&!paused){update(dt);draw();}requestAnimationFrame(frame);}
select(selected,false);setPaused(paused);applyZoom();draw();requestAnimationFrame(frame);
};
