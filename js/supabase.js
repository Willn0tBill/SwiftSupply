/* Shared storefront client: surfaces unavailable backends instead of endless loading. */
(function(){
  const c=window.SWIFTSUPPLY_CONFIG;
  const report=()=>document.dispatchEvent(new Event('supabase-error'));
  if(!c||!c.SUPABASE_URL||!c.SUPABASE_PUBLISHABLE_KEY||c.SUPABASE_PUBLISHABLE_KEY.includes('PASTE_')){document.addEventListener('DOMContentLoaded',report,{once:true});return}
  const script=document.createElement('script');
  let settled=false;
  const fail=()=>{if(settled)return;settled=true;report()};
  const timeout=setTimeout(fail,12000);
  script.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  script.async=true;
  script.onload=()=>{
    if(settled)return;
    try{
      if(!window.supabase?.createClient)throw Error('Supabase SDK did not load');
      window.sb=window.supabase.createClient(c.SUPABASE_URL,c.SUPABASE_PUBLISHABLE_KEY);
      settled=true;clearTimeout(timeout);
      document.dispatchEvent(new Event('supabase-ready'));
    }catch(e){console.error('SwiftSupply connection error',e);clearTimeout(timeout);fail()}
  };
  script.onerror=()=>{clearTimeout(timeout);fail()};
  document.head.appendChild(script);
})();
