import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../v1-activities.js',import.meta.url),'utf8');

function buildContext(extraActivities,goals=[]){
  const quick={innerHTML:'',classList:{add(){}}};
  const container={querySelector(selector){return selector==='.quick-grid'?quick:null}};
  const ctx={
    console,
    state:{profile:{extraActivities,goals,onboardingDone:false}},
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

function renderedActivities(quick){
  return [...quick.innerHTML.matchAll(/openTraining\('([^']+)'\)/g)].map(m=>m[1]);
}

test('Today renders every selected additional activity, not only the first eight',()=>{
  const selected=['Spaziergang','Radfahren','Rudergerät','Schwimmen','Krafttraining','Mobilität','Wandern','Nordic Walking','Walking','Yoga','Pilates'];
  const {ctx,container,quick}=buildContext(selected);
  vm.createContext(ctx);
  vm.runInContext(source,ctx);
  ctx.home(container);
  const rendered=renderedActivities(quick);
  assert.equal(rendered.length,selected.length);
  assert.deepEqual(new Set(rendered),new Set(selected));
  assert.match(quick.innerHTML,/activity-more/);
});

test('Today also renders all sports selected as onboarding goals',()=>{
  const extra=['Spaziergang','Rudergerät','Aqua-Fitness'];
  const goals=['Aktiver Alltag','Radfahren','Schwimmen','Wandern','Fitness','Tennis','Skifahren'];
  const {ctx,container,quick}=buildContext(extra,goals);
  vm.createContext(ctx);
  vm.runInContext(source,ctx);
  ctx.home(container);
  const rendered=renderedActivities(quick);
  const expected=[...new Set([...extra,...goals])];
  assert.equal(rendered.length,expected.length);
  assert.deepEqual(new Set(rendered),new Set(expected));
  for(const goal of goals)assert.ok(rendered.includes(goal),`${goal} fehlt auf Heute`);
});

test('Today does not duplicate an activity selected both as goal and extra activity',()=>{
  const {ctx,container,quick}=buildContext(['Radfahren','Tennis'],['Radfahren','Tennis','Skifahren']);
  vm.createContext(ctx);
  vm.runInContext(source,ctx);
  ctx.home(container);
  const rendered=renderedActivities(quick);
  assert.deepEqual(new Set(rendered),new Set(['Radfahren','Tennis','Skifahren']));
  assert.equal(rendered.length,3);
});
