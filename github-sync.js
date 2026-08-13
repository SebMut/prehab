(()=>{
const DATA_REPO_DEFAULT='SebMut/prehab-data';
const DATA_PATH='state.json';
const TOKEN_KEY='prehab-github-token-v1';
const REPO_KEY='prehab-github-data-repo-v1';
let syncReady=false,syncSha=null,syncTimer=null,syncing=false,lastError='';
let localSave=null,baseHome=null;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const repo=()=>localStorage.getItem(REPO_KEY)||DATA_REPO_DEFAULT;
const token=()=>localStorage.getItem(TOKEN_KEY)||'';
function b64encode(str){const bytes=new TextEncoder().encode(str);let bin='';for(const b of bytes)bin+=String.fromCharCode(b);return btoa(bin)}
function b64decode(str){const bin=atob(str.replace(/\s/g,'')),bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);return new TextDecoder().decode(bytes)}
function headers(){return {'Accept':'application/vnd.github+json','Authorization':`Bearer ${token()}`,'X-GitHub-Api-Version':'2026-03-10','Content-Type':'application/json'}}
async function api(method,url,body){const r=await fetch(url,{method,headers:headers(),body:body?JSON.stringify(body):undefined});let data=null;try{data=await r.json()}catch(e){}return {ok:r.ok,status:r.status,data}}
function endpoint(){return `https://api.github.com/repos/${repo()}/contents/${DATA_PATH}`}
function normalizeRemote(raw){const d=raw&&raw.data?raw.data:raw;if(!d||typeof d!=='object')throw new Error('Ungültige Datendatei');return {...state0,...d,trainings:Array.isArray(d.trainings)?d.trainings:[],checks:d.checks&&typeof d.checks==='object'?d.checks:{},completed:Array.isArray(d.completed)?d.completed:[],weightHistory:Array.isArray(d.weightHistory)?d.weightHistory:[]}}
async function readRemote(){const r=await api('GET',endpoint());if(r.status===404)return {missing:true};if(!r.ok)throw new Error(r.data?.message||`GitHub Fehler ${r.status}`);syncSha=r.data.sha;const raw=JSON.parse(b64decode(r.data.content));return {missing:false,state:normalizeRemote(raw),updatedAt:raw.updatedAt||null}}
async function writeRemote(force=false){if(!token()||syncing)return;if(!syncReady&&!force)return;syncing=true;lastError='';try{if(!syncSha){const current=await readRemote();if(!current.missing&&current.state)syncSha=syncSha}const payload={schema:1,updatedAt:new Date().toISOString(),data:state};const body={message:'sync: update prehab data',content:b64encode(JSON.stringify(payload,null,2))};if(syncSha)body.sha=syncSha;const r=await api('PUT',endpoint(),body);if(!r.ok){if(r.status===409||r.status===422){syncSha=null;throw new Error('Versionskonflikt – bitte erneut synchronisieren.')}throw new Error(r.data?.message||`GitHub Fehler ${r.status}`)}syncSha=r.data.content?.sha||null;syncReady=true;decorateSyncStatus()}catch(e){lastError=e.message||String(e);decorateSyncStatus()}finally{syncing=false}}
function scheduleRemote(){if(!token()||!syncReady)return;clearTimeout(syncTimer);syncTimer=setTimeout(()=>writeRemote(),900)}
async function connect(mode='auto'){
 const t=document.getElementById('gh-token')?.value.trim()||token();const r=document.getElementById('gh-repo')?.value.trim()||repo();if(!t){showSyncMessage('Bitte Token eingeben.',true);return}localStorage.setItem(TOKEN_KEY,t);localStorage.setItem(REPO_KEY,r);showSyncMessage('Verbinde …');
 try{const remote=await readRemote();if(remote.missing){syncReady=true;await writeRemote(true);showSyncMessage('Verbunden. Deine bisherigen lokalen Daten wurden nach GitHub gesichert.');closeModal();showPage('home');return}
  if(mode==='upload'){syncReady=true;await writeRemote(true);showSyncMessage('Lokale Daten wurden nach GitHub übertragen.');closeModal();showPage('home');return}
  state=remote.state;localSave();syncReady=true;showSyncMessage('GitHub-Daten wurden geladen.');closeModal();showPage('home');
 }catch(e){syncReady=false;lastError=e.message||String(e);showSyncMessage(`Verbindung fehlgeschlagen: ${lastError}`,true);decorateSyncStatus()}
}
function showSyncMessage(msg,error=false){const e=document.getElementById('gh-sync-msg');if(e){e.textContent=msg;e.style.color=error?'#b42318':'#667085'}}
window.openGitHubSync=function(){const has=!!token();modal(`<h2>GitHub-Datensicherung</h2><p style="color:#666;font-size:13px;line-height:1.4">Trainings-, Verlaufs- und Gewichtsdaten werden in <b>${DATA_PATH}</b> eines privaten GitHub-Repositories gespeichert. Der Token bleibt nur auf diesem Gerät und wird nicht ins App-Repository geschrieben.</p><div class="field"><label>Privates Daten-Repository</label><input id="gh-repo" value="${repo()}" autocapitalize="off" autocomplete="off"></div><div class="field"><label>Fine-grained GitHub Token</label><input id="gh-token" type="password" placeholder="github_pat_…" value="${has?'': ''}" autocomplete="off"></div><div id="gh-sync-msg" style="min-height:20px;font-size:12px;margin:6px 0 12px"></div><button class="primary" onclick="window.githubSyncConnect()">Verbinden & GitHub-Daten laden</button><button style="width:100%;padding:13px;margin-top:8px;border-radius:12px;background:#f2f2ef;font-weight:700" onclick="window.githubSyncUpload()">Lokale Daten zu GitHub hochladen</button>${has?'<button style="width:100%;padding:13px;margin-top:8px;background:none;color:#b42318" onclick="window.githubSyncDisconnect()">Verbindung auf diesem Gerät entfernen</button>':''}`)};
window.githubSyncConnect=()=>connect('load');
window.githubSyncUpload=()=>connect('upload');
window.githubSyncDisconnect=()=>{localStorage.removeItem(TOKEN_KEY);syncReady=false;syncSha=null;closeModal();showPage('home')};
async function autoLoad(){if(!token())return;try{const remote=await readRemote();if(remote.missing){syncReady=true;await writeRemote(true);return}state=remote.state;localSave();syncReady=true;showPage(document.querySelector('.tabbar button.active')?.dataset.page||'home')}catch(e){lastError=e.message||String(e);syncReady=false;decorateSyncStatus()}}
function syncCard(){const connected=token()&&syncReady;const configured=!!token();const text=connected?'GitHub-Sicherung aktiv':configured?(lastError?'GitHub-Sync: Fehler':'GitHub wird verbunden …'):'GitHub-Sicherung einrichten';const sub=connected?`${repo()} · Daten dauerhaft gespeichert`:configured?(lastError||repo()):'Schützt Training, Verlauf und Gewicht vor Cache-Löschen';return `<div class="section-title">Datensicherung</div><div class="card training-row" onclick="openGitHubSync()"><div class="emoji">${connected?'☁️':'🔐'}</div><div class="row-main"><strong>${text}</strong><small>${sub}</small></div><div class="chev">›</div></div>`}
function decorateSyncStatus(){const existing=document.getElementById('github-sync-card');if(existing)existing.outerHTML=`<div id="github-sync-card">${syncCard()}</div>`}
function init(){if(typeof state==='undefined'||typeof save!=='function'||typeof home!=='function'||typeof modal!=='function'){setTimeout(init,100);return}
 const v=document.querySelector('.version');if(v)v.textContent='v0.7.0 · Build 20260813-15';
 localSave=save;save=function(){localSave();scheduleRemote()};
 baseHome=home;home=function(c){baseHome(c);const page=c.querySelector('.page');if(page){const holder=document.createElement('div');holder.id='github-sync-card';holder.innerHTML=syncCard();const reset=page.querySelector('.dev-reset');if(reset)page.insertBefore(holder,reset);else page.appendChild(holder)}};
 syncReady=false;showPage('home');autoLoad();
}
init();
})();