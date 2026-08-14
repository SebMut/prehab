(()=>{
const BRIDGE_NAME='prehipHealthKit';
const pending=new Map();
let seq=0;

function nativeAvailable(){
  return !!window.webkit?.messageHandlers?.[BRIDGE_NAME];
}
function ensureState(){
  state.healthKit=state.healthKit&&typeof state.healthKit==='object'?state.healthKit:{};
  state.healthKit.enabled=!!state.healthKit.enabled;
  state.healthKit.lastSyncAt=state.healthKit.lastSyncAt||'';
  state.healthKit.latestWeight=state.healthKit.latestWeight||null;
  state.healthKit.todaySteps=state.healthKit.todaySteps||null;
  state.healthKit.workouts=Array.isArray(state.healthKit.workouts)?state.healthKit.workouts:[];
  state.healthKit.authorizationRequested=!!state.healthKit.authorizationRequested;
}
ensureState();

function post(action,payload={}){
  if(!nativeAvailable())return Promise.reject(new Error('Apple Health ist nur in der nativen iPhone-App verfügbar.'));
  const id=`hk-${Date.now()}-${++seq}`;
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{pending.delete(id);reject(new Error('Apple Health hat nicht rechtzeitig geantwortet.'));},15000);
    pending.set(id,{resolve,reject,timer});
    window.webkit.messageHandlers[BRIDGE_NAME].postMessage({id,action,payload});
  });
}
window.prehipHealthNativeReceive=function(message){
  const msg=typeof message==='string'?(()=>{try{return JSON.parse(message)}catch(e){return null}})():message;
  if(!msg?.id||!pending.has(msg.id))return;
  const p=pending.get(msg.id);pending.delete(msg.id);clearTimeout(p.timer);
  if(msg.ok===false)p.reject(new Error(msg.error||'Apple-Health-Fehler'));
  else p.resolve(msg.data||{});
};

