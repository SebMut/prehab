(()=>{
const SESSION_KEY='prehip-supabase-session-v1';
const STATE_KEY='prehab-v1';
const MARKER_PREFIX='prehip-onboarding-complete-v1:';

function readSession(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch(e){return null}}
function decodeJwtSub(token){
  try{
    const part=String(token||'').split('.')[1];
    if(!part)return '';
    const json=atob(part.replace(/-/g,'+').replace(/_/g,'/'));
    return JSON.parse(decodeURIComponent([...json].map(c=>'%'+c.charCodeAt(0).toString(16).padStart(2,'0')).join('')))?.sub||'';
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
function clear(userId=currentUserId()){
  localStorage.removeItem(markerKey(userId));
}
function syncFromState(userId=currentUserId()){
  if(typeof state==='undefined')return false;
  const p=state.profile||{};
  if(p.onboardingDone===true&&p.nameStepDone===true&&p.weightStepDone===true){
    if(!has(userId))localStorage.setItem(markerKey(userId),p.onboardingCompletedAt||new Date().toISOString());
    return true;
  }
  return false;
}

window.prehipOnboardingCompletion={currentUserId,markerKey,has,mark,clear,apply,syncFromState};

/* Restarting the onboarding is an explicit user action, so the guard must stand down. */
if(typeof window.restartOnboarding==='function'&&!window.restartOnboarding.__prehipMarkerWrapped){
  const original=window.restartOnboarding;
  const wrapped=function(){clear();return original.apply(this,arguments)};
  wrapped.__prehipMarkerWrapped=true;
  window.restartOnboarding=wrapped;
}
})();
