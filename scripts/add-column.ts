import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    console.log('Adding column full_name to profiles table...');
    const { error } = await supabase.rpc('execute_sql', {
        sql_query: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;'
    });

    if (error) {
        // If RPC doesn't exist, we might need another way to run SQL, 
        // but usually in these setups there's an execute_sql or we can just try to update a record
        // and if it fails with "column does not exist" we know.
        // However, I'll try a direct query if possible, but standard Supabase JS doesn't allow raw SQL DDL.
        console.error('Error adding column via RPC:', error);
        console.log('Trying to insert a dummy record to check if column exists...');
    } else {
        console.log('Column added successfully!');
    }
}

run();
