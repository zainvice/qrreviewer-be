const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const configureServer = require('./config/serverConfig');
const apiRoutes = require('./routes/api');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const userRoutes = require('./routes/userRoutes');
const standRoutes = require('./routes/standRoutes')
const analyticsRoutes = require('./routes/analyticsRoutes')




const path = require('path');

dotenv.config();


connectDB();


const app = express();


configureServer(app);

app.use(requestLogger);


app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


/* app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});
 */
app.use('/api/v1', apiRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/stands', standRoutes);
app.use('/api/v1/analytics', standRoutes);


app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.message); 
    errorLogger(err, req, res, next);              
    res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
