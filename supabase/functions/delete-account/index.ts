import { withSupabase } from 'npm:@supabase/server'

const HEALTH_BUCKET = 'prehip-health-imports'

async function removeHealthFolder(admin: any, folder: string) {
  while (true) {
    const { data, error } = await admin.storage.from(HEALTH_BUCKET).list(folder, { limit: 100, offset: 0 })
    if (error) {
      const message = String(error.message || '').toLowerCase()
      if (message.includes('bucket') && message.includes('not found')) return
      throw error
    }
    const paths = (data || []).filter((x: any) => x?.name && x.id).map((x: any) => `${folder}/${x.name}`)
    if (!paths.length) return
    const { error: removeError } = await admin.storage.from(HEALTH_BUCKET).remove(paths)
    if (removeError) throw removeError
    if (paths.length < 100) return
  }
}

async function clearHealthImports(admin: any, userId: string) {
  const { error: keyError } = await admin.storage.from(HEALTH_BUCKET).remove([`keys/${userId}.json`])
  if (keyError) {
    const message = String(keyError.message || '').toLowerCase()
    if (!(message.includes('not found') || (message.includes('bucket') && message.includes('not found')))) throw keyError
  }
  await removeHealthFolder(admin, `daily/${userId}`)
  await removeHealthFolder(admin, `workouts/${userId}`)
}

export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    if (req.method !== 'POST') {
      return Response.json({ ok: false, message: 'Method not allowed' }, { status: 405 })
    }

    const body = await req.json().catch(() => ({}))
    const password = typeof body.password === 'string' ? body.password : ''
    const email = ctx.userClaims?.email
    const userId = ctx.userClaims?.sub || ctx.userClaims?.id

    if (!password) return Response.json({ ok: false, message: 'Passwort fehlt.' }, { status: 400 })
    if (!email || !userId) return Response.json({ ok: false, message: 'Sitzung ist nicht gültig.' }, { status: 401 })

    const { data: verified, error: verifyError } = await ctx.supabase.auth.signInWithPassword({ email, password })
    if (verifyError || verified.user?.id !== userId) {
      return Response.json({ ok: false, message: 'Das Passwort ist nicht korrekt.' }, { status: 401 })
    }

    // Health-Importdaten zuerst löschen. Wenn das fehlschlägt, bleibt das Konto bestehen,
    // damit keine verwaisten Gesundheitsdaten ohne Besitzer zurückbleiben.
    try {
      await clearHealthImports(ctx.supabaseAdmin, userId)
    } catch (healthError) {
      console.error('health import cleanup before account delete failed', healthError)
      return Response.json({ ok: false, message: 'Apple-Health-Daten konnten nicht vollständig gelöscht werden. Konto wurde nicht gelöscht.' }, { status: 500 })
    }

    // Refresh-Tokens/Sitzungen auf allen Geräten widerrufen, bevor der Auth-User entfernt wird.
    // Bereits ausgestellte Access-Token-JWTs können technisch bis zu ihrem Ablauf gültig bleiben.
    const { error: signOutError } = await ctx.supabase.auth.signOut({ scope: 'global' })
    if (signOutError) console.error('global sign-out before delete failed', signOutError)

    const { error: deleteError } = await ctx.supabaseAdmin.auth.admin.deleteUser(userId, false)
    if (deleteError) {
      console.error('delete-account failed', deleteError)
      return Response.json({ ok: false, message: 'Konto konnte nicht gelöscht werden.' }, { status: 500 })
    }

    return Response.json({ ok: true })
  }),
}
