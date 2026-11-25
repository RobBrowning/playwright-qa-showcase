/**
 * SauceDemo's banner when a logged-out user requests a protected page. The
 * banner names the page requested and is prefixed "Epic sadface: ", so specs
 * match it with toContainText. Third-party wording: if it changes, change it here.
 */
export const notLoggedInError = (path: string): string => `You can only access '${path}' when you are logged in`;
