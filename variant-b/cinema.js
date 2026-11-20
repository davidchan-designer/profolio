(()=>{'use strict';
const root=document.documentElement,track=document.querySelector('.selected-grid');if(!track)return;
const stage=track.querySelector('.scene-stage'),cards=[...stage.querySelectorAll('.project')],buttons=[...stage.querySelectorAll('[data-scene]')];
const reduce=matchMedia('(prefers-reduced-motion:reduce)');
let active=false,frame=0,lastIndex=-1;
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(n,b));const smooth=n=>n*n*(3-2*n);
cards.forEach((card,i)=>{card.dataset.sceneIndex=i;card.style.zIndex=i+1;card.querySelector('img').loading='eager'});
for(const [src,side,alt] of [['../assets/5991fe5dc1b9.webp','left',''],['../assets/7d054317788f.webp','right','']]){const img=document.createElement('img');img.src=src;img.alt=alt;img.className=`scene-extra extra-${side}`;img.setAttribute('aria-hidden','true');cards[2].append(img)}
function clear(){root.classList.remove('scroll-cinema');for(const card of cards){card.inert=false;card.removeAttribute('aria-hidden');card.classList.remove('scene-visible','scene-active');card.style.removeProperty('visibility')}lastIndex=-1;cancelAnimationFrame(frame);frame=0}
function draw(){frame=0;if(!active||document.hidden)return;const rect=track.getBoundingClientRect(),vh=stage.clientHeight;const travel=Math.max(track.offsetHeight-vh,1),p=clamp(-rect.top/travel)*3.5;
 for(let i=0;i<cards.length;i++){const card=cards[i],local=p-i;const entry=i===0?1:smooth(clamp((local+.38)/.38));const outgoing=smooth(clamp((local-.62)/.38));const visible=local>=-.38&&local<1.02||i===3&&local>=-.38;card.classList.toggle('scene-visible',visible);card.style.setProperty('--scene-wipe',`${(1-entry)*100}%`);card.style.setProperty('--scene-y',`${outgoing*-vh*.12}px`);card.style.setProperty('--scene-z',`${outgoing*-180}px`);card.style.setProperty('--scene-tilt',`${outgoing*10}deg`);card.style.setProperty('--scene-scale',`${1.2-clamp(local+.2)*.18}`);card.style.setProperty('--image-x',`${i===1?(1-clamp(local))*40:0}px`);card.style.setProperty('--image-y',`${i===3?(1-clamp(local))*35:0}px`);card.style.setProperty('--caption-y',`${(1-entry)*100-outgoing*60}px`);card.style.setProperty('--caption-opacity',`${entry*(1-outgoing*.8)}`);card.style.setProperty('--evol-y',`${(1-clamp(local))*48}px`);card.style.setProperty('--evol-angle',`${(1-clamp(local))*-4}deg`);card.style.setProperty('--extra-left',`${(1-clamp(local))*-70}px`);card.style.setProperty('--extra-right',`${(1-clamp(local))*70}px`);card.style.setProperty('--extra-y',`${(1-clamp(local))*-36}px`);}
 // The incoming project owns interaction once more than half of its reveal is visible.
 const index=Math.min(3,Math.floor(p+.19));if(index!==lastIndex){lastIndex=index;cards.forEach((c,i)=>{c.classList.toggle('scene-active',i===index);c.inert=i!==index;c.setAttribute('aria-hidden',String(i!==index))});buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));document.querySelector('#scene-current').textContent=String(index+1).padStart(2,'0')}
}
function request(){if(active&&!frame&&!document.hidden)frame=requestAnimationFrame(draw)}
function sync(){const next=!reduce.matches&&root.classList.contains('motion-enabled');if(next===active){request();return}active=next;if(!active){clear();return}root.classList.add('scroll-cinema');draw()}
buttons.forEach((b,i)=>b.addEventListener('click',()=>{const travel=track.offsetHeight-stage.clientHeight;window.scrollTo({top:scrollY+track.getBoundingClientRect().top+(i+.12)/3.5*travel,behavior:'smooth'})}));
// Keyboard visitors can tab from scene controls to that scene's real project link.
buttons.forEach((b,i)=>b.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const n=clamp(i+(e.key==='ArrowRight'?1:-1),0,3);buttons[n].focus();buttons[n].click()}}));
new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['class']});reduce.addEventListener('change',sync);addEventListener('scroll',request,{passive:true});addEventListener('resize',request,{passive:true});addEventListener('pageshow',sync);document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else request()});sync();
})();
