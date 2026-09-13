document.addEventListener("DOMContentLoaded", () => {
  if (!location.pathname.includes("/admin/")) return;

  const style = document.createElement("style");
  style.textContent = `.admin-wrap{width:100%}.admin-grid{align-items:start}.admin-panel{min-width:0}.table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:14px}.admin-table{min-width:1150px}.admin-table th,.admin-table td{vertical-align:middle;white-space:normal}.admin-table .field{box-sizing:border-box}.admin-number{width:100px}.admin-number-small{width:90px}.bundle-input{min-width:130px}.admin-thumb{width:56px;height:56px;object-fit:cover;border-radius:10px;border:1px solid var(--border);display:block;margin-bottom:6px}.save-success{border-color:#86efac!important;color:#15803d!important;background:#f0fdf4!important}`;
  document.head.appendChild(style);

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? "").replace(/[&<>\"']/g, (m) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
  let products = [];
  let editingAnnouncementId = null;

  function msg(text) {
    const notice = $("adminNotice");
    if (!notice) return;
    notice.textContent = text;
    notice.style.display = "block";
  }

  async function uploadImage(file) {
    if (!file) return null;
    if (file.size > 5 * 1024 * 1024) throw new Error("Images must be 5 MB or smaller.");
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = crypto.randomUUID() + "." + ext;
    const { error } = await sb.storage.from("product-images").upload(path, file, {cacheControl:"3600",upsert:false});
    if (error) throw error;
    return sb.storage.from("product-images").getPublicUrl(path).data.publicUrl;
  }

  function renderProducts() {
    const table = $("productsTable");
    if (!table) return;
    table.innerHTML = products.map((p) => `<tr>
      <td><input class="field" data-p="name" data-id="${p.id}" value="${esc(p.name)}"></td>
      <td>${esc(p.category)}</td>
      <td><input class="field admin-number" data-p="price" data-id="${p.id}" type="number" step=".01" min="0" value="${p.price}"></td>
      <td><input class="field admin-number-small" data-p="stock" data-id="${p.id}" type="number" min="0" value="${p.stock}"></td>
      <td><input data-p="active" data-id="${p.id}" type="checkbox" ${p.active ? "checked" : ""}></td>
      <td><input class="field bundle-input" data-p="bundle_label" data-id="${p.id}" value="${esc(p.bundle_label || "")}" placeholder="2 for $5"></td>
      <td><div class="image-cell">${p.image_url ? `<img class="admin-thumb" src="${esc(p.image_url)}" alt="">` : ""}<input class="field image-input" data-image="${p.id}" type="file" accept="image/png,image/jpeg,image/webp"></div></td>
      <td><button class="button button-secondary save-product" data-id="${p.id}">Save</button></td>
      <td><button class="button button-secondary delete-product" data-id="${p.id}" style="border-color:#fecaca;color:#b91c1c">Delete</button></td>
    </tr>`).join("");

    table.querySelectorAll(".save-product").forEach((button) => {
      button.onclick = async () => {
        const id = button.dataset.id;
        try {
          button.disabled = true;
          button.textContent = "Saving...";
          const values = {};
          table.querySelectorAll(`[data-id="${id}"]`).forEach((input) => {
            if (!input.dataset.p) return;
            if (input.type === "checkbox") values[input.dataset.p] = input.checked;
            else if (input.dataset.p === "price" || input.dataset.p === "stock") values[input.dataset.p] = Number(input.value);
            else values[input.dataset.p] = input.value.trim();
          });
          const file = table.querySelector(`[data-image="${id}"]`)?.files?.[0];
          if (file) {
            msg("Uploading product picture...");
            values.image_url = await uploadImage(file);
          }
          const { error } = await sb.from("products").update({...values,updated_at:new Date().toISOString()}).eq("id",id);
          if (error) throw error;
          msg("Product saved.");
          button.textContent = "Saved";
          button.classList.add("save-success");
          const updated = products.find((p) => p.id === id);
          if (updated) Object.assign(updated, values);
          setTimeout(() => {button.textContent="Save";button.classList.remove("save-success");button.disabled=false;},1200);
        } catch (error) {
          console.error(error);
          msg(error.message || "Could not save product.");
          button.textContent = "Save";
          button.disabled = false;
        }
      };
    });

    table.querySelectorAll(".delete-product").forEach((button) => {
      button.onclick = async () => {
        const product = products.find((p) => p.id === button.dataset.id);
        if (!product || !confirm(`Delete ${product.name}? This will remove the product completely.`)) return;
        const { error } = await sb.from("products").delete().eq("id",button.dataset.id);
        msg(error ? "Could not delete product." : "Product deleted.");
        if (!error) loadAll();
      };
    });
  }

  function renderOrders(rows) {
    const table = $("ordersTable");
    table.innerHTML = rows.map((o) => `<tr><td>${new Date(o.created_at).toLocaleString()}</td><td>${esc(o.customer_name)}</td><td>${esc(o.email||o.phone||"")}</td><td>${esc(JSON.stringify(o.items))}</td><td><select class="field order-status" data-id="${o.id}"><option ${o.status==="new"?"selected":""}>new</option><option ${o.status==="confirmed"?"selected":""}>confirmed</option><option ${o.status==="ready"?"selected":""}>ready</option><option ${o.status==="completed"?"selected":""}>completed</option><option ${o.status==="cancelled"?"selected":""}>cancelled</option></select></td><td><button class="button button-secondary save-order" data-id="${o.id}">Save</button></td></tr>`).join("");
    table.querySelectorAll(".save-order").forEach((button) => button.onclick = async () => {
      const value = table.querySelector(`.order-status[data-id="${button.dataset.id}"]`).value;
      const {error} = await sb.from("orders").update({status:value}).eq("id",button.dataset.id);
      msg(error?"Could not save order.":"Order updated."); if(!error) loadAll();
    });
  }

  function renderRequests(rows) {
    const table = $("requestsTable");
    table.innerHTML = rows.map((r) => `<tr><td>${new Date(r.created_at).toLocaleString()}</td><td>${esc(r.name)}</td><td>${esc(r.requested_product)}</td><td>${esc(r.email||r.phone||"")}</td><td><select class="field req-status" data-id="${r.id}"><option ${r.status==="new"?"selected":""}>new</option><option ${r.status==="reviewing"?"selected":""}>reviewing</option><option ${r.status==="approved"?"selected":""}>approved</option><option ${r.status==="declined"?"selected":""}>declined</option><option ${r.status==="fulfilled"?"selected":""}>fulfilled</option></select></td><td><button class="button button-secondary save-request" data-id="${r.id}">Save</button></td></tr>`).join("");
    table.querySelectorAll(".save-request").forEach((button) => button.onclick = async () => {
      const value = table.querySelector(`.req-status[data-id="${button.dataset.id}"]`).value;
      const {error} = await sb.from("product_requests").update({status:value}).eq("id",button.dataset.id);
      msg(error?"Could not save request.":"Request updated."); if(!error) loadAll();
    });
  }

  function renderAnnouncements(rows) {
    const container = $("announcements");
    container.innerHTML = rows.map((a) => `<div class="announcement"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start"><div><h3>${esc(a.title)}</h3><p>${esc(a.body)}</p><time>${new Date(a.created_at).toLocaleString()}</time></div><button class="button button-secondary edit-announcement" data-id="${a.id}">Edit</button></div></div>`).join("");
    container.querySelectorAll(".edit-announcement").forEach((button) => button.onclick = () => {
      const a = rows.find((item) => item.id === button.dataset.id); if(!a) return;
      editingAnnouncementId=a.id; $("announcementForm").title.value=a.title; $("announcementForm").body.value=a.body; $("announcementSubmit").textContent="Save Changes"; $("announcementCancel").hidden=false; $("announcementForm").scrollIntoView({behavior:"smooth",block:"center"});
    });
  }

  async function loadAll() {
    try {
      const [p,o,r,a,g] = await Promise.all([
        sb.from("products").select("*").order("name"),
        sb.from("orders").select("*").order("created_at",{ascending:false}),
        sb.from("product_requests").select("*").order("created_at",{ascending:false}),
        sb.from("announcements").select("*").order("created_at",{ascending:false}),
        sb.from("site_settings").select("*")
      ]);
      if(p.error||o.error||r.error||a.error||g.error) throw(p.error||o.error||r.error||a.error||g.error);
      products=p.data||[]; renderProducts(); renderOrders(o.data||[]); renderRequests(r.data||[]); renderAnnouncements(a.data||[]);
      const settings=Object.fromEntries((g.data||[]).map((x)=>[x.key,x.value]));
      $("goalForm").goal.value=settings.goal_amount||5000; $("goalForm").current.value=settings.current_amount||0;
      $("stats").innerHTML=`<div class="stat"><strong>${products.length}</strong><span>Products</span></div><div class="stat"><strong>${o.data.length}</strong><span>Orders</span></div><div class="stat"><strong>${r.data.length}</strong><span>Requests</span></div><div class="stat"><strong>${a.data.length}</strong><span>Announcements</span></div>`;
      msg("Connected. Changes save directly to Supabase.");
    } catch(error) { console.error(error); msg("Could not load admin data. Check your Supabase setup."); }
  }

  function showDash(){ $("loginPanel").hidden=true; $("dashboard").hidden=false; $("logout").hidden=false; }

  async function init(){
    if(!window.sb||!window.SWIFTSUPPLY_CONFIG) return;
    const {data:{session}}=await sb.auth.getSession(); if(!session) return;
    if((session.user.email||"").toLowerCase()!==window.SWIFTSUPPLY_CONFIG.ADMIN_EMAIL.toLowerCase()){await sb.auth.signOut();$("loginMessage").textContent="This account is not authorized.";$("loginMessage").classList.add("show");return;}
    showDash(); loadAll();
  }

  document.addEventListener("supabase-ready",init);

  $("loginForm").onsubmit=async(e)=>{e.preventDefault();const {error}=await sb.auth.signInWithPassword({email:$("loginEmail").value,password:$("loginPassword").value});$("loginMessage").textContent=error?error.message:"Logged in.";$("loginMessage").classList.add("show");if(!error){showDash();loadAll();}};
  $("logout").onclick=()=>sb.auth.signOut().then(()=>location.reload());

  $("productForm").onsubmit=async(e)=>{e.preventDefault();try{const p=Object.fromEntries(new FormData(e.currentTarget));const file=p.image;delete p.image;p.price=Number(p.price);p.stock=Number(p.stock);if(file&&file.size){msg("Uploading product picture...");p.image_url=await uploadImage(file);}const {error}=await sb.from("products").insert({...p,active:true});msg(error?"Could not add product.":"Product added.");if(!error){e.currentTarget.reset();loadAll();}}catch(err){console.error(err);msg(err.message||"Could not add product.");}};

  $("goalForm").onsubmit=async(e)=>{e.preventDefault();const f=e.currentTarget;for(const[key,val]of [["goal_amount",f.goal.value],["current_amount",f.current.value]]){const {error}=await sb.from("site_settings").upsert({key,value:String(val)});if(error){msg("Could not save goal.");return;}}msg("Goal saved.");loadAll();};

  $("announcementForm").onsubmit=async(e)=>{e.preventDefault();const p=Object.fromEntries(new FormData(e.currentTarget));const result=editingAnnouncementId?await sb.from("announcements").update(p).eq("id",editingAnnouncementId):await sb.from("announcements").insert(p);const {error}=result;msg(error?(editingAnnouncementId?"Could not save announcement.":"Could not publish announcement."):(editingAnnouncementId?"Announcement updated.":"Announcement published."));if(!error){editingAnnouncementId=null;e.currentTarget.reset();$("announcementSubmit").textContent="Publish Announcement";$("announcementCancel").hidden=true;loadAll();}};
  $("announcementCancel").onclick=()=>{editingAnnouncementId=null;$("announcementForm").reset();$("announcementSubmit").textContent="Publish Announcement";$("announcementCancel").hidden=true;};
});