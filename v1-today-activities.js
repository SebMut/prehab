(()=>{
const GOAL_ACTIVITIES=new Set(['Aktiver Alltag','Radfahren','Schwimmen','Wandern','Fitness','Tennis','Skifahren']);

function selectedNames(){
  const extra=Array.isArray(state.profile?.extraActivities)?state.profile.extraActivities:[];
  const goals=(Array.isArray(state.profile?.goals)?state.profile.goals:[]).filter(name=>GOAL_ACTIVITIES.has(name));
  return [...new Set([...extra,...goals].filter(Boolean))];
}

function selectedActivities(){
  const catalog=(Array.isArray(activities)?activities:[]).map(row=>Array.isArray(row)?{icon:row[0]||'＋',name:row[1],category:row[2]||'Sport'}:row).filter(row=>row?.name);
  return selectedNames().map(name=>catalog.find(row=>row.name===name)||{icon:'＋',name,category:'Sport'});
}

window.prehipTodayActivities=selectedActivities;

const baseTodayActivitiesHome=home;
home=function(c){
  baseTodayActivitiesHome(c);
  const quick=c.querySelector('.activity-quick')||c.querySelector('.quick-grid');
  if(!quick)return;
  const list=selectedActivities();
  quick.classList.add('activity-grid');
  quick.innerHTML=list.length
    ?list.map(a=>`<button onclick="openTraining('${esc(a.name)}')">${a.icon||'＋'}<span>${esc(a.name)}</span></button>`).join('')
    :`<button class="activity-more" onclick="showPage('profile');setTimeout(()=>openActivityManager(),80)">＋<span>Aktivität auswählen</span></button>`;
};
})();
