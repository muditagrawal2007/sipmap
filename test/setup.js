// Shared test setup — runs before every test file.
// Used to set up any global mocks, silence logs, etc.

process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'silent';
process.env.NODE_ENV = 'test';
process.env.APP_ID = process.env.APP_ID || '12345';
process.env.WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'test-secret';
