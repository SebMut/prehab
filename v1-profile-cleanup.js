(()=>{
function removeLegacyProfileBuild(root=document){
  root?.querySelector?.('.dev-box span')?.remove();
}

if(typeof profilePage==='function'){
  const baseProfilePage=profilePage;
  profilePage=function(c){
    baseProfilePage(c);
    removeLegacyProfileBuild(c);
  };
}

function removeGeneratedCancelFromDangerDialog(){
  const m=document.getElementById('modal');
  if(!m?.querySelector('.danger-modal'))return;
  m.querySelector('.sheet > .cancel')?.remove();
}

function wrapDangerDialog(name){
  const original=window[name];
  if(typeof original!=='function'||original.__prehipSingleCancel)return;
  const wrapped=function(...args){
    const result=original.apply(this,args);
    removeGeneratedCancelFromDangerDialog();
    return result;
  };
  wrapped.__prehipSingleCancel=true;
  window[name]=wrapped;
}

wrapDangerDialog('openResetAllSettings');
wrapDangerDialog('openDeleteAccount');
removeLegacyProfileBuild();
})();