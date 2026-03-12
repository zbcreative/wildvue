import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { count, error } = await supabase
      .from('credits')
      .update({ remaining: 3 })
      .eq('is_pro', false)
      .select('id', { count: 'exact', head: true })

    if (error) throw error

    console.log(`[reset-credits] Reset ${count ?? 0} free-tier users to 3 credits.`)

    return new Response(
      JSON.stringify({ ok: true, rows_updated: count ?? 0 }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('[reset-credits] Error:', err)

    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
})
