import { listOutput } from '../../common/schema.js';

export const UserOutput = (user) => ({
  id:        user.id,
  email:     user.email,
  name:      user.name,
  role:      user.role,
  createdAt: user.createdAt,
});

export const UserListOutput = listOutput(UserOutput);
