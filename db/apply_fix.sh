#!/bin/bash

# This script helps you apply the SQL fix to Supabase
# Since we can't directly execute SQL via API without Management API access,
# we'll open the Supabase SQL Editor in your browser with instructions

set -e

echo "=============================================="
echo "  Applying SQL Fix to Supabase Database"
echo "=============================================="
echo ""

# Extract project ref from URL
PROJECT_URL="https://wqrahwsmirvfxvidfmep.supabase.co"
PROJECT_REF="wqrahwsmirvfxvidfmep"

SQL_FILE="db/fix_trip_members_rls.sql"

echo "📋 SQL Fix to apply:"
echo ""
cat "$SQL_FILE"
echo ""
echo "=============================================="
echo ""

# Check if pbcopy is available (macOS)
if command -v pbcopy &> /dev/null; then
    cat "$SQL_FILE" | pbcopy
    echo "✅ SQL copied to clipboard!"
    echo ""
fi

echo "🔧 Opening Supabase SQL Editor..."
echo ""
echo "Please follow these steps:"
echo "1. The SQL Editor will open in your browser"
echo "2. Paste the SQL (already in your clipboard)"
echo "3. Click 'Run' or press Cmd+Enter"
echo "4. You should see 'Success. No rows returned'"
echo ""
echo "Press ENTER to open the SQL Editor..."
read

# Open Supabase SQL Editor
open "https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new"

echo ""
echo "After running the SQL:"
echo "1. Return to your app running at http://localhost:3000"
echo "2. Try creating a new trip"
echo "3. The 'Trip not found' error should be fixed! 🎉"
echo ""
