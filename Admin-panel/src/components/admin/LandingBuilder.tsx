'use client'

import { useState, useTransition } from 'react'
import { ArrowUp, ArrowDown, Trash2, Plus, X, ChevronDown, Eye } from 'lucide-react'
import MediaUploader from '@/components/admin/MediaUploader'
import { updateLanding } from '@/actions/landing'
import type { LandingBlock } from '@/lib/api'

type Content = Record<string, unknown>
const str = (v: unknown, d = '') => (typeof v === 'string' ? v : d)
function arr<T = unknown>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : []
}
const uid = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `b_${Date.now()}_${Math.round(Math.random() * 1e6)}`)

const BLOCK_LABELS: Record<string, string> = {
  announcement: 'Announcement Bar',
  hero: 'Hero Slider',
  curated: 'Category Carousel',
  feature: 'Feature (Bedding & Cushions)',
  snug: '3-Column Grid',
  dining: 'Split Banner (Dining)',
  reels: 'Video Reels',
  banner: 'Full-Width Banner',
  instagram: 'Instagram Strip'
}

// Starter content for a newly added block.
const TEMPLATES: Record<string, () => Content> = {
  announcement: () => ({ text: 'New announcement' }),
  hero: () => ({ images: [] }),
  curated: () => ({ heading: 'CURATED FOR YOU', items: [] }),
  feature: () => ({ leftImage: '', leftTitle: 'HEADING', leftText: 'Text…', leftButton: 'SHOP', leftLink: '/shop', rightImage: '', rightTitle: 'HEADING', rightText: 'Text…', rightButton: 'SHOP', rightLink: '/shop' }),
  snug: () => ({ heading: 'SECTION HEADING', items: [] }),
  dining: () => ({ heading: 'HEADING', text: 'Text…', button: 'BUY NOW', link: '/shop', image: '' }),
  reels: () => ({ heading: '#REELS', videos: [] }),
  banner: () => ({ image: '', link: '/shop' }),
  instagram: () => ({ heading: '#INSTAGRAM', image: '' })
}

/* ── Small field primitives ── */
function Field({ label, value, onChange, area }: { label: string; value: string; onChange: (v: string) => void; area?: boolean }) {
  return (
    <label className="block">
      <span className="block text-[11px] tracking-wider text-gray-500 mb-1">{label}</span>
      {area ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand resize-y" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
      )}
    </label>
  )
}

function SingleMedia({ label, value, onChange, video }: { label: string; value: string; onChange: (v: string) => void; video?: boolean }) {
  return (
    <div>
      <span className="block text-[11px] tracking-wider text-gray-500 mb-1">{label}</span>
      {value ? (
        <div className="relative w-32 h-24 border border-gray-200 rounded overflow-hidden bg-cream group">
          {video ? (
            <video src={value} className="w-full h-full object-cover" muted />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="w-full h-full object-cover" />
          )}
          <button type="button" onClick={() => onChange('')} className="absolute top-1 right-1 grid place-items-center w-6 h-6 rounded-full bg-black/50 text-white hover:bg-black/70" aria-label="Remove">
            <X size={12} />
          </button>
        </div>
      ) : (
        <MediaUploader folder="landing" resetAfterUpload onUploaded={(m) => onChange(m.url)} />
      )}
    </div>
  )
}

function MediaGrid({ label, urls, onChange, video }: { label: string; urls: string[]; onChange: (v: string[]) => void; video?: boolean }) {
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= urls.length) return
    const next = [...urls]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  return (
    <div>
      <span className="block text-[11px] tracking-wider text-gray-500 mb-1">{label} ({urls.length})</span>
      {urls.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
          {urls.map((u, i) => (
            <div key={`${u}-${i}`} className={`relative border border-gray-200 rounded overflow-hidden bg-cream group ${video ? 'aspect-[9/16]' : 'aspect-video'}`}>
              {video ? <video src={u} className="w-full h-full object-cover" muted /> : /* eslint-disable-next-line @next/next/no-img-element */ <img src={u} alt="" className="w-full h-full object-cover" />}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <button type="button" onClick={() => move(i, -1)} className="text-white p-1" aria-label="Move up"><ArrowUp size={12} /></button>
                <button type="button" onClick={() => move(i, 1)} className="text-white p-1" aria-label="Move down"><ArrowDown size={12} /></button>
              </div>
              <button type="button" onClick={() => onChange(urls.filter((_, k) => k !== i))} className="absolute top-1 right-1 grid place-items-center w-5 h-5 rounded-full bg-black/50 text-white hover:bg-black/70" aria-label="Remove"><X size={11} /></button>
            </div>
          ))}
        </div>
      )}
      <MediaUploader folder={video ? 'reels' : 'landing'} resetAfterUpload onUploaded={(m) => onChange([...urls, m.url])} />
    </div>
  )
}

