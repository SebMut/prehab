(()=>{
const DEMO_VERSION='20260814-2';
const SESSION_KEY='prehip-supabase-session-v1';
const baseDemoPlanFor=planFor;

function sessionEmail(){try{return String(JSON.parse(localStorage.getItem(SESSION_KEY)||'null')?.user?.email||'').toLowerCase()}catch(e){return''}}
function isTestLike(){const email=sessionEmail(),name=String(state.profile?.name||'').toLowerCase();return /(^|[._+-])(test|demo)([._+-]|@|$)/.test(email)||email.startsWith('test@')||email.startsWith('demo@')||name==='test'||name==='demo'||name.includes('testnutzer')}
function inDemoRange(date){if(!state.profile?.demoMonthActive||!state.profile?.demoMonthStart||!state.profile?.demoMonthEnd)return false;const d=dateFromKey(dayKey(date)),a=dateFromKey(state.profile.demoMonthStart),b=dateFromKey(state.profile.demoMonthEnd);return d>=a&&d<=b}
function mappedPlan(date){return baseDemoPlanFor(addDays(date,35))}
planFor=function(date){if(inDemoRange(date)&&(!window.programModeFor||window.programModeFor(date)==='prehab'))return mappedPlan(date);return baseDemoPlanFor(date)};

function atTime(date,h=18,m=15){const d=new Date(date);d.setHours(h,m,0,0);return d.toISOString()}
function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
function clearDemoDomain(){state.trainings=[];state.checks={};state.completed=[];state.workoutSessions=[];state.feelings={};state.hipCheckins={};state.weightHistory=[];state.appointments=[]}
function markExercise(date,p,i){const key=`${dayKey(date)}-${p.id}-${i}`;state.checks[key]=true;state.completed.push({key,date:dayKey(date),plan:p.title,exercise:p.items[i].name,dose:p.items[i].dose,target:p.items[i].target,completedAt:atTime(date,18,10+i*6)})}
function seedMonth({silent=false,forceDemoIdentity=false}={}){
  const today=dateFromKey(dayKey(new Date())),start=addDays(today,-29);
  clearDemoDomain();
  state.profile={...(state.profile||{}),demoMonthActive:true,demoMonthStart:dayKey(start),demoMonthEnd:dayKey(today),demoSeedVersion:DEMO_VERSION,onboardingDone:true,nameStepDone:true,programMode:'prehab',goals:(state.profile?.goals?.length?state.profile.goals:['Aktiver Alltag','Radfahren','Schwimmen','Fitness']),equipment:(state.profile?.equipment?.length?state.profile.equipment:['Theraband','Fahrrad','Rudergerät']),quickActivities:['Spaziergang','Radfahren','Schwimmen','Rudergerät','Wandern','Mobilität']};
  if(forceDemoIdentity){state.profile.name='Demo';state.profile.loginSkipped=true;}else if(!state.profile.name)state.profile.name='Testnutzer';
  state.target=82;

  const weightPoints=[88.2,88.0,87.8,87.6,87.4,87.1,86.9,86.7,86.5,86.3,86.1,85.9];
  weightPoints.forEach((w,i)=>{const d=addDays(start,Math.round(i*29/(weightPoints.length-1)));state.weightHistory.push({date:dayKey(d),weight:w,at:atTime(d,7,10)});});
  state.weight=weightPoints[weightPoints.length-1];

  for(let n=0;n<30;n++){
    const d=addDays(start,n),age=29-n,p=planFor(d);
    if(n%2!==1||n>24){
      const pain=clamp(Math.round(5.3-(n/29)*2.1+((n%7===0)?1:0)),2,7);
      const stiffness=clamp(Math.round(6-(n/29)*2.4+((n%9===0)?1:0)),2,8);
      const energy=clamp(3+(n>14?1:0)-((n%11===0)?1:0),1,5);
      const sleep=clamp(3+(n>9?1:0)-((n%8===0)?1:0),1,5);
      state.hipCheckins[dayKey(d)]={pain,stiffness,energy,sleep,limp:pain>=6&&n%3===0,at:atTime(d,7,25)};
      state.feelings[dayKey(d)]={mood:pain<=3?'gut':pain<=5?'mittel':'schlecht',at:atTime(d,7,26)};
    }
    if(!p.rest&&Array.isArray(p.items)&&p.items.length){
      let count=p.items.length;
      if(age===0)count=Math.min(2,p.items.length);
      else if(n%11===0)count=0;
      else if(n%7===0)count=Math.max(1,Math.floor(p.items.length/2));
      else if(n%13===0)count=Math.max(1,p.items.length-1);
      for(let i=0;i<count;i++)markExercise(d,p,i);
      if(count===p.items.length){state.workoutSessions.push({date:dayKey(d),planId:p.id,plan:p.title,minutes:planMinutes(p),startedAt:atTime(d,17,30),completedAt:atTime(d,18,20),feeling:n%6===0?'anstrengend':n%4===0?'leicht':'passend'});}
    }
    if(n%3===0)state.trainings.push({date:dayKey(d),type:'Spaziergang',icon:'🚶',duration:25+(n%4)*5,intensity:3+(n%2),at:atTime(d,12,20)});
    if(n%10===4)state.trainings.push({date:dayKey(d),type:'Schwimmen',icon:'🏊',duration:35,intensity:4,at:atTime(d,19,5)});
    if(n%12===6)state.trainings.push({date:dayKey(d),type:'Wandern',icon:'🥾',duration:70,intensity:4,at:atTime(d,10,15)});
  }

  state.preopChecklist={'clinic-docs':true,'med-list':true,'transport':true,'home-help':true,'home-safe':true,'aids':false,'rehab':true,'work':false,'bag':false};
  state.appointments=[{title:'Voruntersuchung Klinik',date:dayKey(addDays(today,14))},{title:'Reha-Start geplant',date:'2026-11-02'}];
  save();
  if(typeof window.prehipCloudSyncNow==='function'&&window.prehipCloudIsLoggedIn?.())setTimeout(()=>window.prehipCloudSyncNow(),900);
  if(!silent){closeModal();showPage('home');toast('Demo-Monat wurde geladen');}
}
window.prehipSeedDemoMonth=(options={})=>seedMonth(options);
window.loadPrehipDemoMonth=function(){if(!confirm('Demo-Monat laden? Trainings-, Gewichts- und Befindensdaten dieses Accounts werden durch Testdaten ersetzt.'))return;seedMonth()};

const baseDemoProfile=profilePage;
profilePage=function(c){baseDemoProfile(c);const page=c.querySelector('.page');if(!page||page.querySelector('.demo-data-wrap'))return;const label=state.profile?.demoSeedVersion===DEMO_VERSION?'Demo-Monat neu laden':'Demo-Monat laden';page.insertAdjacentHTML('beforeend',`<div class="demo-data-wrap"><div class="section-head"><h3>Testdaten</h3></div><div class="profile-section"><button class="danger-row" style="color:#26343a" onclick="loadPrehipDemoMonth()"><div><span>${label}</span><small>30 Tage mit Gewicht, Hüft-Check-ins, Aktivitäten sowie erledigten, teilweisen und offenen Übungen.</small></div><b>›</b></button></div></div>`)};

let autoTries=0;const auto=setInterval(()=>{autoTries++;if(state.profile?.demoSeedVersion===DEMO_VERSION){clearInterval(auto);return}if(isTestLike()&&window.prehipCloudIsLoggedIn?.()){clearInterval(auto);setTimeout(()=>{if(state.profile?.demoSeedVersion!==DEMO_VERSION)seedMonth({silent:true})},1800);return}if(autoTries>20)clearInterval(auto)},700);
})();