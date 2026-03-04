#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const waitOn = require('wait-on');

const root = path.resolve(__dirname, '..');

const server = spawn('node', ['scripts/start-all.js'], {
  cwd: root,
  env: { ...process.env },
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
      resources: ['http://localhost:3000', 'http://localhost:4000/test'],
      timeout: 60000,
      interval: 500,
    });

    const playwright = spawn('npx', ['playwright', 'test'], {
      cwd: root,
      env: { ...process.env },
      stdio: 'inherit',
    });

    playwright.on('exit', (code) => {
      teardown();
      process.exit(code);
    });
  } catch (error) {
    console.error('Integration setup failed:', error);
    teardown();
    process.exit(1);
  }
}

run();
