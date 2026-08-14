(()=>{
const SESSION_KEY='prehip-supabase-session-v1';
state.profile={loginSkipped:false,...(state.profile||{})};
function hasSession(){try{return !!JSON.parse(localStorage.getItem(SESSION_KEY)||'null')?.access_token}catch(e){return false}}
function setLoginMode(active){
  document.body.classList.toggle('login-open',!!active);
  const nav=document.querySelector('.tabbar');
  if(!nav)return;
  if(active){
    nav.style.display='none';
    nav.setAttribute('aria-hidden','true');
    nav.inert=true;
  }else{
    nav.removeAttribute('aria-hidden');
    nav.inert=false;
  }
}
function gate(){
  if(hasSession()||state.profile.loginSkipped){setLoginMode(false);return false}
  document.body.classList.remove('onboarding-open');
  setLoginMode(true);
  const c=document.getElementById('content');if(!c)return false;
  c.innerHTML=`<div class="login-gate"><div class="login-logo"><img src="assets/prehip-logo.svg" alt="preHIP"><span>v1.1.0-beta.23</span></div><div class="login-visual login-brand-hero"><img src="assets/prehip-logo.svg" alt="preHIP – dein Begleiter rund um die Hüft-OP"></div><span class="eyebrow">DEIN WEG RUND UM DIE HÜFT-OP</span><h1>Willkommen bei preHIP</h1><p>Melde dich an, damit Trainingsstand, Gewicht und Einstellungen geräteübergreifend gespeichert werden.</p><button class="primary big" onclick="openPrehipCloud()">Anmelden / Konto anlegen</button><button class="secondary full" onclick="continueWithoutLogin()">Demo starten</button><small>Die Demo enthält 30 Tage Testdaten mit Training, Gewicht und Hüft-Check-ins.</small></div>`;
  return true;
}
window.continueWithoutLogin=function(){state.profile.loginSkipped=true;setLoginMode(false);if(typeof window.prehipSeedDemoMonth==='function')window.prehipSeedDemoMonth({silent:true,forceDemoIdentity:true});else save();route()}
function route(){
  setLoginMode(false);
  const nav=document.querySelector('.tabbar');
  if(!state.profile.nameStepDone||!state.profile.onboardingDone){view.onboardingStep=0;view.onboardingDraft=null;renderOnboarding()}
  else{if(nav)nav.style.display='grid';showPage('home')}
}
function boot(){
  if(!gate())route();
  let old=hasSession();
  setInterval(()=>{
    const now=hasSession();
    if(!now&&!state.profile.loginSkipped){setLoginMode(true)}
    if(now&&!old){state.profile.loginSkipped=false;save();route()}
    old=now
  },800)
}
setTimeout(boot,120);
})();