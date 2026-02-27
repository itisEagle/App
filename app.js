// app.js - User side
(function(){
"use strict";
var U=null,cart=[],prods=[],cats=[],selC="all",mProd=null,selPM=null,selPMN="",ss64=null;
var $=function(id){return document.getElementById(id)};
function esc(t){if(!t)return"";var d=document.createElement("div");d.textContent=t;return d.innerHTML}
function toast(m,ty){var c=$("TC"),e=document.createElement("div");e.className="toast "+(ty||"info");e.innerHTML='<span class="t-ico">'+({success:"✅",error:"❌",warning:"⚠️",info:"ℹ️"}[ty]||"ℹ️")+'</span><span class="t-msg">'+m+'</span>';c.appendChild(e);setTimeout(function(){e.remove()},3e3)}
function ph(s){return s||"https://placehold.co/400x200/e2e8f0/64748b?text=Gift+Card"}
function ph2(s){return s||"https://placehold.co/50/e2e8f0/64748b?text=GC"}

auth.onAuthStateChanged(function(u){$("L").classList.add("hidden");if(u){U=u;ensureUserDocument(u).then(boot).catch(boot)}else{U=null;$("LS").style.display="flex";$("APP").style.display="none"}});
$("gLogin").addEventListener("click",function(){var b=this;b.disabled=true;b.textContent="Signing in...";$("LE").style.display="none";
  auth.signInWithPopup(googleProvider).then(function(){b.disabled=false;b.innerHTML='<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"> Continue with Google'}).catch(function(e){b.disabled=false;b.innerHTML='<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"> Continue with Google';$("LE").textContent=e.message;$("LE").style.display="block"})});
$("xOut").addEventListener("click",function(){auth.signOut()});

function boot(){$("LS").style.display="none";$("APP").style.display="block";$("UA").src=U.photoURL||"https://ui-avatars.com/api/?name=U";$("UN").textContent=U.displayName||"User";loadCart();fCats();fProds()}

function go(s){var all=document.querySelectorAll(".sec");for(var i=0;i<all.length;i++)all[i].classList.remove("on");
  var m={home:"sHome",cart:"sCart",checkout:"sCO",orders:"sOrd"},el=$(m[s]);if(el)el.classList.add("on");
  var lk=document.querySelectorAll(".n-link[data-s]");for(var j=0;j<lk.length;j++){lk[j].classList.remove("on");if(lk[j].getAttribute("data-s")===s)lk[j].classList.add("on")}
  $("MN").classList.remove("open");
  if(s==="cart")rCart();if(s==="checkout")rCO();if(s==="orders")fOrds()}
$("xBrand").addEventListener("click",function(){go("home")});
$("xHome").addEventListener("click",function(){go("home")});
$("xOrders").addEventListener("click",function(){go("orders")});
$("xCart").addEventListener("click",function(){go("cart")});
$("xHomM").addEventListener("click",function(){go("home")});
$("xOrdM").addEventListener("click",function(){go("orders")});
$("xCarM").addEventListener("click",function(){go("cart")});
$("xShop").addEventListener("click",function(){go("home")});
$("xCO").addEventListener("click",function(){go("checkout")});
$("xMob").addEventListener("click",function(){$("MN").classList.toggle("open")});

function fCats(){db.collection("categories").get().then(function(s){cats=[];s.forEach(function(d){cats.push({id:d.id,name:d.data().name||"",icon:d.data().icon||"📁"})});cats.sort(function(a,b){return a.name.localeCompare(b.name)});rCats()}).catch(function(e){console.error(e)})}
function rCats(){var b=$("CBAR"),h='<button type="button" class="chip '+(selC==="all"?"on":"")+'" data-c="all">🏷️ All</button>';
  for(var i=0;i<cats.length;i++){var c=cats[i];h+='<button type="button" class="chip '+(selC===c.id?"on":"")+'" data-c="'+c.id+'">'+(c.icon||"📁")+" "+esc(c.name)+"</button>"}
  b.innerHTML=h;var ch=b.querySelectorAll(".chip");for(var j=0;j<ch.length;j++){ch[j].addEventListener("click",function(){selC=this.getAttribute("data-c");rCats();rProds()})}}

function fProds(){db.collection("products").get().then(function(s){prods=[];s.forEach(function(d){var x=d.data();prods.push({id:d.id,name:x.name||"",price:x.price||0,imageURL:x.imageURL||"",description:x.description||"",categoryId:x.categoryId||"",customFields:x.customFields||[]})});rProds()}).catch(function(e){console.error(e)})}
function rProds(){var g=$("PGRID"),em=$("PE"),fl=selC==="all"?prods:prods.filter(function(p){return p.categoryId===selC});
  if(!fl.length){g.innerHTML="";em.style.display="block";return}em.style.display="none";
  var h="";for(var i=0;i<fl.length;i++){var p=fl[i],cn="";for(var c=0;c<cats.length;c++){if(cats[c].id===p.categoryId){cn=cats[c].name;break}}
    h+='<div class="p-card" data-pid="'+p.id+'"><img class="p-card-img" src="'+ph(p.imageURL)+'" onerror="this.src=\'https://placehold.co/400x200/e2e8f0/64748b?text=Error\'" alt><div class="p-card-body"><div class="p-card-cat">'+esc(cn||"Other")+'</div><div class="p-card-name">'+esc(p.name)+'</div><div class="p-card-desc">'+esc(p.description)+'</div><div class="p-card-foot"><div class="p-card-price">$'+parseFloat(p.price).toFixed(2)+'</div><button type="button" class="btn-qadd" data-qa="'+p.id+'">Add</button></div></div></div>'}
  g.innerHTML=h;
  g.querySelectorAll(".p-card").forEach(function(c){c.addEventListener("click",function(e){if(e.target.hasAttribute("data-qa"))return;openM(this.getAttribute("data-pid"))})});
  g.querySelectorAll("[data-qa]").forEach(function(b){b.addEventListener("click",function(e){e.stopPropagation();var p=fP(this.getAttribute("data-qa"));if(!p)return;if(p.customFields&&p.customFields.length){openM(p.id);return}addC(p,1,{});toast("Added!","success")})})}
function fP(id){for(var i=0;i<prods.length;i++){if(prods[i].id===id)return prods[i]}return null}

function openM(pid){mProd=fP(pid);if(!mProd)return;$("PMT").textContent=mProd.name;$("PMI").src=ph(mProd.imageURL);$("PMP").textContent="$"+parseFloat(mProd.price).toFixed(2);$("PMD").textContent=mProd.description||"";$("PQ").value=1;
  var fc=$("PMF"),fl=mProd.customFields||[];if(fl.length){var h="<h3>Required Info</h3>";for(var i=0;i<fl.length;i++)h+='<div class="fg"><label>'+esc(fl[i].label)+'</label><input type="text" id="cf'+i+'" placeholder="'+esc(fl[i].placeholder||"Enter "+fl[i].label)+'"></div>';fc.innerHTML=h}else fc.innerHTML="";
  $("PM").classList.add("open")}
function closeM(){$("PM").classList.remove("open");mProd=null}
$("PMX").addEventListener("click",closeM);$("PM").addEventListener("click",function(e){if(e.target===this)closeM()});
$("QM").addEventListener("click",function(){var q=$("PQ"),v=parseInt(q.value)-1;q.value=v<1?1:v});
$("QP").addEventListener("click",function(){var q=$("PQ"),v=parseInt(q.value)+1;q.value=v>99?99:v});
function gCF(){if(!mProd||!mProd.customFields)return{};var v={};mProd.customFields.forEach(function(f,i){var inp=$("cf"+i);if(inp)v[f.label]=inp.value.trim()});return v}
function vCF(){if(!mProd||!mProd.customFields)return true;for(var i=0;i<mProd.customFields.length;i++){var inp=$("cf"+i);if(inp&&!inp.value.trim()){toast('Fill "'+mProd.customFields[i].label+'"',"warning");inp.focus();return false}}return true}
$("MAC").addEventListener("click",function(){if(!vCF())return;addC(mProd,parseInt($("PQ").value),gCF());closeM();toast("Added!","success")});
$("MBN").addEventListener("click",function(){if(!vCF())return;addC(mProd,parseInt($("PQ").value),gCF());closeM();go("checkout")});

function loadCart(){if(!U)return;try{cart=JSON.parse(localStorage.getItem("gc_"+U.uid))||[]}catch(e){cart=[]}badge()}
function saveCart(){if(U)localStorage.setItem("gc_"+U.uid,JSON.stringify(cart));badge()}
function badge(){var n=0;cart.forEach(function(x){n+=x.quantity});$("CB").textContent=n;n>0?$("CB").classList.remove("hide"):$("CB").classList.add("hide");var m=$("CBM");if(m)m.textContent=n}
function addC(p,q,cd){cart.push({id:Date.now()+""+Math.random().toString(36).substr(2,3),productId:p.id,name:p.name,price:+p.price,imageURL:p.imageURL||"",quantity:q,customData:cd||{}});saveCart()}
function rCart(){var w=$("CIW"),em=$("CE"),sm=$("CS");if(!cart.length){w.innerHTML="";em.style.display="block";sm.style.display="none";return}
  em.style.display="none";sm.style.display="block";var h="",tot=0;
  cart.forEach(function(it){var iT=it.price*it.quantity;tot+=iT;var ch="";Object.keys(it.customData||{}).forEach(function(k){ch+='<span class="ci-tag">'+esc(k)+": "+esc(it.customData[k])+"</span>"});
    h+='<div class="cart-item"><img class="ci-img" src="'+ph2(it.imageURL)+'" onerror="this.src=\'https://placehold.co/90\'" alt><div class="ci-info"><div class="ci-name">'+esc(it.name)+'</div><div class="ci-meta">Qty: '+it.quantity+'</div><div>'+ch+'</div><div class="ci-bottom"><div class="ci-price">$'+iT.toFixed(2)+'</div><button type="button" class="ci-rm" data-rm="'+it.id+'">🗑️ Remove</button></div></div></div>'});
  w.innerHTML=h;$("CSB").textContent="$"+tot.toFixed(2);$("CST").textContent="$"+tot.toFixed(2);
  w.querySelectorAll("[data-rm]").forEach(function(b){b.addEventListener("click",function(){cart=cart.filter(function(x){return x.id!==b.getAttribute("data-rm")});saveCart();rCart();toast("Removed","info")})})}

function rCO(){if(!cart.length){go("cart");toast("Cart empty","warning");return}
  selPM=null;selPMN="";ss64=null;$("SSP").style.display="none";$("SSI").value="";$("QRB").style.display="none";
  var tot=0,sh="";cart.forEach(function(it){var iT=it.price*it.quantity;tot+=iT;var cs=Object.keys(it.customData||{}).map(function(k){return k+": "+it.customData[k]}).join(", ");
    sh+='<div class="oi-row"><img src="'+ph2(it.imageURL)+'" onerror="this.src=\'https://placehold.co/44\'" alt><div class="oi-info"><div class="oi-n">'+esc(it.name)+'</div><div class="oi-q">Qty: '+it.quantity+'</div><div class="oi-cd">'+esc(cs)+'</div></div><div class="oi-pr">$'+iT.toFixed(2)+'</div></div>'});
  $("COS").innerHTML=sh;$("COT").textContent="Total: $"+tot.toFixed(2);
  db.collection("payment_methods").get().then(function(s){var ms=[];s.forEach(function(d){var x=d.data();ms.push({id:d.id,name:x.name,imageURL:x.imageURL,instructions:x.instructions})});
    var g=$("PMG");if(!ms.length){g.innerHTML='<p style="color:var(--g6)">No payment methods.</p>';return}
    var h="";ms.forEach(function(m){h+='<div class="pm-card" data-pid="'+m.id+'" data-pn="'+esc(m.name)+'" data-pi="'+esc(m.imageURL||"")+'"><img src="'+(m.imageURL||"https://placehold.co/50?text=Pay")+'" onerror="this.src=\'https://placehold.co/50\'" alt><div class="pm-n">'+esc(m.name)+"</div></div>"});
    g.innerHTML=h;var cs=g.querySelectorAll(".pm-card");
    cs.forEach(function(c){c.addEventListener("click",function(){cs.forEach(function(x){x.classList.remove("sel")});this.classList.add("sel");selPM=this.getAttribute("data-pid");selPMN=this.getAttribute("data-pn");var img=this.getAttribute("data-pi");if(img){$("QRI").src=img;$("QRN").textContent="Pay via "+selPMN;$("QRB").style.display="block"}else $("QRB").style.display="none"})})}).catch(function(e){console.error(e)})}
$("SSI").addEventListener("change",function(){var f=this.files[0];if(!f)return;if(!f.type.startsWith("image/")){toast("Select image","error");return}if(f.size>5242880){toast("Max 5MB","error");return}var r=new FileReader();r.onload=function(e){ss64=e.target.result;$("SSPI").src=ss64;$("SSP").style.display="block"};r.readAsDataURL(f)});
$("xSubmit").addEventListener("click",function(){var b=this;if(!cart.length){toast("Cart empty","warning");return}if(!selPM){toast("Select payment","warning");return}if(!ss64){toast("Upload proof","warning");return}
  b.disabled=true;b.textContent="⏳ Submitting...";var tot=0,items=[];cart.forEach(function(x){tot+=x.price*x.quantity;items.push({productId:x.productId,name:x.name,price:x.price,quantity:x.quantity,imageURL:x.imageURL,customData:x.customData||{}})});
  db.collection("orders").add({userId:U.uid,userName:U.displayName||"",userEmail:U.email||"",items:items,total:tot,paymentMethodId:selPM,paymentMethodName:selPMN,paymentScreenshot:ss64,status:"pending",createdAt:firebase.firestore.FieldValue.serverTimestamp()})
  .then(function(){cart=[];saveCart();selPM=null;ss64=null;toast("Order submitted!","success");go("orders")}).catch(function(e){toast("Error: "+e.message,"error")}).finally(function(){b.disabled=false;b.textContent="✅ Submit Order"})});

function fOrds(){if(!U)return;db.collection("orders").where("userId","==",U.uid).get().then(function(s){
  var os=[];s.forEach(function(d){os.push({id:d.id,d:d.data()})});os.sort(function(a,b){return((b.d.createdAt?b.d.createdAt.toMillis():0)-(a.d.createdAt?a.d.createdAt.toMillis():0))});
  if(!os.length){$("OL").innerHTML="";$("OE").style.display="block";return}$("OE").style.display="none";
  var h="";os.forEach(function(o){var d=o.d,dt=d.createdAt&&d.createdAt.toDate?d.createdAt.toDate().toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):"N/A",st=d.status||"pending",ih="";
    (d.items||[]).forEach(function(it){var cd=Object.keys(it.customData||{}).map(function(k){return esc(k)+": "+esc(it.customData[k])}).join(", ");
      ih+='<div class="oi-row"><img src="'+ph2(it.imageURL)+'" onerror="this.src=\'https://placehold.co/44\'" alt><div class="oi-info"><div class="oi-n">'+esc(it.name)+'</div><div class="oi-q">Qty: '+it.quantity+" × $"+parseFloat(it.price).toFixed(2)+'</div><div class="oi-cd">'+cd+'</div></div><div class="oi-pr">$'+(it.price*it.quantity).toFixed(2)+"</div></div>"});
    h+='<div class="o-card"><div class="o-head"><span class="o-id">#'+o.id.substring(0,8).toUpperCase()+'</span><span class="o-date">'+dt+'</span><span class="o-st '+st+'">'+st+'</span></div><div class="o-body">'+ih+'<div class="o-pm">Payment: '+esc(d.paymentMethodName||"N/A")+'</div><div class="o-total">$'+parseFloat(d.total).toFixed(2)+"</div></div></div>"});
  $("OL").innerHTML=h}).catch(function(e){console.error(e);$("OL").innerHTML='<p style="text-align:center;padding:40px;color:var(--red)">Error loading orders.</p>'})}

$("IPX").addEventListener("click",function(){$("IP").classList.remove("open")});
$("IP").addEventListener("click",function(e){if(e.target===this)this.classList.remove("open")});
document.addEventListener("keydown",function(e){if(e.key==="Escape"){closeM();$("IP").classList.remove("open")}});
})();