function formatSyncTime(value){
  if(!value)return'Noch nicht synchronisiert';
  const d=new Date(value);if(Number.isNaN(d.getTime()))return'Noch nicht synchronisiert';
  return d.toLocaleString('de-DE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
}
function latestHealthSummary(){
  ensureState();
  const hk=state.healthKit;
  const weight=Number(hk.latestWeight?.kg);
  const steps=Number(hk.todaySteps?.count);
  const workoutCount=hk.workouts.length;
  return{
    weight:Number.isFinite(weight)?`${weight.toFixed(1)} kg`:'–',
    steps:Number.isFinite(steps)?Math.round(steps).toLocaleString('de-DE'):'–',
    workouts:workoutCount,
    synced:formatSyncTime(hk.lastSyncAt)
  };
}
function importWeight(sample){
  const kg=Number(sample?.kg);if(!Number.isFinite(kg)||kg<30||kg>300)return;
  const when=sample.date?new Date(sample.date):new Date();
  const key=dayKey(when);
  state.weight=Math.round(kg*10)/10;
  if(!Array.isArray(state.weightHistory))state.weightHistory=[];
  const existing=state.weightHistory.find(x=>x.date===key&&x.source==='appleHealth');
  if(existing){existing.weight=state.weight;existing.at=sample.date||new Date().toISOString();}
  else state.weightHistory.push({date:key,weight:state.weight,at:sample.date||new Date().toISOString(),source:'appleHealth'});
  state.weightHistory.sort((a,b)=>String(a.date).localeCompare(String(b.date)));
}
function applySync(data){
  ensureState();
  const hk=state.healthKit;
  hk.enabled=true;
  hk.authorizationRequested=true;
  hk.lastSyncAt=new Date().toISOString();
  if(data.latestWeight){hk.latestWeight=data.latestWeight;importWeight(data.latestWeight);}
  if(data.todaySteps)hk.todaySteps=data.todaySteps;
  if(Array.isArray(data.workouts))hk.workouts=data.workouts;
  save();
}

window.prehipHealthKitStatus=async function(){
  ensureState();
  if(!nativeAvailable())return{available:false,native:false};
  try{return{native:true,...await post('status')}}catch(e){return{available:false,native:true,error:e.message}};
};
window.prehipHealthKitConnect=async function(){
  if(!nativeAvailable()){
    modal(`<h2>Apple Health</h2><p class="hint">Die GitHub-Pages-Version kann Apple Health nicht direkt auslesen. Dafür wird die native preHIP-iPhone-App benötigt.</p><div class="info-card"><strong>Phase 1 vorbereitet</strong><p>Gewicht, Schritte und Workouts sind bereits als Schnittstelle vorbereitet. Sobald die iOS-App installiert ist, erscheint hier die Apple-Berechtigungsabfrage.</p></div><button class="primary full" onclick="closeModal()">Verstanden</button>`);
    return;
  }
  modal(`<h2>Apple Health verbinden</h2><p class="hint">preHIP möchte ausschließlich Gewicht, Schritte und Workouts lesen. Es werden in Phase 1 keine Daten in Apple Health geschrieben.</p><div id="healthkit-msg" class="form-msg"></div><button class="primary full" onclick="prehipHealthKitAuthorizeNow()">Apple Health freigeben</button>`);
};
window.prehipHealthKitAuthorizeNow=async function(){
  const msg=document.getElementById('healthkit-msg');if(msg)msg.textContent='Apple-Berechtigung wird geöffnet …';
  try{
    const result=await post('requestAuthorization');
    ensureState();state.healthKit.authorizationRequested=true;state.healthKit.enabled=result.available!==false;save();
    if(msg)msg.textContent='Berechtigung angefragt. Daten werden jetzt synchronisiert …';
    await window.prehipHealthKitSyncNow();
    closeModal();showPage('profile');
  }catch(e){if(msg){msg.textContent=e.message;msg.classList.add('error')}}
};
window.prehipHealthKitSyncNow=async function(){
  if(!nativeAvailable())throw new Error('Apple Health ist nur in der nativen iPhone-App verfügbar.');
  const data=await post('sync');applySync(data);return data;
};
window.openAppleHealth=function(){
  ensureState();
  const s=latestHealthSummary();
  if(!nativeAvailable()){window.prehipHealthKitConnect();return;}
  modal(`<h2>Apple Health</h2><div class="info-card"><strong>${state.healthKit.enabled?'✓ Verbunden':'Noch nicht verbunden'}</strong><p>${esc(s.synced)}</p></div><div class="healthkit-summary"><div><span>Gewicht</span><strong>${s.weight}</strong></div><div><span>Schritte heute</span><strong>${s.steps}</strong></div><div><span>Workouts</span><strong>${s.workouts}</strong></div></div><button class="primary full" onclick="prehipHealthKitSyncFromModal()">Jetzt synchronisieren</button><button class="secondary full" onclick="prehipHealthKitConnect()">Berechtigungen öffnen</button>`);
};
window.prehipHealthKitSyncFromModal=async function(){
  try{await window.prehipHealthKitSyncNow();closeModal();showPage('profile');toast('Apple Health synchronisiert')}catch(e){toast(e.message||'Synchronisierung fehlgeschlagen')}
};

const baseProfileHealth=profilePage;
profilePage=function(c){
  baseProfileHealth(c);
  ensureState();
  const page=c.querySelector('.page');if(!page||page.querySelector('[data-apple-health]'))return;
  const s=latestHealthSummary(),native=nativeAvailable();
  const block=document.createElement('div');block.dataset.appleHealth='1';block.className='apple-health-wrap';
  block.innerHTML=`<div class="section-head"><h3>Apple Health</h3></div><div class="profile-section"><button class="profile-row healthkit-row" onclick="openAppleHealth()"><div><span>Apple Health</span><strong>${native?(state.healthKit.enabled?'✓ Verbunden':'Verbinden'):'iPhone-App erforderlich'}</strong><small>${native?`${s.weight} · ${s.steps} Schritte · ${s.workouts} Workouts`:'Gewicht, Schritte und Workouts automatisch übernehmen'}</small></div><b>›</b></button></div>`;
  const account=page.querySelector('.account-actions-wrap,.danger-zone-wrap');
  if(account)page.insertBefore(block,account);else page.appendChild(block);
};

window.prehipHealthKit={nativeAvailable,status:window.prehipHealthKitStatus,sync:window.prehipHealthKitSyncNow};
})();
