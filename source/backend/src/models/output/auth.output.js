import { UserOutput } from './user.output.js';

const _userBase = (user) => ({
  id:        user.id,
  email:     user.email,
  full_name: user.name,
  role:      user.role,
});

export const RegisterOutput = (user) => ({ user: _userBase(user) });

export const LoginOutput = (accessToken, refreshToken, user) => ({
  access_token:  accessToken,
  refresh_token: refreshToken,
  user: _userBase(user),
});

// Profile has the same shape as UserOutput — reuse directly
export { UserOutput as ProfileOutput };
