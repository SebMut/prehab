import fs from 'node:fs';
import {JSDOM} from 'jsdom';

const html=`<!doctype html><html><body><div id="app"><header class="topbar"><div class="brand"><span class="version"></span></div><div class="now"><span id="todayDate"></span><span id="todayTime"></span></div></header><main id="content"></main><nav class="tabbar"><button data-page="home">Heute</button><button data-page="training">Training</button><button data-page="progress">Fortschritt</button><button data-page="calendar">Kalender</button><button data-page="profile">Profil</button></nav></div><div id="modal" class="modal hidden"></div></body></html>`;
const dom=new JSDOM(html,{url:'https://example.test/prehab/',runScripts:'dangerously',pretendToBeVisual:true});
const {window}=dom;
window.fetch=async()=>({ok:true,status:200,json:async()=>[]});
window.confirm=()=>true;
window.alert=()=>{};
const errors=[];
window.addEventListener('error',e=>{errors.push(String(e.error?.stack||e.message||e.error));});
window.addEventListener('unhandledrejection',e=>{errors.push(String(e.reason?.stack||e.reason));});

const files=[
  'v1-app.js','v1-name-onboarding.js','v1-greeting-weight.js','v1-activities.js','v1-goal-plan.js','v1-dashboard.js','v1-account.js','v1-demo-data.js','v1-milestones.js','v1-workout-mobile-fix.js','v1-training-upgrades.js','v1-video-preview.js','v1-ui-refine.js','v1-modal-safe.js','v1-profile-cleanup.js','v1-op-companion.js','v1-goal-ui.js','v1-training-start.js','v1-plan-builder.js','v1-equipment-options.js','v1-plan-handoff-final.js','v1-version.js'
];
for(const file of files){
  const s=window.document.createElement('script');
  s.textContent=fs.readFileSync(new URL(`../${file}`,import.meta.url),'utf8');
  s.dataset.file=file;
  window.document.body.appendChild(s);
}

await new Promise(r=>setTimeout(r,500));
window.eval(`
state.profile.name='Smoke';
state.profile.nameStepDone=true;
state.profile.weightStepDone=true;
state.profile.onboardingDone=false;
state.profile.opDate='2026-10-15';
state.profile.goals=['Aktiver Alltag','Fitness'];
state.profile.activityLevel='Aktiv';
state.profile.equipment=['Theraband'];
state.profile.trainingDays=[1,2,4,5];
view.onboardingDraft=null;
view.onboardingStep=4;
renderOnboarding();
`);
const start=window.document.getElementById('ob-training-start');
if(start)start.value='2026-08-16';
window.eval('onboardNext()');
await new Promise(r=>setTimeout(r,5300));
const ready=window.document.querySelector('.plan-ready-button');
if(!ready)throw new Error('Plan-ready button missing after builder');
window.prehipFinalizePlanAndOpenHome({preventDefault(){},stopPropagation(){}});
await new Promise(r=>setTimeout(r,200));
const text=window.document.getElementById('content')?.textContent||'';
console.log('CONTENT:',text.replace(/\s+/g,' ').slice(0,500));
console.log('ONBOARDING_DONE:',window.eval('state.profile.onboardingDone'));
console.log('ONBOARDING_VISIBLE:',!!window.document.querySelector('#content .onboarding'));
if(errors.length){console.error('RUNTIME ERRORS:\n'+errors.join('\n---\n'));process.exit(2);}
if(window.document.querySelector('#content .onboarding'))throw new Error('Onboarding still visible after finalize');
if(!/PREHIP SCORE|HEUTIGES TRAINING|Heute/i.test(text))throw new Error('Home dashboard did not render');
console.log('HANDOFF_SMOKE_OK');
process.exit(0);
