(()=>{
let signupBusy=false;
function signupButton(){return [...document.querySelectorAll('#modal button')].find(b=>/Konto anlegen/i.test(b.textContent||''));}
function cloudMessage(){return document.getElementById('cloud-msg');}
function friendlyAuthMessage(text=''){
  const s=String(text||'').toLowerCase();
  if(s.includes('email rate limit exceeded')||s.includes('over_email_send_rate_limit')||s.includes('rate limit'))return 'Zu viele Bestätigungs-E-Mails wurden in kurzer Zeit versendet. Der Supabase-Testmaildienst hat sein Stundenlimit erreicht. Bitte später erneut versuchen oder vorerst die Demo verwenden.';
  return text;
}
function decorateRateLimitMessage(){const el=cloudMessage();if(!el)return;const nice=friendlyAuthMessage(el.textContent);if(nice!==el.textContent){el.textContent=nice;el.style.color='#b42318';}}
function install(){
  if(typeof window.prehipCloudSignup!=='function'){setTimeout(install,120);return;}
  if(window.prehipCloudSignup.__prehipWrapped)return;
  const original=window.prehipCloudSignup;
  const wrapped=async function(){
    if(signupBusy)return;
    const btn=signupButton();
    signupBusy=true;
    if(btn){btn.disabled=true;btn.dataset.oldText=btn.textContent;btn.textContent='Konto wird angelegt …';}
    try{await original();decorateRateLimitMessage();}
    finally{
      signupBusy=false;
      if(btn){btn.disabled=false;btn.textContent=btn.dataset.oldText||'Konto anlegen';}
    }
  };
  wrapped.__prehipWrapped=true;
  window.prehipCloudSignup=wrapped;
}
new MutationObserver(()=>setTimeout(decorateRateLimitMessage,0)).observe(document.documentElement,{subtree:true,childList:true,characterData:true});
install();
})();