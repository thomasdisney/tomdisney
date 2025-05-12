import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const task = req.body;
  if (!task || !task.id) return res.status(400).json({ error: 'Missing task data' });

  const { error } = await supabase
    .from('tasks')
    .upsert(task, { onConflict: 'id' });

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ success: true });
}
