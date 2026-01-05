import { createClient } from "@/lib/supabase/server";
import yahooFinance from "@/lib/yahoo-finance";
import { Currency } from "@/types";

export class PriceService {

  static async getPrice(symbol: string, currency: Currency): Promise<number> {
    const supabase = await createClient();
    const now = new Date();

    // 1. Check cache
    const { data: cache } = await supabase
      .from("price_cache")
      .select("price, expires_at")
      .eq("symbol", symbol.toUpperCase())
      .gt("expires_at", now.toISOString())
      .single();

    if (cache) {
      return Number(cache.price);
    }

    // 2. Fetch new price via Yahoo Finance (Robust & Multi-asset)
    try {
      const quote = await yahooFinance.quote(symbol);

      if (!quote || typeof quote.regularMarketPrice !== 'number') {
        throw new Error(`No price found for ${symbol}`);
      }

      const price = quote.regularMarketPrice;

      // 3. Update cache
      const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 mins TTL

      await supabase.from("price_cache").upsert({
        provider: "yahoo",
        symbol: symbol.toUpperCase(),
        currency: quote.currency || currency.toUpperCase(),
        price: price,
        fetched_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      });

      return price;
    } catch (error) {
      console.error(`Error fetching price for ${symbol} via Yahoo:`, error);

      // Fallback to last known price if available even if expired
      const { data: lastKnown } = await supabase
        .from("price_cache")
        .select("price")
        .eq("symbol", symbol.toUpperCase())
        .order("fetched_at", { ascending: false })
        .limit(1)
        .single();

      return lastKnown ? Number(lastKnown.price) : 0;
    }
  }
}
