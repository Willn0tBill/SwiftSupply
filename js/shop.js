let products=[];let filter='All';let brandFilter='All';

function money(v){return '$'+Number(v||0).toFixed(2)}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

function startShop(){
  const params=new URLSearchParams(location.search);
  brandFilter=params.get('brand')||'All';
  document.getElementById('search')?.addEventListener('input',render);
  document.querySelectorAll('.filter[data-filter]').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('.filter[data-filter]').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');filter=b.dataset.filter;render();
  }));
  document.getElementById('stockOnly')?.addEventListener('change',render);
  if(window.sb) loadProducts();
}
document.addEventListener('DOMContentLoaded',startShop);
document.addEventListener('supabase-ready',loadProducts);
window.addEventListener('cart-updated',()=>{if(products.length)render()});

async function loadProducts(){
  if(!window.sb)return;
  const status=document.getElementById('shopStatus');
  try{
    if(status)status.textContent='Loading products...';
    const {data,error}=await sb.from('products').select('*').eq('active',true).order('brand').order('name');
    if(error)throw error;
    products=data||[];
    if(brandFilter!=='All'&&!products.some(p=>(p.brand||'').toLowerCase()===brandFilter.toLowerCase()))brandFilter='All';
    buildBrandFilters();
    if(status)status.textContent=products.length?products.length+' products in the catalog.':'No products are currently listed.';
    render();
  }catch(e){
    console.error('SwiftSupply catalog error:',e);
    if(status)status.textContent='Could not load the catalog. Refresh the page and try again.';
    const empty=document.getElementById('empty');if(empty){empty.hidden=false;empty.textContent='The catalog could not be loaded.'}
  }
}
function buildBrandFilters(){
  const row=document.getElementById('brandFilters');if(!row)return;
  const brands=[...new Set(products.map(p=>p.brand).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  row.innerHTML=['All',...brands].map(b=>`<button type="button" class="filter brand-filter ${b.toLowerCase()===brandFilter.toLowerCase()?'active':''}" data-brand="${esc(b)}">${esc(b)}</button>`).join('');
  row.querySelectorAll('[data-brand]').forEach(b=>b.addEventListener('click',()=>{
    row.querySelectorAll('[data-brand]').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');brandFilter=b.dataset.brand;render();
  }));
}
function render(){
  const root=document.getElementById('products'),empty=document.getElementById('empty'),status=document.getElementById('shopStatus');
  if(!root||!empty)return;
  const q=(document.getElementById('search')?.value||'').toLowerCase().trim();
  const stockOnly=!!document.getElementById('stockOnly')?.checked;
  const list=products.filter(p=>{
    const available=Math.max(0,Number(p.stock||0)-(window.SwiftCart?.reserved(p.id)||0));
    return (filter==='All'||p.category===filter)&&(brandFilter==='All'||(p.brand||'').toLowerCase()===brandFilter.toLowerCase())&&(!q||[p.name,p.description,p.category,p.brand,p.flavor].join(' ').toLowerCase().includes(q))&&(!stockOnly||available>0);
  });
  if(status&&products.length)status.textContent=list.length===products.length?`${products.length} products in the catalog.`:`${list.length} of ${products.length} products shown.`;
  root.innerHTML=list.map(p=>{
    const available=Math.max(0,Number(p.stock||0)-(window.SwiftCart?.reserved(p.id)||0));
    return `<article class="product-card reveal visible"><a class="product-image" href="product.html?id=${encodeURIComponent(p.id)}">${p.image_url?`<img src="${esc(p.image_url)}" alt="${esc(p.name)}" loading="lazy">`:'<span>SwiftSupply</span>'}</a><div class="product-body"><span class="product-category">${esc(p.brand||p.category)}${p.flavor?` · ${esc(p.flavor)}`:''}</span><h3><a href="product.html?id=${encodeURIComponent(p.id)}">${esc(p.name)}</a></h3><p>${esc(p.description||'')}</p><div class="product-bottom"><strong>${money(p.price)}</strong><span class="stock-pill ${available>0?'in':'out'}">${available>0?available+' in stock':'Out of stock'}</span></div>${p.bundle_label?`<small>${esc(p.bundle_label)}</small>`:''}<div class="button-row"><button type="button" class="button button-primary add-cart" data-id="${p.id}" ${available<1?'disabled':''}>${available>0?'Add to Cart':'Out of Stock'}</button><a class="button button-secondary" href="product.html?id=${encodeURIComponent(p.id)}">Details</a></div></div></article>`;
  }).join('');
  empty.hidden=!!list.length;
  root.querySelectorAll('.add-cart').forEach(b=>b.addEventListener('click',()=>{
    const p=products.find(x=>x.id===b.dataset.id);if(!p||!window.SwiftCart)return;
    const result=SwiftCart.add(p,1);
    if(result.ok){render()}else{b.textContent='Out of Stock';}
  }));
}