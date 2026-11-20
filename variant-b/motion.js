(()=>{'use strict';
const root=document.documentElement;
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const mobile=matchMedia('(max-width: 540px)');
const animations=new Set();
let enabled=false,frame=0,observer=null,entered=false;
let optedOut=false;try{optedOut=localStorage.getItem('david-motion')==='off'}catch{}
const name=document.querySelector('.name');
if(name){name.setAttribute('aria-label','David Chan');name.innerHTML=['DAVID','CHAN'].map(w=>`<span class="name-word" aria-hidden="true">${[...w].map(c=>`<span class="name-letter">${c}</span>`).join('')}</span>`).join(' ')}
// The duplicate rolling layer is visual only; every link keeps one accessible name.
for(const link of document.querySelectorAll('.navigation nav a,.compare,.case-nav nav a,.contact-links a')){
 const text=[...link.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim();
 if(!text)continue;link.setAttribute('aria-label',text);
 for(const node of [...link.childNodes])if(node.nodeType===3)node.remove();
 const label=document.createElement('span');label.className='roll-label';label.setAttribute('aria-hidden','true');
 for(let i=0;i<2;i++){const row=document.createElement('span');row.textContent=text;label.append(row)}link.prepend(label);
}
const toggle=document.createElement('button');toggle.className='motion-toggle';toggle.type='button';
const compare=document.querySelector('.compare');
if(compare){const controls=document.createElement('div');controls.className='motion-controls';compare.before(controls);controls.append(compare,toggle)}
else document.querySelector('.case-nav')?.append(toggle);
function play(el,keyframes,options){const anim=el.animate(keyframes,options);animations.add(anim);anim.finished.catch(()=>{}).finally(()=>animations.delete(anim));return anim}
function entrance(){if(entered||!enabled)return;entered=true;
 const letters=document.querySelectorAll('.name-letter');
 letters.forEach((el,i)=>play(el,[{transform:`translateY(${mobile.matches?65:105}%) rotateX(-75deg)`,opacity:.15},{transform:'translateY(0) rotateX(0)',opacity:1}],{duration:720,delay:i*24,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'}));
 const title=document.querySelector('.case-intro h1');if(title)play(title,[{clipPath:'inset(0 0 95% 0)',transform:'translateY(22px)'},{clipPath:'inset(0)',transform:'translateY(0)'}],{duration:650,easing:'cubic-bezier(.16,1,.3,1)'});
}
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
function draw(){frame=0;if(!enabled||document.hidden)return;
 const vh=innerHeight;
 if(name){const header=document.querySelector('.masthead');const p=clamp(scrollY/Math.max(header.offsetHeight,1));name.style.setProperty('--name-y',`${p*(mobile.matches?12:46)}px`);name.style.setProperty('--name-angle',`${p*-16}deg`);name.style.setProperty('--name-opacity',`${1-p*.35}`)}
 const lead=document.querySelector('.lead .project-art');if(lead&&!mobile.matches&&!root.classList.contains('scroll-cinema')){const r=lead.getBoundingClientRect();if(r.bottom>0&&r.top<vh){const p=clamp((vh-r.top)/(vh*.85));lead.style.setProperty('--aperture',`${(1-p)*13}%`);lead.style.setProperty('--film-scale',`${1+(1-p)*.13}`)}}
 const landscape=document.querySelector('.wide .project-art');if(landscape&&!mobile.matches&&!root.classList.contains('scroll-cinema')){const r=landscape.getBoundingClientRect();if(r.bottom>0&&r.top<vh){const p=clamp((vh/2-(r.top+r.height/2))/vh,-1,1);landscape.style.setProperty('--landscape-y',`${p*28}px`)}}
 const film=document.querySelector('.film-player');if(film&&!mobile.matches&&!film.querySelector('iframe')){const r=film.getBoundingClientRect();const p=clamp((vh-r.top)/(vh*.8));film.style.setProperty('--case-inset',`${(1-p)*5}%`);film.style.setProperty('--case-y',`${(1-p)*18}px`)}
}
function requestDraw(){if(enabled&&!frame&&!document.hidden)frame=requestAnimationFrame(draw)}
function update(){enabled=!reduce.matches&&!optedOut;root.classList.toggle('motion-enabled',enabled);root.classList.toggle('motion-paused',!enabled);toggle.disabled=reduce.matches;toggle.setAttribute('aria-pressed',String(enabled));toggle.setAttribute('aria-label',reduce.matches?'Reduced motion enabled':enabled?'Turn animations off':'Turn animations on');toggle.innerHTML=`<svg viewBox="0 0 16 16" aria-hidden="true">${enabled?'<path d="M5 3v10M11 3v10"/>':'<path d="m5 3 8 5-8 5Z"/>'}</svg><span>${reduce.matches?'Reduced motion':enabled?'Motion on':'Motion off'}</span>`;
 if(!enabled){for(const anim of animations)anim.cancel();observer?.disconnect();cancelAnimationFrame(frame);frame=0;return}
 requestDraw();entrance();
 observer?.disconnect();observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;const el=entry.target;observer.unobserve(el);if(el.dataset.revealed)return;el.dataset.revealed='true';const isRight=el.closest('.project')?.querySelector('h3')?.textContent==='EVOL';play(el,[{clipPath:mobile.matches?'inset(0 0 9% 0)':`inset(0 ${isRight?'0':'9%'} 0 ${isRight?'9%':'0'})`},{clipPath:'inset(0)'}],{duration:800,easing:'cubic-bezier(.16,1,.3,1)'});}}, {threshold:.16});
 for(const el of document.querySelectorAll('.keyvisual .image-link'))observer.observe(el);
}
toggle.addEventListener('click',()=>{optedOut=!optedOut;try{localStorage.setItem('david-motion',optedOut?'off':'on')}catch{}update()});
addEventListener('scroll',requestDraw,{passive:true});addEventListener('resize',requestDraw,{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else requestDraw()});reduce.addEventListener('change',update);mobile.addEventListener('change',requestDraw);
// Scroll restoration/BFCache must settle into the current position, never replay a loader.
addEventListener('pageshow',requestDraw);
update();
})();
