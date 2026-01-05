const yfModule = require('yahoo-finance2');

async function test() {
    let yf;
    if (typeof yfModule.default === 'function') {
        yf = new yfModule.default();
    } else if (typeof yfModule === 'object') {
        yf = yfModule; // It might be a pre-instantiated object in some versions
    }

    // Try to suppress notice
    if (yf && yf.suppressNotices) yf.suppressNotices(['yahooSurvey']);

    console.log("Fetching summaryProfile for AAPL...");
    try {
        const result = await yf.quoteSummary('AAPL', { modules: ['summaryProfile'] });
        console.log(JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
