const fs = require('fs');
const path = require('path');

// Read the template file
const htmlPath = path.join(__dirname, 'index.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Replace environment variables
htmlContent = htmlContent.replace(
    '%STRIPE_PUBLISHABLE_KEY%',
    process.env.STRIPE_PUBLISHABLE_KEY || ''
);

// Write the processed file
fs.writeFileSync(htmlPath, htmlContent); 