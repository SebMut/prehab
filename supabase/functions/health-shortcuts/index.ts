import { withSupabase } from 'npm:@supabase/server'
import { normalizeImportPayload, workoutStorageName } from './logic.mjs'

const BUCKET = 'prehip-health-imports'
const KEY_PREFIX = 'ph1'
const encoder = new TextEncoder()
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-prehip-import-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Cache-Control': 'no-store'
}

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: corsHeaders })

function base64Url(bytes: Uint8Array) {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

async function sha256(value: string) {
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(value))
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('')
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

function parseImportKey(value: string) {
  const parts = value.trim().split('.')
  if (parts.length !== 3 || parts[0] !== KEY_PREFIX) return null
  const userId = parts[1]
  const secret = parts[2]
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuid.test(userId) || !/^[A-Za-z0-9_-]{32,80}$/.test(secret)) return null
  return { userId, secret }
}

async function ensureBucket(admin: any) {
  const { data } = await admin.storage.getBucket(BUCKET)
  if (data) return
  const { error } = await admin.storage.createBucket(BUCKET, {
    public: false,
    fileSizeLimit: 262144,
    allowedMimeTypes: ['application/json']
  })
  if (error && !String(error.message || '').toLowerCase().includes('already')) throw error
}

async function putJson(admin: any, path: string, value: unknown) {
  const blob = new Blob([JSON.stringify(value)], { type: 'application/json' })
  const { error } = await admin.storage.from(BUCKET).upload(path, blob, {
    contentType: 'application/json',
    cacheControl: '0',
    upsert: true
  })
  if (error) throw error
}

async function getJson(admin: any, path: string) {
  const { data, error } = await admin.storage.from(BUCKET).download(path)
  if (error || !data) {
    const status = Number(error?.statusCode || error?.status || 0)
    const message = String(error?.message || '').toLowerCase()
    if (status === 404 || message.includes('not found') || message.includes('does not exist')) return null
    if (error) throw error
    return null
  }
  return JSON.parse(await data.text())
}

async function listJson(admin: any, folder: string, limit = 20) {
  const { data, error } = await admin.storage.from(BUCKET).list(folder, {
    limit,
    sortBy: { column: 'name', order: 'desc' }
  })
  if (error) throw error
  const names = (data || []).filter((x: any) => x?.name?.endsWith('.json')).map((x: any) => x.name)
  const rows = await Promise.all(names.map((name: string) => getJson(admin, `${folder}/${name}`).catch(() => null)))
  return rows.filter(Boolean)
}

async function deleteFolder(admin: any, folder: string) {
  // Always list from offset 0 after a delete; otherwise a shrinking folder could skip files.
  while (true) {
    const { data, error } = await admin.storage.from(BUCKET).list(folder, { limit: 100, offset: 0 })
    if (error) throw error
    const names = (data || []).filter((x: any) => x?.name && x.id).map((x: any) => `${folder}/${x.name}`)
    if (!names.length) break
    const { error: removeError } = await admin.storage.from(BUCKET).remove(names)
    if (removeError) throw removeError
    if (names.length < 100) break
  }
}

async function authenticatedUser(req: Request, admin: any) {
  const header = req.headers.get('authorization') || ''
  const match = header.match(/^Bearer\s+(.+)$/i)
  if (!match) return null
  const { data, error } = await admin.auth.getUser(match[1])
  if (error || !data?.user) return null
  return data.user
}

async function readBody(req: Request) {
  const text = await req.text()
  if (text.length > 100_000) throw new Error('Anfrage ist zu groß.')
  if (!text) return {}
  return JSON.parse(text)
}

async function keyRecord(admin: any, userId: string) {
  return await getJson(admin, `keys/${userId}.json`)
}

async function createKey(admin: any, userId: string) {
  const secretBytes = new Uint8Array(32)
  crypto.getRandomValues(secretBytes)
  const secret = base64Url(secretBytes)
  const rawKey = `${KEY_PREFIX}.${userId}.${secret}`
  const now = new Date().toISOString()
  await putJson(admin, `keys/${userId}.json`, {
    version: 1,
    hash: await sha256(secret),
    createdAt: now,
    lastUsedAt: null
  })
  return { key: rawKey, createdAt: now }
}

