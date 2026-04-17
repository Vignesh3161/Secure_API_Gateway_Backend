module.exports = {
  targets: [
    {
      path: '/api/v1',
      target: process.env.TARGET_SERVICE_URL || 'http://localhost:5000',
      changeOrigin: true,
      pathRewrite: {
        '^/api/v1': '', // Remove base path if target doesn't expect it
      },
    },
    // Add more target services as needed
  ],
};
