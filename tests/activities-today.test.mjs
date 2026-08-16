import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../v1-activities.js',import.meta.url),'utf8');

function buildContext(extraActivities){
  const quick={innerHTML:'',classList:{add(){}}};
  const container={querySelector(selector){return selector==='.quick-grid'?quick:null}};
  const ctx={
    console,
    state:{profile:{extraActivities,onboardingDone:false}},
    activities:[],
    home:()=>{},
    profilePage:()=>{},
    esc:value=>String(value),
    save:()=>{},
    modal:()=>{},
    closeModal:()=>{},
    showPage:()=>{},
    view:{page:'home'},
    setTimeout:()=>0,
    document:{querySelectorAll:()=>[],getElementById:()=>null}
  };
  ctx.window=ctx;
  return {ctx,container,quick};
}

test('Today renders every selected additional activity, not only the first eight',()=>{
  const selected=['Spaziergang','Radfahren','Rudergerät','Schwimmen','Krafttraining','Mobilität','Wandern','Nordic Walking','Walking','Yoga','Pilates'];
  const {ctx,container,quick}=buildContext(selected);
  vm.createContext(ctx);
  vm.runInContext(source,ctx);
  ctx.home(container);
  const rendered=[...quick.innerHTML.matchAll(/openTraining\('([^']+)'\)/g)].map(m=>m[1]);
  assert.equal(rendered.length,selected.length);
  assert.deepEqual(new Set(rendered),new Set(selected));
  assert.match(quick.innerHTML,/activity-more/);
});
