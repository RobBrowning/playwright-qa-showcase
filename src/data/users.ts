/**
 * SauceDemo publishes these accounts on its own login page. They are public
 * demo credentials, not secrets. Each one exercises a different behaviour.
 */
export const DEMO_PASSWORD = 'secret_sauce';

export const users = {
  standard: 'standard_user',
  lockedOut: 'locked_out_user',
  problem: 'problem_user',
  performanceGlitch: 'performance_glitch_user',
  error: 'error_user',
  visual: 'visual_user',
} as const;

export type UserKey = keyof typeof users;
