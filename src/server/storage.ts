import { createClient } from '@/utils/supabase/server'

const BUCKET = 'araish-media'
const MARKER = `/storage/v1/object/public/${BUCKET}/`

/**
 * Delete bucket files given their public URLs. Runs with the caller's session,
 * so the storage RLS "admins only" delete policy still applies.
 * Non-bucket URLs (e.g. local /images/ seed paths) are ignored.
 */
export async function deleteMediaByUrls(urls: string[]): Promise<void> {
  const paths = urls
    .map((u) => {
      const i = u.indexOf(MARKER)
      return i === -1 ? null : u.slice(i + MARKER.length)
    })
    .filter((p): p is string => !!p)

  if (paths.length === 0) return

  const supabase = await createClient()
  await supabase.storage.from(BUCKET).remove(paths)
}
