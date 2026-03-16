
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL?.trim();
const SUPABASE_SERVICE_KEY = (
    process.env.SUPABASE_SERVICE_KEY?.trim() ??
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
);

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error(
        'SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_SERVICE_ROLE_KEY) must be configured'
    );
}

console.log('Using URL:', SUPABASE_URL);

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

    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError);
        process.exit(1);
    }

    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
        console.log(`User exists (${existingUser.id}). Updating password & confirming...`);
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            {
                password: password,
                email_confirm: true,
                user_metadata: { email_verified: true, full_name: 'Test User' }
            }
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
