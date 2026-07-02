'use client'

import { useRef, useState, useEffect, type DragEvent } from 'react'
import { UploadCloud, X, Loader2, Copy, Check } from 'lucide-react'
import { uploadMedia, deleteMedia, type UploadedMedia } from '@/utils/upload-media'

/**
 * Admin media uploader: drag-and-drop (or click) an image/video.
 *
 * PERFORMANCE: the moment a file is chosen we show an instant local preview via
 * URL.createObjectURL — no waiting for the network. The Supabase upload runs in
 * the background with a spinner overlay; on success the object URL is revoked.
 *
 * `onUploaded` lets a parent admin form capture the returned media. With
 * `resetAfterUpload` the uploader returns to the dropzone for collecting many files.
 */
export default function MediaUploader({
  folder = 'products',
  onUploaded,
  resetAfterUpload = false
}: {
  folder?: string
  onUploaded?: (_media: UploadedMedia) => void
  resetAfterUpload?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const objectUrlRef = useRef<string | null>(null)

  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [media, setMedia] = useState<UploadedMedia | null>(null)
  const [localPreview, setLocalPreview] = useState<{ url: string; type: 'image' | 'video' } | null>(null)
  const [copied, setCopied] = useState(false)

  // Revoke any outstanding object URL on unmount (no memory leaks).
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  function revokeLocal() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    setLocalPreview(null)
  }

  async function handleFile(file: File) {
    setError(null)

    // 1. Instant local preview — shows immediately, before any network call.
    const localUrl = URL.createObjectURL(file)
    objectUrlRef.current = localUrl
    setLocalPreview({ url: localUrl, type: file.type.startsWith('video/') ? 'video' : 'image' })
    setUploading(true)

    try {
      // 2. Background upload to Supabase.
      const result = await uploadMedia(file, folder)
      onUploaded?.(result)
      if (!resetAfterUpload) setMedia(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.')
    } finally {
      setUploading(false)
      revokeLocal()
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  async function clearMedia() {
    if (media) {
      try {
        await deleteMedia(media.path)
      } catch {
        /* already gone */
      }
    }
    setMedia(null)
    setError(null)
  }

  async function copyUrl() {
    if (!media) return
    await navigator.clipboard.writeText(media.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  // ── Uploading: instant local preview + spinner overlay ──
  if (uploading && localPreview) {
    return (
      <div className="w-full max-w-md">
        <div className="relative h-64 border border-gray-200 rounded-lg overflow-hidden bg-cream">
          {localPreview.type === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={localPreview.url} alt="Uploading preview" className="w-full h-full object-contain opacity-80" />
          ) : (
            <video src={localPreview.url} className="w-full h-full object-contain bg-black opacity-80" muted />
          )}
          <div className="absolute inset-0 grid place-items-center bg-black/20">
            <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-full text-sm text-gray-700">
              <Loader2 size={16} className="animate-spin text-brand" />
              Uploading…
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Uploaded preview (standalone mode) ──
  if (media) {
    return (
      <div className="w-full max-w-md">
        <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-cream">
          {media.type === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={media.url} alt="Uploaded media" className="w-full h-64 object-contain" />
          ) : (
            <video src={media.url} controls className="w-full h-64 object-contain bg-black" />
          )}
          <button
            onClick={clearMedia}
            aria-label="Remove media"
            className="absolute top-2 right-2 grid place-items-center w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <input
            readOnly
            value={media.url}
            className="flex-1 border border-gray-300 px-3 py-2 text-xs text-gray-600 outline-none"
          />
          <button
            onClick={copyUrl}
            className="grid place-items-center w-9 h-9 border border-gray-300 text-gray-600 hover:border-brand hover:text-brand"
            aria-label="Copy URL"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </div>
    )
  }

  // ── Dropzone ──
  return (
    <div className="w-full max-w-md">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center gap-3 h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          dragging ? 'border-brand bg-cream' : 'border-gray-300 hover:border-brand hover:bg-cream/50'
        }`}
      >
        <UploadCloud size={32} className="text-brand" />
        <p className="text-sm text-gray-700">
          <span className="text-brand font-medium">Click to upload</span> or drag &amp; drop
        </p>
        <p className="text-xs text-gray-400">Image or video — up to 50 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = '' // allow re-selecting the same file
          }}
        />
      </div>

      {error && <p className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-2.5">{error}</p>}
    </div>
  )
}
