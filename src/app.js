require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./config/swagger.json');
const { connectDB } = require('./config/database');
const routes = require('./routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend dashboard
app.use(express.static(path.join(__dirname, 'public')));

// Swagger API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: 'Healthcare API Docs',
  customCss: '.swagger-ui .topbar { background-color: #0f172a; }'
}));

// API Routes
app.use('/api', routes);

// 404 Handler for undefined API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found`
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🏥 Healthcare Backend Server is running on port ${PORT}`);
      console.log(`🌐 Base URL: http://localhost:${PORT}`);
      console.log(`📚 Interactive Swagger Docs: http://localhost:${PORT}/api/docs`);
      console.log(`🚀 Web Dashboard: http://localhost:${PORT}/`);
      console.log(`=======================================================`);
    });
  }).catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

module.exports = app;
