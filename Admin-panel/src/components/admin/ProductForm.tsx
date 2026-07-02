'use client'

import { useState, useTransition, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import MediaUploader from '@/components/admin/MediaUploader'
import { deleteMedia, pathFromPublicUrl, type UploadedMedia } from '@/utils/upload-media'
import { createProduct, updateProduct } from '@/actions/product'

type Category = { id: string; name: string }

export type EditableProduct = {
  id: string
  title: string
  description: string | null
  priceFrom: number
  stock: number
  categoryId: string | null
  mediaUrls: string[]
}

// Gallery items track whether they were uploaded in this session ("new") or
// loaded from an existing product — that decides how removal is handled.
type GalleryItem = UploadedMedia & { isNew: boolean }

function mediaTypeFromUrl(url: string): 'image' | 'video' {
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) ? 'video' : 'image'
}

export default function ProductForm({
  categories,
  product
}: {
  categories: Category[]
  product?: EditableProduct
}) {
  const isEdit = !!product
  const router = useRouter()

  const [title, setTitle] = useState(product?.title ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(product ? String(product.priceFrom) : '')
  const [stock, setStock] = useState(product ? String(product.stock) : '')
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories[0]?.id ?? '')
  const [media, setMedia] = useState<GalleryItem[]>(
    (product?.mediaUrls ?? []).map((url) => ({
      url,
      path: pathFromPublicUrl(url) ?? '',
      type: mediaTypeFromUrl(url),
      isNew: false
    }))
  )

  const [error, setError] = useState<string | null>(null)
  const [createdSlug, setCreatedSlug] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  async function removeMedia(item: GalleryItem) {
    setMedia((prev) => prev.filter((m) => m.url !== item.url))
    // Only delete from storage immediately for freshly-uploaded files. Pre-existing
    // media is cleaned up server-side on save (so cancelling an edit keeps the file).
    if (item.isNew && item.path) {
      try {
        await deleteMedia(item.path)
      } catch {
        /* already gone */
      }
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setCreatedSlug(null)

    const priceNum = Number(price)
    const stockNum = Number(stock || '0')
    if (!title.trim()) return setError('Title is required.')
    if (!Number.isFinite(priceNum) || priceNum < 0) return setError('Enter a valid price.')

    const input = {
      title: title.trim(),
      description: description.trim(),
      priceFrom: Math.round(priceNum),
      stock: Math.round(stockNum),
      categoryId: categoryId || null,
      mediaUrls: media.map((m) => m.url)
    }

    startTransition(async () => {
      const result = isEdit
        ? await updateProduct(product!.id, input)
        : await createProduct(input)

      if (!result.ok) {
        setError(result.error)
        return
      }

      if (isEdit) {
        router.push('/products')
        router.refresh()
        return
      }

      // Create mode — reset for the next product.
      setCreatedSlug(result.slug)
      setTitle('')
      setDescription('')
      setPrice('')
      setStock('')
      setCategoryId(categories[0]?.id ?? '')
      setMedia([])
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
      {createdSlug && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-3">
          Product created!{' '}
          <a
            href={`${process.env.NEXT_PUBLIC_STOREFRONT_URL ?? 'http://localhost:3000'}/product/${createdSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium"
          >
            View on store
          </a>{' '}
          or{' '}
          <Link href="/products" className="underline font-medium">
            manage products
          </Link>
          .
        </div>
      )}
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3">{error}</div>
      )}

      <div>
        <label className="block text-xs tracking-wider text-gray-600 mb-1.5">TITLE *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand"
        />
      </div>

      <div>
        <label className="block text-xs tracking-wider text-gray-600 mb-1.5">DESCRIPTION</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand resize-y"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs tracking-wider text-gray-600 mb-1.5">PRICE (PKR) *</label>
          <input
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="w-full border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="block text-xs tracking-wider text-gray-600 mb-1.5">STOCK</label>
          <input
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs tracking-wider text-gray-600 mb-1.5">CATEGORY</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand bg-white"
        >
          <option value="">— Others —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Media */}
      <div>
        <label className="block text-xs tracking-wider text-gray-600 mb-2">
          PRODUCT MEDIA{' '}
          <span className="text-gray-400 normal-case tracking-normal">
            (first image is shown on the shop card)
          </span>
        </label>

        {media.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
            {media.map((m, i) => (
              <div key={m.url} className="relative aspect-square border border-gray-200 overflow-hidden bg-cream">
                {m.type === 'image' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <video src={m.url} className="w-full h-full object-cover" muted />
                )}
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 text-[9px] bg-brand text-white px-1.5 py-0.5 tracking-wider">
                    MAIN
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(m)}
                  className="absolute top-1 right-1 grid place-items-center w-6 h-6 rounded-full bg-black/50 text-white hover:bg-black/70"
                  aria-label="Remove"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <MediaUploader
          folder="products"
          resetAfterUpload
          onUploaded={(m) => setMedia((prev) => [...prev, { ...m, isNew: true }])}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-brand text-white text-sm tracking-widest px-10 py-3 hover:bg-brand-dark transition-colors disabled:opacity-60"
        >
          {pending ? 'SAVING…' : isEdit ? 'SAVE CHANGES' : 'CREATE PRODUCT'}
        </button>
        {isEdit && (
          <Link href="/products" className="text-sm text-gray-500 hover:text-brand">
            Cancel
          </Link>
        )}
      </div>
    </form>
  )
}
