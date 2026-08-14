(()=>{
const SESSION_KEY='prehip-supabase-session-v1';
const STATE_KEY='prehab-v1';
const PREFIX='prehip-plan-complete-v1:';

function session(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch(e){return null}}
function userId(){
  const s=session();
  if(s?.user?.id)return s.user.id;
  try{
    const part=String(s?.access_token||'').split('.')[1];
    if(!part)return '';
    const normalized=part.replace(/-/g,'+').replace(/_/g,'/');
    const padded=normalized+'='.repeat((4-normalized.length%4)%4);
    return JSON.parse(atob(padded))?.sub||'';
  }catch(e){return ''}
}
function key(){const id=userId();return id?PREFIX+id:''}
function has(){const k=key();return !!(k&&localStorage.getItem(k))}
function mark(){
  const k=key();
  if(!k)return false;
  localStorage.setItem(k,new Date().toISOString());
  repairState();
  return true;
}
function clear(){const k=key();if(k)localStorage.removeItem(k)}
function repairState(){
  if(typeof state==='undefined')return;
  state.profile={...(state.profile||{}),nameStepDone:true,weightStepDone:true,onboardingDone:true};
  if(!state.profile.onboardingCompletedAt)state.profile.onboardingCompletedAt=new Date().toISOString();
  try{localStorage.setItem(STATE_KEY,JSON.stringify(state))}catch(e){}
}
function goHomeIfNeeded(){
  if(!has())return;
  repairState();
  const onboarding=document.querySelector('#content .onboarding');
  if(!onboarding&&state.profile?.onboardingDone===true)return;
  document.body.classList.remove('onboarding-open','plan-building-open');
  document.querySelectorAll('[data-onboarding-guard="1"]').forEach(el=>{
    el.removeAttribute('data-onboarding-guard');
    el.style.removeProperty('display');
  });
  const top=document.querySelector('.topbar');if(top)top.style.removeProperty('display');
  const nav=document.querySelector('.tabbar');if(nav){nav.removeAttribute('aria-hidden');nav.removeAttribute('inert');nav.inert=false;nav.style.display='grid';}
  if(typeof showPage==='function')showPage('home');
}

function install(){
  if(typeof window.openBuiltPrehipPlan!=='function'||typeof window.renderOnboarding!=='function'){setTimeout(install,80);return;}

  if(!window.openBuiltPrehipPlan.__prehipLateCompletionGuard){
    const originalOpen=window.openBuiltPrehipPlan;
    const wrappedOpen=function(){
      mark();
      const result=originalOpen.apply(this,arguments);
      [0,200,700,1500,3000,6000].forEach(ms=>setTimeout(goHomeIfNeeded,ms));
      return result;
    };
    wrappedOpen.__prehipLateCompletionGuard=true;
    window.openBuiltPrehipPlan=wrappedOpen;
  }

  if(!window.renderOnboarding.__prehipLateCompletionGuard){
    const originalRender=window.renderOnboarding;
    const wrappedRender=function(){
      if(has()){
        repairState();
        document.body.classList.remove('onboarding-open','plan-building-open');
        const nav=document.querySelector('.tabbar');if(nav)nav.style.display='grid';
        if(typeof showPage==='function')showPage('home');
        return;
      }
      return originalRender.apply(this,arguments);
    };
    wrappedRender.__prehipLateCompletionGuard=true;
    window.renderOnboarding=wrappedRender;
  }

  if(typeof window.restartOnboarding==='function'&&!window.restartOnboarding.__prehipLateCompletionGuard){
    const originalRestart=window.restartOnboarding;
    const wrappedRestart=function(){clear();return originalRestart.apply(this,arguments)};
    wrappedRestart.__prehipLateCompletionGuard=true;
    window.restartOnboarding=wrappedRestart;
  }
}

window.prehipCompletionGuard={has,mark,clear,repairState};
install();
})();
