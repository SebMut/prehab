(()=>{
const SESSION_KEY='prehip-supabase-session-v1';
let signupBusy=false;
function signupButton(){return [...document.querySelectorAll('#modal button')].find(b=>/Konto anlegen/i.test(b.textContent||''));}
function cloudMessage(){return document.getElementById('cloud-msg');}
function setMsg(text,error=false){const el=cloudMessage();if(el){el.textContent=text;el.style.color=error?'#b42318':'#667085';}}
function friendlyAuthMessage(text=''){
  const s=String(text||'').toLowerCase();
  if(s.includes('email rate limit exceeded')||s.includes('over_email_send_rate_limit')||s.includes('rate limit'))return 'Zu viele Auth-E-Mails wurden in kurzer Zeit angefordert. Bitte kurz warten und erneut versuchen.';
  if(s.includes('user already registered')||s.includes('already been registered'))return 'Für diese E-Mail-Adresse besteht bereits ein Konto. Bitte melde dich stattdessen an.';
  return text||'Registrierung fehlgeschlagen.';
}
function freshAccountState(){
  return {
    weight:88,
    target:82,
    trainings:[],
    checks:{},
    completed:[],
    weightHistory:[],
    workoutSessions:[],
    feelings:{},
    appointments:[],
    hipCheckins:{},
    preopChecklist:{},
    profile:{
      onboardingDone:false,
      name:'',
      nameStepDone:false,
      weightStepDone:false,
      loginSkipped:false,
      opDate:'2026-10-15',
      goals:[],
      activityLevel:'',
      equipment:[],
      trainingDays:[],
      quickActivities:['Spaziergang','Radfahren','Schwimmen','Rudergerät'],
      programMode:'auto',
      clinic:'',
      surgeon:'',
      procedure:'',
      rehabStart:'',
      opNotes:''
    }
  };
}
function resetForNewAccount(){
  state=freshAccountState();
  view.onboardingStep=0;
  view.onboardingDraft=null;
  localStorage.setItem('prehab-v1',JSON.stringify(state));
}
async function signupDirect(){
  const cfg=window.PREHIP_SUPABASE_CONFIG;
  const email=document.getElementById('cloud-email')?.value.trim();
  const password=document.getElementById('cloud-password')?.value||'';
  if(!email||password.length<8){setMsg('E-Mail und mindestens 8 Zeichen Passwort eingeben.',true);return;}
  if(!cfg?.url||!cfg?.publishableKey){setMsg('Cloud-Konfiguration ist nicht verfügbar.',true);return;}
  const btn=signupButton();
  signupBusy=true;
  if(btn){btn.disabled=true;btn.dataset.oldText=btn.textContent;btn.textContent='Konto wird angelegt …';}
  setMsg('Konto wird angelegt …');
  try{
    const redirect=`${location.origin}${location.pathname}`;
    const res=await fetch(`${cfg.url}/auth/v1/signup?redirect_to=${encodeURIComponent(redirect)}`,{
      method:'POST',
      headers:{'apikey':cfg.publishableKey,'Authorization':`Bearer ${cfg.publishableKey}`,'Content-Type':'application/json'},
      body:JSON.stringify({email,password})
    });
    let data=null;try{data=await res.json()}catch(e){}
    if(!res.ok){setMsg(friendlyAuthMessage(data?.msg||data?.message||`Registrierung fehlgeschlagen (${res.status}).`),true);return;}

    // A brand-new account must never inherit Demo/test data from the browser.
    resetForNewAccount();

    if(data?.access_token){
      localStorage.setItem(SESSION_KEY,JSON.stringify(data));
      // Reload so the normal cloud bootstrap creates the new user's empty app_state
      // and routes into Name -> Gewicht -> restliches Onboarding.
      location.reload();
      return;
    }
    // Production fallback for the day email confirmation is enabled again.
    setMsg('Konto angelegt. Bitte bestätige deine E-Mail. Danach startet dein persönliches Onboarding.');
  }catch(e){
    setMsg('Registrierung konnte gerade nicht abgeschlossen werden. Bitte erneut versuchen.',true);
  }finally{
    signupBusy=false;
    if(btn&&document.body.contains(btn)){btn.disabled=false;btn.textContent=btn.dataset.oldText||'Konto anlegen';}
  }
}
function decorateRateLimitMessage(){const el=cloudMessage();if(!el)return;const nice=friendlyAuthMessage(el.textContent);if(nice!==el.textContent&&nice){el.textContent=nice;el.style.color='#b42318';}}
function install(){
  if(typeof window.prehipCloudSignup!=='function'){setTimeout(install,120);return;}
  if(window.prehipCloudSignup.__prehipFreshSignup)return;
  signupDirect.__prehipFreshSignup=true;
  window.prehipCloudSignup=signupDirect;
}
new MutationObserver(()=>setTimeout(decorateRateLimitMessage,0)).observe(document.documentElement,{subtree:true,childList:true,characterData:true});
install();
})();