require('dotenv').config();

const app = require('./app');
const db = require('./config/db');
require('./config/redis');

const PORT = process.env.PORT || 5000;

// DB Connection Test
db.query('SELECT NOW()')
  .then(res => console.log('DB Connected:', res.rows))
  .catch(err => console.error('DB Error:', err));

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});