async function revokeKey(admin: any, userId: string) {
  const { error } = await admin.storage.from(BUCKET).remove([`keys/${userId}.json`])
  if (error && !String(error.message || '').toLowerCase().includes('not found')) throw error
}

async function clearUser(admin: any, userId: string) {
  await revokeKey(admin, userId)
  await deleteFolder(admin, `daily/${userId}`)
  await deleteFolder(admin, `workouts/${userId}`)
}

async function getStatus(admin: any, userId: string) {
  const key = await keyRecord(admin, userId)
  const daily = await listJson(admin, `daily/${userId}`, 1)
  const workouts = await listJson(admin, `workouts/${userId}`, 30)
  const newestDaily = daily[0] || null
  const latestWorkout = workouts[0] || null
  const dates = [newestDaily?.importedAt, latestWorkout?.importedAt, key?.lastUsedAt]
    .filter(Boolean)
    .map((x: string) => new Date(x).getTime())
    .filter(Number.isFinite)
  return {
    configured: !!key?.hash,
    keyCreatedAt: key?.createdAt || null,
    keyLastUsedAt: key?.lastUsedAt || null,
    lastImportAt: dates.length ? new Date(Math.max(...dates)).toISOString() : null,
    latestDaily: newestDaily,
    workouts,
    latestWorkout
  }
}

async function authorizeImport(req: Request, admin: any) {
  const raw = req.headers.get('x-prehip-import-key') || ''
  const parsed = parseImportKey(raw)
  if (!parsed) return null
  const record = await keyRecord(admin, parsed.userId)
  if (!record?.hash) return null
  const supplied = await sha256(parsed.secret)
  if (!safeEqual(supplied, String(record.hash))) return null
  return { ...parsed, record }
}

async function importHealth(req: Request, body: any, admin: any) {
  const auth = await authorizeImport(req, admin)
  if (!auth) return json({ ok: false, message: 'Import-Schlüssel ist ungültig oder wurde widerrufen.' }, 401)

  let normalized
  try {
    normalized = normalizeImportPayload(body)
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Ungültige Health-Daten.' }, 400)
  }

  const importedAt = new Date().toISOString()
  if (normalized.daily) {
    await putJson(admin, `daily/${auth.userId}/${normalized.daily.date}.json`, {
      ...normalized.daily,
      importedAt
    })
  }
  for (const workout of normalized.workouts) {
    await putJson(admin, `workouts/${auth.userId}/${workoutStorageName(workout)}`, {
      ...workout,
      importedAt
    })
  }
  await putJson(admin, `keys/${auth.userId}.json`, {
    ...auth.record,
    lastUsedAt: importedAt
  })

  return json({
    ok: true,
    imported: {
      daily: normalized.daily ? 1 : 0,
      workouts: normalized.workouts.length
    },
    importedAt
  })
}

export default {
  fetch: withSupabase({ auth: 'none' }, async (req, ctx) => {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders })
    if (req.method !== 'POST') return json({ ok: false, message: 'Method not allowed' }, 405)

    try {
      await ensureBucket(ctx.supabaseAdmin)
      const body = await readBody(req)
      const action = typeof body.action === 'string' ? body.action : 'import'

      if (action === 'import') return await importHealth(req, body, ctx.supabaseAdmin)

      const user = await authenticatedUser(req, ctx.supabaseAdmin)
      if (!user) return json({ ok: false, message: 'Bitte melde dich erneut an.' }, 401)

      if (action === 'createKey') {
        const created = await createKey(ctx.supabaseAdmin, user.id)
        return json({ ok: true, ...created })
      }
      if (action === 'revokeKey') {
        await revokeKey(ctx.supabaseAdmin, user.id)
        return json({ ok: true })
      }
      if (action === 'clear') {
        await clearUser(ctx.supabaseAdmin, user.id)
        return json({ ok: true })
      }
      if (action === 'status') {
        return json({ ok: true, ...(await getStatus(ctx.supabaseAdmin, user.id)) })
      }

      return json({ ok: false, message: 'Unbekannte Aktion.' }, 400)
    } catch (error) {
      console.error('health-shortcuts failed', error)
      return json({ ok: false, message: 'Apple-Health-Dienst ist momentan nicht verfügbar.' }, 500)
    }
  })
}
