(() => {
'use strict';
const raw=window.PORTFOLIO_DATA;
const grid=document.querySelector('#project-grid');
if(!raw){grid.innerHTML='<p class="empty-state">The project library could not load. Please refresh the page.</p>';return;}
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=s=>String(s??'').replace(/<br\s*\/?\s*>/gi,' ').replace(/<[^>]*>/g,'').replace(/\b(Seedance|GPT Image) 2\.5/g,'$1');
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const web3Names=new Set(['Hailstone Labs','Convergent','Wombat Exchange','Sable Finance','Narwhal Finance','Crypto Wesearch','SoloMission','PingBusiness']);
const projects=[];
for(const [category,data] of Object.entries(raw)) for(const p of data.projects){if(p.hidden)continue;const id=slug(p.title);projects.push({...p,id,category,web3:web3Names.has(p.title),ai:category==='ai'||p.title==='Convergent'});}
const byId=Object.fromEntries(projects.map(p=>[p.id,p]));
const openingProjects=['solomission','pingbusiness','evol','convergent','wombat-exchange','znooz','hailstone-labs','catherine-lim','hungry-ryan'];
const filterLeads={web3:['convergent','wombat-exchange','hailstone-labs','solomission'],ai:['pingbusiness','znooz','solomission','evol'],motion:['wombat-exchange','pingbusiness','znooz','solomission']};
const PAGE_SIZE=4;
const archive=[...openingProjects.map(id=>byId[id]),...projects.filter(p=>!openingProjects.includes(p.id))];
const editorial={
 'znooz':{tags:'PRODUCT · PHOTOGRAPHY · AI IMAGERY'},
 'pingbusiness':{tags:'WEB3 · AI VIDEO · STORYBOARD'},
 'convergent':{tags:'WEB3 · AI · IDENTITY',desc:'An AI-assisted visual identity for a Solana DeFi protocol.',summary:'AI-assisted brand visuals for Convergent, developed across identity, social content and website applications.'},
 'hailstone-labs':{tags:'WEB3 · BRAND · DIGITAL',desc:'A connected visual identity for a research-driven venture studio.',summary:'A visual system for Hailstone Labs spanning identity, website UI/UX, social content and event materials.'},
 'evol':{tags:'AI · CAMPAIGN · ART DIRECTION',desc:'AI imagery and layout for a Hong Kong social campaign.',summary:'A social campaign for a Hong Kong dating brand, combining AI imagery with art direction and layout.'},
 'wombat-exchange':{tags:'WEB3 · MOTION · GRAPHICS',desc:'Tutorial animations for cross-chain swaps and WOM locking, alongside social graphics and campaign banners.'},
 'hungry-ryan':{tags:'AI · CHARACTER · PERSONAL',desc:'Food imagery and character consistency, explored through an AI persona.',summary:'A personal AI character experiment exploring consistent portrait generation, food imagery and short-form social content.'},
 'catherine-lim':{tags:'AI · DIGITAL CHARACTER',desc:'A digital character exploring fashion and lifestyle storytelling.',summary:'A personal exploration of AI-generated character imagery, fashion and lifestyle content.'},
 'solomission':{tags:'WEB3 · SOCIAL · AI FILM',desc:'Campaign graphics on digital identity, alongside the SoloMission sci-fi short.',summary:'The SoloMission AI short film, followed by a collection of SOLO visuals on identity, privacy and online communities.'}
};
function imageSize(src){
 const size=window.PORTFOLIO_IMAGE_SIZES?.[src];
 return size?` width="${size[0]}" height="${size[1]}"`:'';
}
let activeFilter='all',visibleCount=PAGE_SIZE;
function renderProjects(filter){
 activeFilter=filter;
 const leads=filterLeads[filter]||[];
 const ordered=[...leads.map(id=>byId[id]),...archive.filter(p=>!leads.includes(p.id))];
 const list=ordered.filter(p=>filter==='all'||filter==='web3'&&p.web3||filter==='ai'&&p.ai||filter==='motion'&&(p.category==='motion'||['solomission','pingbusiness','znooz'].includes(p.id)));
 const visible=list.slice(0,visibleCount);
 grid.innerHTML=visible.map((p,index)=>{const ed=editorial[p.id]||{};return `<article class="project-card" data-id="${p.id}"><a class="project-image project-link" href="#project/${p.id}" aria-label="View ${escape(p.title)} project"><img src="${escape(p.img)}" alt="${escape(p.title)} project artwork" width="960" height="680" loading="${index<2?'eager':'lazy'}" decoding="async"><span class="project-open" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 19 19 5M5 5h14v14"/></svg></span></a><div class="card-meta"><h3><a class="project-link" href="#project/${p.id}">${escape(p.title)}</a></h3><span class="card-tags">${escape(ed.tags||[p.web3?'Web3':'',p.ai?'AI':'',raw[p.category].title].filter(Boolean).join(' · '))}</span></div><p class="card-description">${escape(ed.desc||clean(p.desc))}</p></article>`;}).join('');
 document.querySelectorAll('[data-filter]').forEach(b=>{const on=b.dataset.filter===filter;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on);});
 document.querySelector('#result-count').textContent=`${visible.length} of ${list.length} projects`;
 const more=document.querySelector('#show-more'),remaining=list.length-visible.length;
 more.hidden=remaining===0;
 more.textContent=`Show ${Math.min(PAGE_SIZE,remaining)} more projects`;
 document.querySelector('#show-less').hidden=visibleCount<=PAGE_SIZE;
 document.querySelector('#work-pagination-note').textContent=remaining?`${remaining} more ${filter==='all'?'':filter==='ai'?'AI ':filter==='web3'?'Web3 ':'motion '}projects to explore.`:'You’ve reached the end of this collection.';
}
function browseProjects(filter){visibleCount=PAGE_SIZE;renderProjects(filter);}
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>browseProjects(b.dataset.filter)));
document.querySelectorAll('[data-browse]').forEach(link=>link.addEventListener('click',()=>browseProjects(link.dataset.browse)));
document.querySelector('#show-more').addEventListener('click',()=>{const firstNew=grid.children.length;visibleCount+=PAGE_SIZE;renderProjects(activeFilter);grid.children[firstNew]?.querySelector('a').focus({preventScroll:true});});
document.querySelector('#show-less').addEventListener('click',()=>{browseProjects(activeFilter);document.querySelector('[data-filter="'+activeFilter+'"]').focus();});
const dialog=document.querySelector('#project-dialog');let returnHash='#work',lastTrigger=null,openedFromPage=false,activeProject=null;
const arrowIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>';
function videoHTML(item){
 if(item.type==='instagram' && /^[A-Za-z0-9_-]+$/.test(item.id)){
  const path=item.isPost?'p':'reel';
  return `<a class="video-fallback" href="https://www.instagram.com/${path}/${item.id}/" target="_blank" rel="noopener noreferrer">${escape(item.caption||'View post')} on Instagram ${arrowIcon}</a>`;
 }
 if(item.type==='youtube'){
  const safeId=/^[\w-]{6,20}$/.test(item.id)?item.id:'';
  return `<figure class="case-video"><button class="video-placeholder ${item.orientation==='portrait'?'portrait':''}" data-video="${safeId}" data-orientation="${item.orientation||'landscape'}" aria-label="Play ${escape(item.caption||'project video')}"><img src="https://i.ytimg.com/vi/${safeId}/hqdefault.jpg" alt="" loading="lazy"><span class="video-play"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m8 5 11 7-11 7Z"/></svg> Play film</span></button><figcaption><span>${escape(item.caption||'')}</span><a class="video-fallback" href="https://www.youtube.com/watch?v=${safeId}" target="_blank" rel="noopener noreferrer">Watch on YouTube ${arrowIcon}</a></figcaption></figure>`;
 }
 if(item.type==='video')return `<figure class="case-video local-film"><video controls playsinline preload="none" width="${item.orientation==='portrait'?720:1280}" height="${item.orientation==='portrait'?1280:720}" ${item.poster?`poster="${escape(item.poster)}"`:''} src="${escape(item.src)}" aria-label="Play ${escape(item.caption)}">Your browser does not support embedded video.</video><figcaption><span class="film-caption"><strong>${escape(item.caption)}</strong>${item.label?`<small>${escape(item.label)}</small>`:''}</span>${item.duration?`<span class="film-duration">${escape(item.duration)}</span>`:''}</figcaption><a class="film-direct" aria-label="Open video: ${escape(item.caption)}" href="${escape(item.src)}" target="_blank" rel="noopener">Open video ${arrowIcon}</a></figure>`;
 return '';
}
function imageHTML(src,alt,caption=''){
 return `<figure class="case-image"><a class="artwork-link" href="${escape(src)}" target="_blank" rel="noopener" aria-label="View full image: ${escape(alt||'Project artwork')}"><img src="${escape(src)}" alt="${escape(alt||'Project artwork')}"${imageSize(src)} loading="lazy" decoding="async"><span class="artwork-expand" aria-hidden="true">${arrowIcon}</span></a>${caption?`<figcaption>${escape(caption)}</figcaption>`:''}</figure>`;
}
function galleryHTML(items){
 return (items||[]).map(item=>{
  const heading=item.heading?`<header class="case-section-heading"><h3>${escape(item.heading)}</h3></header>`:'';
  let media='';
  if(item.type==='video-selection')media=`<div class="film-selection">${item.videos.map(videoHTML).join('')}</div>${item.moreVideos?.length?`<details class="more-films"><summary>More videos <span>${item.moreVideos.length} films</span></summary><div class="film-selection film-selection-more">${item.moreVideos.map(videoHTML).join('')}</div></details>`:''}`;
  else if(item.type==='image-collection')media=`<div class="gallery-grid">${item.images.map(im=>imageHTML(im.src,im.alt)).join('')}</div>${item.moreImages?.length?`<details class="more-artwork"><summary>More artwork <span>${item.moreImages.length} images</span></summary><div class="gallery-grid">${item.moreImages.map(im=>imageHTML(im.src,im.alt)).join('')}</div></details>`:''}`;
  else if(item.type==='image')media=imageHTML(item.src,item.caption,item.caption);
  else if(item.type==='image-grid')media=`<div class="gallery-grid${item.images.length===1?' single-image':''}${item.layout==='square-and-landscape'?' square-and-landscape':''}">${item.images.map(im=>imageHTML(im.src,im.alt)).join('')}</div>`;
  else if(item.type==='grid-video')media=`<div class="gallery-grid video-grid">${item.videos.map(videoHTML).join('')}</div>`;
  else media=videoHTML(item);
  return `<section class="case-section case-section-${escape(item.type)}"${item.id||item.type==='video-selection'?` id="${escape(item.id||'ping-films')}" tabindex="-1"`:''}>${heading}${item.intro?`<p class="case-section-note">${escape(item.intro)}</p>`:''}${media}</section>`;
 }).join('');
}
function openProject(id){
 const p=byId[id];
 if(!p){
  history.replaceState(null,'','#work');dismissProject();openedFromPage=false;
  document.querySelector('#work').scrollIntoView({behavior:'instant'});
  toast('This project could not be found. Browse the collection below.');return;
 }
 if(dialog.open&&activeProject===id)return;
 activeProject=id;
 const ed=editorial[id]||{},gallery=p.details.gallery||[];
 const roleLabel=['Venture Studio','Bakery Brand','DeFi Protocol'].includes(p.role)?'Project type':'Role';
 const cover=p.details.cover?.src||p.img;
 const coverInGallery=gallery.some(item=>item.src===cover||item.images?.some(image=>image.src===cover));
 const coverHTML=`<figure class="case-cover"><img src="${escape(cover)}" alt="${escape(p.details.cover?.alt||p.title+' artwork')}"${imageSize(cover)} decoding="async">${id==='znooz'?`<figcaption><a class="film-direct" href="${escape(cover)}" target="_blank" rel="noopener">View full cover ${arrowIcon}</a></figcaption>`:''}</figure>`;
 const mediaCase=id==='pingbusiness'||p.details.presentation==='media';
 const filmTarget=gallery.find(item=>item.type==='video-selection')?.id||'ping-films';
 const services=p.details.services.filter(service=>!(id==='convergent'&&service==='Brand Strategy'));
 document.querySelector('#project-content').innerHTML=`<article class="case-study" data-project="${escape(id)}">${mediaCase?`<header class="case-header case-header-film"><div class="case-title-block"><h2 id="detail-title">${escape(p.title)}</h2><p class="detail-category">${escape(ed.tags)}</p><p class="detail-description">${escape(clean(p.details.longDesc))}</p><div class="case-film-actions"><button class="case-watch-link" data-watch-films="${escape(filmTarget)}" aria-controls="${escape(filmTarget)}">${id==='znooz'?'Watch product videos':'Watch selected films'} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 4v16m-6-6 6 6 6-6"/></svg></button>${id==='pingbusiness'?`<a class="case-client-link" href="https://pingbusiness.org/" target="_blank" rel="noopener noreferrer">Visit PingBusiness ${arrowIcon}</a>`:`<button class="case-section-link" data-case-section="znooz-ai" aria-controls="znooz-ai">AI imagery</button><button class="case-section-link" data-case-section="znooz-graphics" aria-controls="znooz-graphics">Product graphics</button>`}</div></div>${coverHTML}</header>`:`<header class="case-header"><div class="case-title-block"><h2 id="detail-title">${escape(p.title)}</h2><p class="detail-category">${escape(ed.tags||raw[p.category].title)}</p></div><p class="detail-description">${escape(ed.summary||clean(p.details.longDesc))}</p></header>`}<dl class="case-facts"><div><dt>${roleLabel}</dt><dd>${escape(p.role)}</dd></div>${id==='solomission'?'':`<div><dt>Client</dt><dd>${escape(p.client)}</dd></div>`}<div class="case-services"><dt>Contributions</dt><dd><ul>${services.map(service=>`<li>${escape(service)}</li>`).join('')}</ul></dd></div></dl>${coverInGallery||mediaCase?'':coverHTML}<div class="gallery case-gallery">${galleryHTML(gallery)}</div></article>`;
 if(!dialog.open){dialog.showModal();document.body.classList.add('modal-open');}
 dialog.scrollTop=0;document.title=p.title+' — David Chan';
}
function dismissProject(){
 document.querySelectorAll('#project-content video').forEach(video=>video.pause());
 if(dialog.open)dialog.close();
 activeProject=null;
 document.body.classList.remove('modal-open');
 document.querySelector('#project-content').innerHTML='';
 document.title='David Chan — Web3, Motion & AI Design';
 if(lastTrigger?.isConnected)lastTrigger.focus({preventScroll:true});
}
function closeProject(){
 if(!dialog.open)return;
 dismissProject();
 if(location.hash.startsWith('#project/')){
  if(openedFromPage)history.back();
  else {history.replaceState(null,'',returnHash);document.querySelector(returnHash)?.scrollIntoView({behavior:'instant'});}
 }
 openedFromPage=false;
}
function route(){
 if(location.hash==='#ai'||location.hash==='#web3'){browseProjects(location.hash.slice(1));document.querySelector('#work').scrollIntoView();}
 if(location.hash==='#studio')document.querySelector('.studio-disclosure').open=true;
 if(location.hash==='#project/wombat-exchange-graphics')history.replaceState(history.state,'','#project/wombat-exchange');
 if(location.hash.startsWith('#project/')){
  let id;try{id=decodeURIComponent(location.hash.slice(9));}catch{id='';}
  openProject(id);
 }else if(dialog.open)dismissProject();
}
document.addEventListener('click',e=>{const jump=e.target.closest('[data-watch-films], [data-case-section]');if(jump){const section=document.getElementById(jump.dataset.caseSection||jump.dataset.watchFilms);if(!section)return;section.focus({preventScroll:true});section.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}const link=e.target.closest('a.project-link');if(link){e.preventDefault();returnHash=location.hash||'#work';lastTrigger=link;openedFromPage=true;history.pushState(null,'',link.getAttribute('href'));route();}const play=e.target.closest('[data-video]');if(play){const frame=document.createElement('iframe');frame.className='video-frame '+(play.dataset.orientation==='portrait'?'portrait':'');frame.src='https://www.youtube-nocookie.com/embed/'+play.dataset.video+'?autoplay=1&rel=0';frame.title=play.getAttribute('aria-label');frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';frame.allowFullscreen=true;play.replaceWith(frame);}});
document.querySelector('#close-project').addEventListener('click',closeProject);dialog.addEventListener('cancel',e=>{e.preventDefault();closeProject();});dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeProject();}});window.addEventListener('hashchange',route);window.addEventListener('popstate',route);
let toastTimer;function toast(message){const el=document.querySelector('#toast');(dialog.open?dialog:document.body).append(el);el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3500);}
document.querySelector('#copy-link').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);toast('Project link copied.');}catch{toast('Copy the project URL from your browser’s address bar.');}});
document.addEventListener('error',e=>{if(e.target instanceof HTMLImageElement){e.target.alt=e.target.alt||'Project image unavailable';e.target.classList.add('image-unavailable');}},true);
document.addEventListener('toggle',e=>{if(e.target.matches?.('.more-films')&&!e.target.open)e.target.querySelectorAll('video').forEach(video=>video.pause());},true);
document.addEventListener('play',e=>{if(e.target instanceof HTMLVideoElement)document.querySelectorAll('#project-content video').forEach(v=>{if(v!==e.target)v.pause();});},true);
renderProjects('all');
let officeReady=false;
const studio=document.querySelector('.studio-disclosure');
studio.addEventListener('toggle',()=>{
 if(studio.open&&!officeReady){window.initOffice?.({projects:byId});officeReady=true;}
 if(studio.open&&location.hash==='#studio')requestAnimationFrame(()=>document.querySelector('#studio').scrollIntoView({behavior:'instant',block:'start'}));
});
route();
})();
