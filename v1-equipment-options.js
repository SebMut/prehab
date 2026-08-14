(()=>{
const EQUIPMENT_OPTIONS=['Theraband','Kurzhanteln','Fahrrad','Rudergerät','Fitnessstudio','Schwimmbad','Sprossenwand'];

function addExtraOnboardingEquipment(){
  if(view?.onboardingStep!==3)return;
  const box=document.getElementById('ob-equipment');
  if(!box)return;
  const selected=typeof onboardingDraft==='function'?(onboardingDraft()?.equipment||[]):((state.profile&&state.profile.equipment)||[]);
  ['Schwimmbad','Sprossenwand'].forEach(value=>{
    if([...box.querySelectorAll('button')].some(b=>b.dataset.value===value))return;
    const button=document.createElement('button');
    button.type='button';
    button.dataset.value=value;
    button.textContent=value;
    if(selected.includes(value))button.classList.add('selected');
    button.addEventListener('click',()=>button.classList.toggle('selected'));
    box.appendChild(button);
  });
}

if(typeof window.renderOnboarding==='function'&&!window.renderOnboarding.__prehipEquipmentOptions){
  const originalRender=window.renderOnboarding;
  const wrappedRender=function(){
    const result=originalRender.apply(this,arguments);
    addExtraOnboardingEquipment();
    return result;
  };
  wrappedRender.__prehipEquipmentOptions=true;
  window.renderOnboarding=wrappedRender;
}

if(typeof window.openProfileEdit==='function'&&!window.openProfileEdit.__prehipEquipmentOptions){
  const originalProfileEdit=window.openProfileEdit;
  const wrappedProfileEdit=function(type){
    if(type==='equipment'&&typeof multiEdit==='function'){
      return multiEdit('Equipment',EQUIPMENT_OPTIONS,'equipment');
    }
    return originalProfileEdit.apply(this,arguments);
  };
  wrappedProfileEdit.__prehipEquipmentOptions=true;
  window.openProfileEdit=wrappedProfileEdit;
}

/* A selected swimming goal should only create pool sessions when a pool is actually available. */
if(typeof planFor==='function'&&!planFor.__prehipEquipmentOptions){
  const originalPlanFor=planFor;
  const wrappedPlanFor=function(date){
    const plan=originalPlanFor(date);
    const equipment=Array.isArray(state.profile?.equipment)?state.profile.equipment:[];
    if(plan?.goal==='Schwimmen'&&!equipment.includes('Schwimmbad'))return HIP_A;
    return plan;
  };
  wrappedPlanFor.__prehipEquipmentOptions=true;
  planFor=wrappedPlanFor;
}
})();
