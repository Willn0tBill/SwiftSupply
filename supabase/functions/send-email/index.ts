import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const cors={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type'
};

serve(async(req)=>{
  if(req.method==='OPTIONS') return new Response('ok',{headers:cors});
  try{
    const {to,subject,html}=await req.json();
    if(!to||!subject||!html) throw new Error('Missing email fields');
    const key=Deno.env.get('RESEND_API_KEY');
    const from=Deno.env.get('RESEND_FROM')||'SwiftSupply <noreply@yucai.org>';
    if(!key) throw new Error('RESEND_API_KEY is not configured');
    const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({from,to,subject,html})});
    const data=await r.json();
    if(!r.ok) throw new Error(data?.message||'Resend request failed');
    return new Response(JSON.stringify({ok:true,id:data.id}),{headers:{...cors,'Content-Type':'application/json'},status:200});
  }catch(e){return new Response(JSON.stringify({ok:false,error:e.message}),{headers:{...cors,'Content-Type':'application/json'},status:400});}
});
