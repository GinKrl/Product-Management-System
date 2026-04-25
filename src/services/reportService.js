import { supabase } from "../lib/supabaseClient";

/**
 * M1 - REP_001: Fetch all products with their current active price
 */
export const fetchProductPriceReport = async () => {
  const { data, error } = await supabase
    .from('current_product_prices')
    .select('*');

  if (error) {
    console.error("Error fetching REP_001:", error.message);
    throw error;
  }
  return data;
};

/**
 * M1 - REP_002: Fetch top selling products based on sales quantity
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