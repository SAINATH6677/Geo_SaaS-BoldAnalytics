const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const requestMeta = require('./middleware/requestMeta');
const responseFormatter = require('./middleware/responseFormatter');
const errorHandler = require('./middleware/errorHandler');

const quotaMiddleware = require('./middleware/quotaMiddleware');
const apiLogger = require('./middleware/apiLogger');

const app = express();

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Security headers
app.use(helmet());

// Meta + Response middleware
app.use(requestMeta);

app.use(quotaMiddleware);
app.use(apiLogger);

app.use(responseFormatter);

// CORS
app.use(cors());

// JSON parser
app.use(express.json());

// Health route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Geo SaaS API Running 🚀'
  });
});

// Swagger Docs
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// ---------------- ROUTES ----------------
const authRoutes = require('./routes/authRoutes');
const stateRoutes = require('./routes/stateRoutes');
const districtRoutes = require('./routes/districtRoutes');
const subDistrictRoutes = require('./routes/subDistrictsRoutes');
const villageRoutes = require('./routes/villageRoutes');
const searchRoutes = require('./routes/searchRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const adminRoutes = require('./routes/adminRoutes');
const autocompleteRoutes = require('./routes/autocompleteRoutes');

app.use('/v1/auth', authRoutes);
app.use('/v1/states', stateRoutes);
app.use('/v1/districts', districtRoutes);
app.use('/v1/subdistricts', subDistrictRoutes);
app.use('/v1/villages', villageRoutes);
app.use('/v1/search', searchRoutes);
app.use('/v1/dashboard', dashboardRoutes);
app.use('/v1/admin', adminRoutes);
app.use('/v1/autocomplete', autocompleteRoutes);

// Global error handler MUST be last
app.use(errorHandler);

module.exports = app;