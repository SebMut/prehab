(()=>{
state.profile={name:'',nameStepDone:false,weightStepDone:false,...(state.profile||{})};
const baseRenderOnboarding=renderOnboarding;

function onboardingShell({progress='10%',eyebrow,title,text,body,action,label='Weiter',backAction=''}){
  document.body.classList.add('onboarding-open');
  const nav=document.querySelector('.tabbar');if(nav)nav.style.display='none';
  const footer=backAction
    ? `<div class="onboard-footer"><button class="secondary" onclick="${backAction}">Zurück</button><button class="primary" onclick="${action}">${label}</button></div>`
    : `<div class="onboard-footer single"><button class="primary" onclick="${action}">${label}</button></div>`;
  document.getElementById('content').innerHTML=`<div class="onboarding"><div class="onboard-brand"><img src="assets/prehip-logo.svg" alt="preHIP"><span>preHIP</span></div><div class="onboard-progress"><i style="width:${progress}"></i></div><div class="onboard-body"><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${text}</p>${body}</div>${footer}</div>`;
}

renderOnboarding=function(){
  if(!state.profile.nameStepDone){
    onboardingShell({
      progress:'8%',
      eyebrow:'BEVOR WIR STARTEN',
      title:'Wie dürfen wir dich nennen?',
      text:'Dein Vorname erscheint auf deinem persönlichen Startbildschirm.',
      body:`<div class="field onboarding-name"><label>Vorname</label><input id="ob-first-name" maxlength="30" autocomplete="given-name" placeholder="Vorname" value="${esc(state.profile.name||'')}"></div>`,
      action:'saveOnboardingName()'
    });
    return;
  }
  if(!state.profile.weightStepDone){
    onboardingShell({
      progress:'16%',
      eyebrow:'DEIN AUSGANGSPUNKT',
      title:'Wie ist dein aktuelles Gewicht?',
      text:'Damit können wir deinen persönlichen Gewichtsverlauf und dein Ziel von Anfang an richtig darstellen.',
      body:`<div class="onboard-weight-grid"><div class="field"><label>Ist-Gewicht</label><div class="weight-input-wrap"><input id="ob-current-weight" type="number" inputmode="decimal" min="30" max="300" step="0.1" value="${Number(state.weight||88).toFixed(1)}"><span>kg</span></div></div><div class="field"><label>Zielgewicht</label><div class="weight-input-wrap"><input id="ob-target-weight" type="number" inputmode="decimal" min="30" max="300" step="0.1" value="${Number(state.target||82).toFixed(1)}"><span>kg</span></div></div></div><div id="ob-weight-error" class="onboard-error" role="alert"></div><p class="hint">Du kannst beide Werte später jederzeit im Profil oder auf der Startseite ändern.</p>`,
      action:'saveOnboardingWeight()',
      backAction:'backOnboardingToName()'
    });
    return;
  }
  baseRenderOnboarding();
  if(view.onboardingStep===0){
    const footer=document.querySelector('.onboard-footer');
    const left=footer?.querySelector('.secondary');
    if(left){left.textContent='Zurück';left.classList.remove('ghost');left.setAttribute('onclick','backOnboardingToWeight()');}
  }
}

window.backOnboardingToName=function(){
  state.profile.nameStepDone=false;
  save();
  renderOnboarding();
};

window.backOnboardingToWeight=function(){
  if(typeof persistOnboardStep==='function')persistOnboardStep();
  state.profile.weightStepDone=false;
  save();
  renderOnboarding();
};

window.saveOnboardingName=function(){
  const n=document.getElementById('ob-first-name')?.value.trim();
  if(!n){document.getElementById('ob-first-name')?.focus();return}
  state.profile.name=n.slice(0,30);
  state.profile.nameStepDone=true;
  save();
  renderOnboarding();
}

window.saveOnboardingWeight=function(){
  const current=Number(String(document.getElementById('ob-current-weight')?.value||'').replace(',','.'));
  const target=Number(String(document.getElementById('ob-target-weight')?.value||'').replace(',','.'));
  const error=document.getElementById('ob-weight-error');
  const fail=(msg,id)=>{if(error)error.textContent=msg;document.getElementById(id)?.focus()};
  if(!Number.isFinite(current)||current<30||current>300){fail('Bitte gib ein plausibles Ist-Gewicht zwischen 30 und 300 kg ein.','ob-current-weight');return}
  if(!Number.isFinite(target)||target<30||target>300){fail('Bitte gib ein plausibles Zielgewicht zwischen 30 und 300 kg ein.','ob-target-weight');return}
  if(Math.abs(current-target)>100){fail('Bitte prüfe dein Zielgewicht – die Differenz zum Ist-Gewicht wirkt ungewöhnlich groß.','ob-target-weight');return}
  state.weight=Math.round(current*10)/10;
  state.target=Math.round(target*10)/10;
  state.profile.weightStepDone=true;
  const now=new Date();
  state.weightHistory=[{date:dayKey(now),weight:state.weight,at:now.toISOString()}];
  save();
  renderOnboarding();
}
})();