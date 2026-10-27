(()=>{
const HOME_DATE='2026-11-15';
const WEEKLY_START='2026-11-16';
const POST_OP_START='2026-10-15';

const clinic={id:'rehab-clinic',kind:'clinic',title:'Reha / Klinikphase',short:'Reha / Klinik',icon:'🏥',time:'Regeneration & Therapie',rest:true,items:[]};
const homeReturn={id:'rehab-home',kind:'home',title:'Daheim ankommen',short:'Daheim',icon:'🏠',time:'Erholung',rest:true,items:[]};
const therapy={id:'rehab-therapy',kind:'therapy',title:'Lymphdrainage + KG',short:'Lymph + KG',icon:'🩺',time:'2 Termine',rest:false,items:[
  {name:'Lymphdrainage',dose:'Termin',target:'Regeneration',desc:'Behandlungstermin – Dauer und Inhalt nach Praxis.',media:'zip:hip'},
  {name:'Krankengymnastik (KG)',dose:'Termin',target:'Beweglichkeit · Gangbild · Kraft',desc:'Übungen und Belastung nach deiner Therapeutin/deinem Therapeuten.',media:'zip:hip'}
]};
const gymA={id:'rehab-gym-a',kind:'gym',title:'Fitnessstudio',short:'Fitnessstudio',icon:'🏋️',time:'1 Einheit',rest:false,items:[
  {name:'Fitnessstudio',dose:'1 Einheit',target:'Freigegebenes Training',desc:'Nur Übungen und Belastungen, die von Physio/Arzt für dich freigegeben sind.',media:'zip:hip'}
]};
const gymB={...gymA,id:'rehab-gym-b'};
const recovery={id:'rehab-recovery',kind:'recovery',title:'Erholung / Alltag',short:'Erholung',icon:'🌿',time:'Keine Pflicht-Einheit',rest:true,items:[]};
const sundayRest={id:'rehab-rest',kind:'restday',title:'Kompletter Ruhetag',short:'Ruhetag',icon:'☁️',time:'Erholung',rest:true,items:[]};

const basePlanForHomeRehab=planFor;
planFor=function(date){
  const d=new Date(date.getFullYear(),date.getMonth(),date.getDate(),12);
  const k=dayKey(d);
  if(k<POST_OP_START)return basePlanForHomeRehab(d);
  if(k<HOME_DATE)return clinic;
  if(k===HOME_DATE)return homeReturn;
  if(k>=WEEKLY_START){
    if(d.getDay()===1)return therapy;
    if(d.getDay()===2)return gymA;
    if(d.getDay()===3)return recovery;
    if(d.getDay()===4)return therapy;
    if(d.getDay()===5)return gymB;
    if(d.getDay()===6)return recovery;
    return sundayRest;
  }
  return basePlanForHomeRehab(d);
};

function specialMessage(p){
  if(p.kind==='clinic')return 'Bis 14.11. bleibt preHIP im Klinik-/Reha-Modus. Deine Behandlung vor Ort hat Vorrang vor einem App-Trainingsplan.';
  if(p.kind==='home')return 'Ab heute bist du wieder daheim. Der feste Wochenrhythmus startet morgen, am 16.11.';
  if(p.kind==='recovery')return 'Keine Pflicht-Einheit. Erholung und dein von der KG vorgegebenes Heimprogramm haben Vorrang.';
  if(p.kind==='restday')return 'Heute bleibt komplett trainingsfrei.';
  return '';
}

window.completeRehabItem=function(key,index){
  const d=dateFromKey(key),p=planFor(d),e=p.items[index];
  if(!e)return;
  const checkKey=exerciseKey(d,index);
  state.checks[checkKey]=true;
  state.completed=state.completed.filter(x=>x.key!==checkKey);
  state.completed.push({key:checkKey,date:key,plan:p.title,exercise:e.name,dose:e.dose,target:e.target,completedAt:new Date().toISOString()});
  save();
  closeModal();
  openPlanDetail(key);
};
window.undoRehabItem=function(key,index){
  const d=dateFromKey(key),checkKey=exerciseKey(d,index);
  delete state.checks[checkKey];
  state.completed=state.completed.filter(x=>x.key!==checkKey);
  save();
  closeModal();
  openPlanDetail(key);
};

function specialRows(d,p){
  return p.items.map((e,i)=>{
    const done=!!state.checks[exerciseKey(d,i)];
    return '<div class="rehab-task '+(done?'done':'')+'"><div class="rehab-task-icon">'+(p.kind==='therapy'?(i===0?'💧':'🧑‍⚕️'):'🏋️')+'</div><div class="rehab-task-copy"><strong>'+esc(e.name)+'</strong><small>'+esc(e.target)+'</small><p>'+esc(e.desc)+'</p></div><button class="'+(done?'rehab-undo':'rehab-done')+'" onclick="'+(done?'undoRehabItem':'completeRehabItem')+'(\''+dayKey(d)+'\','+i+')">'+(done?'↩':'✓')+'</button></div>';
  }).join('');
}

const baseOpenPlanDetailHomeRehab=openPlanDetail;
openPlanDetail=function(key){
  const d=dateFromKey(key),p=planFor(d);
  if(!p.kind)return baseOpenPlanDetailHomeRehab(key);
  const done=completedFor(d).length;
  if(p.rest){
    modal('<div class="detail-head"><button class="sheet-close" onclick="closeModal()">×</button><span class="eyebrow">'+formatDate(d,{weekday:'long',day:'2-digit',month:'long'}).toUpperCase()+'</span><h2>'+p.icon+' '+esc(p.title)+'</h2><p>'+esc(p.time)+'</p></div><div class="rest-message large">'+esc(specialMessage(p))+'</div>',true);
    return;
  }
  const safety=p.kind==='gym'?'<div class="rehab-safety">Fitnessstudio erst im Rahmen deiner individuellen Freigabe nutzen. Belastung und Übungen richten sich nach KG/ärztlicher Empfehlung.</div>':'';
  modal('<div class="detail-head"><button class="sheet-close" onclick="closeModal()">×</button><span class="eyebrow">'+formatDate(d,{weekday:'long',day:'2-digit',month:'long'}).toUpperCase()+'</span><h2>'+p.icon+' '+esc(p.title)+'</h2><p>'+done+'/'+p.items.length+' erledigt</p></div>'+safety+'<div class="rehab-task-list">'+specialRows(d,p)+'</div>',true);
};

const baseDayCardHomeRehab=dayCard;
dayCard=function(d){
  const p=planFor(d);
  if(!p.kind)return baseDayCardHomeRehab(d);
  const done=completedFor(d).length,isToday=dayKey(d)===dayKey(new Date());
  return '<details class="plan-day '+(isToday?'today':'')+'" '+(isToday?'open':'')+'><summary><div class="day-badge"><span>'+d.toLocaleDateString('de-DE',{weekday:'short'}).slice(0,2)+'</span><b>'+d.getDate()+'</b></div><div class="plan-summary"><strong>'+esc(p.short||p.title)+'</strong><small>'+esc(p.time)+(p.rest?'':' · '+done+'/'+p.items.length+' erledigt')+'</small></div><span class="summary-chevron">⌄</span></summary><div class="plan-body">'+(p.rest?'<div class="rest-message">'+esc(specialMessage(p))+'</div>':'<div class="rehab-mini">'+specialRows(d,p)+'</div><button class="secondary full" onclick="openPlanDetail(\''+dayKey(d)+'\')">Details öffnen</button>')+'</div></details>';
};

const baseHomeHomeRehab=home;
home=function(c){
  baseHomeHomeRehab(c);
  const d=new Date(),p=planFor(d);
  if(!p.kind)return;
  const card=c.querySelector('.today-card');
  if(!card)return;
  const done=completedFor(d).length,left=p.items.length-done;
  card.classList.toggle('rest',!!p.rest);
  card.innerHTML='<div class="today-card-head"><div class="activity-icon">'+p.icon+'</div><div><span class="card-kicker">DEIN TAG HEUTE</span><h2>'+esc(p.title)+'</h2><p>'+esc(p.time)+(p.rest?'':' · '+left+' offen')+'</p></div></div>'+(p.rest?'<div class="rest-message">'+esc(specialMessage(p))+'</div>':'<button class="primary big" onclick="openPlanDetail(\''+dayKey(d)+'\')">'+(left===0?'Details ansehen':'Öffnen')+'</button>');
};

const baseCalendarHomeRehab=calendarPage;
calendarPage=function(c){
  baseCalendarHomeRehab(c);
  const cal=c.querySelector('.calendar-card');
  if(!cal||c.querySelector('.rehab-week-card'))return;
  const info=document.createElement('section');
  info.className='info-card rehab-week-card';
  info.innerHTML='<strong>Dein Wochenrhythmus ab 16.11.</strong><p><b>Mo & Do:</b> Lymphdrainage + KG<br><b>Di & Fr:</b> Fitnessstudio<br><b>So:</b> kompletter Ruhetag</p>';
  cal.insertAdjacentElement('beforebegin',info);
};

const baseProfileHomeRehab=profilePage;
profilePage=function(c){
  baseProfileHomeRehab(c);
  const page=c.querySelector('.page');
  if(!page||c.querySelector('.rehab-profile-card'))return;
  const section=document.createElement('div');
  section.className='rehab-profile-card';
  section.innerHTML='<div class="section-head"><h3>Daheim & Therapie</h3></div><div class="profile-section"><div class="profile-row"><div><span>Daheim ab</span><strong>15.11.2026</strong></div></div><div class="profile-row"><div><span>Lymphdrainage + KG</span><strong>Montag & Donnerstag · ab 16.11.</strong></div></div><div class="profile-row"><div><span>Fitnessstudio</span><strong>Dienstag & Freitag · 2× pro Woche</strong></div></div></div>';
  const cloud=page.querySelector('#prehip-cloud-card');
  page.insertBefore(section,cloud||page.lastChild);
};

const style=document.createElement('style');
style.textContent='.rehab-task-list,.rehab-mini{display:grid;gap:8px}.rehab-task{display:grid;grid-template-columns:38px minmax(0,1fr) 36px;gap:10px;align-items:center;padding:11px;border:1px solid var(--line,#e8e8e5);border-radius:14px;background:#fff}.rehab-task.done{opacity:.65}.rehab-task-icon{width:38px;height:38px;display:grid;place-items:center;border-radius:11px;background:#f3f5f4}.rehab-task-copy strong{display:block;font-size:14px}.rehab-task-copy small{display:block;color:#2E7475;font-size:11px;font-weight:700;margin-top:2px}.rehab-task-copy p{font-size:11px;line-height:1.35;color:#727b7d;margin:5px 0 0}.rehab-done,.rehab-undo{width:34px;height:34px;border-radius:10px;border:0;font-weight:800}.rehab-done{background:#e7f2ef;color:#2E7475}.rehab-undo{background:#f2f2ef;color:#6c7375}.rehab-safety{background:#fff7ed;border:1px solid #fed7aa;color:#8a4b10;border-radius:14px;padding:11px 12px;font-size:11px;line-height:1.4;margin-bottom:12px}.rehab-week-card{margin-bottom:12px}';
document.head.appendChild(style);

if(!state.profile.homeFrom)state.profile.homeFrom=HOME_DATE;
state.profile.rehabWeeklySchedule={therapyDays:[1,4],gymDays:[2,5],restDay:0,start:WEEKLY_START};
save();
})();