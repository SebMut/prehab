import { withSupabase } from 'npm:@supabase/server'

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

    const { error: deleteError } = await ctx.supabaseAdmin.auth.admin.deleteUser(userId, false)
    if (deleteError) {
      console.error('delete-account failed', deleteError)
      return Response.json({ ok: false, message: 'Konto konnte nicht gelöscht werden.' }, { status: 500 })
    }

    return Response.json({ ok: true })
  }),
}
