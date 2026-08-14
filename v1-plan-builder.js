(()=>{
const PLAN_BUILD_MS=15000;
let planBuildRunning=false;
const basePlanBuilderNext=onboardNext;

function planBuildSteps(){
  const goals=(state.profile?.goals||[]).length||1;
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
  overlay.innerHTML=`<div class="plan-builder-card"><div class="plan-builder-logo"><div class="plan-builder-ring"></div><img src="assets/prehip-logo.svg" alt="preHIP"></div><span class="eyebrow">DEIN PLAN ENTSTEHT</span><h1>Wir stellen dein Training zusammen</h1><p id="plan-builder-main">${esc(steps[0][0])}</p><small id="plan-builder-sub">${esc(steps[0][1])}</small><div class="plan-build-progress"><i></i></div><div class="plan-build-status" id="plan-build-status">${steps.map((s,i)=>`<div class="${i===0?'active':''}"><span>${i===0?'●':'○'}</span><strong>${esc(s[0])}</strong></div>`).join('')}</div><p class="plan-builder-foot">Bitte einen Moment – preHIP personalisiert deinen Plan.</p></div>`;
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
function finishPlanBuild(viewData){
  const {overlay,steps}=viewData;
  if(overlay?.isConnected){
    const main=overlay.querySelector('#plan-builder-main'),sub=overlay.querySelector('#plan-builder-sub');
    if(main)main.textContent='Dein Plan ist bereit';if(sub)sub.textContent='Persönliche Woche erfolgreich erstellt';
    overlay.querySelectorAll('#plan-build-status>div').forEach(row=>{row.classList.add('done');row.classList.remove('active');const mark=row.querySelector('span');if(mark)mark.textContent='✓';});
    overlay.classList.add('finished');
  }
  setTimeout(()=>{
    overlay?.remove();
    document.body.classList.remove('plan-building-open');
    planBuildRunning=false;
    basePlanBuilderNext();
  },650);
}

onboardNext=function(){
  const finalStep=state.profile?.nameStepDone&&state.profile?.weightStepDone&&view.onboardingStep===4;
  if(!finalStep)return basePlanBuilderNext();
  if(planBuildRunning)return;
  const input=document.getElementById('ob-training-start'),error=document.getElementById('ob-training-start-error');
  const value=input?.value||'',d=onboardingDraft(),op=d.opDate||state.profile.opDate||DEFAULT_OP_DATE;
  const fail=msg=>{if(error)error.textContent=msg;input?.focus();};
  if(!value){fail('Bitte wähle aus, ab wann dein Trainingsplan starten soll.');return;}
  if(value<dayKey(new Date())){fail('Der Trainingsstart kann im Onboarding nicht in der Vergangenheit liegen.');return;}
  if(value>=op){fail('Der Trainingsstart muss vor deinem OP-Datum liegen.');return;}
  persistOnboardStep();
  planBuildRunning=true;
  const viewData=renderPlanBuildOverlay();
  const schedule=[3200,6100,9100,12100];
  schedule.forEach((ms,i)=>setTimeout(()=>updatePlanBuild(viewData,i+1),ms));
  setTimeout(()=>finishPlanBuild(viewData),PLAN_BUILD_MS);
};
window.onboardNext=onboardNext;
})();
