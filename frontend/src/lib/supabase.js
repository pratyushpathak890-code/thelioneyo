import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export async function uploadImage(file, bucket = 'product-images') {
  if (!supabase) throw new Error('Supabase not configured');
  const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
    upsert: true,
    contentType: file.type || 'image/jpeg',
    cacheControl: '3600',
  });

  if (error) {
    const msg = error.message || '';
    if (msg.toLowerCase().includes('bucket') || msg.includes('404') || error.statusCode === 404) {
      throw new Error(
        `Storage bucket "${bucket}" not found.\n\nGo to Supabase Dashboard → Storage → New bucket → Name: "${bucket}" → Public: ON.\n\nOr paste an image URL directly in the field below.`
      );
    }
    if (error.statusCode === 403 || msg.toLowerCase().includes('policy') || msg.toLowerCase().includes('unauthorized')) {
      throw new Error(
        `Upload permission denied for bucket "${bucket}".\n\nIn Supabase Dashboard → Storage → "${bucket}" → Policies → Add policy to allow INSERT for anon role.\n\nOr paste an image URL directly.`
      );
    }
    throw new Error(msg || 'Upload failed. Try pasting an image URL directly.');
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return urlData.publicUrl;
}

export async function fetchProducts() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) { console.error('fetchProducts error:', error); return []; }
  return data || [];
}

export async function fetchAllProducts() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('fetchAllProducts error:', error); return []; }
  return data || [];
}

export async function fetchSiteSettings() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .maybeSingle();
    if (error) {
      // Table may not exist yet — silent fallback
      if (error.code !== 'PGRST205') console.warn('fetchSiteSettings:', error.message);
      return null;
    }
    return data;
  } catch (e) {
    console.warn('fetchSiteSettings (caught):', e.message);
    return null;
  }
}

export async function upsertSiteSettings(settings) {
  if (!supabase) throw new Error('Supabase not configured');
  if (settings.id) {
    const { data, error } = await supabase
      .from('site_settings')
      .update({ ...settings, updated_at: new Date().toISOString() })
      .eq('id', settings.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('site_settings')
      .insert({ ...settings, updated_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export async function insertProduct(product) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('products').insert(product).select().single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id, product) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id) {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleProductActive(id, is_active) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('products')
    .update({ is_active })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function insertOrder(orderData) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert({ ...orderData, status: 'Processing', created_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (e) {
    console.warn('insertOrder (non-critical):', e.message);
    return null;
  }
}

export async function fetchOrders() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.warn('fetchOrders:', e.message);
    return [];
  }
}

export async function updateOrderStatus(id, status) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (e) {
    console.warn('updateOrderStatus:', e.message);
    return null;
  }
}
