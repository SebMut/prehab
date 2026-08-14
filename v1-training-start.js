(()=>{
const TODAY_KEY=dayKey(new Date());
state.profile.trainingStartDate=state.profile.trainingStartDate||state.profile.goalPlanEnabledAt||TODAY_KEY;

function latestTrainingStart(opKey){
  const key=opKey||state.profile.opDate||DEFAULT_OP_DATE;
  return dayKey(addDays(dateFromKey(key),-1));
}
function safeTrainingStart(value,opKey){
  const latest=latestTrainingStart(opKey);
  let v=value||TODAY_KEY;
  if(v>latest)v=latest;
  return v;
}
function trainingStartLabel(){
  const k=state.profile.trainingStartDate||TODAY_KEY;
  return formatDate(dateFromKey(k),{day:'2-digit',month:'long',year:'numeric'});
}
function recordedOn(key){
  return (state.completed||[]).some(x=>x?.date===key)||
    (state.workoutSessions||[]).some(x=>x?.date===key)||
    (state.trainings||[]).some(x=>x?.date===key);
}
function dynamicPrestart(){
  const k=state.profile.trainingStartDate||TODAY_KEY;
  const d=dateFromKey(k);
  const text=formatDate(d,{day:'2-digit',month:'2-digit',year:'numeric'});
  return {...PRESTART,title:`Trainingsstart am ${text}`,short:'Vorbereitung',time:`Dein persönlicher Plan startet am ${text}`};
}

/* Final plan guard: before the chosen start date there are no due/missed sessions. */
const personalizedPlanFor=planFor;
planFor=function(date){
  const d=new Date(date.getFullYear(),date.getMonth(),date.getDate(),12);
  const key=dayKey(d),startKey=state.profile.trainingStartDate||TODAY_KEY;
  if(key<startKey&&!recordedOn(key))return dynamicPrestart();
  const p=personalizedPlanFor(d);
  /* The original prototype had a fixed 16.08. start. Allow the new personal start to supersede it. */
  if(p?.id==='prestart'&&key>=startKey&&!recordedOn(key)){
    const days=(state.profile.trainingDays||[]).map(Number);
    return days.includes(d.getDay())?HIP_A:REST;
  }
  return p;
};

/* Add the start-date field to the existing final onboarding step. */
const baseTrainingStartRenderOnboarding=renderOnboarding;
renderOnboarding=function(){
  if(state.profile.nameStepDone&&state.profile.weightStepDone&&view.onboardingStep===4){
    const d=onboardingDraft();
    d.trainingStartDate=safeTrainingStart(d.trainingStartDate||state.profile.trainingStartDate||TODAY_KEY,d.opDate||state.profile.opDate);
  }
  baseTrainingStartRenderOnboarding();
  if(!state.profile.nameStepDone||!state.profile.weightStepDone||view.onboardingStep!==4)return;
  const body=document.querySelector('.onboard-body'),days=body?.querySelector('#ob-days');
  if(!body||!days||body.querySelector('#ob-training-start'))return;
  const d=onboardingDraft(),latest=latestTrainingStart(d.opDate||state.profile.opDate);
  const wrap=document.createElement('div');
  wrap.className='training-start-onboard';
  wrap.innerHTML=`<div class="field"><label for="ob-training-start">Trainingsstart</label><div class="onboard-date compact"><span>▶</span><input id="ob-training-start" type="date" min="${TODAY_KEY}" max="${latest}" value="${safeTrainingStart(d.trainingStartDate,d.opDate)}"></div></div><div id="ob-training-start-error" class="onboard-error" role="alert"></div><p class="hint">Erst ab diesem Datum werden Trainingstage als geplant gewertet. Davor befindest du dich in der Vorbereitungsphase.</p>`;
  days.parentNode.insertBefore(wrap,days);
};

const baseTrainingStartPersist=persistOnboardStep;
persistOnboardStep=function(){
  baseTrainingStartPersist();
  if(view.onboardingStep===4){
    const input=document.getElementById('ob-training-start');
    if(input?.value)onboardingDraft().trainingStartDate=input.value;
  }
};

const baseTrainingStartNext=onboardNext;
onboardNext=function(){
  if(state.profile.nameStepDone&&state.profile.weightStepDone&&view.onboardingStep===4){
    const input=document.getElementById('ob-training-start'),error=document.getElementById('ob-training-start-error');
    const value=input?.value||'';
    const d=onboardingDraft(),op=d.opDate||state.profile.opDate||DEFAULT_OP_DATE;
    const fail=msg=>{if(error)error.textContent=msg;input?.focus();};
    if(!value){fail('Bitte wähle aus, ab wann dein Trainingsplan starten soll.');return;}
    if(value<TODAY_KEY){fail('Der Trainingsstart kann im Onboarding nicht in der Vergangenheit liegen.');return;}
    if(value>=op){fail('Der Trainingsstart muss vor deinem OP-Datum liegen.');return;}
    d.trainingStartDate=value;
    state.profile.trainingStartDate=value;
    state.profile.goalPlanEnabledAt=value;
  }
  baseTrainingStartNext();
};

/* Show and edit the date later in Profile. */
const baseTrainingStartProfile=profilePage;
profilePage=function(c){
  baseTrainingStartProfile(c);
  const sections=[...c.querySelectorAll('.profile-section')];
  const main=sections[0];
  if(!main||main.querySelector('[data-training-start]'))return;
  const rows=[...main.querySelectorAll('.profile-row')];
  const trainingDaysRow=rows.find(r=>r.querySelector('span')?.textContent.trim()==='Trainingstage');
  const row=document.createElement('div');
  row.className='profile-row';row.dataset.trainingStart='1';row.onclick=openTrainingStartEdit;
  row.innerHTML=`<div><span>Trainingsstart</span><strong>${esc(trainingStartLabel())}</strong><small>Ab diesem Datum wird dein Plan aktiv.</small></div><b>›</b>`;
  if(trainingDaysRow)main.insertBefore(row,trainingDaysRow);else main.appendChild(row);
};

window.openTrainingStartEdit=function(){
  const value=state.profile.trainingStartDate||TODAY_KEY,latest=latestTrainingStart();
  modal(`<h2>Trainingsstart</h2><p class="hint">Lege fest, ab welchem Datum dein persönlicher Trainingsplan aktiv sein soll. Vergangene bereits dokumentierte Einheiten bleiben erhalten.</p><div class="field"><label>Startdatum</label><input id="profile-training-start" type="date" max="${latest}" value="${value}"></div><div id="profile-training-start-error" class="form-msg error"></div><button class="primary full" onclick="saveTrainingStartDate()">Speichern</button>`);
};
window.saveTrainingStartDate=function(){
  const input=document.getElementById('profile-training-start'),error=document.getElementById('profile-training-start-error');
  const value=input?.value||'',op=state.profile.opDate||DEFAULT_OP_DATE;
  if(!value){if(error)error.textContent='Bitte wähle ein Startdatum.';return;}
  if(value>=op){if(error)error.textContent='Der Trainingsstart muss vor deinem OP-Datum liegen.';return;}
  state.profile.trainingStartDate=value;
  state.profile.goalPlanEnabledAt=value;
  save();closeModal();showPage('profile');
};

window.prehipTrainingStart={label:trainingStartLabel};
})();
