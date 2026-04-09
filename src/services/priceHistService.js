import { supabase } from '../supabaseClient';

export const getPriceHistory = async (prodcode) => {
  try {
    const { data, error } = await supabase
      .from('priceHist')
      .select('*')
      .eq('prodcode', prodcode)
      .order('stamp', { ascending: false });

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
      .from('priceHist')
      .insert([priceData])
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding price history entry:', error.message);
    throw error;
  }
};