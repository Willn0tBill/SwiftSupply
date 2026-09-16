document.addEventListener('DOMContentLoaded',()=>{
  if(!location.pathname.includes('/admin/'))return;
  const table=document.getElementById('productsTable');
  const filters=document.getElementById('productFilters');
  if(!table||!filters)return;

  const search=document.getElementById('productSearch');
  const brandFilter=document.getElementById('productBrandFilter');
  const categoryFilter=document.getElementById('productCategoryFilter');
  const clear=document.getElementById('clearProductFilters');
  const count=document.getElementById('productFilterCount');

  const style=document.createElement('style');
  style.textContent=`
    .product-filters{display:grid;grid-template-columns:minmax(240px,2fr) minmax(150px,1fr) minmax(150px,1fr) auto;gap:12px;align-items:end;margin:18px 0 10px;padding:16px;border:1px solid rgba(255,255,255,.08);border-radius:16px;background:rgba(255,255,255,.025)}
    .product-filters>div{min-width:0}.product-filters label{display:block;margin:0 0 6px;font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase}
    .product-filters .field{width:100%}.product-filter-count{min-height:22px;margin:0 0 8px;font-size:13px;color:var(--muted)}
    @media(max-width:800px){.product-filters{grid-template-columns:1fr 1fr}.product-filter-search{grid-column:1/-1}.product-filters button{width:100%}}
    @media(max-width:520px){.product-filters{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  let lastRows=[];

  function textOf(row,selector){return row.querySelector(selector)?.value?.trim()||''}
  function selectedValues(){return{
    search:(search?.value||'').trim().toLowerCase(),
    brand:(brandFilter?.value||'').trim().toLowerCase(),
    category:(categoryFilter?.value||'').trim().toLowerCase()
  }}

  function updateOptions(rows){
    const brands=[...new Set(rows.map(r=>textOf(r,'[data-p="brand"]')).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    const categories=[...new Set(rows.map(r=>r.querySelector('[data-label="Category"]')?.textContent?.trim()||'').filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    const oldBrand=brandFilter.value,oldCategory=categoryFilter.value;
    brandFilter.innerHTML='<option value="">All brands</option>'+brands.map(v=>`<option value="${escapeAttr(v)}">${escapeHtml(v)}</option>`).join('');
    categoryFilter.innerHTML='<option value="">All categories</option>'+categories.map(v=>`<option value="${escapeAttr(v)}">${escapeHtml(v)}</option>`).join('');
    if(brands.some(v=>v.toLowerCase()===oldBrand))brandFilter.value=oldBrand;
    if(categories.some(v=>v.toLowerCase()===oldCategory))categoryFilter.value=oldCategory;
  }

  function escapeHtml(value){return String(value??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]))}
  function escapeAttr(value){return escapeHtml(value)}

  function applyFilters(){
    const f=selectedValues();
    let shown=0;
    [...table.querySelectorAll('tr')].forEach(row=>{
      if(!row.querySelector('[data-p="brand"]'))return;
      const brand=textOf(row,'[data-p="brand"]'),flavor=textOf(row,'[data-p="flavor"]'),name=textOf(row,'[data-p="name"]');
      const category=row.querySelector('[data-label="Category"]')?.textContent?.trim()||'';
      const haystack=`${brand} ${flavor} ${name}`.toLowerCase();
      const matchesSearch=!f.search||haystack.includes(f.search);
      const matchesBrand=!f.brand||brand.toLowerCase()===f.brand;
      const matchesCategory=!f.category||category.toLowerCase()===f.category;
      const show=matchesSearch&&matchesBrand&&matchesCategory;
      row.style.display=show?'':'none';
      if(show)shown++;
    });
    const total=lastRows.length;
    if(count)count.textContent=(f.search||f.brand||f.category)?`${shown} of ${total} products shown`:`${total} products`;
  }

  function refresh(){
    const rows=[...table.querySelectorAll('tr')].filter(r=>r.querySelector('[data-p="brand"]'));
    if(rows.length){lastRows=rows;updateOptions(rows)}else if(lastRows.length){lastRows=[];brandFilter.innerHTML='<option value="">All brands</option>';categoryFilter.innerHTML='<option value="">All categories</option>'}
    applyFilters();
  }

  search?.addEventListener('input',applyFilters);
  brandFilter?.addEventListener('change',applyFilters);
  categoryFilter?.addEventListener('change',applyFilters);
  clear?.addEventListener('click',()=>{search.value='';brandFilter.value='';categoryFilter.value='';applyFilters()});

  const observer=new MutationObserver(()=>requestAnimationFrame(refresh));
  observer.observe(table,{childList:true,subtree:true});
  setTimeout(refresh,350);
});
