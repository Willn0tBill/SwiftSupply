(()=>{
  if(!location.pathname.includes('/admin/'))return;
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  let requests=[];
  function ensurePanel(){
    const dashboard=document.getElementById('dashboard');
    if(!dashboard||document.getElementById('powerWashingAdminPanel'))return;
    const panel=document.createElement('section');
    panel.id='powerWashingAdminPanel';
    panel.className='admin-panel';
    panel.style.marginTop='20px';
    panel.innerHTML=`<div class="panel-heading"><div><p class="eyebrow">SSPW · SWIFTSUPPLY POWER WASHING</p><h3>SSPW Requests</h3><p class="section-intro" style="margin-bottom:0">Track quote requests, update their status, and delete old ones when you no longer need them.</p></div><select id="pwRequestFilter" class="field admin-filter"><option value="active">Active requests</option><option value="all">All requests</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div><div class="table-wrap"><table class="admin-table"><thead><tr><th>Date</th><th>Name</th><th>Contact</th><th>Area</th><th>Service</th><th>Property</th><th>Size</th><th>Preferred</th><th>Notes</th><th>Status</th><th>Save</th><th>Delete</th></tr></thead><tbody id="pwRequestsTable"></tbody></table></div>`;
    const productRequestTable=document.getElementById('requestsTable');
    const requestPanel=productRequestTable?.closest('.admin-panel');
    if(requestPanel)requestPanel.insertAdjacentElement('afterend',panel);else dashboard.appendChild(panel);
    document.getElementById('pwRequestFilter')?.addEventListener('change',render);
  }
  function addStat(){
    const stats=document.getElementById('stats');if(!stats)return;
    let card=document.getElementById('pwRequestStat');
    if(!card){card=document.createElement('div');card.id='pwRequestStat';card.className='stat';stats.appendChild(card)}
    const active=requests.filter(r=>!['completed','cancelled'].includes(r.status)).length;
    card.innerHTML=`<strong>${active}</strong><span>SSPW Leads</span>`;
  }
  function render(){
    ensurePanel();
    const table=document.getElementById('pwRequestsTable');if(!table)return;
    const mode=document.getElementById('pwRequestFilter')?.value||'active';
    let rows=[...requests];
    if(mode==='active')rows=rows.filter(r=>!['completed','cancelled'].includes(r.status));
    if(mode==='completed')rows=rows.filter(r=>r.status==='completed');
    if(mode==='cancelled')rows=rows.filter(r=>r.status==='cancelled');
    table.innerHTML=rows.map(r=>`<tr><td data-label="Date">${new Date(r.created_at).toLocaleString()}</td><td data-label="Name">${esc(r.name)}</td><td data-label="Contact">${esc(r.email||r.phone||'')}</td><td data-label="Area">${esc(r.city||'—')}</td><td data-label="Service">${esc(r.service_type||'—')}</td><td data-label="Property">${esc(r.property_type||'—')}</td><td data-label="Size">${esc(r.size_estimate||'—')}</td><td data-label="Preferred">${esc(r.preferred_date||'Flexible')}</td><td data-label="Notes">${esc(r.notes||'—')}</td><td data-label="Status"><select class="field pw-status" data-id="${r.id}"><option value="new" ${r.status==='new'?'selected':''}>new</option><option value="contacted" ${r.status==='contacted'?'selected':''}>contacted</option><option value="quoted" ${r.status==='quoted'?'selected':''}>quoted</option><option value="scheduled" ${r.status==='scheduled'?'selected':''}>scheduled</option><option value="completed" ${r.status==='completed'?'selected':''}>completed</option><option value="cancelled" ${r.status==='cancelled'?'selected':''}>cancelled</option></select></td><td data-label="Save"><button class="button button-secondary pw-save" data-id="${r.id}">Save</button></td><td data-label="Delete"><button class="button button-secondary pw-delete" data-id="${r.id}" style="border-color:#7f1d1d;color:#fca5a5">Delete</button></td></tr>`).join('');
    table.querySelectorAll('.pw-save').forEach(button=>button.onclick=async()=>{const status=table.querySelector(`.pw-status[data-id="${button.dataset.id}"]`)?.value;button.disabled=true;const{error}=await sb.from('powerwashing_requests').update({status,updated_at:new Date().toISOString()}).eq('id',button.dataset.id);button.disabled=false;const notice=document.getElementById('adminNotice');if(notice){notice.textContent=error?'Could not update SSPW request.':'SSPW request updated.';notice.style.display='block'}if(!error)load()});
    table.querySelectorAll('.pw-delete').forEach(button=>button.onclick=async()=>{const request=requests.find(r=>r.id===button.dataset.id);if(!request||!confirm(`Delete the SSPW request from ${request.name}? This cannot be undone.`))return;button.disabled=true;const{error}=await sb.from('powerwashing_requests').delete().eq('id',button.dataset.id);const notice=document.getElementById('adminNotice');if(notice){notice.textContent=error?'Could not delete SSPW request.':'SSPW request deleted.';notice.style.display='block'}if(!error)load();else button.disabled=false});
    addStat();
  }
  async function load(){
    if(!window.sb)return;
    const{data:{session}}=await sb.auth.getSession();
    if(!session||!window.SWIFTSUPPLY_CONFIG||String(session.user.email||'').toLowerCase()!==String(SWIFTSUPPLY_CONFIG.ADMIN_EMAIL||'').toLowerCase())return;
    ensurePanel();
    const{data,error}=await sb.from('powerwashing_requests').select('*').order('created_at',{ascending:false});
    if(error){console.error('Could not load SSPW requests',error);return}
    requests=data||[];render();
  }
  function init(){ensurePanel();load();window.sb?.auth?.onAuthStateChange(()=>setTimeout(load,0))}
  if(window.sb)init();else document.addEventListener('supabase-ready',init,{once:true});
})();