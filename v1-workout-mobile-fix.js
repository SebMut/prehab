(()=>{
function syncWorkoutChrome(){
  const active=document.body.classList.contains('workout-open');
  const nav=document.querySelector('.tabbar');
  const top=document.querySelector('.topbar');
  if(active){
    if(nav){nav.dataset.prehipDisplay=nav.style.display||'';nav.style.setProperty('display','none','important')}
    if(top){top.dataset.prehipDisplay=top.style.display||'';top.style.setProperty('display','none','important')}
  }else{
    if(nav){nav.style.removeProperty('display');delete nav.dataset.prehipDisplay}
    if(top){top.style.removeProperty('display');delete top.dataset.prehipDisplay}
  }
}
const obs=new MutationObserver(syncWorkoutChrome);
obs.observe(document.body,{attributes:true,attributeFilter:['class']});
window.addEventListener('pageshow',syncWorkoutChrome);
window.addEventListener('resize',()=>{if(document.body.classList.contains('workout-open'))syncWorkoutChrome()});
setTimeout(syncWorkoutChrome,0);
})();