// Fix: Updated path to match standard project structure where supabaseClient is in src/
// Change line 2 of priceHistService.js to this:
import { supabase } from '/src/lib/supabaseClient';

/**
 * Fetches price history for a specific product.
 * Requirement: PR-03 PriceHistoryPanel
 */
export const getPriceHistory = async (prodcode) => {
  try {
    const { data, error } = await supabase
      .from('price_history') // Ensure this matches your actual table name (usually snake_case)
      .select('*')
      .eq('prodcode', prodcode)
      .order('effDate', { ascending: false }); // Sorting by effective date as per UI requirement

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
    // Ensure the keys in priceData (effDate, unitPrice) match your DB columns
    const { data, error } = await supabase
      .from('price_history')
      .insert([{
        prodcode: priceData.prodcode,
        effDate: priceData.effDate,
        unitPrice: parseFloat(priceData.unitPrice)
      }])
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding price history entry:', error.message);
    throw error;
  }
};