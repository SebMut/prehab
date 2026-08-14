(()=>{
const cfg=window.PREHIP_SUPABASE_CONFIG;
const SESSION_KEY='prehip-supabase-session-v1';
const CACHE_PREFIX='prehip-health-shortcut-cache-v1:';
const ENDPOINT=cfg?.url?`${cfg.url}/functions/v1/health-shortcuts`:'';
const DAILY_SHORTCUT='preHIP Tagesdaten';
let remoteStatus=null,lastStatusAt=0,statusInFlight=null,lastCreatedKey='';

function readSession(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch(e){return null}}
function decodeSub(token=''){try{const p=token.split('.')[1];if(!p)return'';const b=p.replace(/-/g,'+').replace(/_/g,'/');const json=decodeURIComponent(atob(b.padEnd(Math.ceil(b.length/4)*4,'=')).split('').map(c=>`%${c.charCodeAt(0).toString(16).padStart(2,'0')}`).join(''));return JSON.parse(json)?.sub||''}catch(e){return''}}
function userId(){const s=readSession();return s?.user?.id||decodeSub(s?.access_token||'')||''}
function loggedIn(){return !!readSession()?.access_token&&!!userId()}
function cacheKey(){const id=userId();return id?`${CACHE_PREFIX}${id}`:''}
function readCache(){const key=cacheKey();if(!key)return{};try{const value=JSON.parse(localStorage.getItem(key)||'{}');return value&&typeof value==='object'?value:{}}catch(e){return{}}}
function writeCache(value){const key=cacheKey();if(key)localStorage.setItem(key,JSON.stringify(value||{}))}
function clearCache(){const key=cacheKey();if(key)localStorage.removeItem(key)}

// beta.38 used a native HealthKit proof of concept. Remove only its transient metadata;
// any weight already imported into weightHistory remains intact.
if(state&&typeof state==='object'&&('healthKit' in state||'healthShortcut' in state)){
  delete state.healthKit;delete state.healthShortcut;try{save()}catch(e){}
}

async function callService(action,extra={}){
  if(!cfg?.url||!cfg?.publishableKey)throw new Error('Cloud-Konfiguration fehlt.');
  const session=readSession();if(!session?.access_token)throw new Error('Bitte melde dich zuerst an.');
  const r=await fetch(ENDPOINT,{method:'POST',headers:{apikey:cfg.publishableKey,Authorization:`Bearer ${session.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({action,...extra})});
  let data=null;try{data=await r.json()}catch(e){}
  if(!r.ok||!data?.ok)throw new Error(data?.message||`Apple-Health-Fehler ${r.status}`);
  return data;
}
function when(value){if(!value)return'Noch keine Daten';const d=new Date(value);return Number.isNaN(d.getTime())?'Noch keine Daten':d.toLocaleString('de-DE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}
function workoutLabel(type=''){const t=String(type).toLowerCase();if(t.includes('cycl')||t.includes('bike'))return'Radfahren';if(t.includes('swim'))return'Schwimmen';if(t.includes('row'))return'Rudern';if(t.includes('walk'))return'Gehen';if(t.includes('hik'))return'Wandern';if(t.includes('tennis'))return'Tennis';if(t.includes('ski'))return'Skifahren';if(t.includes('strength'))return'Krafttraining';return String(type||'Workout').replace(/-/g,' ')}
function newestWeightTimestamp(){const rows=Array.isArray(state.weightHistory)?state.weightHistory:[];let newest=0;for(const row of rows){const value=row?.at||`${row?.date||''}T12:00:00`;const n=new Date(value).getTime();if(Number.isFinite(n)&&n>newest)newest=n}return newest}

function applyStatus(status){
  remoteStatus=status;writeCache(status);
  const daily=status?.latestDaily,kg=Number(daily?.weightKg);
  if(Number.isFinite(kg)&&kg>=30&&kg<=300){
    const previousNewest=newestWeightTimestamp();
    const weightAt=daily.weightRecordedAt||daily.recordedAt||daily.importedAt||new Date().toISOString();
    const healthTs=new Date(weightAt).getTime();
    if(Number.isFinite(healthTs)){
      const weightDate=dayKey(new Date(weightAt));
      state.weightHistory=Array.isArray(state.weightHistory)?state.weightHistory:[];
      let row=state.weightHistory.find(x=>x.date===weightDate&&x.source==='appleHealthShortcut');
      const changed=!row||Number(row.weight)!==kg||row.at!==weightAt;
      if(row){row.weight=kg;row.at=weightAt}else state.weightHistory.push({date:weightDate,weight:kg,at:weightAt,source:'appleHealthShortcut'});
      state.weightHistory.sort((a,b)=>String(a.date).localeCompare(String(b.date)));
      if(healthTs>=previousNewest-1000)state.weight=kg;
      if(changed)save();
    }
  }
}
async function refreshStatus({rerender=false,force=false}={}){
  if(!loggedIn())throw new Error('Bitte melde dich zuerst an.');
  if(!force&&Date.now()-lastStatusAt<60000&&remoteStatus)return remoteStatus;
  if(statusInFlight)return statusInFlight;
  statusInFlight=callService('status').then(data=>{lastStatusAt=Date.now();applyStatus(data);return data}).finally(()=>statusInFlight=null);
  const data=await statusInFlight;if(rerender&&view?.page==='profile')showPage('profile');return data
}
function currentStatus(){return remoteStatus||readCache()||{}}
function snapshot(){const s=currentStatus(),d=s.latestDaily||{},w=s.latestWorkout||null;return{configured:!!s.configured,weight:Number.isFinite(Number(d.weightKg))?`${Number(d.weightKg).toFixed(1)} kg`:'–',steps:Number.isFinite(Number(d.steps))?Math.round(Number(d.steps)).toLocaleString('de-DE'):'–',workout:w?`${workoutLabel(w.activityType)} · ${Math.round(Number(w.durationMinutes)||0)} min`:'–',last:when(s.lastImportAt)}}
function fallbackCopy(value,done){const t=document.createElement('textarea');t.value=value;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();try{document.execCommand('copy');done()}catch(e){}t.remove()}
function copyText(value,label='Kopiert'){const done=()=>toast(label);if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(value).then(done).catch(()=>fallbackCopy(value,done));fallbackCopy(value,done)}
function setupValues(){return{endpoint:ENDPOINT,apiKey:cfg?.publishableKey||'',importKey:lastCreatedKey}}
function setupHint(){return `<div class="health-privacy"><strong>🔐 Was wird übertragen?</strong><p>Nur Werte, die dein Kurzbefehl ausdrücklich sendet: Gewicht, Schritte und ausgewählte Workouts. Dein Apple-Health-Zugang selbst wird nicht an preHIP übertragen.</p></div>`}
function callbackUrl(result){const u=new URL(location.origin+location.pathname);u.searchParams.set('health',result);return u.toString()}

window.prehipHealthShortcutRefresh=async function(){try{await refreshStatus({force:true});if(view?.page==='profile')showPage('profile');toast('Apple Health neu geladen')}catch(e){toast(e.message||'Aktualisierung fehlgeschlagen')}};
window.prehipHealthShortcutRunNow=function(){
  if(!currentStatus().configured){window.openAppleHealth();return}
  const success=encodeURIComponent(callbackUrl('done')),cancel=encodeURIComponent(callbackUrl('cancelled')),error=encodeURIComponent(callbackUrl('error'));
  const url=`shortcuts://x-callback-url/run-shortcut?name=${encodeURIComponent(DAILY_SHORTCUT)}&x-success=${success}&x-cancel=${cancel}&x-error=${error}`;
  location.href=url;
};
window.prehipHealthShortcutCreateKey=async function(){try{const data=await callService('createKey');lastCreatedKey=data.key||'';const next={...readCache(),configured:true,keyCreatedAt:data.createdAt||'',keyLastUsedAt:null};remoteStatus=next;writeCache(next);showShortcutSetup(true)}catch(e){toast(e.message||'Schlüssel konnte nicht erstellt werden')}};
window.prehipHealthShortcutRevoke=async function(){if(!confirm('Apple-Health-Verbindung wirklich trennen? Der bisherige Import-Schlüssel funktioniert danach nicht mehr.'))return;try{await callService('revokeKey');lastCreatedKey='';const next={...readCache(),configured:false,keyCreatedAt:null,keyLastUsedAt:null};remoteStatus=next;writeCache(next);closeModal();showPage('profile');toast('Apple Health getrennt')}catch(e){toast(e.message||'Trennen fehlgeschlagen')}};
window.prehipHealthShortcutClear=async function(){if(!loggedIn())return;await callService('clear');lastCreatedKey='';remoteStatus=null;lastStatusAt=0;clearCache()};
window.prehipHealthShortcutCopy=function(kind){const v=setupValues();if(kind==='endpoint')copyText(v.endpoint,'API-Adresse kopiert');else if(kind==='apiKey')copyText(v.apiKey,'API-Key kopiert');else if(kind==='importKey'&&v.importKey)copyText(v.importKey,'Import-Schlüssel kopiert')};

function showShortcutSetup(created=false){
  const v=setupValues(),noRaw=!v.importKey;
  modal(`<div class="health-setup"><span class="eyebrow">APPLE HEALTH · KURZBEFEHLE</span><h2>${created?'Dein Import-Schlüssel ist bereit':'Apple Health einrichten'}</h2><p class="hint">Die Health-Daten bleiben auf dem iPhone. Ein persönlicher Kurzbefehl sendet nur freigegebene Werte an dein preHIP-Konto.</p>${setupHint()}${created?`<div class="health-secret"><span>Persönlicher Import-Schlüssel</span><code>${esc(v.importKey)}</code><small>Dieser Schlüssel wird aus Sicherheitsgründen nur jetzt vollständig angezeigt.</small><button class="secondary full" onclick="prehipHealthShortcutCopy('importKey')">Schlüssel kopieren</button></div>`:noRaw?`<div class="info-card"><strong>Schlüssel bereits eingerichtet</strong><p>Der Klartext-Schlüssel wird nicht gespeichert. Falls du ihn nicht mehr im Kurzbefehl hast, erstelle einfach einen neuen; der alte wird automatisch ungültig.</p></div>`:''}<div class="health-copy-grid"><button onclick="prehipHealthShortcutCopy('endpoint')"><span>API-Adresse</span><strong>Kopieren</strong></button><button onclick="prehipHealthShortcutCopy('apiKey')"><span>Öffentlicher API-Key</span><strong>Kopieren</strong></button></div><div class="shortcut-recipes"><h3>1 · Tagesdaten</h3><p>Kurzbefehl exakt <strong>„${DAILY_SHORTCUT}“</strong> nennen. Er liest letztes Körpergewicht inklusive Messdatum und heutige Schritte aus Health und sendet sie per POST.</p><h3>2 · Workout-Automation</h3><p>Nach beendetem Apple-Watch-Training das zuletzt beendete Workout an dieselbe Adresse senden.</p></div><button class="primary full" onclick="openHealthShortcutInstructions()">Schritt-für-Schritt-Anleitung</button>${noRaw?'<button class="secondary full" onclick="prehipHealthShortcutCreateKey()">Neuen Schlüssel erstellen</button>':''}<button class="cancel" onclick="closeModal()">Schließen</button></div>`,true)
}
window.showShortcutSetup=showShortcutSetup;
window.openHealthShortcutInstructions=function(){
  const v=setupValues();
  modal(`<div class="health-instructions"><span class="eyebrow">IPHONE KURZBEFEHLE</span><h2>preHIP mit Apple Health verbinden</h2><div class="instruction-step"><b>1</b><div><strong>Schlüssel bereithalten</strong><p>${v.importKey?'Dein gerade erzeugter Schlüssel kann direkt kopiert werden.':'Wenn dein alter Schlüssel nicht mehr vorliegt, erstelle einen neuen.'}</p></div></div><div class="instruction-step"><b>2</b><div><strong>„${DAILY_SHORTCUT}“ erstellen</strong><p>Health-Proben suchen: Körpergewicht, neuester Wert, Limit 1. Zusätzlich Schritte von heute suchen und summieren.</p></div></div><div class="instruction-step"><b>3</b><div><strong>Dictionary anlegen</strong><p><code>action=import</code>, <code>weightKg</code>, <code>weightRecordedAt</code> = Datum der Gewichtsprobe, <code>steps</code>, <code>recordedAt</code> = aktuelles Datum und <code>source=Apple Health Shortcut</code>.</p></div></div><div class="instruction-step"><b>4</b><div><strong>„Inhalte von URL abrufen“</strong><p>POST · JSON · Header <code>apikey</code> = öffentlicher API-Key und <code>x-prehip-import-key</code> = persönlicher Import-Schlüssel.</p></div></div><div class="instruction-step"><b>5</b><div><strong>Automatisieren</strong><p>Tagesdaten z. B. abends ausführen. Für Workouts eine zweite Automation nach beendetem Apple-Watch-Training verwenden. Sobald „${DAILY_SHORTCUT}“ gespeichert ist, kann preHIP ihn auch direkt starten und danach automatisch zurückkehren.</p></div></div><div class="health-field"><span>API-Adresse</span><code>${esc(v.endpoint)}</code><button onclick="prehipHealthShortcutCopy('endpoint')">Kopieren</button></div><div class="health-field"><span>Öffentlicher API-Key</span><code>${esc(v.apiKey)}</code><button onclick="prehipHealthShortcutCopy('apiKey')">Kopieren</button></div>${v.importKey?`<div class="health-field secret"><span>Import-Schlüssel</span><code>${esc(v.importKey)}</code><button onclick="prehipHealthShortcutCopy('importKey')">Kopieren</button></div>`:''}<p class="hint">Eine ausführliche Feldliste findest du zusätzlich in <strong>APPLE_HEALTH_SHORTCUTS.md</strong>.</p><button class="secondary full" onclick="showShortcutSetup(false)">Zurück</button></div>`,true)
};
window.openAppleHealth=function(){
  if(!loggedIn()){modal(`<h2>Apple Health</h2><p class="hint">Für die automatische Zuordnung der Health-Daten zu deinem Profil musst du angemeldet sein.</p><button class="primary full" onclick="closeModal();openPrehipCloud()">Anmelden</button>`);return}
  const s=snapshot();
  modal(`<div class="health-modal"><span class="eyebrow">APPLE HEALTH</span><h2>${s.configured?'Verbunden über Kurzbefehle':'Noch nicht verbunden'}</h2><p class="hint">Kein Xcode nötig: Dein iPhone sendet ausgewählte Health-Daten über einen persönlichen Import-Schlüssel an preHIP.</p><div class="health-summary"><div><span>Gewicht</span><strong>${s.weight}</strong></div><div><span>Schritte</span><strong>${s.steps}</strong></div><div><span>Letztes Workout</span><strong>${esc(s.workout)}</strong></div></div><p class="health-last">Letzter Import: ${esc(s.last)}</p>${setupHint()}${s.configured?'<button class="primary full" onclick="prehipHealthShortcutRunNow()"> Jetzt aus Apple Health aktualisieren</button><button class="secondary full" onclick="prehipHealthShortcutRefresh()">Nur Importe neu laden</button><button class="secondary full" onclick="showShortcutSetup(false)">Einrichtung anzeigen</button><button class="danger-link" onclick="prehipHealthShortcutRevoke()">Apple Health trennen</button>':'<button class="primary full" onclick="prehipHealthShortcutCreateKey()">Apple Health einrichten</button>'}</div>`,true)
};

const baseProfileShortcut=profilePage;
profilePage=function(c){
  baseProfileShortcut(c);c.querySelector('[data-apple-health]')?.remove();
  const page=c.querySelector('.page');if(!page)return;const s=snapshot(),block=document.createElement('div');
  block.dataset.appleHealth='shortcuts';block.className='apple-health-wrap shortcuts';
  block.innerHTML=`<div class="section-head"><h3>Apple Health</h3><button class="text-btn" onclick="event.stopPropagation();prehipHealthShortcutRefresh()">Neu laden</button></div><div class="profile-section"><button class="profile-row health-shortcut-row" onclick="openAppleHealth()"><div class="health-logo"></div><div class="health-row-copy"><span>Apple Health</span><strong>${loggedIn()?(s.configured?'✓ Verbunden':'Einrichten'):'Anmeldung erforderlich'}</strong><small>${s.configured?`${s.weight} · ${s.steps} Schritte · ${esc(s.workout)}`:'Gewicht, Schritte und Workouts automatisch übernehmen'}</small></div><b>›</b></button></div>`;
  const account=page.querySelector('.account-actions-wrap,.danger-zone-wrap');if(account)page.insertBefore(block,account);else page.appendChild(block);
  if(loggedIn()&&Date.now()-lastStatusAt>60000)setTimeout(()=>refreshStatus({rerender:true}).catch(()=>{}),30);
};

function handleShortcutCallback(){
  const u=new URL(location.href),result=u.searchParams.get('health');if(!result)return;
  u.searchParams.delete('health');u.searchParams.delete('result');u.searchParams.delete('errorMessage');history.replaceState(null,'',u.pathname+(u.search||'')+u.hash);
  if(result==='done')setTimeout(()=>refreshStatus({force:true}).then(()=>{showPage('profile');toast('Apple Health synchronisiert')}).catch(()=>toast('Import konnte noch nicht geladen werden')),700);
  else if(result==='error')setTimeout(()=>toast('Apple-Health-Kurzbefehl ist fehlgeschlagen'),400);
}
handleShortcutCallback();

window.prehipHealthShortcuts={refresh:refreshStatus,clear:window.prehipHealthShortcutClear,applyStatus};
})();
