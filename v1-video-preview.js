(()=>{
const VERIFIED_VIDEO_URLS={
  'Glute Bridge':'https://www.youtube.com/watch?v=Z3cY3d3BBo4',
  'Bird Dog':'https://www.youtube.com/shorts/XOnwlBZ7eKs',
  'Dead Bug':'https://www.youtube.com/watch?v=bxn9FBrt4-A',
  'Pallof Press':'https://www.youtube.com/watch?v=axgv7H_VQOo',
  'Rudergerät locker–moderat':'https://www.youtube.com/watch?v=4zWu1yuJ0_g',
  'Einrudern':'https://www.youtube.com/watch?v=4zWu1yuJ0_g',
  'Ausrudern':'https://www.youtube.com/watch?v=4zWu1yuJ0_g'
};
const SEARCH_QUERIES={
  'Hüftbeuger dehnen':'Hüftbeuger dehnen Physiotherapie richtige Ausführung',
  'Hüftbeuger mobilisieren':'Hüftbeuger mobilisieren Physiotherapie richtige Ausführung',
  'Hintere Oberschenkel dehnen':'Hamstring hintere Oberschenkel dehnen Physiotherapie richtige Ausführung',
  'Gesäß mobilisieren':'Gesäß mobilisieren Hüfte Physiotherapie',
  'Brustdrücken mit Band':'Brustdrücken Widerstandsband richtige Ausführung',
  'Rudern mit Band':'Rudern Widerstandsband richtige Ausführung',
  'Trizepsdrücken mit Band':'Trizepsdrücken Widerstandsband richtige Ausführung',
  'Sit-to-Stand':'Sit to Stand Physiotherapie Übung richtige Ausführung',
  'Niedrige Step-ups':'Step Up Physiotherapie niedrige Stufe richtige Ausführung',
  'Seitliche Schritte mit Band':'Lateral Band Walk seitliche Schritte mit Band richtige Ausführung',
  'Hüftabduktion mit Band':'Hüftabduktion mit Band Physiotherapie richtige Ausführung',
  'Stehende Hüftextension mit Band':'Stehende Hüftextension mit Band Physiotherapie',
  'Unterarmstütz':'Unterarmstütz Plank richtige Ausführung Physiotherapie',
  'Einrollen':'Ergometer Fahrrad richtige Einstellung und Technik',
  'Radfahren locker–moderat':'Ergometer Fahrrad richtige Einstellung und Technik',
  'Ausrollen':'Ergometer Fahrrad richtige Einstellung und Technik'
};
function youtubeUrlFor(name){
  const n=String(name||'').trim();
  if(VERIFIED_VIDEO_URLS[n])return VERIFIED_VIDEO_URLS[n];
  const q=SEARCH_QUERIES[n]||`${n} Übung richtige Ausführung Physiotherapie`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
}
openExerciseVideo=function(name){
  document.getElementById('exercise-video-pop')?.remove();
  const url=youtubeUrlFor(name);
  const w=window.open(url,'_blank','noopener,noreferrer');
  if(!w)window.location.href=url;
};
window.openExerciseVideo=openExerciseVideo;
window.prehipYoutubeUrlFor=youtubeUrlFor;
})();