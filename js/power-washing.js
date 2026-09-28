document.addEventListener('DOMContentLoaded',()=>{
  const form=document.getElementById('powerWashingForm');
  if(!form)return;
  const message=document.getElementById('pwMessage');
  const button=form.querySelector('button[type="submit"]');
  const serviceSelect=document.getElementById('pwService');
  const sizeSelect=document.getElementById('pwSize');
  const serviceDetailsGroup=document.getElementById('pwServiceDetailsGroup');
  const serviceDetailsLabel=document.getElementById('pwServiceDetailsLabel');
  const sizeDetailsGroup=document.getElementById('pwSizeDetailsGroup');
  const serviceDetails=document.getElementById('pwServiceDetails');
  const sizeDetails=document.getElementById('pwSizeDetails');
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function syncDetailFields(){
    const serviceValue=serviceSelect?.value||'';
    const multipleServices=serviceValue==='Multiple Areas / Services';
    const otherService=serviceValue==='Other';
    const needsServiceDetails=multipleServices||otherService;
    const multipleSizes=sizeSelect?.value==='Multiple areas / cans';

    if(serviceDetailsGroup)serviceDetailsGroup.hidden=!needsServiceDetails;
    if(serviceDetailsLabel)serviceDetailsLabel.textContent=otherService?'What do you need cleaned?':'Which areas or services?';
    if(serviceDetails){
      serviceDetails.required=needsServiceDetails;
      serviceDetails.placeholder=otherService?'Tell us what you need cleaned.':'Example: driveway, front sidewalk, patio, and 2 trash cans';
      if(!needsServiceDetails)serviceDetails.value='';
    }

    if(sizeDetailsGroup)sizeDetailsGroup.hidden=!multipleSizes;
    if(sizeDetails){sizeDetails.required=multipleSizes;if(!multipleSizes)sizeDetails.value=''}
  }
  serviceSelect?.addEventListener('change',syncDetailFields);
  sizeSelect?.addEventListener('change',syncDetailFields);
  syncDetailFields();

  async function sendEmail(to,subject,html){
    if(!window.sb)throw Error('Database not configured');
    const{data,error}=await sb.functions.invoke('resend-email',{body:{to,subject,html}});
    if(error)throw error;
    if(!data?.ok)throw Error(data?.error||'Email could not be sent');
    return data;
  }

  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const fd=new FormData(form);
    const name=String(fd.get('name')||'').trim();
    const email=String(fd.get('email')||'').trim();
    const phone=String(fd.get('phone')||'').trim();
    const city=String(fd.get('city')||'').trim();
    const service_type=String(fd.get('service_type')||'').trim();
    const property_type=String(fd.get('property_type')||'').trim();
    const size_estimate=String(fd.get('size_estimate')||'').trim();
    const preferred_date=String(fd.get('preferred_date')||'').trim();
    const service_details=String(fd.get('service_details')||'').trim();
    const size_details=String(fd.get('size_details')||'').trim();
    const notes=String(fd.get('notes')||'').trim();
    const needsServiceDetails=service_type==='Multiple Areas / Services'||service_type==='Other';
    const serviceDetailsLabelText=service_type==='Other'?'What needs cleaning':'Areas / services';

    message.classList.add('show');
    if(!email&&!phone){message.textContent='Please add an email or phone number so SwiftSupply Power Washing can follow up.';return}
    if(needsServiceDetails&&!service_details){message.textContent=service_type==='Other'?'Please tell us what you need cleaned.':'Please tell us which areas or services you need cleaned.';serviceDetails?.focus();return}
    if(size_estimate==='Multiple areas / cans'&&!size_details){message.textContent='Please give us the size or amount for each area.';sizeDetails?.focus();return}

    button.disabled=true;button.textContent='Sending request...';message.textContent='Submitting your Power Washing request...';
    try{
      if(!window.sb)throw Error('Database not configured');
      const noteParts=[];
      if(service_details)noteParts.push(`${serviceDetailsLabelText}: ${service_details}`);
      if(size_details)noteParts.push(`Size details: ${size_details}`);
      if(notes)noteParts.push(notes);
      const combinedNotes=noteParts.join('\n\n');
      const payload={name,email:email||null,phone:phone||null,city:city||null,service_type,property_type:property_type||null,size_estimate:size_estimate||null,preferred_date:preferred_date||null,notes:combinedNotes||null,status:'new'};
      const{error}=await sb.from('powerwashing_requests').insert(payload);
      if(error)throw error;

      const adminHtml=`<h2>New SwiftSupply Power Washing quote request</h2><p><strong>Name:</strong> ${esc(name)}</p><p><strong>Contact:</strong> ${esc(email||phone)}</p><p><strong>City / area:</strong> ${esc(city||'Not provided')}</p><p><strong>Service:</strong> ${esc(service_type)}</p>${service_details?`<p><strong>${esc(serviceDetailsLabelText)}:</strong> ${esc(service_details)}</p>`:''}<p><strong>Property:</strong> ${esc(property_type||'Not provided')}</p><p><strong>Size:</strong> ${esc(size_estimate||'Not sure')}</p>${size_details?`<p><strong>Size details:</strong> ${esc(size_details)}</p>`:''}<p><strong>Preferred date:</strong> ${esc(preferred_date||'Flexible')}</p><p><strong>Notes:</strong><br>${esc(notes||'None').replace(/\n/g,'<br>')}</p>`;
      let emailWarning=false;
      try{await sendEmail(SWIFTSUPPLY_CONFIG.SUPPORT_EMAIL||SWIFTSUPPLY_CONFIG.ADMIN_EMAIL,'New SwiftSupply Power Washing quote request',adminHtml)}catch(err){console.error('Power Washing support email failed',err);emailWarning=true}

      if(email){
        const customerHtml=`<h2>We received your SwiftSupply Power Washing quote request</h2><p>Hi ${esc(name)},</p><p>We received your request for <strong>${esc(service_type)}</strong>.</p>${service_details?`<p><strong>${esc(serviceDetailsLabelText)}:</strong> ${esc(service_details)}</p>`:''}<p>SwiftSupply Power Washing will review the details and follow up with you before anything is scheduled.</p><p>SwiftSupply Power Washing</p>`;
        try{await sendEmail(email,'SwiftSupply Power Washing quote request received',customerHtml)}catch(err){console.error('Power Washing customer email failed',err);emailWarning=true}
      }

      form.reset();
      syncDetailFields();
      message.textContent=emailWarning?'Your Power Washing request was saved. Email confirmation may be delayed, but we still received it.':'Power Washing request sent. We’ll review it and follow up with you.';
    }catch(err){console.error(err);message.textContent='Could not submit the Power Washing request right now. Please try again later.'}
    finally{button.disabled=false;button.textContent='Request a Power Washing Quote'}
  });
});