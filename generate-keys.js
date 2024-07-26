const crypto = require('crypto');

const generateKey = () => crypto.randomBytes(64).toString('hex');
console.log('Generated Key:', generateKey());