/* ── Repeatable object list (curated / snug items) ── */
function ItemList({
  label,
  items,
  onChange,
  fields,
  imageKey
}: {
  label: string
  items: Content[]
  onChange: (v: Content[]) => void
  fields: { key: string; label: string; area?: boolean }[]
  imageKey: string
}) {
  const patch = (i: number, k: string, v: unknown) => onChange(items.map((it, k2) => (k2 === i ? { ...it, [k]: v } : it)))
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  return (
    <div>
      <span className="block text-[11px] tracking-wider text-gray-500 mb-2">{label} ({items.length})</span>
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="border border-gray-200 rounded p-3 space-y-2 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Item {i + 1}</span>
              <div className="flex gap-1">
                <button type="button" onClick={() => move(i, -1)} className="p-1 text-gray-400 hover:text-brand"><ArrowUp size={13} /></button>
                <button type="button" onClick={() => move(i, 1)} className="p-1 text-gray-400 hover:text-brand"><ArrowDown size={13} /></button>
                <button type="button" onClick={() => onChange(items.filter((_, k) => k !== i))} className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={13} /></button>
              </div>
            </div>
            <SingleMedia label="Image" value={str(it[imageKey])} onChange={(v) => patch(i, imageKey, v)} />
            {fields.map((f) => (
              <Field key={f.key} label={f.label} area={f.area} value={str(it[f.key])} onChange={(v) => patch(i, f.key, v)} />
            ))}
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onChange([...items, { [imageKey]: '' }])} className="mt-3 inline-flex items-center gap-1 text-xs text-brand hover:text-brand-dark">
        <Plus size={14} /> Add item
      </button>
    </div>
  )
}

/* ── Per-block editor ── */
function BlockEditor({ block, patch }: { block: LandingBlock; patch: (partial: Content) => void }) {
  const c = block.content
  const set = (k: string) => (v: unknown) => patch({ [k]: v })
  switch (block.type) {
    case 'announcement':
      return <Field label="Text (leave blank to hide)" value={str(c.text)} onChange={set('text')} />
    case 'hero':
      return <MediaGrid label="Slides" urls={arr<string>(c.images)} onChange={set('images')} />
    case 'curated':
      return (
        <div className="space-y-3">
          <Field label="Heading" value={str(c.heading)} onChange={set('heading')} />
          <ItemList label="Categories" items={arr<Content>(c.items)} onChange={set('items')} imageKey="image" fields={[{ key: 'label', label: 'Label' }, { key: 'link', label: 'Link (URL)' }]} />
        </div>
      )
    case 'feature':
      return (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-600">Left column</p>
            <SingleMedia label="Left image" value={str(c.leftImage)} onChange={set('leftImage')} />
            <Field label="Left title" value={str(c.leftTitle)} onChange={set('leftTitle')} />
            <Field label="Left text" area value={str(c.leftText)} onChange={set('leftText')} />
            <Field label="Left button" value={str(c.leftButton)} onChange={set('leftButton')} />
            <Field label="Left link" value={str(c.leftLink)} onChange={set('leftLink')} />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-600">Right column</p>
            <SingleMedia label="Right image" value={str(c.rightImage)} onChange={set('rightImage')} />
            <Field label="Right title" value={str(c.rightTitle)} onChange={set('rightTitle')} />
            <Field label="Right text" area value={str(c.rightText)} onChange={set('rightText')} />
            <Field label="Right button" value={str(c.rightButton)} onChange={set('rightButton')} />
            <Field label="Right link" value={str(c.rightLink)} onChange={set('rightLink')} />
          </div>
        </div>
      )
    case 'snug':
      return (
        <div className="space-y-3">
          <Field label="Heading" value={str(c.heading)} onChange={set('heading')} />
          <ItemList label="Cards" items={arr<Content>(c.items)} onChange={set('items')} imageKey="image" fields={[{ key: 'title', label: 'Title' }, { key: 'desc', label: 'Description', area: true }, { key: 'link', label: 'Link (URL)' }]} />
        </div>
      )
    case 'dining':
      return (
        <div className="space-y-3">
          <Field label="Heading" value={str(c.heading)} onChange={set('heading')} />
          <Field label="Text" area value={str(c.text)} onChange={set('text')} />
          <Field label="Button label" value={str(c.button)} onChange={set('button')} />
          <Field label="Button link" value={str(c.link)} onChange={set('link')} />
          <SingleMedia label="Image" value={str(c.image)} onChange={set('image')} />
        </div>
      )
    case 'reels':
      return (
        <div className="space-y-3">
          <Field label="Heading" value={str(c.heading)} onChange={set('heading')} />
          <MediaGrid label="Videos" urls={arr<string>(c.videos)} onChange={set('videos')} video />
        </div>
      )
    case 'banner':
      return (
        <div className="space-y-3">
          <SingleMedia label="Banner image" value={str(c.image)} onChange={set('image')} />
          <Field label="Link (URL)" value={str(c.link)} onChange={set('link')} />
        </div>
      )
    case 'instagram':
      return (
        <div className="space-y-3">
          <Field label="Heading" value={str(c.heading)} onChange={set('heading')} />
          <SingleMedia label="Image" value={str(c.image)} onChange={set('image')} />
        </div>
      )
    default:
      return <p className="text-sm text-gray-400">No editor for this block.</p>
  }
}

