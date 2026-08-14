(()=>{
const cfg=window.PREHIP_SUPABASE_CONFIG;
const SESSION_KEY='prehip-supabase-session-v1';
const ENDPOINT=cfg?.url?`${cfg.url}/functions/v1/health-shortcuts`:'';
let remoteStatus=null,lastStatusAt=0,statusInFlight=null,lastCreatedKey='';

function readSession(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch(e){return null}}
function loggedIn(){return !!readSession()?.access_token}
function ensureLocal(){
  state.healthShortcut=state.healthShortcut&&typeof state.healthShortcut==='object'?state.healthShortcut:{};
  state.healthShortcut.workouts=Array.isArray(state.healthShortcut.workouts)?state.healthShortcut.workouts:[];
}
ensureLocal();

async function callService(action,extra={}){
  const session=readSession();
  if(!session?.access_token)throw new Error('Bitte melde dich zuerst an.');
  const r=await fetch(ENDPOINT,{method:'POST',headers:{apikey:cfg.publishableKey,Authorization:`Bearer ${session.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({action,...extra})});
  let data=null;try{data=await r.json()}catch(e){}
  if(!r.ok||!data?.ok)throw new Error(data?.message||`Apple-Health-Fehler ${r.status}`);
  return data;
}
function when(value){if(!value)return'Noch keine Daten';const d=new Date(value);return Number.isNaN(d.getTime())?'Noch keine Daten':d.toLocaleString('de-DE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}
function workoutLabel(type=''){const t=String(type).toLowerCase();if(t.includes('cycl')||t.includes('bike'))return'Radfahren';if(t.includes('swim'))return'Schwimmen';if(t.includes('row'))return'Rudern';if(t.includes('walk'))return'Gehen';if(t.includes('hik'))return'Wandern';if(t.includes('tennis'))return'Tennis';if(t.includes('ski'))return'Skifahren';if(t.includes('strength'))return'Krafttraining';return String(type||'Workout').replace(/-/g,' ')}
function newestWeightTimestamp(){
  const rows=Array.isArray(state.weightHistory)?state.weightHistory:[];
  let newest=0;for(const row of rows){const value=row?.at||`${row?.date||''}T12:00:00`;const n=new Date(value).getTime();if(Number.isFinite(n)&&n>newest)newest=n}return newest;
}
function applyStatus(status){
  ensureLocal();remoteStatus=status;
  state.healthShortcut.configured=!!status.configured;
  state.healthShortcut.keyCreatedAt=status.keyCreatedAt||'';
  state.healthShortcut.lastImportAt=status.lastImportAt||'';
  state.healthShortcut.latestDaily=status.latestDaily||null;
  state.healthShortcut.workouts=Array.isArray(status.workouts)?status.workouts:[];
  state.healthShortcut.latestWorkout=status.latestWorkout||null;
  const daily=status.latestDaily;
  const kg=Number(daily?.weightKg);
  if(Number.isFinite(kg)&&kg>=30&&kg<=300){
    const date=daily.date||dayKey(new Date(daily.recordedAt||Date.now()));
    state.weightHistory=Array.isArray(state.weightHistory)?state.weightHistory:[];
    let row=state.weightHistory.find(x=>x.date===date&&x.source==='appleHealthShortcut');
    if(row){row.weight=kg;row.at=daily.recordedAt||daily.importedAt||new Date().toISOString()}
    else state.weightHistory.push({date,weight:kg,at:daily.recordedAt||daily.importedAt||new Date().toISOString(),source:'appleHealthShortcut'});
    state.weightHistory.sort((a,b)=>String(a.date).localeCompare(String(b.date)));
    const importedAt=new Date(daily.recordedAt||daily.importedAt||0).getTime();
    if(Number.isFinite(importedAt)&&importedAt>=newestWeightTimestamp()-1000)state.weight=kg;
  }
  save();
}
async function refreshStatus({rerender=false,force=false}={}){
  if(!loggedIn())return null;
  if(!force&&Date.now()-lastStatusAt<60000&&remoteStatus)return remoteStatus;
  if(statusInFlight)return statusInFlight;
  statusInFlight=callService('status').then(data=>{lastStatusAt=Date.now();applyStatus(data);return data}).finally(()=>statusInFlight=null);
  try{const data=await statusInFlight;if(rerender&&view?.page==='profile')showPage('profile');return data}catch(e){return null}
}
function snapshot(){ensureLocal();const s=remoteStatus||state.healthShortcut||{},d=s.latestDaily||state.healthShortcut.latestDaily||{},w=s.latestWorkout||state.healthShortcut.latestWorkout||null;return{configured:!!s.configured,weight:Number.isFinite(Number(d.weightKg))?`${Number(d.weightKg).toFixed(1)} kg`:'–',steps:Number.isFinite(Number(d.steps))?Math.round(Number(d.steps)).toLocaleString('de-DE'):'–',workout:w?`${workoutLabel(w.activityType)} · ${Math.round(Number(w.durationMinutes)||0)} min`:'–',last:when(s.lastImportAt||state.healthShortcut.lastImportAt)}}
function copyText(value,label='Kopiert'){const done=()=>toast(label);if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(value).then(done).catch(()=>fallbackCopy(value,done));fallbackCopy(value,done)}
function fallbackCopy(value,done){const t=document.createElement('textarea');t.value=value;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();try{document.execCommand('copy');done()}catch(e){}t.remove()}
function setupValues(){return{endpoint:ENDPOINT,apiKey:cfg?.publishableKey||'',importKey:lastCreatedKey}}

window.prehipHealthShortcutRefresh=async function(){try{await refreshStatus({force:true});if(view?.page==='profile')showPage('profile');toast('Apple Health aktualisiert')}catch(e){toast(e.message||'Aktualisierung fehlgeschlagen')}};
window.prehipHealthShortcutCreateKey=async function(){
  try{const data=await callService('createKey');lastCreatedKey=data.key||'';remoteStatus={...(remoteStatus||{}),configured:true,keyCreatedAt:data.createdAt};state.healthShortcut.configured=true;state.healthShortcut.keyCreatedAt=data.createdAt||'';save();showShortcutSetup(true)}catch(e){toast(e.message||'Schlüssel konnte nicht erstellt werden')}
};
window.prehipHealthShortcutRevoke=async function(){
  if(!confirm('Apple-Health-Verbindung wirklich trennen? Der bisherige Import-Schlüssel funktioniert danach nicht mehr.'))return;
  try{await callService('revokeKey');lastCreatedKey='';remoteStatus={...(remoteStatus||{}),configured:false};state.healthShortcut.configured=false;save();closeModal();showPage('profile');toast('Apple Health getrennt')}catch(e){toast(e.message||'Trennen fehlgeschlagen')}
};
window.prehipHealthShortcutClear=async function(){if(!loggedIn())return;await callService('clear');lastCreatedKey='';remoteStatus=null;lastStatusAt=0;state.healthShortcut={workouts:[]};save()};
window.prehipHealthShortcutCopy=function(kind){const v=setupValues();if(kind==='endpoint')copyText(v.endpoint,'API-Adresse kopiert');if(kind==='apiKey')copyText(v.apiKey,'API-Key kopiert');if(kind==='importKey'&&v.importKey)copyText(v.importKey,'Import-Schlüssel kopiert')};

function setupHint(){return `<div class="health-privacy"><strong>🔐 Was wird übertragen?</strong><p>Nur die Werte, die dein Kurzbefehl ausdrücklich sendet: Gewicht, Schritte und ausgewählte Workouts. Dein Apple-Health-Zugang selbst wird nicht an preHIP übertragen.</p></div>`}
function showShortcutSetup(created=false){
  const v=setupValues();
  const noRaw=!v.importKey;
  modal(`<div class="health-setup"><span class="eyebrow">APPLE HEALTH · KURZBEFEHLE</span><h2>${created?'Dein Import-Schlüssel ist bereit':'Apple Health einrichten'}</h2><p class="hint">Die Health-Daten bleiben auf dem iPhone. Ein persönlicher Kurzbefehl sendet nur freigegebene Werte an dein preHIP-Konto.</p>${setupHint()}${created?`<div class="health-secret"><span>Persönlicher Import-Schlüssel</span><code>${esc(v.importKey)}</code><small>Dieser Schlüssel wird aus Sicherheitsgründen nur jetzt vollständig angezeigt.</small><button class="secondary full" onclick="prehipHealthShortcutCopy('importKey')">Schlüssel kopieren</button></div>`:noRaw?`<div class="info-card"><strong>Schlüssel bereits eingerichtet</strong><p>Der Klartext-Schlüssel wird nicht gespeichert. Falls du ihn nicht mehr im Kurzbefehl hast, erstelle einfach einen neuen; der alte wird dabei automatisch ungültig.</p></div>`:''}<div class="health-copy-grid"><button onclick="prehipHealthShortcutCopy('endpoint')"><span>API-Adresse</span><strong>Kopieren</strong></button><button onclick="prehipHealthShortcutCopy('apiKey')"><span>Öffentlicher API-Key</span><strong>Kopieren</strong></button></div><div class="shortcut-recipes"><h3>1 · Tagesdaten</h3><p>Kurzbefehl: letztes Körpergewicht + heutige Schritte aus Health suchen → Dictionary erstellen → „Inhalte von URL abrufen“ als POST. Die exakten Felder stehen unten in der Anleitung.</p><h3>2 · Workout-Automation</h3><p>Persönliche Automation „Apple Watch Training beendet“ → letztes Workout aus Health suchen → als POST an dieselbe Adresse senden.</p></div><button class="primary full" onclick="openHealthShortcutInstructions()">Schritt-für-Schritt-Anleitung</button>${noRaw?'<button class="secondary full" onclick="prehipHealthShortcutCreateKey()">Neuen Schlüssel erstellen</button>':''}<button class="cancel" onclick="closeModal()">Schließen</button></div>`,true)
}
window.showShortcutSetup=showShortcutSetup;
window.openHealthShortcutInstructions=function(){
  const v=setupValues();
  modal(`<div class="health-instructions"><span class="eyebrow">IPHONE KURZBEFEHLE</span><h2>preHIP mit Apple Health verbinden</h2><div class="instruction-step"><b>1</b><div><strong>Schlüssel bereithalten</strong><p>${v.importKey?'Dein gerade erzeugter Schlüssel kann direkt kopiert werden.':'Wenn dein alter Schlüssel nicht mehr vorliegt, gehe zurück und erstelle einen neuen.'}</p></div></div><div class="instruction-step"><b>2</b><div><strong>Neuen Kurzbefehl „preHIP Tagesdaten“ erstellen</strong><p>In Kurzbefehle zuerst „Health-Proben suchen“ für Körpergewicht (neuester Wert) und Schritte (heute) hinzufügen.</p></div></div><div class="instruction-step"><b>3</b><div><strong>Dictionary anlegen</strong><p>Felder: <code>action</code> = <code>import</code>, <code>weightKg</code>, <code>steps</code>, <code>recordedAt</code> = aktuelles Datum, <code>source</code> = <code>Apple Health Shortcut</code>.</p></div></div><div class="instruction-step"><b>4</b><div><strong>„Inhalte von URL abrufen“</strong><p>Methode POST · Request Body JSON · URL ist die preHIP-API-Adresse. Header <code>apikey</code> = öffentlicher API-Key und <code>x-prehip-import-key</code> = dein persönlicher Import-Schlüssel.</p></div></div><div class="instruction-step"><b>5</b><div><strong>Automation</strong><p>Den Tages-Kurzbefehl z. B. einmal abends automatisch ausführen. Für Workouts eine zweite Automation „Apple Watch Training beendet“ anlegen und das zuletzt beendete Workout senden.</p></div></div><div class="health-field"><span>API-Adresse</span><code>${esc(v.endpoint)}</code><button onclick="prehipHealthShortcutCopy('endpoint')">Kopieren</button></div><div class="health-field"><span>Öffentlicher API-Key</span><code>${esc(v.apiKey)}</code><button onclick="prehipHealthShortcutCopy('apiKey')">Kopieren</button></div>${v.importKey?`<div class="health-field secret"><span>Import-Schlüssel</span><code>${esc(v.importKey)}</code><button onclick="prehipHealthShortcutCopy('importKey')">Kopieren</button></div>`:''}<p class="hint">Die ausführliche Feldliste ist zusätzlich in <strong>APPLE_HEALTH_SHORTCUTS.md</strong> im Projekt dokumentiert.</p><button class="secondary full" onclick="showShortcutSetup(false)">Zurück</button></div>`,true)
};
window.openAppleHealth=function(){
  if(!loggedIn()){modal(`<h2>Apple Health</h2><p class="hint">Für die automatische Zuordnung der Health-Daten zu deinem Profil musst du angemeldet sein.</p><button class="primary full" onclick="closeModal();openPrehipCloud()">Anmelden</button>`);return}
  const s=snapshot();
  modal(`<div class="health-modal"><span class="eyebrow">APPLE HEALTH</span><h2>${s.configured?'Verbunden über Kurzbefehle':'Noch nicht verbunden'}</h2><p class="hint">Kein Xcode nötig: Dein iPhone sendet ausgewählte Health-Daten über einen persönlichen Import-Schlüssel an preHIP.</p><div class="health-summary"><div><span>Gewicht</span><strong>${s.weight}</strong></div><div><span>Schritte</span><strong>${s.steps}</strong></div><div><span>Letztes Workout</span><strong>${esc(s.workout)}</strong></div></div><p class="health-last">Letzter Import: ${esc(s.last)}</p>${setupHint()}${s.configured?'<button class="primary full" onclick="prehipHealthShortcutRefresh()">Daten aktualisieren</button><button class="secondary full" onclick="showShortcutSetup(false)">Einrichtung anzeigen</button><button class="danger-link" onclick="prehipHealthShortcutRevoke()">Apple Health trennen</button>':'<button class="primary full" onclick="prehipHealthShortcutCreateKey()">Apple Health einrichten</button>'}</div>`,true)
};

const baseProfileShortcut=profilePage;
profilePage=function(c){
  baseProfileShortcut(c);
  ensureLocal();
  c.querySelector('[data-apple-health]')?.remove();
  const page=c.querySelector('.page');if(!page)return;
  const s=snapshot(),block=document.createElement('div');
  block.dataset.appleHealth='shortcuts';block.className='apple-health-wrap shortcuts';
  block.innerHTML=`<div class="section-head"><h3>Apple Health</h3><button class="text-btn" onclick="event.stopPropagation();prehipHealthShortcutRefresh()">Aktualisieren</button></div><div class="profile-section"><button class="profile-row health-shortcut-row" onclick="openAppleHealth()"><div class="health-logo"></div><div class="health-row-copy"><span>Apple Health</span><strong>${loggedIn()?(s.configured?'✓ Verbunden':'Einrichten'):'Anmeldung erforderlich'}</strong><small>${s.configured?`${s.weight} · ${s.steps} Schritte · ${esc(s.workout)}`:'Gewicht, Schritte und Workouts automatisch übernehmen'}</small></div><b>›</b></button></div>`;
  const account=page.querySelector('.account-actions-wrap,.danger-zone-wrap');if(account)page.insertBefore(block,account);else page.appendChild(block);
  if(loggedIn()&&Date.now()-lastStatusAt>60000)setTimeout(()=>refreshStatus({rerender:true}),30);
};

window.prehipHealthShortcuts={refresh:refreshStatus,clear:window.prehipHealthShortcutClear};
})();
