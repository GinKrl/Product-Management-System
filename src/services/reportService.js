// src/services/reportService.js
import { supabase } from "../lib/supabaseClient";

/**
 * REP_001: Fetch all products with their current active price.
 * Uses the current_product_price view (singular — confirmed from DB).
 */
export const fetchProductPriceReport = async () => {
  // FIX: was 'current_product_prices' (plural) — view is 'current_product_price'
  const { data, error } = await supabase
    .from('current_product_price')
    .select('*');

  if (error) {
    console.error("Error fetching REP_001:", error.message);
    throw error;
  }
  return data;
};

/**
 * REP_002: Fetch top selling products based on sales quantity.
 */
export const fetchTopSellingReport = async (limit = 5) => {
  const { data, error } = await supabase
    .from('top_selling_products')
    .select('*')
    .limit(limit);

  if (error) {
    console.error("Error fetching REP_002:", error.message);
    throw error;
  }
  return data;
};