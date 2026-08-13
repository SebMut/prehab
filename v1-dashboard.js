(()=>{
state.hipCheckins=state.hipCheckins&&typeof state.hipCheckins==='object'?state.hipCheckins:{};
state.preopChecklist=state.preopChecklist&&typeof state.preopChecklist==='object'?state.preopChecklist:{};
state.profile={programMode:'auto',clinic:'',surgeon:'',procedure:'',rehabStart:'',opNotes:'',...(state.profile||{})};

const PREOP_ITEMS=[
  {id:'clinic-docs',icon:'📄',title:'Klinikunterlagen vollständig',sub:'Aufnahmeunterlagen, Versichertenkarte und relevante Befunde bereitlegen.'},
  {id:'med-list',icon:'💊',title:'Medikamentenliste geklärt',sub:'Aktuelle Medikamente und Dosierungen für das Klinikteam notieren.'},
  {id:'transport',icon:'🚗',title:'Heimfahrt organisiert',sub:'Abholung bzw. Heimtransport nach der Entlassung klären.'},
  {id:'home-help',icon:'🤝',title:'Unterstützung zu Hause organisiert',sub:'Hilfe für Einkaufen, Haushalt oder Kinder in den ersten Tagen planen.'},
  {id:'home-safe',icon:'🏠',title:'Wohnung vorbereitet',sub:'Stolperfallen reduzieren und häufig benötigte Dinge gut erreichbar platzieren.'},
  {id:'aids',icon:'🩼',title:'Hilfsmittel geklärt',sub:'Nur das besorgen, was Klinik oder Therapie tatsächlich empfiehlt.'},
  {id:'rehab',icon:'🏥',title:'Reha / Nachsorge geklärt',sub:'Start, Ort und Ansprechpartner festhalten.'},
  {id:'work',icon:'💼',title:'Arbeit / AU organisiert',sub:'Arbeitgeber, Abwesenheit und notwendige Unterlagen planen.'},
  {id:'bag',icon:'🧳',title:'Kliniktasche vorbereitet',sub:'Bequeme Kleidung, feste Schuhe, Ladegerät und benötigte persönliche Dinge.'}
];

const REHAB_PLACEHOLDER={id:'rehab-placeholder',title:'Rehab · Klinikplan hinterlegen',short:'Rehab vorbereitet',icon:'🏥',time:'Nach OP-Freigabe',rest:true,items:[]};
const basePlanFor=planFor;
planFor=function(date){return programModeFor(date)==='rehab'?REHAB_PLACEHOLDER:basePlanFor(date)};

function programModeFor(date=new Date()){
  if(state.profile.programMode==='prehab'||state.profile.programMode==='rehab')return state.profile.programMode;
  return dateFromKey(dayKey(date))>=opDate()?'rehab':'prehab';
}
window.programModeFor=programModeFor;

function daysBack(n){return addDays(new Date(),-n)}
function checkinFor(d=new Date()){return state.hipCheckins[dayKey(d)]||null}
function checkinWellbeing(ci){
  if(!ci)return 60;
  const pain=100-Math.max(0,Math.min(10,Number(ci.pain||0)))*10;
  const stiff=100-Math.max(0,Math.min(10,Number(ci.stiffness||0)))*10;
  const energy=Math.max(1,Math.min(5,Number(ci.energy||3)))*20;
  const sleep=Math.max(1,Math.min(5,Number(ci.sleep||3)))*20;
  return Math.round(pain*.4+stiff*.25+energy*.2+sleep*.15);
}
function duePlanFulfilment(){
  const start=startOfWeek(),today=dateFromKey(dayKey(new Date()));let due=0,done=0;
  for(let i=0;i<7;i++){
    const d=addDays(start,i);if(d>today)break;const p=planFor(d);if(p.rest)continue;due++;if(completedFor(d).length===p.items.length)done++;
  }
  return due?Math.round(done/due*100):100;
}
function regularityScore(){
  const keys=new Set();
  state.completed.forEach(x=>{const d=dateFromKey(x.date);if(d>=daysBack(6))keys.add(x.date)});
  state.trainings.forEach(x=>{const d=dateFromKey(x.date);if(d>=daysBack(6))keys.add(x.date)});
  Object.keys(state.hipCheckins).forEach(k=>{const d=dateFromKey(k);if(d>=daysBack(6))keys.add(k)});
  return Math.min(100,Math.round(keys.size/5*100));
}
function scoreParts(){
  const plan=duePlanFulfilment(),weight=Math.round(progress()),regularity=regularityScore(),wellbeing=checkinWellbeing(checkinFor());
  const total=Math.round(plan*.4+weight*.2+regularity*.2+wellbeing*.2);
  return{total,plan,weight,regularity,wellbeing};
}
window.prehipScore=()=>scoreParts().total;
function scoreText(s){if(s>=85)return'Sehr konstant vorbereitet';if(s>=70)return'Guter Vorbereitungsrhythmus';if(s>=50)return'Du bist auf dem Weg';return'Heute zählt der nächste kleine Schritt'}
function checkinGuidance(ci){
  if(!ci)return{label:'Check-in fehlt',tone:'neutral',text:'Kurzer Hüft-Check-in macht deinen Verlauf vergleichbar.'};
  const pain=Number(ci.pain||0),energy=Number(ci.energy||3);
  if(pain>=7||ci.limp||energy<=2)return{label:'Heute bewusst locker',tone:'soft',text:'Dein eigener Check-in ist heute auffälliger als an einem guten Tag. Belastung nur im vereinbarten Rahmen.'};
  if(pain>=4||Number(ci.stiffness||0)>=6)return{label:'Heute kontrolliert',tone:'medium',text:'Achte heute besonders auf saubere, angenehme Bewegungen und deine vereinbarten Grenzen.'};
  return{label:'Heute normal im Plan',tone:'good',text:'Dein Check-in spricht aus deiner Sicht für einen normalen Trainingstag im vereinbarten Rahmen.'};
}
function weeklyPlanCard(){
  const start=startOfWeek(),today=dateFromKey(dayKey(new Date()));let planned=0,complete=0,rad=0,radDone=0,row=0,rowDone=0,str=0,strDone=0;
  for(let i=0;i<7;i++){
    const d=addDays(start,i),p=planFor(d);if(p.rest)continue;planned++;const isDone=completedFor(d).length===p.items.length;if(isDone)complete++;
    if(p.id.includes('bike')){rad++;if(isDone)radDone++}else if(p.id.includes('row')){row++;if(isDone)rowDone++}else if(p.id.includes('hip')){str++;if(isDone)strDone++}
  }
  const pct=planned?Math.round(complete/planned*100):0;
  return `<section class="dash-card plan-fulfil"><div class="dash-card-head"><div><span class="card-kicker">WOCHENZIEL</span><h3>${complete} von ${planned} Einheiten</h3></div><strong>${pct}%</strong></div><div class="dash-progress"><i style="width:${pct}%"></i></div><div class="goal-pills"><span>🚴 ${radDone}/${rad} Rad</span><span>🚣 ${rowDone}/${row} Rudern</span><span>🦵 ${strDone}/${str} Kraft</span></div></section>`;
}
function hipTrendMini(){
  const rows=Object.entries(state.hipCheckins).sort((a,b)=>a[0].localeCompare(b[0])).slice(-14);if(rows.length<2)return'<div class="trend-empty">Noch zu wenig Hüft-Check-ins für einen Trend.</div>';
  const W=320,H=110,l=18,r=10,t=12,b=18,x=i=>l+i*((W-l-r)/(rows.length-1)),y=v=>t+(Math.max(0,Math.min(10,v))/10)*(H-t-b);
  const pain=rows.map(([k,v],i)=>`${x(i)},${y(10-Number(v.pain||0))}`).join(' '),stiff=rows.map(([k,v],i)=>`${x(i)},${y(10-Number(v.stiffness||0))}`).join(' ');
  return `<svg class="hip-mini-chart" viewBox="0 0 ${W} ${H}"><line x1="${l}" x2="${W-r}" y1="${H-b}" y2="${H-b}" stroke="#e7ecec"/><polyline points="${pain}" fill="none" stroke="#2e7475" stroke-width="2.5"/><polyline points="${stiff}" fill="none" stroke="#f17c20" stroke-width="2" stroke-dasharray="4 3"/></svg><div class="trend-legend"><span><i class="pain"></i>Schmerz</span><span><i class="stiff"></i>Steifigkeit</span></div>`;
}
function checklistSummary(){const done=PREOP_ITEMS.filter(x=>state.preopChecklist[x.id]).length,pct=Math.round(done/PREOP_ITEMS.length*100);return{done,total:PREOP_ITEMS.length,pct}}

const baseHomeDashboard=home;
home=function(c){
  const d=new Date(),p=planFor(d),left=remaining(d).length,j=journey(),ci=checkinFor(d),guide=checkinGuidance(ci),score=scoreParts(),check=checklistSummary(),mode=programModeFor(d);
  c.innerHTML=`<div class="page dashboard-v11"><section class="dash-greeting"><span class="eyebrow">HEUTE · ${formatDate(d,{weekday:'long',day:'2-digit',month:'long'}).toUpperCase()}</span><h1>${typeof greeting==='function'?greeting():''}${state.profile.name?', '+esc(state.profile.name):''}</h1><p>${esc(j.kicker)} · ${mode==='prehab'?'Prehab':'Rehab vorbereitet'}</p></section><section class="score-card"><div class="score-ring" style="--score:${score.total}"><div><b>${score.total}</b><span>/100</span></div></div><div class="score-copy"><span class="card-kicker">PREHIP SCORE</span><h2>${scoreText(score.total)}</h2><p>Motivationswert aus Planerfüllung, Gewichtsfortschritt, Regelmäßigkeit und deinem Befinden – keine medizinische Bewertung.</p></div></section><div class="score-breakdown"><span>Plan <b>${score.plan}%</b></span><span>Gewicht <b>${score.weight}%</b></span><span>Regelmäßig <b>${score.regularity}%</b></span><span>Befinden <b>${score.wellbeing}%</b></span></div><section class="today-card ${p.rest?'rest':''}"><div class="today-card-head"><div class="activity-icon">${p.icon}</div><div><span class="card-kicker">HEUTIGES TRAINING</span><h2>${esc(p.title)}</h2><p>${p.rest?esc(p.time):`${esc(p.time)} · ${left} von ${p.items.length} offen`}</p></div></div>${mode==='rehab'?`<div class="rest-message">Die App ist in den Rehab-Modus gewechselt. Postoperative Übungen werden erst mit deinem konkreten Klinik-/Physioplan aktiviert.</div>`:p.rest?`<div class="rest-message">${p.id==='prestart'?'Dein fester Trainingsplan startet am 16.08.':'Heute ist bewusst trainingsfrei. Ein Ruhetag zählt als Teil des Plans.'}</div>`:`<button class="primary big" onclick="openPlanDetail('${dayKey(d)}')">${left===p.items.length?'Training starten':left===0?'Training ansehen':'Training fortsetzen'}</button>`}</section><section class="dash-card hip-check ${guide.tone}"><div class="dash-card-head"><div><span class="card-kicker">DEINE HÜFTE HEUTE</span><h3>${guide.label}</h3></div><button class="text-btn" onclick="openHipCheckin()">${ci?'Ändern':'Check-in'}</button></div>${ci?`<div class="hip-values"><span>Schmerz <b>${ci.pain}/10</b></span><span>Steifigkeit <b>${ci.stiffness}/10</b></span><span>Energie <b>${ci.energy}/5</b></span><span>Schlaf <b>${ci.sleep}/5</b></span></div>`:''}<p>${guide.text}</p></section>${weeklyPlanCard()}<div class="section-head"><h3>Zusätzliche Aktivität</h3><button class="text-btn" onclick="showPage('profile');setTimeout(()=>openActivityManager(),80)">Anpassen ›</button></div><div class="quick-grid activity-quick">${(state.profile.quickActivities||['Spaziergang','Radfahren','Schwimmen','Rudergerät']).slice(0,6).map(name=>{const a=(window.getSportsCatalog?.()||activities.map(x=>({icon:x[0],name:x[1]}))).find(x=>x.name===name)||{icon:'＋',name};return `<button onclick="openTraining('${esc(a.name)}')">${a.icon||'＋'}<span>${esc(a.name)}</span></button>`}).join('')}</div><section class="dash-card checklist-teaser" onclick="openPreopChecklist()"><div class="dash-card-head"><div><span class="card-kicker">PRE-OP-CHECKLISTE</span><h3>${check.done} von ${check.total} erledigt</h3></div><strong>${check.pct}%</strong></div><div class="dash-progress"><i style="width:${check.pct}%"></i></div><p>Klinik, Heimfahrt, Hilfsmittel, Reha, Wohnung und Arbeit im Blick behalten.</p></section><div class="section-head"><h3>Gewicht & Hüftverlauf</h3><button class="text-btn" onclick="openWeight()">Gewicht eintragen ›</button></div>${typeof weightChart==='function'?weightChart():''}<section class="dash-card trend-card"><div class="dash-card-head"><div><span class="card-kicker">HÜFT-VERLAUF</span><h3>Schmerz & Steifigkeit</h3></div><button class="text-btn" onclick="showPage('progress')">Details ›</button></div>${hipTrendMini()}</section></div>`;
};

window.openHipCheckin=function(){
  const ci=checkinFor()||{pain:3,stiffness:3,energy:3,sleep:3,limp:false};
  modal(`<h2>Wie geht’s deiner Hüfte?</h2><p class="hint">Ein subjektiver Tageswert für deinen persönlichen Verlauf – keine medizinische Bewertung.</p>${rangeField('Schmerz','hip-pain',ci.pain,0,10)}${rangeField('Steifigkeit','hip-stiff',ci.stiffness,0,10)}${rangeField('Energie','hip-energy',ci.energy,1,5)}${rangeField('Schlaf','hip-sleep',ci.sleep,1,5)}<label class="check-toggle"><input id="hip-limp" type="checkbox" ${ci.limp?'checked':''}><span>Hinken heute stärker als sonst</span></label><button class="primary full" onclick="saveHipCheckin()">Check-in speichern</button>`);
};
function rangeField(label,id,val,min,max){return `<div class="range-field"><div><label>${label}</label><output id="${id}-out">${val}/${max}</output></div><input id="${id}" type="range" min="${min}" max="${max}" step="1" value="${val}" oninput="document.getElementById('${id}-out').textContent=this.value+'/${max}'"></div>`}
window.saveHipCheckin=function(){state.hipCheckins[dayKey(new Date())]={pain:Number(document.getElementById('hip-pain').value),stiffness:Number(document.getElementById('hip-stiff').value),energy:Number(document.getElementById('hip-energy').value),sleep:Number(document.getElementById('hip-sleep').value),limp:!!document.getElementById('hip-limp').checked,at:new Date().toISOString()};save();closeModal();showPage('home')};

window.openPreopChecklist=function(){const s=checklistSummary();modal(`<div class="detail-head"><button class="sheet-close" onclick="closeModal()">×</button><span class="eyebrow">PRE-OP</span><h2>Vorbereitung auf deine OP</h2><p>${s.done} von ${s.total} erledigt · ${s.pct}%</p></div><div class="checklist-list">${PREOP_ITEMS.map(x=>`<button class="checklist-item ${state.preopChecklist[x.id]?'done':''}" onclick="togglePreop('${x.id}')"><span class="check-icon">${state.preopChecklist[x.id]?'✓':x.icon}</span><div><strong>${x.title}</strong><small>${x.sub}</small></div></button>`).join('')}</div><div class="safety-note">Medikamente, Nüchternheit, Hilfsmittel und konkrete OP-/Reha-Regeln immer nach den Vorgaben deiner Klinik bzw. behandelnden Fachpersonen.</div><button class="secondary full" onclick="openMySurgery()">Meine OP-Daten</button>`,true)};
window.togglePreop=function(id){state.preopChecklist[id]=!state.preopChecklist[id];save();openPreopChecklist()};
window.openMySurgery=function(){modal(`<h2>Meine OP</h2><div class="field"><label>OP-Datum</label><input id="s-op" type="date" value="${state.profile.opDate||''}"></div><div class="field"><label>Klinik</label><input id="s-clinic" value="${esc(state.profile.clinic||'')}"></div><div class="field"><label>Operateur / Operateurin</label><input id="s-surgeon" value="${esc(state.profile.surgeon||'')}"></div><div class="field"><label>Verfahren / Notiz</label><input id="s-procedure" value="${esc(state.profile.procedure||'')}"></div><div class="field"><label>Geplanter Reha-Start</label><input id="s-rehab" type="date" value="${state.profile.rehabStart||''}"></div><div class="field"><label>Notizen</label><textarea id="s-notes" rows="4">${esc(state.profile.opNotes||'')}</textarea></div><button class="primary full" onclick="saveMySurgery()">Speichern</button>`)};
window.saveMySurgery=function(){state.profile.opDate=document.getElementById('s-op').value||state.profile.opDate;state.profile.clinic=document.getElementById('s-clinic').value.trim();state.profile.surgeon=document.getElementById('s-surgeon').value.trim();state.profile.procedure=document.getElementById('s-procedure').value.trim();state.profile.rehabStart=document.getElementById('s-rehab').value;state.profile.opNotes=document.getElementById('s-notes').value.trim();save();closeModal();showPage('home')};

const baseProgressV11=progressPage;
progressPage=function(c){baseProgressV11(c);const page=c.querySelector('.page');if(!page)return;const rows=Object.entries(state.hipCheckins).sort((a,b)=>a[0].localeCompare(b[0])).slice(-30);const card=document.createElement('section');card.className='dash-card hip-history-full';card.innerHTML=`<div class="dash-card-head"><div><span class="card-kicker">HÜFT-VERLAUF</span><h3>Letzte ${rows.length||0} Check-ins</h3></div><button class="text-btn" onclick="openHipCheckin()">Heute erfassen</button></div>${hipTrendMini()}${rows.length?`<div class="hip-history-rows">${rows.slice(-7).reverse().map(([k,v])=>`<div><span>${formatDate(dateFromKey(k),{weekday:'short',day:'2-digit',month:'2-digit'})}</span><b>Schmerz ${v.pain}/10</b><small>Steif ${v.stiffness}/10 · Energie ${v.energy}/5 · Schlaf ${v.sleep}/5${v.limp?' · Hinken ↑':''}</small></div>`).join('')}</div>`:''}`;page.insertBefore(card,page.querySelector('.section-head:nth-last-of-type(1)')||page.lastChild)};

const baseCalendarV11=calendarPage;
calendarPage=function(c){baseCalendarV11(c);const today=new Date(),base=new Date(today.getFullYear(),today.getMonth()+view.calendarOffset,1,12),year=base.getFullYear(),month=base.getMonth();c.querySelectorAll('.cal-cell:not(.muted)').forEach(btn=>{const day=Number(btn.querySelector('b')?.textContent);if(!day)return;const k=dayKey(new Date(year,month,day,12)),dots=btn.querySelector('.cal-dots');if(!dots)return;if(state.hipCheckins[k])dots.insertAdjacentHTML('beforeend','<i class="hipdot"></i>');if(state.weightHistory.some(x=>x.date===k))dots.insertAdjacentHTML('beforeend','<i class="weightdot"></i>')})};
const baseOpenCalV11=openCalendarDay;
openCalendarDay=function(key){baseOpenCalV11(key);const m=document.querySelector('#modal .sheet'),ci=state.hipCheckins[key],wh=state.weightHistory.find(x=>x.date===key);if(!m)return;if(ci)m.insertAdjacentHTML('beforeend',`<div class="mini-row"><span>❤️</span><div><strong>Hüfte: Schmerz ${ci.pain}/10</strong><small>Steifigkeit ${ci.stiffness}/10 · Energie ${ci.energy}/5 · Schlaf ${ci.sleep}/5</small></div></div>`);if(wh)m.insertAdjacentHTML('beforeend',`<div class="mini-row"><span>⚖️</span><div><strong>${Number(wh.weight).toFixed(1)} kg</strong><small>Gewichtsmessung</small></div></div>`)};

const baseProfileV11=profilePage;
profilePage=function(c){baseProfileV11(c);const page=c.querySelector('.page');if(!page)return;const cloud=page.querySelector('#prehip-cloud-card');const section=document.createElement('div');section.innerHTML=`<div class="section-head"><h3>Meine OP & Modus</h3></div><div class="profile-section"><div class="profile-row" onclick="openMySurgery()"><div><span>OP-Details</span><strong>${esc(state.profile.clinic||'Klinik und Reha ergänzen')}</strong></div><b>›</b></div><div class="profile-row" onclick="openProgramMode()"><div><span>App-Modus</span><strong>${state.profile.programMode==='auto'?'Automatisch am OP-Datum':state.profile.programMode==='prehab'?'Prehab manuell':'Rehab manuell'}</strong></div><b>›</b></div><div class="profile-row" onclick="openPreopChecklist()"><div><span>Pre-OP-Checkliste</span><strong>${checklistSummary().done}/${PREOP_ITEMS.length} erledigt</strong></div><b>›</b></div></div>`;page.insertBefore(section,cloud||page.querySelector('.section-head:last-of-type')||page.lastChild)};
window.openProgramMode=function(){modal(`<h2>Prehab / Rehab</h2><p class="hint">„Automatisch“ wechselt am eingetragenen OP-Datum. Rehab startet zunächst nur als vorbereiteter Modus ohne pauschale postoperative Übungen.</p><div class="choice-list"><button class="choice ${state.profile.programMode==='auto'?'selected':''}" onclick="setProgramMode('auto')">Automatisch</button><button class="choice ${state.profile.programMode==='prehab'?'selected':''}" onclick="setProgramMode('prehab')">Prehab manuell</button><button class="choice ${state.profile.programMode==='rehab'?'selected':''}" onclick="setProgramMode('rehab')">Rehab manuell</button></div>`)};
window.setProgramMode=function(mode){state.profile.programMode=mode;save();closeModal();showPage('profile')};

save();
})();