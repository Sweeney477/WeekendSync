#!/usr/bin/env node

// Script to apply the SQL fix to Supabase database
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

// Read the SQL fix file
const sqlFilePath = join(__dirname, 'fix_trip_members_rls.sql');
const sql = readFileSync(sqlFilePath, 'utf-8');

console.log('🔧 Applying SQL fix to Supabase...\n');
console.log('SQL to execute:');
console.log('─'.repeat(60));
console.log(sql);
console.log('─'.repeat(60));
console.log('');

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Execute the SQL
async function applyFix() {
    try {
        // Split SQL by semicolons and execute each statement
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s && !s.startsWith('--'));

        for (const statement of statements) {
            console.log(`Executing: ${statement.substring(0, 50)}...`);
            const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

            if (error) {
                console.error('❌ Error:', error.message);
                throw error;
            }
        }

        console.log('\n✅ SQL fix applied successfully!');
        console.log('\nYou can now try creating a new trip.');
        console.log('The "Trip not found" error should be resolved! 🎉');

    } catch (error) {
        console.error('\n❌ Failed to apply SQL fix:', error.message);
        console.error('\nPlease apply the fix manually via Supabase Dashboard:');
        console.error('1. Go to https://wqrahwsmirvfxvidfmep.supabase.co');
        console.error('2. Navigate to Database → SQL Editor');
        console.error('3. Copy the contents of db/fix_trip_members_rls.sql');
        console.error('4. Paste and run in the SQL editor');
        process.exit(1);
    }
}

applyFix();
