import YahooFinance from 'yahoo-finance2';

// In Next.js/Browser environments, the default export might be nested or the class itself.
// We handle various import patterns to ensure we get a working instance.
function getYahooFinanceInstance() {
    try {
        // Try named or default as constructor (v3 standard)
        if (typeof YahooFinance === 'function') {
            return new (YahooFinance as any)();
        }

        const anyYF = YahooFinance as any;
        if (anyYF.default && typeof anyYF.default === 'function') {
            return new anyYF.default();
        }

        // If it's already an instance or has search method
        if (YahooFinance && (YahooFinance as any).search) {
            return YahooFinance;
        }

        throw new Error('Could not find a valid Yahoo Finance constructor or instance');
    } catch (err) {
        console.error('Yahoo Finance Initialization Error:', err);
        return YahooFinance; // Fallback
    }
}

const yahooFinance = getYahooFinanceInstance();

// Configure the instance
try {
    if (yahooFinance && typeof yahooFinance.setGlobalConfig === 'function') {
        yahooFinance.setGlobalConfig({
            validation: {
                logErrors: false
            }
        });
    }
} catch (err) {
    console.warn('Failed to set global config for yahooFinance', err);
}

export default yahooFinance;
