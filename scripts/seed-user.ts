
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load env vars
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const SUPABASE_URL = envConfig.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = envConfig.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function seedUser() {
    const email = 'test-user@example.com';
    const password = 'Password123!';

    console.log(`Checking user ${email}...`);

    // List users to find if exists
    // admin.listUsers() 
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError);
        process.exit(1);
    }

    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
        console.log('User exists. Updating password to be sure...');
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            { password: password, email_confirm: true, user_metadata: { email_verified: true } }
        );
        if (updateError) {
            console.error('Error updating user:', updateError);
        } else {
            console.log('User updated successfully.');
        }
    } else {
        console.log('User does not exist. Creating...');
        const { data, error: createError } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: { full_name: 'Test User' }
        });

        if (createError) {
            console.error('Error creating user:', createError);
            process.exit(1);
        }
        console.log('User created successfully:', data.user.id);
    }
}

seedUser();