/* ── Compact live preview per block ── */
function BlockPreview({ block }: { block: LandingBlock }) {
  const c = block.content
  const imgCls = 'object-cover w-full h-full'
  switch (block.type) {
    case 'announcement':
      return <div className="bg-brand text-white text-center text-xs py-2 px-3">{str(c.text) || <span className="opacity-60">(hidden)</span>}</div>
    case 'hero': {
      const first = arr<string>(c.images)[0]
      return (
        <div className="h-40 bg-cream relative">
          {first ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={first} alt="" className={imgCls} /> : <div className="grid place-items-center h-full text-gray-400 text-sm">No slides</div>}
        </div>
      )
    }
    case 'curated':
      return (
        <div className="py-4">
          <p className="text-center text-sm tracking-widest text-gray-700 mb-3">{str(c.heading)}</p>
          <div className="flex gap-2 overflow-x-auto px-3">
            {arr<Content>(c.items).map((it, i) => (
              <div key={i} className="shrink-0 w-24">
                <div className="aspect-square bg-gray-100 rounded overflow-hidden">
                  {str(it.image) && /* eslint-disable-next-line @next/next/no-img-element */ <img src={str(it.image)} alt="" className={imgCls} />}
                </div>
                <p className="text-[10px] text-center mt-1 truncate">{str(it.label)}</p>
              </div>
            ))}
          </div>
        </div>
      )
    case 'feature':
      return (
        <div className="grid grid-cols-2 gap-3 p-4 bg-[#fdfbf9]">
          {(['left', 'right'] as const).map((side) => (
            <div key={side}>
              <div className="aspect-[4/5] bg-gray-100 rounded overflow-hidden mb-2">
                {str(c[`${side}Image`]) && /* eslint-disable-next-line @next/next/no-img-element */ <img src={str(c[`${side}Image`])} alt="" className={imgCls} />}
              </div>
              <p className="text-xs font-medium">{str(c[`${side}Title`])}</p>
              <p className="text-[10px] text-gray-500 line-clamp-2">{str(c[`${side}Text`])}</p>
              <span className="inline-block mt-1 bg-brand text-white text-[9px] px-3 py-1">{str(c[`${side}Button`])}</span>
            </div>
          ))}
        </div>
      )
    case 'snug':
      return (
        <div className="bg-brand/90 p-4">
          <p className="text-center text-white text-sm tracking-widest mb-3">{str(c.heading)}</p>
          <div className="grid grid-cols-3 gap-2">
            {arr<Content>(c.items).map((it, i) => (
              <div key={i} className="bg-white p-1.5 rounded">
                <div className="aspect-[4/5] bg-gray-100 rounded overflow-hidden">
                  {str(it.image) && /* eslint-disable-next-line @next/next/no-img-element */ <img src={str(it.image)} alt="" className={imgCls} />}
                </div>
                <p className="text-[9px] text-center mt-1 truncate">{str(it.title)}</p>
              </div>
            ))}
          </div>
        </div>
      )
    case 'dining':
      return (
        <div className="grid grid-cols-2 items-center bg-offwhite">
          <div className="p-4 text-right">
            <p className="text-lg tracking-widest text-gray-800">{str(c.heading)}</p>
            <p className="text-[10px] text-gray-500 line-clamp-3">{str(c.text)}</p>
            <span className="inline-block mt-2 bg-brand text-white text-[9px] px-3 py-1">{str(c.button)}</span>
          </div>
          <div className="h-40 bg-gray-100 overflow-hidden">
            {str(c.image) && /* eslint-disable-next-line @next/next/no-img-element */ <img src={str(c.image)} alt="" className={imgCls} />}
          </div>
        </div>
      )
    case 'reels':
      return (
        <div className="p-4">
          <p className="text-sm font-bold mb-3">{str(c.heading)}</p>
          <div className="flex gap-2 overflow-x-auto">
            {arr<string>(c.videos).map((v, i) => (
              <video key={i} src={v} muted className="shrink-0 w-20 aspect-[9/16] object-cover rounded-lg bg-gray-900" />
            ))}
            {arr<string>(c.videos).length === 0 && <span className="text-xs text-gray-400">No videos</span>}
          </div>
        </div>
      )
    case 'banner':
      return (
        <div className="h-32 bg-gray-100 overflow-hidden">
          {str(c.image) ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={str(c.image)} alt="" className={imgCls} /> : <div className="grid place-items-center h-full text-gray-400 text-sm">No banner image</div>}
        </div>
      )
    case 'instagram':
      return (
        <div className="py-4">
          <p className="text-center text-sm tracking-widest text-gray-700 mb-2">{str(c.heading)}</p>
          <div className="px-4">{str(c.image) && /* eslint-disable-next-line @next/next/no-img-element */ <img src={str(c.image)} alt="" className="w-full h-auto rounded" />}</div>
        </div>
      )
    default:
      return null
  }
}

