(()=>{
const cfg=window.PREHIP_SUPABASE_CONFIG;
const SESSION_KEY='prehip-supabase-session-v1';
const APP_KEY='prehab-v1';
const baseProfileDanger=profilePage;

function sessionFromStorage(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch(e){return null}}
function loggedIn(){return !!sessionFromStorage()?.access_token}
function dangerMsg(text,error=false){const el=document.getElementById('danger-msg');if(el){el.textContent=text;el.className=`danger-msg ${error?'error':'success'}`}}
async function accountUser(accessToken){
  const r=await fetch(`${cfg.url}/auth/v1/user`,{headers:{apikey:cfg.publishableKey,Authorization:`Bearer ${accessToken}`}});
  let data=null;try{data=await r.json()}catch(e){}
  if(!r.ok||!data?.email)throw new Error('Bitte melde dich erneut an.');
  return data;
}
async function verifyPassword(password){
  const current=sessionFromStorage();
  if(!current?.access_token)throw new Error('Bitte melde dich zuerst an.');
  if(!password)throw new Error('Bitte gib dein Passwort ein.');
  const u=await accountUser(current.access_token);
  const r=await fetch(`${cfg.url}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:cfg.publishableKey,'Content-Type':'application/json'},body:JSON.stringify({email:u.email,password})});
  let data=null;try{data=await r.json()}catch(e){}
  if(!r.ok||!data?.access_token||data?.user?.id!==u.id)throw new Error('Das Passwort ist nicht korrekt.');
  localStorage.setItem(SESSION_KEY,JSON.stringify(data));
  return {session:data,user:u};
}
function freshState(){
  const fresh=JSON.parse(JSON.stringify(state0));
  fresh.profile={...(fresh.profile||{}),name:'',nameStepDone:false,onboardingDone:false,loginSkipped:false,programMode:'auto',clinic:'',surgeon:'',procedure:'',rehabStart:'',opNotes:'',quickActivities:['Spaziergang','Radfahren','Schwimmen','Rudergerät']};
  fresh.weightHistory=[{date:dayKey(new Date()),weight:Number(fresh.weight)||START_WEIGHT,at:new Date().toISOString()}];
  fresh.hipCheckins={};
  fresh.preopChecklist={};
  return fresh;
}
function clearPrehipLocalData({keepSession=false}={}){
  const keep=keepSession?localStorage.getItem(SESSION_KEY):null;
  [...Array(localStorage.length)].forEach((_,i)=>{const k=localStorage.key(i);if(k&&(k.startsWith('prehip-')||k.startsWith('prehab-')))localStorage.removeItem(k)});
  if(keep&&keepSession)localStorage.setItem(SESSION_KEY,keep);
}

profilePage=function(c){
  baseProfileDanger(c);
  const page=c.querySelector('.page');if(!page||page.querySelector('.danger-zone-wrap'))return;
  const isIn=loggedIn();
  page.insertAdjacentHTML('beforeend',`<div class="danger-zone-wrap"><div class="section-head"><h3>Daten & Konto</h3></div><div class="profile-section danger-zone"><button class="danger-row" onclick="openResetAllSettings()"><div><span>Alle Einstellungen löschen</span><small>Profil, Training, Gewicht, Check-ins, Termine und Checkliste zurücksetzen. Dein Konto bleibt bestehen.</small></div><b>›</b></button><button class="danger-row account-delete" onclick="openDeleteAccount()"><div><span>Konto löschen</span><small>${isIn?'Konto und alle damit verbundenen preHIP-Daten dauerhaft löschen.':'Dafür musst du angemeldet sein.'}</small></div><b>›</b></button></div></div>`);
};

window.openResetAllSettings=function(){
  if(!loggedIn()){modal(`<h2>Anmeldung erforderlich</h2><p class="hint">Zum Löschen aller Einstellungen muss dein Passwort geprüft werden.</p><button class="primary full" onclick="closeModal();openPrehipCloud()">Anmelden</button>`);return}
  modal(`<div class="danger-modal"><div class="danger-symbol">↺</div><h2>Alle Einstellungen löschen?</h2><p>Dadurch werden dein Profil, Trainingsverlauf, Gewicht, Hüft-Check-ins, Termine, Checkliste und persönliche Einstellungen zurückgesetzt. <strong>Dein Konto bleibt bestehen.</strong></p><div class="field"><label>Passwort zur Bestätigung</label><input id="danger-password" type="password" autocomplete="current-password" placeholder="Passwort"></div><div id="danger-msg" class="danger-msg"></div><button class="danger-button" onclick="confirmResetAllSettings()">Alles zurücksetzen</button><button class="secondary full" onclick="closeModal()">Abbrechen</button></div>`);
};
window.confirmResetAllSettings=async function(){
  const btn=document.querySelector('.danger-button');if(btn)btn.disabled=true;dangerMsg('Passwort wird geprüft …');
  try{
    await verifyPassword(document.getElementById('danger-password')?.value||'');
    state=freshState();
    localStorage.setItem(APP_KEY,JSON.stringify(state));
    if(typeof save==='function')save();
    if(typeof window.prehipCloudSyncNow==='function')await window.prehipCloudSyncNow();
    dangerMsg('Alle Einstellungen wurden gelöscht.');
    setTimeout(()=>location.reload(),350);
  }catch(e){dangerMsg(e.message||'Löschen fehlgeschlagen.',true);if(btn)btn.disabled=false}
};

window.openDeleteAccount=function(){
  if(!loggedIn()){modal(`<h2>Anmeldung erforderlich</h2><p class="hint">Zum Löschen des Kontos musst du angemeldet sein und dein Passwort erneut eingeben.</p><button class="primary full" onclick="closeModal();openPrehipCloud()">Anmelden</button>`);return}
  modal(`<div class="danger-modal"><div class="danger-symbol delete">!</div><h2>Konto dauerhaft löschen?</h2><p>Dein preHIP-Konto und alle damit verknüpften Cloud-Daten werden dauerhaft gelöscht. Dieser Schritt kann nicht rückgängig gemacht werden.</p><div class="field"><label>Passwort zur Bestätigung</label><input id="danger-password" type="password" autocomplete="current-password" placeholder="Passwort"></div><div id="danger-msg" class="danger-msg"></div><button class="danger-button account" onclick="confirmDeleteAccount()">Konto dauerhaft löschen</button><button class="secondary full" onclick="closeModal()">Abbrechen</button></div>`);
};
window.confirmDeleteAccount=async function(){
  const btn=document.querySelector('.danger-button.account');if(btn)btn.disabled=true;dangerMsg('Passwort wird geprüft …');
  try{
    const password=document.getElementById('danger-password')?.value||'';
    const verified=await verifyPassword(password);
    dangerMsg('Konto wird gelöscht …');
    const r=await fetch(`${cfg.url}/functions/v1/delete-account`,{method:'POST',headers:{apikey:cfg.publishableKey,Authorization:`Bearer ${verified.session.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({password})});
    let data=null;try{data=await r.json()}catch(e){}
    if(!r.ok||!data?.ok){if(r.status===404)throw new Error('Die sichere Kontolöschung ist serverseitig noch nicht aktiviert.');throw new Error(data?.message||data?.error||'Konto konnte nicht gelöscht werden.')}
    clearPrehipLocalData({keepSession:false});
    document.body.classList.remove('onboarding-open');
    closeModal();
    alert('Dein preHIP-Konto wurde gelöscht.');
    location.reload();
  }catch(e){dangerMsg(e.message||'Kontolöschung fehlgeschlagen.',true);if(btn)btn.disabled=false}
};
})();