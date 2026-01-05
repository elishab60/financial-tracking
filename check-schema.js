const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    const { data, error } = await supabase.from('assets').select('*').limit(1);
    if (error) {
        console.error("Error fetching assets:", error);
    } else {
        if (data && data.length > 0) {
            console.log("Asset Keys:", Object.keys(data[0]));
        } else {
            console.log("No assets found");
        }
    }
}

checkSchema();
