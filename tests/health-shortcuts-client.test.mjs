import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function localStorageMock(initial={}){
  const map=new Map(Object.entries(initial));
  return {
    getItem:key=>map.has(key)?map.get(key):null,
    setItem:(key,value)=>map.set(key,String(value)),
    removeItem:key=>map.delete(key),
    key:index=>[...map.keys()][index]??null,
    get length(){return map.size},
    dump:()=>Object.fromEntries(map)
  };
}
function dateKey(value){const d=new Date(value);return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`}
function buildContext(){
  const userId='123e4567-e89b-42d3-a456-426614174000';
  const session=JSON.stringify({access_token:'fake.jwt.token',user:{id:userId}});
  const localStorage=localStorageMock({'prehip-supabase-session-v1':session});
  const state={weight:88,weightHistory:[{date:'2026-08-14',weight:88,at:'2026-08-14T08:00:00.000Z',source:'manual'}],healthKit:{enabled:true},healthShortcut:{workouts:[{id:'legacy'}]}};
  let saves=0;
  const ctx={
    console,URL,Date,JSON,Math,Number,String,Array,Object,Map,Promise,encodeURIComponent,decodeURIComponent,
    atob:value=>Buffer.from(value,'base64').toString('binary'),
    setTimeout:()=>0,clearTimeout:()=>{},
    localStorage,state,dayKey:dateKey,save:()=>{saves++},
    profilePage:()=>{},view:{page:'home'},showPage:()=>{},toast:()=>{},modal:()=>{},closeModal:()=>{},openPrehipCloud:()=>{},esc:v=>String(v),confirm:()=>true,
    navigator:{},document:{createElement:()=>({style:{},select(){},remove(){}}),body:{appendChild(){}},execCommand:()=>true},
    history:{replaceState(){}},location:{href:'https://sebmut.github.io/prehab/',origin:'https://sebmut.github.io',pathname:'/prehab/',search:'',hash:''},
    fetch:async()=>{throw new Error('network not expected')}
  };
  ctx.window=ctx;
  ctx.window.PREHIP_SUPABASE_CONFIG={url:'https://example.supabase.co',publishableKey:'public'};
  Object.defineProperty(ctx,'saveCount',{get:()=>saves});
  return {ctx,userId,localStorage,state};
}

const source=fs.readFileSync(new URL('../v1-health-shortcuts.js',import.meta.url),'utf8');

test('old Apple Health weight never overwrites a newer manual weight',()=>{
  const {ctx,state}=buildContext();vm.createContext(ctx);vm.runInContext(source,ctx);
  ctx.window.prehipHealthShortcuts.applyStatus({configured:true,latestDaily:{date:'2026-08-14',weightKg:87.2,weightRecordedAt:'2026-08-14T07:00:00.000Z',recordedAt:'2026-08-14T21:00:00.000Z'}});
  assert.equal(state.weight,88);
  assert.ok(state.weightHistory.some(x=>x.source==='appleHealthShortcut'&&x.weight===87.2));
});

test('newer Apple Health weight becomes current weight',()=>{
  const {ctx,state}=buildContext();vm.createContext(ctx);vm.runInContext(source,ctx);
  ctx.window.prehipHealthShortcuts.applyStatus({configured:true,latestDaily:{date:'2026-08-14',weightKg:86.8,weightRecordedAt:'2026-08-14T09:00:00.000Z',recordedAt:'2026-08-14T21:00:00.000Z'}});
  assert.equal(state.weight,86.8);
});

test('raw Health status stays out of normal app state and uses per-user local cache',()=>{
  const {ctx,state,userId,localStorage}=buildContext();vm.createContext(ctx);vm.runInContext(source,ctx);
  const status={configured:true,latestDaily:{date:'2026-08-14',steps:9000},workouts:[{id:'w1',activityType:'walking'}]};
  ctx.window.prehipHealthShortcuts.applyStatus(status);
  assert.equal('healthShortcut' in state,false);
  assert.equal('healthKit' in state,false);
  const cache=JSON.parse(localStorage.getItem(`prehip-health-shortcut-cache-v1:${userId}`));
  assert.equal(cache.latestDaily.steps,9000);
  assert.equal(cache.workouts[0].id,'w1');
});
