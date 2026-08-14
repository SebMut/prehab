(()=>{
const ALL_GOALS=['Aktiver Alltag','Radfahren','Schwimmen','Wandern','Fitness','Tennis','Skifahren'];
const ALL_EQUIPMENT=['Theraband','Kurzhanteln','Fahrrad','Rudergerät','Fitnessstudio','Schwimmbad','Sprossenwand'];
const ALL_DAYS=[1,2,3,4,5,6,0];
const DEFAULT_LEVEL='Aktiv';
const FLAG='onboardingDefaultsV3Applied';

function applyDefaultsOnce(){
  if(typeof state==='undefined'||!state.profile||state.profile.onboardingDone===true)return false;
  if(state.profile[FLAG]===true)return false;

  /* New users start with every multi-select option enabled and can simply deselect. */
  state.profile.goals=[...ALL_GOALS];
  state.profile.equipment=[...ALL_EQUIPMENT];
  state.profile.trainingDays=[...ALL_DAYS];
  state.profile.activityLevel=DEFAULT_LEVEL;
  state.profile[FLAG]=true;

  if(typeof view!=='undefined'&&view.onboardingDraft){
    view.onboardingDraft.goals=[...ALL_GOALS];
    view.onboardingDraft.equipment=[...ALL_EQUIPMENT];
    view.onboardingDraft.trainingDays=[...ALL_DAYS];
    view.onboardingDraft.activityLevel=DEFAULT_LEVEL;
    view.onboardingDraft[FLAG]=true;
  }

  try{if(typeof save==='function')save()}catch(e){}
  return true;
}

if(applyDefaultsOnce()&&typeof renderOnboarding==='function'){
  try{renderOnboarding()}catch(e){}
}

window.prehipApplyOnboardingDefaults=applyDefaultsOnce;
})();
