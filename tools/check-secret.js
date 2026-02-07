
const jwt = require('jsonwebtoken');

const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJic29rYWtydGNsbm1yYWx5bW5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjg1MDMsImV4cCI6MjA4NTYwNDUwM30.gADduO-wHmarrpvQsPzt8oQo789KCZlHyeqkw8xQDU0';
const secret = '66a1190b-5e6d-401a-bbf6-243ec1bff27c';
const projectRef = 'rbsokakrtclnmralymna';

try {
    const decoded = jwt.verify(anonKey, secret);
    console.log('✅ SECRET matches Anon Key!');
    console.log('Decoded:', decoded);
} catch (e) {
    console.log('❌ SECRET does NOT match!');
    console.log('Error:', e.message);
}
