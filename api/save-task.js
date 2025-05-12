// api/save-task.js

import { set } from '@vercel/edge-config';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const task = req.body;
    if (!task || !task.id) {
      return res.status(400).json({ error: 'Invalid task data' });
    }

    await set(`task-${task.id}`, task);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Failed to save task:', err);
    return res.status(500).json({ error: 'Failed to save task' });
  }
}
