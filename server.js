const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public')); // Serves HTML files
app.use('/auth', authRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
