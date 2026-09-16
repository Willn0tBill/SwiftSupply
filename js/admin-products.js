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
    .product-filters>div{min-width:0}
    .product-filters label{display:block;margin:0 0 6px;font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase}
    .product-filters .field{width:100%}
    .product-filter-count{min-height:22px;margin:0 0 8px;font-size:13px;color:var(--muted)}
    @media(max-width:800px){.product-filters{grid-template-columns:1fr 1fr}.product-filter-search{grid-column:1/-1}.product-filters button{width:100%}}
    @media(max-width:520px){.product-filters{grid-template-columns:1fr}.product-filter-search{grid-column:auto}}
  `;
  document.head.appendChild(style);

  function clean(value){return String(value??'').trim()}
  function lower(value){return clean(value).toLowerCase()}
  function inputValue(row,key){return clean(row.querySelector(`[data-p="${key}"]`)?.value)}
  function cellValue(row,label){return clean(row.querySelector(`[data-label="${label}"]`)?.textContent)}

  function getRows(){
    return [...table.querySelectorAll('tr')].filter(row=>row.querySelector('[data-p="brand"]')||row.querySelector('[data-p="name"]'));
  }

  function getProductData(row){
    return {
      brand:inputValue(row,'brand'),
      flavor:inputValue(row,'flavor'),
      name:inputValue(row,'name'),
      category:cellValue(row,'Category')
    };
  }

  function rebuildOptions(){
    const rows=getRows();
    const data=rows.map(getProductData);
    const brands=[...new Set(data.map(p=>p.brand).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    const categories=[...new Set(data.map(p=>p.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    const selectedBrand=brandFilter?.value||'';
    const selectedCategory=categoryFilter?.value||'';

    if(brandFilter){
      brandFilter.innerHTML='<option value="">All brands</option>'+brands.map(v=>`<option value="${escapeAttr(v)}">${escapeHtml(v)}</option>`).join('');
      if(brands.some(v=>lower(v)===lower(selectedBrand)))brandFilter.value=selectedBrand;
    }

    if(categoryFilter){
      categoryFilter.innerHTML='<option value="">All categories</option>'+categories.map(v=>`<option value="${escapeAttr(v)}">${escapeHtml(v)}</option>`).join('');
      if(categories.some(v=>lower(v)===lower(selectedCategory)))categoryFilter.value=selectedCategory;
    }

    return rows;
  }

  function escapeHtml(value){
    return String(value??'').replace(/[&<>"']/g,m=>({
      '&':'&amp;',
      '<':'&lt;',
      '>':'&gt;',
      '"':'&quot;',
      "'":'&#39;'
    }[m]));
  }

  function escapeAttr(value){return escapeHtml(value)}

  function applyFilters(){
    const rows=getRows();
    const query=lower(search?.value);
    const brand=lower(brandFilter?.value);
    const category=lower(categoryFilter?.value);
    let shown=0;

    rows.forEach(row=>{
      const p=getProductData(row);
      const searchable=lower(`${p.brand} ${p.flavor} ${p.name} ${p.category}`);
      const matchesSearch=!query||searchable.includes(query);
      const matchesBrand=!brand||lower(p.brand)===brand;
      const matchesCategory=!category||lower(p.category)===category;
      const show=matchesSearch&&matchesBrand&&matchesCategory;
      row.style.display=show?'':'none';
      if(show)shown++;
    });

    if(count){
      count.textContent=(query||brand||category)
        ? `${shown} of ${rows.length} products shown`
        : `${rows.length} products`;
    }
  }

  function refresh(){
    const rows=rebuildOptions();
    if(rows.length)applyFilters();
    else if(count)count.textContent='0 products';
  }

  search?.addEventListener('input',applyFilters);
  brandFilter?.addEventListener('change',applyFilters);
  categoryFilter?.addEventListener('change',applyFilters);

  clear?.addEventListener('click',()=>{
    if(search)search.value='';
    if(brandFilter)brandFilter.value='';
    if(categoryFilter)categoryFilter.value='';
    applyFilters();
  });

  let refreshQueued=false;
  const observer=new MutationObserver(()=>{
    if(refreshQueued)return;
    refreshQueued=true;
    requestAnimationFrame(()=>{
      refreshQueued=false;
      refresh();
    });
  });
  observer.observe(table,{childList:true,subtree:true});

  // Admin data loads asynchronously, so keep the first initialization reliable.
  let attempts=0;
  const boot=setInterval(()=>{
    refresh();
    attempts++;
    if(getRows().length||attempts>=30)clearInterval(boot);
  },250);

  refresh();
});
