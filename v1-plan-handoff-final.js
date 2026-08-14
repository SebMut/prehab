(()=>{
const HANDOFF_KEY='prehip-plan-handoff-active-v1';
const STATE_KEY='prehab-v1';
let handoffTimer=null;

function handoffActive(){
  const raw=sessionStorage.getItem(HANDOFF_KEY);
  if(!raw)return false;
  const started=Number(raw)||0;
  if(!started||Date.now()-started>30000){sessionStorage.removeItem(HANDOFF_KEY);return false;}
  return true;
}
function persistCompletedState(){
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
  const top=document.querySelector('.topbar');
  if(top)top.style.removeProperty('display');
  const nav=document.querySelector('.tabbar');
  if(nav){
    nav.removeAttribute('aria-hidden');
    nav.removeAttribute('inert');
    nav.inert=false;
    nav.style.removeProperty('display');
    nav.style.display='grid';
  }
}
function renderHomeNow(){
  persistCompletedState();
  restoreChrome();
  if(typeof view!=='undefined'){
    view.onboardingDraft=null;
    view.onboardingStep=0;
    view.workout=null;
    view.page='home';
  }
  document.getElementById('prehip-plan-builder')?.remove();
  document.getElementById('modal')?.classList.add('hidden');
  if(typeof showPage==='function')showPage('home');
}
function enforceHandoff(){
  if(!handoffActive())return;
  const staleOnboarding=!!document.querySelector('#content .onboarding');
  const incomplete=state?.profile?.onboardingDone!==true||state?.profile?.nameStepDone!==true||state?.profile?.weightStepDone!==true;
  if(staleOnboarding||incomplete)renderHomeNow();
}
function startEnforcement(){
  clearInterval(handoffTimer);
  handoffTimer=setInterval(enforceHandoff,120);
  [0,50,200,500,1000,2000,4000,7000].forEach(ms=>setTimeout(enforceHandoff,ms));
  setTimeout(()=>{
    enforceHandoff();
    clearInterval(handoffTimer);
    handoffTimer=null;
    sessionStorage.removeItem(HANDOFF_KEY);
    persistCompletedState();
    try{if(typeof save==='function')save()}catch(e){}
    setTimeout(()=>{try{window.prehipCloudSyncNow?.()}catch(e){}},250);
  },10000);
}

window.openBuiltPrehipPlan=function(){
  sessionStorage.setItem(HANDOFF_KEY,String(Date.now()));
  persistCompletedState();
  try{if(typeof save==='function')save()}catch(e){}
  renderHomeNow();
  startEnforcement();
};

if(typeof window.renderOnboarding==='function'&&!window.renderOnboarding.__prehipFinalHandoff){
  const originalRender=window.renderOnboarding;
  const wrappedRender=function(){
    if(handoffActive()){
      renderHomeNow();
      return;
    }
    return originalRender.apply(this,arguments);
  };
  wrappedRender.__prehipFinalHandoff=true;
  window.renderOnboarding=wrappedRender;
}

if(handoffActive())startEnforcement();
})();
