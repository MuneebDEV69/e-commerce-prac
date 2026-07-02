import { createClient } from '@supabase/supabase-js'

const BUCKET = 'araish-media'
const MARKER = `/storage/v1/object/public/${BUCKET}/`

/**
 * Delete bucket files by their public URLs, acting as the admin who made the
 * request (their token is passed through) so the storage RLS "admins only"
 * delete policy is satisfied. Non-bucket URLs (local seed paths) are ignored.
 */
export async function deleteMediaByUrls(urls: string[], accessToken: string): Promise<void> {
  const paths = urls
    .map((u) => {
      const i = u.indexOf(MARKER)
      return i === -1 ? null : u.slice(i + MARKER.length)
    })
    .filter((p): p is string => !!p)

  if (paths.length === 0) return

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } }
  })
  await supabase.storage.from(BUCKET).remove(paths)
}
