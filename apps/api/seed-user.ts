
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rbsokakrtclnmralymna.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJic29rYWtydGNsbm1yYWx5bW5hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDAyODUwMywiZXhwIjoyMDg1NjA0NTAzfQ.qLDlGuQdC6D1DZ7jM2DABONrvUi-su-ajU0ImmWANuw';

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
