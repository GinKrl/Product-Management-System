// src/services/productService.js
import { supabase } from '../lib/supabaseClient';

export const productService = {
  getAllProducts: async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching products:', error.message);
      return { data: [], error };
    }
  }
};