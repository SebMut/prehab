export const MAX_WORKOUTS_PER_IMPORT = 50;

const cleanText = (value, max = 80) => String(value ?? '').trim().replace(/[\u0000-\u001f\u007f]/g, '').slice(0, max);
const finite = value => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};
const round = (n, digits = 1) => {
  const p = 10 ** digits;
  return Math.round(n * p) / p;
};

export function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function dateKey(value) {
  const d = value instanceof Date ? value : parseDate(value);
  if (!d) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function stringHash(input) {
  let h1 = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h1 ^= input.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193);
  }
  return (h1 >>> 0).toString(36);
}

export function stableWorkoutId(workout) {
  const explicit = cleanText(workout?.id, 100).replace(/[^a-zA-Z0-9._-]/g, '_');
  if (explicit) return explicit;
  const raw = [workout?.activityType, workout?.start, workout?.end, workout?.durationMinutes, workout?.source].map(x => cleanText(x, 120)).join('|');
  return `auto-${stringHash(raw)}`;
}

function normalizeWorkout(raw, now) {
  if (!raw || typeof raw !== 'object') return null;
  const start = parseDate(raw.start);
  const end = parseDate(raw.end);
  if (!start) return null;
  const nowMs = now.getTime();
  if (start.getTime() > nowMs + 24 * 3600_000 || start.getTime() < nowMs - 366 * 24 * 3600_000) return null;
  if (end && end < start) return null;
  if (end && end.getTime() - start.getTime() > 24 * 3600_000) return null;

  let duration = finite(raw.durationMinutes);
  if (duration == null && end) duration = (end.getTime() - start.getTime()) / 60_000;
  if (duration == null || duration < 0.5 || duration > 1440) return null;

  const distance = finite(raw.distanceKm);
  const energy = finite(raw.activeEnergyKcal);
  if (distance != null && (distance < 0 || distance > 500)) return null;
  if (energy != null && (energy < 0 || energy > 10_000)) return null;

  const activityType = cleanText(raw.activityType || raw.type || 'workout', 60).toLowerCase().replace(/\s+/g, '-');
  if (!activityType || !/^[a-z0-9äöüß._-]+$/i.test(activityType)) return null;

  const normalized = {
    id: stableWorkoutId(raw),
    activityType,
    label: cleanText(raw.label || raw.name || '', 80),
    start: start.toISOString(),
    end: (end || new Date(start.getTime() + duration * 60_000)).toISOString(),
    durationMinutes: round(duration, 1),
    source: cleanText(raw.source || 'Apple Health', 80) || 'Apple Health'
  };
  if (distance != null) normalized.distanceKm = round(distance, 2);
  if (energy != null) normalized.activeEnergyKcal = round(energy, 1);
  return normalized;
}

export function normalizeImportPayload(input, now = new Date()) {
  if (!input || typeof input !== 'object') throw new Error('Ungültige Importdaten.');
  const data = input.data && typeof input.data === 'object' ? input.data : input;
  const recorded = parseDate(data.recordedAt) || now;
  if (recorded.getTime() > now.getTime() + 24 * 3600_000 || recorded.getTime() < now.getTime() - 366 * 24 * 3600_000) {
    throw new Error('Zeitstempel liegt außerhalb des erlaubten Bereichs.');
  }

  const weight = finite(data.weightKg);
  const steps = finite(data.steps);
  if (weight != null && (weight < 30 || weight > 300)) throw new Error('Gewicht liegt außerhalb des erlaubten Bereichs.');
  if (steps != null && (steps < 0 || steps > 200_000)) throw new Error('Schrittzahl liegt außerhalb des erlaubten Bereichs.');

  const daily = weight != null || steps != null ? {
    date: dateKey(recorded),
    recordedAt: recorded.toISOString(),
    source: cleanText(data.source || 'Apple Health', 80) || 'Apple Health'
  } : null;
  if (daily && weight != null) daily.weightKg = round(weight, 1);
  if (daily && steps != null) daily.steps = Math.round(steps);

  const rawWorkouts = Array.isArray(data.workouts) ? data.workouts.slice(0, MAX_WORKOUTS_PER_IMPORT) : (data.workout ? [data.workout] : []);
  const seen = new Set();
  const workouts = [];
  for (const raw of rawWorkouts) {
    const workout = normalizeWorkout(raw, now);
    if (!workout || seen.has(workout.id)) continue;
    seen.add(workout.id);
    workouts.push(workout);
  }

  if (!daily && workouts.length === 0) throw new Error('Keine gültigen Health-Daten im Import.');
  return { daily, workouts };
}

export function sanitizeStorageId(value) {
  return cleanText(value, 110).replace(/[^a-zA-Z0-9._-]/g, '_') || 'workout';
}

export function workoutStorageName(workout) {
  const prefix = String(workout.start || '').replace(/[^0-9]/g, '').slice(0, 14) || '00000000000000';
  return `${prefix}_${sanitizeStorageId(workout.id)}.json`;
}
