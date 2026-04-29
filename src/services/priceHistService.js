// src/services/priceHistService.js
// FIX: was '/src/lib/supabaseClient' — absolute path fails in Vite
import { supabase } from '../lib/supabaseClient';

export const getPriceHistory = async (prodcode) => {
  try {
    const { data, error } = await supabase
      .from('pricehist')
      .select('*')
      .eq('prodcode', prodcode)
      // FIX: column is 'effdate' lowercase — matches actual DB
      .order('effdate', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching history for ${prodcode}:`, error.message);
    throw error;
  }
};

export const addPriceEntry = async (priceData) => {
  try {
    const { data, error } = await supabase
      .from('pricehist')
      .insert([{
        prodcode:  priceData.prodcode,
        // FIX: columns are lowercase in actual DB
        effdate:   priceData.effDate,
        unitprice: parseFloat(priceData.unitPrice),
      }])
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding price history entry:', error.message);
    throw error;
  }
};