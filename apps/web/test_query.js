import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xuzkfnpzmmtgpsjaiguv.supabase.co';
const supabaseKey = 'sb_publishable_qJJRpJzz3Rn3VBmRplyTRQ_jQy16gSW';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing connection...');
  const resProfiles = await supabase.from('profiles').select('*').limit(1);
  console.log('profiles query response:', JSON.stringify(resProfiles, null, 2));

  const resCampaigns = await supabase.from('campaigns').select('*').limit(1);
  console.log('campaigns query response:', JSON.stringify(resCampaigns, null, 2));
}

test().catch(console.error);
