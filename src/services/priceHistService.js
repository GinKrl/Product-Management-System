import { supabase } from '/src/lib/supabaseClient';

export const getPriceHistory = async (prodcode) => {
  try {
    const { data, error } = await supabase
      .from('pricehist') 
      .select('*')
      .eq('prodcode', prodcode)
      .order('effDate', { ascending: false }); // FIXED: Matched exact schema casing

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
        prodcode: priceData.prodcode,
        effDate: priceData.effDate,     // FIXED: Matched exact schema casing
        unitPrice: parseFloat(priceData.unitPrice) // FIXED: Matched exact schema casing
      }])
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding price history entry:', error.message);
    throw error;
  }
};