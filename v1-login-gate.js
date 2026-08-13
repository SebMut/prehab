(()=>{
const SESSION_KEY='prehip-supabase-session-v1';
state.profile={loginSkipped:false,...(state.profile||{})};
function hasSession(){try{return !!JSON.parse(localStorage.getItem(SESSION_KEY)||'null')?.access_token}catch(e){return false}}
function gate(){if(hasSession()||state.profile.loginSkipped)return false;document.body.classList.remove('onboarding-open');const nav=document.querySelector('.tabbar');if(nav)nav.style.display='none';const c=document.getElementById('content');if(!c)return false;c.innerHTML=`<div class="login-gate"><div class="login-logo"><img src="assets/prehip-logo.svg" alt="preHIP"><span>v1.0.0-beta.2</span></div><div class="login-visual">🦴</div><span class="eyebrow">DEIN WEG RUND UM DIE HÜFT-OP</span><h1>Willkommen bei preHIP</h1><p>Melde dich an, damit Trainingsstand, Gewicht und Einstellungen geräteübergreifend gespeichert werden.</p><button class="primary big" onclick="openPrehipCloud()">Anmelden / Konto anlegen</button><button class="secondary full" onclick="continueWithoutLogin()">Ohne Konto testen</button><small>Du kannst dich später jederzeit im Profil anmelden.</small></div>`;return true}
window.continueWithoutLogin=function(){state.profile.loginSkipped=true;save();route()}
function route(){const nav=document.querySelector('.tabbar');if(!state.profile.nameStepDone||!state.profile.onboardingDone){view.onboardingStep=0;view.onboardingDraft=null;renderOnboarding()}else{if(nav)nav.style.display='grid';showPage('home')}}
function boot(){if(!gate())route();let old=hasSession();setInterval(()=>{const now=hasSession();if(now&&!old){state.profile.loginSkipped=false;save();route()}old=now},800)}
setTimeout(boot,120);
})();