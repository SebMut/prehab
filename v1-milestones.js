(()=>{
const CHECKLIST_IDS=['clinic-docs','med-list','transport','home-help','home-safe','aids','rehab','work','bag'];
const pct=(v,max)=>Math.max(0,Math.min(100,Math.round((Number(v)||0)/(Number(max)||1)*100)));
const unique=(arr)=>[...new Set(arr)];
function fullSessions(){return unique((state.workoutSessions||[]).filter(x=>x?.date).map(x=>`${x.date}|${x.planId||x.plan||''}`));}
function sessionCount(){return fullSessions().length;}
function totalMinutes(){return Math.round((state.workoutSessions||[]).reduce((a,x)=>a+Number(x.minutes||0),0)+(state.trainings||[]).reduce((a,x)=>a+Number(x.duration||0),0));}
function countByPlan(fragment){return unique((state.workoutSessions||[]).filter(x=>String(x.planId||'').includes(fragment)).map(x=>`${x.date}|${x.planId}`)).length;}
function checklistCount(){return CHECKLIST_IDS.filter(id=>!!state.preopChecklist?.[id]).length;}
function daysToOpMilestone(){return Math.max(0,signedDaysToOp());}
function checkins(){return Object.entries(state.hipCheckins||{}).sort((a,b)=>a[0].localeCompare(b[0]));}
function hasSevenDayDocumentation(){const rows=checkins();for(let i=0;i<rows.length;i++){const start=dateFromKey(rows[i][0]);let n=0;for(let j=i;j<rows.length;j++){const d=dateFromKey(rows[j][0]);if((d-start)/86400000<=6)n++;else break;}if(n>=5)return true;}return false;}
function trendLower(field){const rows=checkins();if(rows.length<14)return false;const last=rows.slice(-7),prev=rows.slice(-14,-7);const avg=a=>a.reduce((s,[,v])=>s+Number(v?.[field]||0),0)/a.length;return avg(last)<avg(prev)-0.35;}
function weightStats(){const rows=[...(state.weightHistory||[])].filter(x=>Number.isFinite(Number(x.weight))).sort((a,b)=>String(a.date).localeCompare(String(b.date)));const start=rows.length?Number(rows[0].weight):Number(state.weight||0),current=Number(state.weight||start),target=Number(state.target||current),goal=Math.abs(start-target),moved=target<=start?start-current:current-start,progress=goal>0?Math.max(0,Math.min(100,Math.round(moved/goal*100))):100;return{rows,start,current,target,goal,moved,progress};}
function activeDatesInWeek(start){const end=addDays(start,6),keys=new Set();(state.workoutSessions||[]).forEach(x=>{const d=dateFromKey(x.date);if(d>=start&&d<=end)keys.add(x.date)});(state.trainings||[]).forEach(x=>{const d=dateFromKey(x.date);if(d>=start&&d<=end)keys.add(x.date)});return keys.size;}
function weeklyFulfilments(){const today=dateFromKey(dayKey(new Date())),weeks=[];for(let back=0;back<8;back++){const start=addDays(startOfWeek(today),-7*back),end=addDays(start,6);if(end>today&&back>0)continue;let due=0,done=0;for(let i=0;i<7;i++){const d=addDays(start,i);if(d>today)break;const p=planFor(d);if(p.rest)continue;due++;if(completedFor(d).length===p.items.length)done++;}if(due)weeks.push({start,due,done,pct:Math.round(done/due*100),active:activeDatesInWeek(start)});}return weeks;}
function fourRegularWeeks(){const w=weeklyFulfilments().filter(x=>x.start<startOfWeek(new Date())).slice(0,4);return w.length===4&&w.every(x=>x.active>=3);}
function milestoneData(){const sessions=sessionCount(),mins=totalMinutes(),checks=checkins(),checkN=checklistCount(),weight=weightStats(),weeks=weeklyFulfilments(),bestWeek=weeks.reduce((m,x)=>Math.max(m,x.pct),0),fullWeek=weeks.some(x=>x.pct===100),bike=countByPlan('bike'),row=countByPlan('row'),hip=countByPlan('hip'),days=daysToOpMilestone();const firstMeasured=weight.rows.length>0;
 const chapters=[
  {id:'start',icon:'🌱',title:'Losgelegt',subtitle:'Die ersten Schritte auf deinem preHIP-Weg',items:[
   {label:'Erstes Training geschafft',done:sessions>=1,progress:pct(sessions,1),detail:`${Math.min(sessions,1)}/1 Training`},
   {label:'Erster Hüft-Check-in',done:checks.length>=1,progress:pct(checks.length,1),detail:`${Math.min(checks.length,1)}/1 Check-in`},
   {label:'Erste Gewichtsmessung',done:firstMeasured,progress:firstMeasured?100:0,detail:firstMeasured?`${weight.start.toFixed(1)} kg Startwert`:'Noch keine Messung'}
  ]},
  {id:'rhythm',icon:'🔁',title:'Im Rhythmus',subtitle:'Regelmäßigkeit statt Fitness-Streak',items:[
   {label:'10 Trainingseinheiten',done:sessions>=10,progress:pct(sessions,10),detail:`${Math.min(sessions,10)}/10 Einheiten`},
   {label:'100 Trainingsminuten',done:mins>=100,progress:pct(mins,100),detail:`${Math.min(mins,100)}/100 Minuten`},
   {label:'7 Hüft-Check-ins',done:checks.length>=7,progress:pct(checks.length,7),detail:`${Math.min(checks.length,7)}/7 Check-ins`},
   {label:'Eine Woche dokumentiert',done:hasSevenDayDocumentation(),progress:hasSevenDayDocumentation()?100:pct(Math.min(checks.length,5),5),detail:'Befinden regelmäßig festhalten'},
   {label:'80 % Planerfüllung in einer Woche',done:bestWeek>=80,progress:Math.min(bestWeek,100),detail:`Bisher beste Woche: ${bestWeek}%`}
  ]},
  {id:'prepared',icon:'💪',title:'Gut vorbereitet',subtitle:'Training, Hüfte, Gewicht und Organisation greifen zusammen',items:[
   {label:'20 Trainingseinheiten',done:sessions>=20,progress:pct(sessions,20),detail:`${Math.min(sessions,20)}/20 Einheiten`},
   {label:'4 Wochen regelmäßig aktiv',done:fourRegularWeeks(),progress:fourRegularWeeks()?100:pct(weeks.filter(x=>x.active>=3).slice(0,4).length,4),detail:`${Math.min(weeks.filter(x=>x.active>=3).length,4)}/4 Wochen`},
   {label:'10 Radeinheiten',done:bike>=10,progress:pct(bike,10),detail:`${Math.min(bike,10)}/10 Rad`},
   {label:'10 Ruder-Einheiten',done:row>=10,progress:pct(row,10),detail:`${Math.min(row,10)}/10 Rudern`},
   {label:'10 Hüft-/Rumpfeinheiten',done:hip>=10,progress:pct(hip,10),detail:`${Math.min(hip,10)}/10 Kraft`},
   {label:'Erstes −1 kg',done:weight.moved>=1,progress:pct(weight.moved,1),detail:`${Math.max(0,weight.moved).toFixed(1)} kg vom Start`},
   {label:'Halbzeit zum Zielgewicht',done:weight.progress>=50,progress:Math.min(weight.progress*2,100),detail:`${weight.progress}% des Gewichtswegs`},
   {label:'Pre-OP-Checkliste 75 %',done:checkN>=7,progress:pct(checkN,7),detail:`${checkN}/${CHECKLIST_IDS.length} Punkte erledigt`},
   {label:'Persönlicher Schmerztrend niedriger',done:trendLower('pain'),progress:trendLower('pain')?100:checks.length>=14?55:pct(checks.length,14),detail:'Vergleich der letzten 7 mit den 7 Check-ins davor',optional:true}
  ]},
  {id:'opready',icon:'🏥',title:'OP bereit',subtitle:'Die letzten organisatorischen Schritte vor dem OP-Tag',items:[
   {label:'Pre-OP-Checkliste vollständig',done:checkN===CHECKLIST_IDS.length,progress:pct(checkN,CHECKLIST_IDS.length),detail:`${checkN}/${CHECKLIST_IDS.length} Punkte`},
   {label:'Heimfahrt organisiert',done:!!state.preopChecklist?.transport,progress:state.preopChecklist?.transport?100:0,detail:'Pre-OP-Checkliste'},
   {label:'Reha / Nachsorge geklärt',done:!!state.preopChecklist?.rehab,progress:state.preopChecklist?.rehab?100:0,detail:'Pre-OP-Checkliste'},
   {label:'Wohnung vorbereitet',done:!!state.preopChecklist?.['home-safe'],progress:state.preopChecklist?.['home-safe']?100:0,detail:'Pre-OP-Checkliste'},
   {label:'Noch 14 Tage bis zur OP',done:days<=14,progress:days<=14?100:Math.max(0,Math.round((60-days)/46*100)),detail:days?`Noch ${days} Tage`:'OP-Tag erreicht',time:true},
   {label:'Letzte Woche vor der OP',done:days<=7,progress:days<=7?100:Math.max(0,Math.round((30-days)/23*100)),detail:days?`Noch ${days} Tage`:'OP-Tag erreicht',time:true},
   {label:'Zielgewicht erreicht',done:weight.progress>=100,progress:weight.progress,detail:`${weight.current.toFixed(1)} kg · Ziel ${weight.target.toFixed(1)} kg`}
  ]}
 ];
 chapters.forEach(ch=>{ch.done=ch.items.filter(x=>!x.optional).every(x=>x.done);ch.completed=ch.items.filter(x=>x.done).length;ch.total=ch.items.length;});
 return{chapters,sessions,mins,checks:checks.length,weight,checkN,fullWeek,bestWeek,days};
}
window.prehipMilestoneData=milestoneData;
function nextMilestone(){const d=milestoneData(),all=d.chapters.flatMap((ch,ci)=>ch.items.map((m,mi)=>({...m,chapter:ch.title,chapterIcon:ch.icon,ci,mi})));const actionable=all.filter(x=>!x.done&&!x.optional&&!x.time);const timed=all.filter(x=>!x.done&&!x.optional&&x.time);return actionable.sort((a,b)=>a.ci-b.ci||b.progress-a.progress||a.mi-b.mi)[0]||timed.sort((a,b)=>b.progress-a.progress)[0]||null;}
window.prehipNextMilestone=nextMilestone;
function nextMilestoneHTML(){const m=nextMilestone();if(!m)return `<section class="next-milestone complete"><div class="milestone-symbol">🏆</div><div><span class="card-kicker">DEINE REISE</span><h3>Alle aktuellen Meilensteine erreicht</h3><p>Dein nächstes Kapitel startet mit der nächsten preHIP-Phase.</p></div></section>`;return `<section class="next-milestone" onclick="showPage('progress')"><div class="milestone-symbol">${m.chapterIcon}</div><div class="next-copy"><span class="card-kicker">NÄCHSTER MEILENSTEIN · ${esc(m.chapter.toUpperCase())}</span><h3>${esc(m.label)}</h3><p>${esc(m.detail)}</p><div class="mini-milestone-progress"><i style="width:${m.progress}%"></i></div></div><b>›</b></section>`;}
function chaptersHTML(){const d=milestoneData();return `<div class="milestone-journey">${d.chapters.map((ch,i)=>`<section class="milestone-chapter ${ch.done?'complete':''}"><div class="chapter-head"><div class="chapter-icon">${ch.done?'✓':ch.icon}</div><div><span>Kapitel ${i+1}</span><h3>${esc(ch.title)}</h3><p>${esc(ch.subtitle)}</p></div><strong>${ch.completed}/${ch.total}</strong></div><div class="chapter-line"><i style="width:${Math.round(ch.items.reduce((s,x)=>s+x.progress,0)/ch.items.length)}%"></i></div><div class="chapter-items">${ch.items.map(m=>`<div class="journey-milestone ${m.done?'done':''} ${m.optional?'optional':''}"><div class="jm-state">${m.done?'✓':'○'}</div><div><strong>${esc(m.label)}</strong><small>${esc(m.detail)}${m.optional?' · optionaler Verlauf':''}</small></div>${!m.done?`<span>${m.progress}%</span>`:''}</div>`).join('')}</div></section>`).join('')}</div>`;}
const baseMilestoneHome=home;
home=function(c){baseMilestoneHome(c);const page=c.querySelector('.dashboard-v11');if(!page||page.querySelector('.next-milestone'))return;const score=page.querySelector('.score-breakdown');if(score)score.insertAdjacentHTML('afterend',nextMilestoneHTML());else page.insertAdjacentHTML('afterbegin',nextMilestoneHTML());};
const baseMilestoneProgress=progressPage;
progressPage=function(c){baseMilestoneProgress(c);const old=c.querySelector('.milestones');if(!old)return;const head=old.previousElementSibling;if(head?.classList.contains('section-head')){const h=head.querySelector('h3');if(h)h.textContent='Deine Meilenstein-Reise';}old.outerHTML=chaptersHTML();};
})();