import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pxuochjvbgkermlpbvea.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4dW9jaGp2YmdrZXJtbHBidmVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3Mzc0MTUsImV4cCI6MjA3NDMxMzQxNX0.N4G71ciuWIlX4ZN5vO9-pKmdZSXbHSTtv7AV4N8bloc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
