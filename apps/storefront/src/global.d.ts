declare module '*.css'
declare module '*.scss'
declare module '*.module.css'
declare module '*.module.scss'

interface ImportMeta {
  env: Record<string, string>
}
