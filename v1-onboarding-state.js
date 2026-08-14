(()=>{
const SESSION_KEY='prehip-supabase-session-v1';
const STATE_KEY='prehab-v1';
const MARKER_PREFIX='prehip-onboarding-complete-v1:';

function readSession(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch(e){return null}}
function decodeJwtSub(token){
  try{
    const part=String(token||'').split('.')[1];
    if(!part)return '';
    const padded=part.replace(/-/g,'+').replace(/_/g,'/')+'==='.slice((part.length+3)%4);
    return JSON.parse(atob(padded))?.sub||'';
  }catch(e){return ''}
}
function currentUserId(){
  const s=readSession();
  return s?.user?.id||decodeJwtSub(s?.access_token)||'local';
}
function markerKey(userId=currentUserId()){return MARKER_PREFIX+(userId||'local')}
function has(userId=currentUserId()){return !!localStorage.getItem(markerKey(userId))}
function markerValue(userId=currentUserId()){return localStorage.getItem(markerKey(userId))||''}
function writeState(){try{if(typeof state!=='undefined')localStorage.setItem(STATE_KEY,JSON.stringify(state))}catch(e){}}
function apply(userId=currentUserId()){
  if(!has(userId)||typeof state==='undefined')return false;
  state.profile={...(state.profile||{}),nameStepDone:true,weightStepDone:true,onboardingDone:true};
  if(!state.profile.onboardingCompletedAt)state.profile.onboardingCompletedAt=markerValue(userId)||new Date().toISOString();
  writeState();
  return true;
}
function mark(userId=currentUserId()){
  const value=new Date().toISOString();
  localStorage.setItem(markerKey(userId),value);
  if(typeof state!=='undefined'){
    state.profile={...(state.profile||{}),nameStepDone:true,weightStepDone:true,onboardingDone:true,onboardingCompletedAt:state.profile?.onboardingCompletedAt||value};
    writeState();
  }
  return value;
}
function clear(userId=currentUserId()){localStorage.removeItem(markerKey(userId))}
function syncFromState(userId=currentUserId()){
  if(typeof state==='undefined')return false;
  const p=state.profile||{};
  if(p.onboardingDone===true&&p.nameStepDone===true&&p.weightStepDone===true){
    if(!has(userId))localStorage.setItem(markerKey(userId),p.onboardingCompletedAt||new Date().toISOString());
    return true;
  }
  return false;
}
function restoreAppChrome(){
  document.body.classList.remove('onboarding-open','plan-building-open');
  document.querySelectorAll('[data-onboarding-guard="1"]').forEach(el=>{
    el.removeAttribute('data-onboarding-guard');
    el.style.removeProperty('display');
  });
  const top=document.querySelector('.topbar');if(top)top.style.removeProperty('display');
  const nav=document.querySelector('.tabbar');
  if(nav){nav.removeAttribute('aria-hidden');nav.removeAttribute('inert');nav.inert=false;nav.style.removeProperty('display');nav.style.display='grid';}
}

const api=window.prehipOnboardingCompletion={currentUserId,markerKey,has,mark,clear,apply,syncFromState,restoreAppChrome};

/* Stale cloud hydration must never reopen the onboarding after completion. */
if(typeof window.renderOnboarding==='function'&&!window.renderOnboarding.__prehipCompletionGuard){
  const originalRender=window.renderOnboarding;
  const guardedRender=function(){
    if(api.has()&&api.apply()){
      restoreAppChrome();
      try{if(typeof save==='function')save()}catch(e){}
      if(typeof showPage==='function')showPage('home');
      return;
    }
    return originalRender.apply(this,arguments);
  };
  guardedRender.__prehipCompletionGuard=true;
  window.renderOnboarding=guardedRender;
}

try{syncFromState()}catch(e){}

/* Restarting onboarding is explicit, so allow it by removing the marker first. */
if(typeof window.restartOnboarding==='function'&&!window.restartOnboarding.__prehipMarkerWrapped){
  const originalRestart=window.restartOnboarding;
  const wrappedRestart=function(){clear();return originalRestart.apply(this,arguments)};
  wrappedRestart.__prehipMarkerWrapped=true;
  window.restartOnboarding=wrappedRestart;
}
})();
