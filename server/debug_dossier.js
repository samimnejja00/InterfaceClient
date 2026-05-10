const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mqkxjcugywogwimenakw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xa3hqY3VneXdvZ3dpbWVuYWt3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDM3MDc1MSwiZXhwIjoyMDg1OTQ2NzUxfQ.ffotSL0q5hu-t3TmrT6CVb04c2yVCYhUqaAsyfS2Nxg';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    const { data, error } = await supabase
        .from('dossiers')
        .select('id, client_id, souscripteur, dossier_details_rc(date_reception)')
        .eq('souscripteur', 'Ahmed BenAli')
        .limit(5);
    
    if (error) {
        console.error(error);
        return;
    }
    console.log(JSON.stringify(data, null, 2));
}

check();
