(()=>{
const ALL_GOALS=['Aktiver Alltag','Radfahren','Schwimmen','Wandern','Fitness','Tennis','Skifahren'];
const ALL_DAYS=[1,2,3,4,5,6,0];
const FLAG='onboardingDefaultsV2Applied';

function applyDefaultsOnce(){
  if(typeof state==='undefined'||!state.profile||state.profile.onboardingDone===true)return false;
  if(state.profile[FLAG]===true)return false;
  state.profile.goals=[...ALL_GOALS];
  state.profile.trainingDays=[...ALL_DAYS];
  state.profile[FLAG]=true;
  if(typeof view!=='undefined'&&view.onboardingDraft){
    view.onboardingDraft.goals=[...ALL_GOALS];
    view.onboardingDraft.trainingDays=[...ALL_DAYS];
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
