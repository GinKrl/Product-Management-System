import { supabase } from '/src/lib/supabaseClient';

/**
 * Fetches price history for a specific product.
 * Requirement: PR-03 PriceHistoryPanel
 */
export const getPriceHistory = async (prodcode) => {
  try {
    const { data, error } = await supabase
      .from('pricehist') // FIXED: Matches SQL table name
      .select('*')
      .eq('prodcode', prodcode)
      .order('effdate', { ascending: false }); // FIXED: Matches SQL column name

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching history for ${prodcode}:`, error.message);
    throw error;
  }
};

/**
 * Adds a new price entry.
 * Requirement: PR-03 AddPriceEntryForm
 */
export const addPriceEntry = async (priceData) => {
  try {
    const { data, error } = await supabase
      .from('pricehist') // FIXED: Matches SQL table name
      .insert([{
        prodcode: priceData.prodcode,
        effdate: priceData.effDate,     // Maps UI state (effDate) to DB column (effdate)
        unitprice: parseFloat(priceData.unitPrice) // Maps UI state (unitPrice) to DB column (unitprice)
      }])
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding price history entry:', error.message);
    throw error;
  }
};
