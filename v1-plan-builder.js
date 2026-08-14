(()=>{
const PLAN_BUILD_MS=15000;
let planBuildRunning=false;
let builtPlanReady=false;
const basePlanBuilderNext=onboardNext;

function planBuildSteps(){
  const draft=typeof onboardingDraft==='function'?onboardingDraft():null;
  const goals=(draft?.goals||state.profile?.goals||[]).length||1;
  return [
    ['OP-Zeitraum wird geprüft','Countdown und Trainingsstart abstimmen'],
    ['Deine Ziele werden ausgewertet',`${goals} persönliche ${goals===1?'Zielsetzung':'Zielsetzungen'} berücksichtigen`],
    ['Trainingstage werden verteilt','Belastung und Ruhetage sinnvoll anordnen'],
    ['Hüfte & Rumpf werden priorisiert','Pflichtkern mit deinen Wunschaktivitäten kombinieren'],
    ['Dein persönlicher Plan wird finalisiert','Fast geschafft …']
  ];
}
function renderPlanBuildOverlay(){
  document.body.classList.add('plan-building-open','onboarding-open');
  const nav=document.querySelector('.tabbar');if(nav){nav.style.display='none';nav.setAttribute('aria-hidden','true');nav.setAttribute('inert','');}
  const steps=planBuildSteps();
  const overlay=document.createElement('div');
  overlay.id='prehip-plan-builder';
  overlay.className='plan-builder-overlay';
  overlay.innerHTML=`<div class="plan-builder-card"><div class="plan-builder-logo"><div class="plan-builder-ring"></div><img src="assets/prehip-logo.svg" alt="preHIP"></div><span class="eyebrow">DEIN PLAN ENTSTEHT</span><h1>Wir stellen dein Training zusammen</h1><p id="plan-builder-main">${esc(steps[0][0])}</p><small id="plan-builder-sub">${esc(steps[0][1])}</small><div class="plan-build-progress"><i></i></div><div class="plan-build-status" id="plan-build-status">${steps.map((s,i)=>`<div class="${i===0?'active':''}"><span>${i===0?'●':'○'}</span><strong>${esc(s[0])}</strong></div>`).join('')}</div><div id="plan-builder-action"></div><p class="plan-builder-foot">Bitte einen Moment – preHIP personalisiert deinen Plan.</p></div>`;
  document.body.appendChild(overlay);
  requestAnimationFrame(()=>requestAnimationFrame(()=>overlay.classList.add('running')));
  return {overlay,steps};
}
function updatePlanBuild(viewData,index){
  const {overlay,steps}=viewData;if(!overlay?.isConnected)return;
  const i=Math.min(index,steps.length-1),main=overlay.querySelector('#plan-builder-main'),sub=overlay.querySelector('#plan-builder-sub');
  if(main)main.textContent=steps[i][0];if(sub)sub.textContent=steps[i][1];
  overlay.querySelectorAll('#plan-build-status>div').forEach((row,n)=>{
    row.classList.toggle('done',n<i);row.classList.toggle('active',n===i);
    const mark=row.querySelector('span');if(mark)mark.textContent=n<i?'✓':n===i?'●':'○';
  });
}
function commitBuiltPlan(){
  const d=typeof onboardingDraft==='function'?onboardingDraft():{};
  const start=d.trainingStartDate||state.profile.trainingStartDate||dayKey(new Date());
  d.trainingStartDate=start;
  state.profile={
    ...state.profile,
    ...d,
    trainingStartDate:start,
    goalPlanEnabledAt:start,
    nameStepDone:true,
    weightStepDone:true,
    onboardingDone:true,
    onboardingCompletedAt:new Date().toISOString()
  };
  try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}
  save();
  builtPlanReady=true;
}
function finishPlanBuild(viewData){
  const {overlay}=viewData;
  commitBuiltPlan();
  if(!overlay?.isConnected)return;
  const main=overlay.querySelector('#plan-builder-main'),sub=overlay.querySelector('#plan-builder-sub'),action=overlay.querySelector('#plan-builder-action'),foot=overlay.querySelector('.plan-builder-foot');
  if(main)main.textContent='Dein Plan ist bereit';
  if(sub)sub.textContent='Deine persönliche Trainingswoche wurde erfolgreich erstellt.';
  overlay.querySelectorAll('#plan-build-status>div').forEach(row=>{row.classList.add('done');row.classList.remove('active');const mark=row.querySelector('span');if(mark)mark.textContent='✓';});
  if(action)action.innerHTML='<div class="plan-profile-hint"><span>⚙️</span><p><strong>Nichts ist endgültig.</strong><br>OP-Datum, Ziele, Trainingsstart, Trainingstage, Equipment und weitere Angaben kannst du später jederzeit im Profil anpassen.</p></div><button class="primary full plan-ready-button" onclick="openBuiltPrehipPlan()">Meinen Plan ansehen</button>';
  if(foot)foot.textContent='Du kannst jetzt direkt mit preHIP starten.';
  overlay.classList.add('finished','ready');
  planBuildRunning=false;
}
function clearOnboardingChrome(){
  document.body.classList.remove('plan-building-open','onboarding-open','login-open');
  document.querySelectorAll('[data-onboarding-guard="1"]').forEach(el=>{
    el.removeAttribute('data-onboarding-guard');
    el.style.removeProperty('display');
  });
  const top=document.querySelector('.topbar');if(top)top.style.removeProperty('display');
  const nav=document.querySelector('.tabbar');
  if(nav){nav.removeAttribute('aria-hidden');nav.removeAttribute('inert');nav.inert=false;nav.style.removeProperty('display');nav.style.display='grid';}
}
function renderBuiltHome(){
  state.profile.nameStepDone=true;
  state.profile.weightStepDone=true;
  state.profile.onboardingDone=true;
  try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}
  clearOnboardingChrome();
  view.onboardingDraft=null;
  view.onboardingStep=0;
  view.page='home';
  view.workout=null;
  document.body.classList.remove('workout-open');
  document.querySelectorAll('.tabbar button').forEach(b=>b.classList.toggle('active',b.dataset.page==='home'));
  const c=document.getElementById('content');
  if(c&&typeof home==='function')home(c);else if(typeof showPage==='function')showPage('home');
  if(typeof setVersion==='function')setVersion();
  setTimeout(()=>window.prehipCloudDecorate?.(),0);
}
window.openBuiltPrehipPlan=function(){
  if(!builtPlanReady||state.profile.onboardingDone!==true)commitBuiltPlan();
  document.getElementById('prehip-plan-builder')?.remove();
  renderBuiltHome();
  // Push the completed onboarding state immediately so an older cloud snapshot
  // cannot route the user back into step 5 after the handoff.
  setTimeout(()=>{try{window.prehipCloudSyncNow?.()}catch(e){}},0);
  [250,1000,3000].forEach(ms=>setTimeout(()=>{
    if(state.profile.onboardingDone===true&&document.querySelector('#content .onboarding'))renderBuiltHome();
  },ms));
};

