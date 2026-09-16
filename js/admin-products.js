document.addEventListener('DOMContentLoaded',()=>{
  if(!location.pathname.includes('/admin/'))return;
  const table=document.getElementById('productsTable');
  if(!table)return;
  const $=s=>document.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const notice=t=>{const n=document.getElementById('adminNotice');if(n){n.textContent=t;n.style.display='block'}};
  const money=v=>'$'+Number(v||0).toFixed(2);
  async function loadProducts(){
    if(!window.sb)return;
    const {data,error}=await sb.from('products').select('*').order('brand').order('name');
    if(error){console.error(error);notice('Products could not be loaded. Check the Products table permissions.');return;}
    const products=data||[];
    table.innerHTML=products.length?products.map(p=>`<tr>
      <td data-label="Brand"><input class="field" data-p="brand" data-id="${p.id}" value="${esc(p.brand||'')}" placeholder="Monster"></td>
      <td data-label="Flavor"><input class="field" data-p="flavor" data-id="${p.id}" value="${esc(p.flavor||'')}" placeholder="Flavor"></td>
      <td data-label="Product"><input class="field" data-p="name" data-id="${p.id}" value="${esc(p.name||'')}"></td>
      <td data-label="Category">${esc(p.category||'')}</td>
      <td data-label="Price"><input class="field admin-number" data-p="price" data-id="${p.id}" type="number" step=".01" min="0" value="${Number(p.price||0)}"></td>
      <td data-label="Stock"><input class="field admin-number-small" data-p="stock" data-id="${p.id}" type="number" min="0" value="${Number(p.stock||0)}"></td>
      <td data-label="Active"><input data-p="active" data-id="${p.id}" type="checkbox" ${p.active?'checked':''}></td>
      <td data-label="Bundle Label"><input class="field bundle-input" data-p="bundle_label" data-id="${p.id}" value="${esc(p.bundle_label||'')}" placeholder="2 for $5"></td>
      <td data-label="Picture">${p.image_url?`<img class="admin-thumb" src="${esc(p.image_url)}" alt="">`:''}</td>
      <td data-label="Save"><button type="button" class="button button-secondary fallback-save-product" data-id="${p.id}">Save</button></td>
      <td data-label="Delete"><button type="button" class="button button-secondary fallback-delete-product" data-id="${p.id}">Delete</button></td>
    </tr>`).join(''):'<tr><td colspan="11" style="padding:24px;text-align:center">No products have been added yet.</td></tr>';
    table.querySelectorAll('.fallback-save-product').forEach(btn=>btn.onclick=async()=>{
      const id=btn.dataset.id, values={};
      table.querySelectorAll(`[data-id="${id}"]`).forEach(input=>{if(input.type==='checkbox')values[input.dataset.p]=input.checked;else if(input.dataset.p)values[input.dataset.p]=['price','stock'].includes(input.dataset.p)?Number(input.value):input.value.trim()||null});
      btn.disabled=true;btn.textContent='Saving...';
      const {error}=await sb.from('products').update({...values,updated_at:new Date().toISOString()}).eq('id',id);
      btn.disabled=false;btn.textContent=error?'Save':'Saved';notice(error?'Could not save product.':'Product saved.');
      if(!error)setTimeout(()=>btn.textContent='Save',1000);
    });
    table.querySelectorAll('.fallback-delete-product').forEach(btn=>btn.onclick=async()=>{
      const row=btn.closest('tr'),name=row?.querySelector('[data-p="name"]')?.value||'this product';
      if(!confirm(`Delete ${name}? This will remove the product completely.`))return;
      const {error}=await sb.from('products').delete().eq('id',btn.dataset.id);
      notice(error?'Could not delete product.':'Product deleted.');if(!error)loadProducts();
    });
  }
  const start=()=>setTimeout(loadProducts,300);
  document.addEventListener('supabase-ready',start);
  start();
});
