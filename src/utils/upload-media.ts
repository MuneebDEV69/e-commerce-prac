import { createClient } from '@/utils/supabase/client'

/**
 * Media storage helpers for the `araish-media` Supabase Storage bucket.
 *
 * Uploads go directly from the browser to Supabase (no round-trip through the
 * Next.js server), so large videos aren't constrained by server action body
 * limits. Writes are gated by RLS — only authenticated users can upload/delete
 * (see the SQL policies in the project setup notes).
 *
 * The bucket is public, so getPublicUrl() returns a permanent, CDN-served URL
 * suitable for storing on a Product and rendering on the storefront.
 */

export const MEDIA_BUCKET = 'araish-media'
const MAX_BYTES = 50 * 1024 * 1024 // 50 MB

export type UploadedMedia = {
  url: string // public URL — store this on the product
  path: string // bucket-relative path — keep this to delete later
  type: 'image' | 'video'
}

/** Upload one image/video and return its public URL + storage path. */
export async function uploadMedia(file: File, folder = 'products'): Promise<UploadedMedia> {
  const isImage = file.type.startsWith('image/')
  const isVideo = file.type.startsWith('video/')
  if (!isImage && !isVideo) {
    throw new Error('Only image or video files are allowed.')
  }
  if (file.size > MAX_BYTES) {
    throw new Error('File is too large (max 50 MB).')
  }

  const supabase = createClient()

  // Unique, URL-safe path so two files with the same name never collide.
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase()
  const path = `${folder}/${Date.now()}-${safeName}`

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type
  })
  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path)
  return { url: data.publicUrl, path, type: isImage ? 'image' : 'video' }
}

/** Delete one or more files by their storage path (call when a product is removed/updated). */
export async function deleteMedia(paths: string | string[]): Promise<void> {
  const supabase = createClient()
  const list = Array.isArray(paths) ? paths : [paths]
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove(list)
  if (error) throw new Error(error.message)
}

/**
 * Derive the bucket-relative storage path from a stored public URL.
 * Useful when a product only has the public URL saved and you need to delete it.
 */
export function pathFromPublicUrl(publicUrl: string): string | null {
  const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`
  const idx = publicUrl.indexOf(marker)
  return idx === -1 ? null : publicUrl.slice(idx + marker.length)
}
