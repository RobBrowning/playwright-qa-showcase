// Seed for the Playwright test agents (planner, generator, healer).
// Not a test: it replaces no manual check and asserts nothing of its own.
// playwright.config.ts ignores it unless PLAYWRIGHT_AGENTS is set, which
// .mcp.json does for the agent MCP server, so normal runs never pick it up.
//
// Agents start from the state this leaves: standard_user logged in on the
// inventory page, with the project's page object fixtures in scope.
import { test } from '../../src/fixtures/test';

test.describe('Agent seed', () => {
  test('seed', async ({ loggedIn }) => {
    // generate code here.
    void loggedIn;
  });
});
