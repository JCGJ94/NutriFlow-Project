
const crypto = require('crypto');

const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJic29rYWtydGNsbm1yYWx5bW5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjg1MDMsImV4cCI6MjA4NTYwNDUwM30.gADduO-wHmarrpvQsPzt8oQo789KCZlHyeqkw8xQDU0';
const secret = '3WfDo76fiHz+l0iV/2zVrkOAHSsnCy4Da+J3s01Ob5BDl6pHjdsQFi2qp7CNXDYpngxeA5qIut4kNxYYa/Zrfw==';

const [headerB64, payloadB64, signatureB64] = anonKey.split('.');

function base64UrlDecode(str) {
    return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

function base64UrlEncode(buf) {
    return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

const data = headerB64 + '.' + payloadB64;
const hmac = crypto.createHmac('sha256', secret);
hmac.update(data);
const digest = hmac.digest();
const calculatedSignature = base64UrlEncode(digest);

console.log('Calculated Signature:', calculatedSignature);
console.log('Expected Signature:  ', signatureB64);

if (calculatedSignature === signatureB64) {
    console.log('✅ SUCCESS: The JWT Secret is CORRECT.');
} else {
    console.log('❌ FAILURE: The JWT Secret is INCORRECT.');
}
