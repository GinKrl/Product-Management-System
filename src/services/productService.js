import { supabase } from '../supabaseClient';

/**
 * Fetches products based on user type.
 * USER accounts only see ACTIVE records. ADMIN/SUPERADMIN see all records.
 */
export const getProducts = async (userType) => {
  try {
    let query = supabase.from('product').select('*');

    if (userType === 'USER') {
      query = query.eq('record_status', 'ACTIVE');
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching products:', error.message);
    throw error;
  }
};

export const addProduct = async (productData) => {
  try {
    const { data, error } = await supabase
      .from('product')
      .insert([productData])
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding product:', error.message);
    throw error;
  }
};

export const updateProduct = async (prodcode, productData) => {
  try {
    const { data, error } = await supabase
      .from('product')
      .update(productData)
      .eq('prodcode', prodcode) 
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error updating product ${prodcode}:`, error.message);
    throw error;
  }
};

export const softDeleteProduct = async (prodcode) => {
  try {
    const { data, error } = await supabase
      .from('product')
      .update({ record_status: 'INACTIVE' })
      .eq('prodcode', prodcode)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error soft deleting product ${prodcode}:`, error.message);
    throw error;
  }
};

export const recoverProduct = async (prodcode) => {
  try {
    const { data, error } = await supabase
      .from('product')
      .update({ record_status: 'ACTIVE' })
      .eq('prodcode', prodcode)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error recovering product ${prodcode}:`, error.message);
    throw error;
  }
};