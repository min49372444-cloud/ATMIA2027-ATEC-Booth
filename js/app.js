/* ATEC Interactive Booth v11 — all product data comes from Excel-generated content.json */
const $ = id => document.getElementById(id);
const isMobile = () => window.matchMedia('(max-width:640px)').matches;
let centered = false;
let centerQueued = false;
const safePath = p => typeof p === 'string' && /^assets\/[a-zA-Z0-9_./-]+$/.test(p) && !p.includes('..') ? p : null;
function setImage(el,path,placeholder){
  const src=safePath(path);
  if(!src){el.hidden=true;if(placeholder)placeholder.hidden=false;return;}
  el.onload=()=>{el.hidden=false;if(placeholder)placeholder.hidden=true;if(el.id==='boothImage'){resizeBooth();scheduleCenter();}};
  el.onerror=()=>{el.hidden=true;if(placeholder){placeholder.hidden=false;placeholder.textContent='Booth image unavailable. Check the file path.';}};
  el.src=src;
  if(el.complete&&el.naturalWidth>0)el.onload();
}
function resizeBooth(){
  const frame=$('boothFrame'),canvas=$('boothCanvas'),img=$('boothImage');
  if(!frame||!canvas||!img)return;
  if(!isMobile()){canvas.style.width='';canvas.style.minWidth='';updateArrows();return;}
  if(!img.naturalWidth||!img.naturalHeight)return;
  const width=Math.max(frame.clientWidth,Math.round(frame.clientHeight*img.naturalWidth/img.naturalHeight));
  canvas.style.width=width+'px';canvas.style.minWidth=width+'px';
  updateArrows();
}
function scheduleCenter(){
  if(centered||centerQueued||!isMobile())return;
  centerQueued=true;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    centerQueued=false;
    if(centered||!isMobile())return;
    resizeBooth();
    const frame=$('boothFrame'),img=$('boothImage');
    if(!img.naturalWidth)return;
    const max=Math.max(0,frame.scrollWidth-frame.clientWidth);
    if(max>2){frame.scrollLeft=Math.round(max/2);centered=true;}
    updateArrows();
  }));
}
function updateArrows(){
  const frame=$('boothFrame'),left=$('boothArrowLeft'),right=$('boothArrowRight');
  const max=Math.max(0,frame.scrollWidth-frame.clientWidth);
  left.hidden=!isMobile()||max<=2||frame.scrollLeft<=2;
  right.hidden=!isMobile()||max<=2||frame.scrollLeft>=max-2;
}
function scrollBooth(direction){
  const frame=$('boothFrame');
  frame.scrollBy({left:direction*Math.max(180,Math.round(frame.clientWidth*.7)),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}
function openProduct(p){
  $('productTitle').textContent=p.name||p.id||'';
  $('productCategory').textContent=p.category||'';
  $('productDescription').textContent=p.description||'';
  const img=$('productImage');img.hidden=true;img.removeAttribute('src');setImage(img,p.image);
  $('features').replaceChildren();
  for(const feature of p.features||[]){if(!feature)continue;const li=document.createElement('li');li.textContent=feature;$('features').append(li);}
  $('featuresSection').hidden=!$('features').children.length;
  $('specs').replaceChildren();
  for(const spec of p.specifications||[]){if(!spec.name&&!spec.value)continue;const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=spec.name||'';dd.textContent=spec.value||'';$('specs').append(dt,dd);}
  $('specsSection').hidden=!$('specs').children.length;
  const path=safePath(p.brochure),brochure=$('brochure');brochure.hidden=!path;if(path)brochure.href=path;else brochure.removeAttribute('href');
  $('productDialog').showModal();
}
async function init(){
  try{
    const response=await fetch('data/content.json',{cache:'no-store'});
    if(!response.ok)throw new Error('content.json not found');
    const data=await response.json(),settings=data.settings||{};
    document.title=settings.page_title||"ATEC's e-Booth\n@ATMIA 2027";
    $('title').textContent=settings.page_title||"ATEC's e-Booth\n@ATMIA 2027";
    $('event').textContent=settings.event_name||'';
    $('subtitle').textContent=settings.subtitle||'';
    $('logo').addEventListener('load',()=>{$('brandFallback').hidden=true;});
    setImage($('logo'),settings.logo_image);
    setImage($('boothImage'),settings.booth_image,$('boothPlaceholder'));
    $('hotspots').replaceChildren();
    for(const p of data.products||[]){
      if(p.visible===false)continue;
      const btn=document.createElement('button');btn.type='button';btn.className='hotspot';btn.textContent=p.name||p.id;
      btn.style.left=Math.max(0,Math.min(100,Number(p.x)||0))+'%';
      btn.style.top=Math.max(0,Math.min(100,Number(p.y)||0))+'%';
      btn.setAttribute('aria-label','Explore '+(p.name||p.id));
      btn.addEventListener('click',()=>openProduct(p));$('hotspots').append(btn);
    }
    $('downloads').replaceChildren();let count=0;
    for(const d of data.downloads||[]){const path=safePath(d.path);if(d.visible===false||!path)continue;const a=document.createElement('a');a.href=path;a.target='_blank';a.rel='noopener';a.textContent=(d.label||'Download')+' ↗';$('downloads').append(a);count++;}
    if(!count){const p=document.createElement('p');p.className='muted';p.textContent='Resources will be available soon.';$('downloads').append(p);}
    if(settings.contact_email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.contact_email)){$('contact').hidden=false;$('contactLink').href='mailto:'+settings.contact_email;$('contactLink').textContent=settings.contact_email;}
    resizeBooth();scheduleCenter();
  }catch(e){console.error(e);$('subtitle').textContent='Unable to load website content.';}
}
$('closeDialog').addEventListener('click',()=>$('productDialog').close());
$('productDialog').addEventListener('click',e=>{if(e.target===$('productDialog'))$('productDialog').close();});
$('boothArrowLeft').addEventListener('click',()=>scrollBooth(-1));
$('boothArrowRight').addEventListener('click',()=>scrollBooth(1));
$('boothFrame').addEventListener('scroll',updateArrows,{passive:true});
window.addEventListener('resize',()=>{resizeBooth();scheduleCenter();});
window.addEventListener('pageshow',()=>{resizeBooth();scheduleCenter();});
if(typeof ResizeObserver!=='undefined'){const observer=new ResizeObserver(()=>{updateArrows();scheduleCenter();});observer.observe($('boothFrame'));observer.observe($('boothCanvas'));}
init();
