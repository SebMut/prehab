(()=>{
state.goalPlanWeeks=state.goalPlanWeeks&&typeof state.goalPlanWeeks==='object'?state.goalPlanWeeks:{};
state.profile.goalPlanEnabledAt=state.profile.goalPlanEnabledAt||dayKey(new Date());

const GOALS=['Aktiver Alltag','Radfahren','Schwimmen','Wandern','Fitness','Tennis','Skifahren'];
const baseGoalPlanFor=planFor;

const WALK_MOBILITY={id:'everyday-mobility',goal:'Aktiver Alltag',title:'Gehen + Mobility',short:'Alltag + Mobility',icon:'🚶',time:'35–45 min',items:[
 E('Spaziergang zügig','25–35 min','Ausdauer · sicherer Alltag','In einem angenehmen, gleichmäßigen Tempo gehen. Die Einheit soll kontrolliert bleiben.','zip:hip'),
 E('Hüftbeuger mobilisieren','2 × 30 s je Seite','Hüftbeuger','Nur in einen angenehmen Zug gehen und ruhig weiteratmen.','zip:hip'),
 E('Hintere Oberschenkel dehnen','2 × 30 s je Seite','Hamstrings','Rücken lang halten und aus der Hüfte leicht nach vorn neigen.','zip:hamstring'),
 E('Bird Dog','2 × 8 je Seite','Rumpf · Rücken · Gesäß','Diagonal strecken, ohne das Becken zu verdrehen.','bird')
]};
const FUNCTIONAL={id:'everyday-functional',goal:'Aktiver Alltag',title:'Alltagskraft & Stabilität',short:'Alltagskraft',icon:'🚶',time:'30–40 min',items:[
 E('Sit-to-Stand','3 × 8–12','Quadrizeps · Gesäß · Aufstehen','Von einem stabilen Stuhl kontrolliert aufstehen und langsam wieder absetzen.','zip:quad'),
 E('Niedrige Step-ups','3 × 8 je Seite','Quadrizeps · Gesäß · Treppenfunktion','Niedrige Stufe, Fuß ganz aufsetzen und stabil hochdrücken.','step'),
 E('Glute Bridge','3 × 10–15','Gesäß · Beckenstabilität','Becken kontrolliert anheben und oben kurz das Gesäß anspannen.','bridge'),
 E('Bird Dog','3 × 8 je Seite','Rumpf · Rücken · Gesäß','Ruhig diagonal strecken und das Becken stabil halten.','bird')
]};
const SWIM_A={id:'swim-a',goal:'Schwimmen',title:'Schwimmen + Hüftmobilität',short:'Schwimmen',icon:'🏊',time:'45–55 min',items:[
 E('Einschwimmen','8 min','Kreislauf · Bewegungsgefühl','Sehr locker beginnen und einen Schwimmstil wählen, der sich für deine Hüfte angenehm anfühlt.','zip:hip'),
 E('Schwimmen locker–moderat','25–35 min','Ausdauer · Ganzkörper','Gleichmäßig schwimmen. Technik und Tempo so wählen, dass die Bewegung angenehm und kontrolliert bleibt.','zip:hip'),
 E('Ausschwimmen','5–8 min','Regeneration','Tempo deutlich reduzieren und locker ausschwimmen.','zip:hip'),
 E('Hüftbeuger dehnen','2 × 30 s je Seite','Hüftbeuger','Nach dem Schwimmen sanft mobilisieren, ohne in Gelenkschmerz zu gehen.','zip:hip')
]};
const SWIM_B={id:'swim-b',goal:'Schwimmen',title:'Schwimmen · ruhige Intervalle',short:'Schwimm-Intervalle',icon:'🏊',time:'45–60 min',items:[
 E('Einschwimmen','10 min','Kreislauf · Ganzkörper','Locker einschwimmen.','zip:hip'),
 E('Ruhige Schwimm-Intervalle','6 × 3 min · 1 min locker','Ausdauer · Rhythmus','Drei Minuten gleichmäßig schwimmen, dazwischen jeweils eine Minute sehr locker.','zip:hip'),
 E('Ausschwimmen','8 min','Regeneration','Ruhig ausschwimmen und Atmung normalisieren.','zip:hip'),
 E('Gesäß mobilisieren','2 × 30 s je Seite','Gesäß · Außenrotatoren','Nur einen angenehmen Zug zulassen.','zip:glute')
]};
const HIKE_A={id:'hike-a',goal:'Wandern',title:'Gehen/Wandern + Beinkraft',short:'Wandern + Kraft',icon:'🥾',time:'55–75 min',items:[
 E('Gehen oder leichte Wanderung','40–55 min','Ausdauer · Gehfähigkeit','Möglichst gleichmäßig gehen und Steigung sowie Untergrund so wählen, dass die Hüfte angenehm bleibt.','zip:hip'),
 E('Niedrige Step-ups','3 × 8 je Seite','Quadrizeps · Gesäß · Treppenfunktion','Kontrolliert auf eine niedrige Stufe steigen.','step'),
 E('Glute Bridge','3 × 12','Gesäß · Beckenstabilität','Becken kontrolliert anheben und wieder absenken.','bridge'),
 E('Hintere Oberschenkel dehnen','2 × 30 s je Seite','Hamstrings','Sanft dehnen und ruhig atmen.','zip:hamstring')
]};
const HIKE_B={id:'hike-b',goal:'Wandern',title:'Wander-Vorbereitung & Stabilität',short:'Wander-Stabilität',icon:'🥾',time:'35–45 min',items:[
 E('Sit-to-Stand','3 × 10','Quadrizeps · Gesäß · Alltag','Kontrolliert aufstehen und wieder hinsetzen.','zip:quad'),
 E('Niedrige Step-ups','3 × 8 je Seite','Quadrizeps · Gesäß','Niedrige Stufe und kontrollierte Bewegung.','step'),
 E('Seitliche Schritte mit Band','3 × 8 je Richtung','Seitliches Gesäß · Hüftstabilität','Kleine kontrollierte Schritte, Knie und Füße nach vorn.','zip:glute'),
 E('Bird Dog','3 × 8 je Seite','Rumpf · Rücken · Gesäß','Becken stabil halten.','bird')
]};
const FITNESS_BAND_A={id:'fitness-a',goal:'Fitness',title:'Oberkörper & Rumpf',short:'Fitness · Oberkörper',icon:'💪',time:'35–45 min',items:[
 E('Rudern mit Band','3 × 12','Oberer Rücken · Schulterblätter','Ellenbogen nach hinten führen und Schulterblätter zusammenziehen.','rowband'),
 E('Brustdrücken mit Band','3 × 10–15','Brust · Trizeps','Band kontrolliert nach vorn drücken.','chestpress'),
 E('Trizepsdrücken mit Band','3 × 12–15','Trizeps · Stützfähigkeit','Oberarme ruhig halten und kontrolliert strecken.','triceps'),
 E('Pallof Press','3 × 10 je Seite','Rumpf · Anti-Rotation','Band nach vorn drücken und Verdrehung aktiv verhindern.','zip:chest'),
 E('Unterarmstütz','3 × 20–40 s','Rumpf · Schultergürtel','Körper als Linie halten und ruhig weiteratmen.','plank')
]};
const FITNESS_BAND_B={id:'fitness-b',goal:'Fitness',title:'Oberkörper & Core B',short:'Fitness · Core',icon:'💪',time:'35–45 min',items:[
 E('Rudern mit Band','3 × 12–15','Oberer Rücken · Schulterblätter','Ruhig ziehen und kontrolliert lösen.','rowband'),
 E('Brustdrücken mit Band','3 × 12','Brust · Trizeps','Kontrolliert nach vorn drücken.','chestpress'),
 E('Bird Dog','3 × 8 je Seite','Rumpf · Rücken · Gesäß','Diagonal strecken und das Becken stabil halten.','bird'),
 E('Dead Bug','3 × 8 je Seite','Rumpf · Beckenstabilität','Lendenwirbelsäule stabil halten und diagonal Arm und Bein absenken.','plank')
]};
const TENNIS_A={id:'tennis-prep-a',goal:'Tennis',title:'Tennis-Vorbereitung · Stabilität',short:'Tennis-Vorbereitung',icon:'🎾',time:'35–45 min',items:[
 E('Seitliche Schritte mit Band','3 × 8–12 je Richtung','Seitliches Gesäß · Hüftstabilität','Kleine kontrollierte Schritte. Kein Tennis-Pflichttraining – nur Vorbereitung.','zip:glute'),
 E('Niedrige Step-ups','3 × 8 je Seite','Quadrizeps · Gesäß','Kontrolliert hochdrücken.','step'),
 E('Pallof Press','3 × 10 je Seite','Rumpf · Anti-Rotation','Verdrehung aktiv verhindern.','zip:chest'),
 E('Bird Dog','3 × 8 je Seite','Rumpf · Rücken · Gesäß','Becken ruhig halten.','bird'),
 E('Hüftbeuger dehnen','2 × 30 s je Seite','Hüftbeuger','Sanfter Zug, kein Gelenkschmerz.','zip:hip')
]};
const TENNIS_B={id:'tennis-prep-b',goal:'Tennis',title:'Tennis-Vorbereitung · Rumpf & Beine',short:'Tennis · Rumpf',icon:'🎾',time:'35–40 min',items:[
 E('Sit-to-Stand','3 × 10','Quadrizeps · Gesäß','Kontrolliert aufstehen und hinsetzen.','zip:quad'),
 E('Hüftabduktion mit Band','3 × 10–15 je Seite','Seitliches Gesäß · Hüftstabilität','Becken bleibt ruhig.','zip:glute'),
 E('Dead Bug','3 × 8 je Seite','Rumpf · Beckenstabilität','Rumpf stabil halten.','plank'),
 E('Rudern mit Band','3 × 12','Oberer Rücken · Schulterblätter','Schulterblätter kontrolliert nach hinten führen.','rowband')
]};
const SKI_A={id:'ski-prep-a',goal:'Skifahren',title:'Ski-Vorbereitung · Beine & Rumpf',short:'Ski-Vorbereitung',icon:'⛷️',time:'35–45 min',items:[
 E('Sit-to-Stand','3 × 10–12','Quadrizeps · Gesäß','Kontrolliert aufstehen und wieder absetzen.','zip:quad'),
 E('Niedrige Step-ups','3 × 8 je Seite','Quadrizeps · Gesäß','Stabil hochdrücken.','step'),
 E('Seitliche Schritte mit Band','3 × 8–12 je Richtung','Seitliches Gesäß · Hüftstabilität','Kleine kontrollierte Schritte.','zip:glute'),
 E('Glute Bridge','3 × 12','Gesäß · Beckenstabilität','Becken kontrolliert anheben.','bridge'),
 E('Unterarmstütz','3 × 20–40 s','Rumpf · Schultergürtel','Körper als Linie halten.','plank')
]};
const SKI_B={id:'ski-prep-b',goal:'Skifahren',title:'Ski-Vorbereitung · Stabilität B',short:'Ski · Stabilität',icon:'⛷️',time:'35–45 min',items:[
 E('Hüftabduktion mit Band','3 × 10–15 je Seite','Seitliches Gesäß · Hüftstabilität','Becken stabil halten.','zip:glute'),
 E('Niedrige Step-ups','3 × 8 je Seite','Quadrizeps · Gesäß','Niedrige Stufe verwenden.','step'),
 E('Bird Dog','3 × 8 je Seite','Rumpf · Rücken · Gesäß','Diagonal strecken, Becken ruhig.','bird'),
 E('Pallof Press','3 × 10 je Seite','Rumpf · Anti-Rotation','Verdrehung verhindern.','zip:chest')
]};
const GENERAL_A={id:'general-a',goal:'Basis',title:'Hüfte, Rumpf & Mobility',short:'Basis + Mobility',icon:'🧘',time:'30–40 min',items:[
 E('Glute Bridge','3 × 12','Gesäß · Beckenstabilität','Kontrolliert anheben und absenken.','bridge'),
 E('Bird Dog','3 × 8 je Seite','Rumpf · Rücken · Gesäß','Becken stabil halten.','bird'),
 E('Hüftbeuger mobilisieren','2 × 30 s je Seite','Hüftbeuger','Nur angenehmer Zug.','zip:hip'),
 E('Hintere Oberschenkel dehnen','2 × 30 s je Seite','Hamstrings','Sanft dehnen.','zip:hamstring')
]};

const allPlans=[REST,PRESTART,START_DAY,HIP_A,HIP_B,BIKE_A,BIKE_B,ROW_A,ROW_B,WALK_MOBILITY,FUNCTIONAL,SWIM_A,SWIM_B,HIKE_A,HIKE_B,FITNESS_BAND_A,FITNESS_BAND_B,TENNIS_A,TENNIS_B,SKI_A,SKI_B,GENERAL_A];
const PLAN_BY_ID=Object.fromEntries(allPlans.map(p=>[p.id,p]));
function selectedGoals(){const g=Array.isArray(state.profile?.goals)?state.profile.goals.filter(x=>GOALS.includes(x)):[];return g.length?g:['Aktiver Alltag'];}
function signature(){return JSON.stringify({goals:selectedGoals().slice().sort(),days:(state.profile.trainingDays||[]).slice().sort(),equipment:(state.profile.equipment||[]).slice().sort()});}
function weekNumber(start){return Math.floor((startOfWeek(start)-startOfWeek(ROTATION_START))/604800000);}
function goalVariants(goal){const eq=state.profile.equipment||[];if(goal==='Aktiver Alltag')return[FUNCTIONAL,WALK_MOBILITY];if(goal==='Radfahren')return eq.includes('Fahrrad')?[BIKE_A,BIKE_B]:[FUNCTIONAL,WALK_MOBILITY];if(goal==='Schwimmen')return[SWIM_A,SWIM_B];if(goal==='Wandern')return[HIKE_A,HIKE_B];if(goal==='Fitness')return eq.includes('Rudergerät')?[ROW_A,ROW_B]:[FITNESS_BAND_A,FITNESS_BAND_B];if(goal==='Tennis')return[TENNIS_A,TENNIS_B];if(goal==='Skifahren')return[SKI_A,SKI_B];return[GENERAL_A];}
function preferredDays(weekNo){let days=[...new Set((state.profile.trainingDays||[]).map(Number).filter(x=>x>=0&&x<=6))];if(!days.length)days=[1,2,3,5,6,0];if(days.length===7){const restDay=4;days=days.filter(x=>x!==restDay);}return days.slice(0,6);}
function extrasForWeek(weekNo,needed){const goals=selectedGoals(),rot=((weekNo%goals.length)+goals.length)%goals.length,ordered=[...goals.slice(rot),...goals.slice(0,rot)],out=[];for(let round=0;round<2&&out.length<needed;round++){for(const g of ordered){const vars=goalVariants(g);if(vars[round])out.push(vars[round]);if(out.length>=needed)break;}}let fill=0;while(out.length<needed){out.push(fill++%2===0?GENERAL_A:WALK_MOBILITY);}return out.slice(0,needed);}
function desiredWeek(start){const weekNo=weekNumber(start),active=preferredDays(weekNo),activeDates=[];for(let i=0;i<7;i++){const d=addDays(start,i);if(active.includes(d.getDay()))activeDates.push(d);}const n=activeDates.length,plans=[];if(n===1){plans.push(HIP_A);}else if(n===2){plans.push(HIP_A,...extrasForWeek(weekNo,1));}else if(n===3){plans.push(HIP_A,...extrasForWeek(weekNo,1),HIP_B);}else if(n>=4){const extras=extrasForWeek(weekNo,n-2),secondCore=Math.floor(n/2);let e=0;for(let i=0;i<n;i++){if(i===0)plans.push(HIP_A);else if(i===secondCore)plans.push(HIP_B);else plans.push(extras[e++]);}}
 const days={};for(let i=0;i<7;i++){const d=addDays(start,i),idx=activeDates.findIndex(x=>dayKey(x)===dayKey(d));days[dayKey(d)]=idx>=0?(plans[idx]?.id||GENERAL_A.id):REST.id;}return{days,goals:selectedGoals(),signature:signature(),createdAt:new Date().toISOString()};}
function hasRecordedDay(key){return (state.completed||[]).some(x=>x.date===key)||(state.workoutSessions||[]).some(x=>x.date===key)||(state.trainings||[]).some(x=>x.date===key);}
let persistTimer=null;function persistLater(){clearTimeout(persistTimer);persistTimer=setTimeout(()=>{try{save()}catch(e){}},250);}
function ensureWeek(start){const wk=dayKey(start),desired=desiredWeek(start),today=dateFromKey(dayKey(new Date())),enabled=dateFromKey(state.profile.goalPlanEnabledAt),existing=state.goalPlanWeeks[wk];if(!existing){const days={...desired.days};for(let i=0;i<7;i++){const d=addDays(start,i),k=dayKey(d);if(d<enabled)days[k]=baseGoalPlanFor(d).id;}state.goalPlanWeeks[wk]={...desired,days};persistLater();return state.goalPlanWeeks[wk];}
 if(existing.signature!==desired.signature){for(let i=0;i<7;i++){const d=addDays(start,i),k=dayKey(d);if(d>=today&&!hasRecordedDay(k))existing.days[k]=desired.days[k];}existing.signature=desired.signature;existing.goals=desired.goals;existing.updatedAt=new Date().toISOString();persistLater();}return existing;}
planFor=function(date){const d=new Date(date.getFullYear(),date.getMonth(),date.getDate(),12);const base=baseGoalPlanFor(d);if(base.id==='prestart')return base;const week=ensureWeek(startOfWeek(d)),id=week.days[dayKey(d)];return PLAN_BY_ID[id]||base;};

function currentWeekGoalStats(){const s=startOfWeek(),rows=[];for(let i=0;i<7;i++){const d=addDays(s,i),p=planFor(d);if(p.rest)continue;rows.push({date:dayKey(d),goal:p.goal||(/bike/.test(p.id)?'Radfahren':/row|fitness/.test(p.id)?'Fitness':/swim/.test(p.id)?'Schwimmen':/hike/.test(p.id)?'Wandern':/tennis/.test(p.id)?'Tennis':/ski/.test(p.id)?'Skifahren':'Hüfte & Rumpf'),plan:p,done:completedFor(d).length===p.items.length});}return rows;}
window.prehipGoalPlan={selectedGoals,currentWeekGoalStats,signature};
})();