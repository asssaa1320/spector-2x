const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(__dirname));

// Main route - serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Admin route - serve admin.html
app.get('/admin-zues-dev', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Catch all other routes and redirect to main page
app.get('*', (req, res) => {
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`🚀 Zeus Coupon Server running on http://localhost:${PORT}`);
    console.log(`📊 Admin Panel: http://localhost:${PORT}/admin-zues-dev`);
    console.log(`🔐 Admin Login: admin-zues-oun / admin-zues-password`);
});
