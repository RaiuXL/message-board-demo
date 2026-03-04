#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const backendPort = process.env.API_PORT || process.env.PORT || 4000;

const services = [
  {
    name: 'backend',
    command: 'npm',
    args: ['run', 'dev'],
    cwd: path.resolve(projectRoot, '..', 'api'),
    env: {
      ...process.env,
      PORT: backendPort,
      DB_DIALECT: 'sqlite',
      DB_STORAGE: ':memory:',
      NODE_ENV: 'development',
    },
  },
  {
    name: 'frontend',
    command: 'npm',
    args: ['run', 'dev', '--', '--hostname', process.env.HOST || '127.0.0.1'],
    cwd: projectRoot,
    env: {
      ...process.env,
      HOST: process.env.HOST || '127.0.0.1',
      NODE_ENV: 'development',
      NEXT_PUBLIC_API_BASE: `http://localhost:${backendPort}/messages`,
    },
  },

];

const children = services.map(({ name, command, args, cwd, env }) => {
  const child = spawn(command, args, {
    cwd,
    env,
    stdio: 'inherit',
  });

  child.on('exit', (code, signal) => {
    const reason = signal ? `signal ${signal}` : `exit code ${code}`;
    console.log(`${name} exited (${reason}).`);
  });

  return child;
});

function teardown() {
  children.forEach((child) => {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  });
}

process.on('SIGINT', () => {
  teardown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  teardown();
  process.exit(0);
});