export default function LandingBuilder({ initial }: { initial: LandingBlock[] }) {
  const [sections, setSections] = useState<LandingBlock[]>(initial)
  const [selected, setSelected] = useState<string | null>(initial[0]?.id ?? null)
  const [addType, setAddType] = useState('hero')
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const patch = (id: string, partial: Content) =>
    setSections((prev) => prev.map((b) => (b.id === id ? { ...b, content: { ...b.content, ...partial } } : b)))
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= sections.length) return
    setSections((prev) => {
      const next = [...prev]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }
  const remove = (id: string) => setSections((prev) => prev.filter((b) => b.id !== id))
  const add = () => {
    const block: LandingBlock = { id: uid(), type: addType, content: (TEMPLATES[addType] ?? (() => ({})))() }
    setSections((prev) => [...prev, block])
    setSelected(block.id)
  }

  function save() {
    setMsg(null)
    startTransition(async () => {
      const r = await updateLanding(sections)
      setMsg(r.ok ? { ok: true, text: 'Saved! The storefront updates within ~1 minute.' } : { ok: false, text: r.error })
    })
  }

  return (
    <div>
      {msg && (
        <div className={`mb-4 text-sm px-4 py-3 border ${msg.ok ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200'}`}>{msg.text}</div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <select value={addType} onChange={(e) => setAddType(e.target.value)} className="border border-gray-300 px-3 py-2 text-sm bg-white">
          {Object.entries(BLOCK_LABELS).map(([t, l]) => (
            <option key={t} value={t}>{l}</option>
          ))}
        </select>
        <button onClick={add} className="inline-flex items-center gap-1.5 bg-gray-800 text-white text-sm px-4 py-2 hover:bg-gray-700">
          <Plus size={16} /> Add Section
        </button>
        <button onClick={save} disabled={pending} className="ml-auto bg-brand text-white text-sm tracking-widest px-8 py-2.5 hover:bg-brand-dark transition-colors disabled:opacity-60">
          {pending ? 'SAVING…' : 'SAVE PAGE'}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* LEFT — controls */}
        <div className="space-y-3">
          {sections.length === 0 && <p className="text-sm text-gray-400">No sections yet — add one above.</p>}
          {sections.map((block, i) => {
            const open = selected === block.id
            return (
              <div key={block.id} className={`border rounded ${open ? 'border-brand' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50">
                  <button onClick={() => setSelected(open ? null : block.id)} className="flex items-center gap-2 flex-1 text-left">
                    <ChevronDown size={15} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
                    <span className="text-sm font-medium text-gray-800">{BLOCK_LABELS[block.type] ?? block.type}</span>
                  </button>
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="p-1 text-gray-400 hover:text-brand disabled:opacity-30" aria-label="Move up"><ArrowUp size={15} /></button>
                  <button onClick={() => move(i, 1)} disabled={i === sections.length - 1} className="p-1 text-gray-400 hover:text-brand disabled:opacity-30" aria-label="Move down"><ArrowDown size={15} /></button>
                  <button onClick={() => remove(block.id)} className="p-1 text-gray-400 hover:text-red-600" aria-label="Delete section"><Trash2 size={15} /></button>
                </div>
                {open && (
                  <div className="p-4 border-t border-gray-100">
                    <BlockEditor block={block} patch={(p) => patch(block.id, p)} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* RIGHT — live preview */}
        <div className="lg:sticky lg:top-24 self-start">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
            <Eye size={14} /> Live preview
          </div>
          <div className="border border-gray-200 rounded overflow-hidden bg-white max-h-[80vh] overflow-y-auto">
            {sections.map((block) => (
              <div
                key={block.id}
                onClick={() => setSelected(block.id)}
                className={`cursor-pointer ${selected === block.id ? 'ring-2 ring-brand ring-inset' : ''}`}
              >
                <BlockPreview block={block} />
              </div>
            ))}
            {sections.length === 0 && <div className="grid place-items-center h-40 text-gray-400 text-sm">Empty page</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
