const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jectngcrpikxwnjdwana.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplY3RuZ2NycGlreHduamR3YW5hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODI1Mjc1NiwiZXhwIjoyMDczODI4NzU2fQ.8QslPMejGE8mllC3qWPEUdcKWZqx4L4x5dxEFRrEP2I';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;