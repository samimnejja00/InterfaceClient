@echo off
REM Database Setup Script for Windows
REM This script initializes the Supabase database

echo.
echo ===================================
echo PrestaTrack Database Setup
echo ===================================
echo.

echo Step 1: Go to your Supabase Dashboard
echo   - Open: https://app.supabase.com
echo   - Select your project
echo.

echo Step 2: Open SQL Editor
echo   - Click "SQL Editor" in the left sidebar
echo   - Click "New Query"
echo.

echo Step 3: Copy the schema file
echo   - Open file: supabase_schema_final.sql
echo   - Select all (Ctrl+A)
echo   - Copy (Ctrl+C)
echo.

echo Step 4: Paste in Supabase
echo   - Paste into the SQL Editor (Ctrl+V)
echo   - Click "Run" button
echo.

echo Step 5: Wait for success
echo   - Look for green checkmark
echo   - Or check results for "success" message
echo.

echo ===================================
echo After setup is complete:
echo   1. Refresh your browser (Ctrl+Shift+R)
echo   2. Try signing up!
echo ===================================
echo.

pause
