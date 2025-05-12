// api/get-tasks.js

import { getAll } from '@vercel/edge-config';

export default async function handler(req, res) {
  try {
    const all = await getAll();
    const tasks = Object.values(all).filter(
      (item) => item?.id && item.id.startsWith?.('task-')
    );

    return res.status(200).json(tasks);
  } catch (err) {
    console.error('Failed to load tasks:', err);
    return res.status(500).json({ error: 'Failed to load tasks' });
  }
}
