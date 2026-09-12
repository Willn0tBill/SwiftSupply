(function(){
  const c=window.SWIFTSUPPLY_CONFIG;
  if(!c||!c.SUPABASE_URL||c.SUPABASE_PUBLISHABLE_KEY.includes('PASTE_')) return;
  const s=document.createElement('script');
  s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  s.onload=function(){window.sb=window.supabase.createClient(c.SUPABASE_URL,c.SUPABASE_PUBLISHABLE_KEY);document.dispatchEvent(new Event('supabase-ready'));};
  document.head.appendChild(s);
})();