onboardNext=function(){
  const finalStep=state.profile?.nameStepDone&&state.profile?.weightStepDone&&view.onboardingStep===4;
  if(!finalStep)return basePlanBuilderNext();
  if(planBuildRunning||builtPlanReady)return;
  const input=document.getElementById('ob-training-start'),error=document.getElementById('ob-training-start-error');
  const value=input?.value||'',d=onboardingDraft(),op=d.opDate||state.profile.opDate||DEFAULT_OP_DATE;
  const fail=msg=>{if(error)error.textContent=msg;input?.focus();};
  if(!value){fail('Bitte wähle aus, ab wann dein Trainingsplan starten soll.');return;}
  if(value<dayKey(new Date())){fail('Der Trainingsstart kann im Onboarding nicht in der Vergangenheit liegen.');return;}
  if(value>=op){fail('Der Trainingsstart muss vor deinem OP-Datum liegen.');return;}
  persistOnboardStep();
  d.trainingStartDate=value;
  planBuildRunning=true;
  const viewData=renderPlanBuildOverlay();
  const schedule=[3200,6100,9100,12100];
  schedule.forEach((ms,i)=>setTimeout(()=>updatePlanBuild(viewData,i+1),ms));
  setTimeout(()=>finishPlanBuild(viewData),PLAN_BUILD_MS);
};
window.onboardNext=onboardNext;
})();
