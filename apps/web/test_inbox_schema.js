import { createClient } from '@supabase/supabase-js';

const s = createClient(
  'https://xuzkfnpzmmtgpsjaiguv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1emtmbnB6bW10Z3BzamFpZ3V2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI0MDIyMCwiZXhwIjoyMDk0ODE2MjIwfQ.-Gn4K5SsevNpqhsIM7sJwzf3-1HZBrb2zsei8PpxDDM'
);

async function check() {
  console.log('Querying inbox_conversations columns...');
  const testCols = ['id', 'mailbox_id', 'lead_id', 'nylas_thread_id', 'thread_id', 'sentiment', 'last_message_text', 'snippet'];
  for (const col of testCols) {
    const { error } = await s.from('inbox_conversations').select(col).limit(1);
    console.log(`Column '${col}':`, error ? `❌ Error (${error.message})` : '✅ Exists');
  }

  console.log('\nQuerying inbox_messages columns...');
  const testMsgCols = ['id', 'conversation_id', 'nylas_message_id', 'body', 'direction', 'sender_type', 'snippet', 'subject', 'magic_reply_draft', 'received_at'];
  for (const col of testMsgCols) {
    const { error } = await s.from('inbox_messages').select(col).limit(1);
    console.log(`Column '${col}':`, error ? `❌ Error (${error.message})` : '✅ Exists');
  }
}

check();
