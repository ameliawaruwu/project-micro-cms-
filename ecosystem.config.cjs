module.exports = {
  apps: [
    {
      name: 'kroomify-api',
      script: 'dist/server.cjs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5058
      }
    }
  ]
};
