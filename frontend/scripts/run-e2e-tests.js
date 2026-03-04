#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const waitOn = require('wait-on');

const root = path.resolve(__dirname, '..');

const backendPort = process.env.API_PORT || process.env.PORT || 4000;

const server = spawn('node', ['scripts/start-all.js'], {
  cwd: root,
  env: {
    ...process.env,
    NODE_ENV: 'development',
    DB_DIALECT: 'sqlite',
    DB_STORAGE: ':memory:',
  },
  stdio: 'inherit',
});

function teardown() {
  if (!server.killed) {
    server.kill('SIGTERM');
  }
}

process.on('SIGINT', () => {
  teardown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  teardown();
  process.exit(0);
});

async function run() {
  try {
    await waitOn({
      resources: ['http://localhost:3000', `http://localhost:${backendPort}/test`],
      timeout: 90000,
      interval: 500,
    });

    const playwright = spawn('npx', ['playwright', 'test', '--config', 'playwright.e2e.config.ts'], {
      cwd: root,
      env: { ...process.env },
      stdio: 'inherit',
    });

    playwright.on('exit', (code) => {
      teardown();
      process.exit(code);
    });
  } catch (error) {
    console.error('E2E setup failed:', error);
    teardown();
    process.exit(1);
  }
}

run();
