document.addEventListener("DOMContentLoaded", () => {
  if (!location.pathname.includes("/admin/")) return;
  const input=document.getElementById("bulkProducts"),addButton=document.getElementById("bulkAddButton"),clearButton=document.getElementById("bulkClearButton"),message=document.getElementById("bulkMessage");
  if(!input||!addButton)return;
  const setMessage=(text,error=false)=>{if(!message)return;message.textContent=text;message.classList.add("show");message.style.color=error?"#ef4444":""};
  const parseBool=v=>!["false","no","0","inactive","off"].includes(String(v??"").trim().toLowerCase());

  addButton.addEventListener("click",async()=>{
    const lines=input.value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
    if(!lines.length){setMessage("Paste at least one product first.",true);return}
    const products=[],invalid=[];
    lines.forEach((line,index)=>{
      const p=line.split("|").map(x=>x.trim());
      if(p.length<6){invalid.push(`Line ${index+1}: needs at least Brand | Flavor | Name | Category | Price | Stock`);return}
      const [brand,flavor,name,category,priceRaw,stockRaw,bundle_label="",description="",activeRaw="true",image_url=""]=p;
      const price=Number(String(priceRaw).replace(/^\$/,"")),stock=Number(stockRaw);
      if(!brand||!name||!category||!Number.isFinite(price)||price<0||!Number.isInteger(stock)||stock<0){invalid.push(`Line ${index+1}: check brand, name, category, price, and stock`);return}
      products.push({brand,flavor,name,category,price,stock,bundle_label:bundle_label||null,description:description||null,active:parseBool(activeRaw),image_url:image_url||null});
    });
    if(invalid.length){setMessage(invalid.slice(0,4).join(" • ")+(invalid.length>4?` • +${invalid.length-4} more`:""),true);return}
    addButton.disabled=true;addButton.textContent="Importing...";
    try{
      const {data:existing,error:existingError}=await sb.from("products").select("brand,flavor,name");
      if(existingError)throw existingError;
      const keys=new Set((existing||[]).map(x=>`${(x.brand||"").trim().toLowerCase()}|${(x.flavor||"").trim().toLowerCase()}|${(x.name||"").trim().toLowerCase()}`));
      const unique=[],seen=new Set();
      for(const x of products){const key=`${x.brand.toLowerCase()}|${x.flavor.toLowerCase()}|${x.name.toLowerCase()}`;if(keys.has(key)||seen.has(key))continue;seen.add(key);unique.push(x)}
      if(!unique.length){setMessage("All of those products already exist.");return}
      const {error}=await sb.from("products").insert(unique);if(error)throw error;
      setMessage(`Imported ${unique.length} product${unique.length===1?"":"s"} with their category, brand, flavor, name, price, stock, bundle, description, active status, and image URL.`);
      input.value="";setTimeout(()=>location.reload(),800);
    }catch(error){console.error(error);setMessage(error.message||"Could not import the products.",true)}
    finally{addButton.disabled=false;addButton.textContent="Import Products"}
  });
  clearButton?.addEventListener("click",()=>{input.value="";setMessage("")});
});