import { listOutput } from '../../common/schema.js';

export const NotificationOutput = (n) => ({
  id:         n.id,
  type:       n.type,       // order | inventory | forum | system
  title:      n.title,
  body:       n.body,
  is_read:    n.isRead,
  ref_id:     n.refId   ?? null,
  ref_type:   n.refType ?? null,  // order | product | post
  created_at: n.createdAt,
});

export const NotificationListOutput = listOutput(NotificationOutput);
