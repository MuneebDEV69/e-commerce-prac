import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Browser-safe Supabase client (anon key).
 * Use this for storage uploads and any Supabase-specific operations from the frontend.
 *
 * Example — upload a product image to the "products" bucket:
 *   const { data, error } = await supabase.storage
 *     .from('products')
 *     .upload(`images/${Date.now()}-${file.name}`, file)
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
