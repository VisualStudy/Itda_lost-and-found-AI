module.exports = {
  apps: [{
    name: 'itda',
    script: 'npx',
    args: 'wrangler pages dev dist --ip 0.0.0.0 --port 3000 --local',
    cwd: '/home/user/webapp',
    env: { NODE_ENV: 'development' },
    watch: false,
    instances: 1,
    exec_mode: 'fork',
  }],
}
