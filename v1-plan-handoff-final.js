(()=>{
const STATE_KEY='prehab-v1';

function persistComplete(){
  if(typeof state==='undefined')return;
  state.profile={
    ...(state.profile||{}),
    nameStepDone:true,
    weightStepDone:true,
    onboardingDone:true,
    onboardingCompletedAt:state.profile?.onboardingCompletedAt||new Date().toISOString()
  };
  try{localStorage.setItem(STATE_KEY,JSON.stringify(state))}catch(e){}
}
function restoreChrome(){
  document.body.classList.remove('onboarding-open','plan-building-open','login-open','workout-open');
  document.querySelectorAll('[data-onboarding-guard="1"]').forEach(el=>{
    el.removeAttribute('data-onboarding-guard');
    el.style.removeProperty('display');
  });
  const top=document.querySelector('.topbar');if(top)top.style.removeProperty('display');
  const nav=document.querySelector('.tabbar');
  if(nav){
    nav.removeAttribute('aria-hidden');
    nav.removeAttribute('inert');
    nav.inert=false;
    nav.style.removeProperty('display');
    nav.style.display='grid';
  }
}
function homeDirect(){
  persistComplete();
  restoreChrome();
  document.getElementById('prehip-plan-builder')?.remove();
  if(typeof view!=='undefined'){
    view.onboardingDraft=null;
    view.onboardingStep=0;
    view.workout=null;
    view.page='home';
  }
  document.querySelectorAll('.tabbar button').forEach(b=>b.classList.toggle('active',b.dataset.page==='home'));
  const c=document.getElementById('content');
  if(c&&typeof home==='function')home(c);
  else if(typeof showPage==='function')showPage('home');
  try{if(typeof setVersion==='function')setVersion()}catch(e){}
  setTimeout(()=>window.prehipCloudDecorate?.(),0);
}

window.prehipFinalizePlanAndOpenHome=function(event){
  try{event?.preventDefault?.();event?.stopPropagation?.();}catch(e){}
  try{window.prehipCommitBuiltPlan?.()}catch(e){}
  persistComplete();
  try{if(typeof save==='function')save()}catch(e){}
  homeDirect();
  setTimeout(()=>{try{window.prehipCloudSyncNow?.()}catch(e){}},300);
  return false;
};
window.openBuiltPrehipPlan=window.prehipFinalizePlanAndOpenHome;

/* Core invariant: once onboarding is complete, no module may render it again.
   restartOnboarding() remains valid because it first sets onboardingDone=false. */
if(typeof renderOnboarding==='function'){
  const originalRender=renderOnboarding;
  const guardedRender=function(){
    if(state?.profile?.onboardingDone===true){
      homeDirect();
      return;
    }
    return originalRender.apply(this,arguments);
  };
  guardedRender.__prehipCompletionInvariant=true;
  renderOnboarding=guardedRender;
  window.renderOnboarding=guardedRender;
}

/* Last-resort DOM invariant for delayed callbacks from older wrappers. */
let repairing=false;
new MutationObserver(()=>{
  if(repairing||state?.profile?.onboardingDone!==true)return;
  if(!document.querySelector('#content .onboarding'))return;
  repairing=true;
  try{homeDirect()}finally{setTimeout(()=>{repairing=false},0)}
}).observe(document.getElementById('content'),{subtree:true,childList:true});
})();
