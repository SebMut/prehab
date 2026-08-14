import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeImportPayload, stableWorkoutId, workoutStorageName } from '../supabase/functions/health-shortcuts/logic.mjs';

const NOW=new Date('2026-08-14T21:30:00.000Z');

test('normalizes valid daily health data',()=>{
  const out=normalizeImportPayload({weightKg:87.44,steps:8431,recordedAt:'2026-08-14T20:30:00Z',source:'Apple Health Shortcut'},NOW);
  assert.equal(out.daily.weightKg,87.4);
  assert.equal(out.daily.steps,8431);
  assert.equal(out.daily.date,'2026-08-14');
  assert.equal(out.workouts.length,0);
});

test('rejects implausible weight',()=>{
  assert.throws(()=>normalizeImportPayload({weightKg:8,recordedAt:'2026-08-14T20:30:00Z'},NOW),/Gewicht/);
  assert.throws(()=>normalizeImportPayload({weightKg:800,recordedAt:'2026-08-14T20:30:00Z'},NOW),/Gewicht/);
});

test('rejects implausible steps',()=>{
  assert.throws(()=>normalizeImportPayload({steps:-1,recordedAt:'2026-08-14T20:30:00Z'},NOW),/Schrittzahl/);
  assert.throws(()=>normalizeImportPayload({steps:200001,recordedAt:'2026-08-14T20:30:00Z'},NOW),/Schrittzahl/);
});

test('normalizes and deduplicates workouts',()=>{
  const workout={id:'abc-123',activityType:'Cycling',start:'2026-08-14T18:00:00Z',end:'2026-08-14T18:47:00Z',durationMinutes:47,distanceKm:18.723,activeEnergyKcal:412.44,source:'Apple Watch'};
  const out=normalizeImportPayload({workouts:[workout,workout]},NOW);
  assert.equal(out.workouts.length,1);
  assert.equal(out.workouts[0].activityType,'cycling');
  assert.equal(out.workouts[0].distanceKm,18.72);
  assert.equal(out.workouts[0].activeEnergyKcal,412.4);
});

test('derives stable workout id when id is missing',()=>{
  const workout={activityType:'rowing',start:'2026-08-14T18:00:00Z',end:'2026-08-14T18:30:00Z',durationMinutes:30,source:'Apple Watch'};
  assert.equal(stableWorkoutId(workout),stableWorkoutId({...workout}));
  assert.match(stableWorkoutId(workout),/^auto-/);
});

test('rejects backwards and excessively long workout windows',()=>{
  assert.throws(()=>normalizeImportPayload({workout:{activityType:'cycling',start:'2026-08-14T19:00:00Z',end:'2026-08-14T18:00:00Z',durationMinutes:60}},NOW),/Keine gültigen/);
  assert.throws(()=>normalizeImportPayload({workout:{activityType:'cycling',start:'2026-08-12T18:00:00Z',end:'2026-08-14T18:01:00Z',durationMinutes:2881}},NOW),/Keine gültigen/);
});

test('caps a single request to 50 workouts',()=>{
  const workouts=Array.from({length:80},(_,i)=>({id:`w-${i}`,activityType:'walking',start:`2026-08-14T${String(Math.floor(i/6)+8).padStart(2,'0')}:${String((i%6)*10).padStart(2,'0')}:00Z`,durationMinutes:5,source:'Apple Watch'}));
  const out=normalizeImportPayload({workouts},NOW);
  assert.ok(out.workouts.length<=50);
});

test('storage filename does not expose unsafe characters',()=>{
  const name=workoutStorageName({id:'../../bad id?<x>',start:'2026-08-14T18:00:00Z'});
  assert.doesNotMatch(name,/\.\.|\/|\?|<|>/);
  assert.match(name,/\.json$/);
});

test('rejects empty payload',()=>{
  assert.throws(()=>normalizeImportPayload({},NOW),/Keine gültigen/);
});
