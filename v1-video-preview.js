(()=>{
const VIDEO_LIBRARY={
  'Glute Bridge':{id:'wPM8icPu6H8',label:'Glute Bridge'},
  'Bird Dog':{id:'wiFNA3sqjCA',label:'Bird Dog'},
  'Dead Bug':{id:'bxn9FBrt4-A',label:'Dead Bug'},
  'Pallof Press':{id:'axgv7H_VQOo',label:'Pallof Press'},
  'Rudergerät locker–moderat':{id:'qIUio2uC2lw',label:'Concept2 · Rudertechnik'},
  'Einrudern':{id:'qIUio2uC2lw',label:'Concept2 · Rudertechnik'},
  'Ausrudern':{id:'qIUio2uC2lw',label:'Concept2 · Rudertechnik'},
  'Hüftbeuger dehnen':{id:'34SlL-PPCWQ',label:'Kneeling Hip Flexor Stretch'},
  'Niedrige Step-ups':{id:'WCFCdxzFBa4',label:'Bodyweight Step-Up'},
  'Unterarmstütz':{id:'pSHjTRCQxIw',label:'Unterarmstütz / Plank'},
  'Rudern mit Band':{id:'lHuGxZZ09nY',label:'Resistance Band Rows'},
  'Brustdrücken mit Band':{id:'Ap1uGI5oEms',label:'Band Chest Press'},
  'Stehende Hüftextension mit Band':{id:'mj8FITvNzFc',label:'Standing Band Kickback'},
  'Hintere Oberschenkel dehnen':{id:'Jku6PwFGBGk',label:'Standing Hamstring Stretch'}
};
const SEARCH_QUERIES={
  'Hüftbeuger mobilisieren':'Hüftbeuger mobilisieren Physiotherapie richtige Ausführung',
  'Gesäß mobilisieren':'Gesäß Dehnung Figure 4 Stretch Physiotherapie richtige Ausführung',
  'Trizepsdrücken mit Band':'Trizepsdrücken Widerstandsband richtige Ausführung',
  'Sit-to-Stand':'Sit to Stand chair Physiotherapie richtige Ausführung',
  'Seitliche Schritte mit Band':'Lateral Band Walk seitliche Schritte mit Band richtige Ausführung',
  'Hüftabduktion mit Band':'Standing Hip Abduction Resistance Band Physiotherapie',
  'Einrollen':'Ergometer Fahrrad richtige Einstellung Technik Physiotherapie',
  'Radfahren locker–moderat':'Ergometer Fahrrad richtige Einstellung Technik Physiotherapie',
  'Ausrollen':'Ergometer Fahrrad richtige Einstellung Technik Physiotherapie'
};
function searchUrl(name){const q=SEARCH_QUERIES[name]||`${name} Übung richtige Ausführung Physiotherapie`;return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`}
function watchUrl(id){return `https://www.youtube.com/watch?v=${id}`}
function closeVideoPopup(){document.getElementById('exercise-video-pop')?.remove()}
window.closePrehipVideoPopup=closeVideoPopup;
openExerciseVideo=function(name){
  closeVideoPopup();
  const n=String(name||'').trim(),video=VIDEO_LIBRARY[n],pop=document.createElement('div');pop.id='exercise-video-pop';pop.className='video-pop prehip-video-pop';
  if(video){pop.innerHTML=`<div class="video-sheet prehip-video-sheet"><div class="video-head"><div><span>ÜBUNGSVIDEO</span><strong>${esc(n)}</strong><small>${esc(video.label)}</small></div><button onclick="closePrehipVideoPopup()" aria-label="Video schließen">×</button></div><div class="video-frame"><iframe src="https://www.youtube-nocookie.com/embed/${video.id}?rel=0&playsinline=1&autoplay=1" title="${esc(n)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div><a class="youtube-external" href="${watchUrl(video.id)}" target="_blank" rel="noopener">Auf YouTube öffnen ↗</a></div>`}
  else{const url=searchUrl(n);pop.innerHTML=`<div class="video-sheet prehip-video-sheet"><div class="video-head"><div><span>ÜBUNGSVIDEO</span><strong>${esc(n)}</strong></div><button onclick="closePrehipVideoPopup()" aria-label="Video schließen">×</button></div><div class="video-unverified"><div>▶</div><h3>Noch kein eindeutig geprüftes Video</h3><p>Für diese Übung zeigen wir bewusst kein möglicherweise falsches Video. Du kannst eine gezielte YouTube-Suche öffnen.</p><a href="${url}" target="_blank" rel="noopener">Passende Videos suchen ↗</a></div></div>`}
  document.body.appendChild(pop);pop.addEventListener('click',e=>{if(e.target===pop)closeVideoPopup()});
};
window.openExerciseVideo=openExerciseVideo;
window.prehipVideoLibrary=VIDEO_LIBRARY;
})();