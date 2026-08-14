(()=>{
function install(){
  const completion=window.prehipOnboardingCompletion;
  const original=window.openBuiltPrehipPlan;
  if(!completion||typeof original!=='function'){setTimeout(install,80);return;}
  if(original.__prehipCompletionHandoff)return;
  const wrapped=function(){
    completion.mark();
    try{
      state.profile={...(state.profile||{}),nameStepDone:true,weightStepDone:true,onboardingDone:true};
      localStorage.setItem('prehab-v1',JSON.stringify(state));
      if(typeof save==='function')save();
    }catch(e){}
    const result=original.apply(this,arguments);
    [0,150,500,1200,3000,7000].forEach(ms=>setTimeout(()=>{
      if(!completion.has())return;
      completion.apply();
      const onboarding=document.querySelector('#content .onboarding');
      if(onboarding){
        completion.restoreAppChrome?.();
        try{if(typeof save==='function')save()}catch(e){}
        if(typeof showPage==='function')showPage('home');
      }
    },ms));
    return result;
  };
  wrapped.__prehipCompletionHandoff=true;
  window.openBuiltPrehipPlan=wrapped;
}
install();
})();
