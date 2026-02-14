const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const token = process.env.RAILWAY_API_TOKEN;
if (!token) {
    console.error('ERROR: RAILWAY_API_TOKEN not found in .env file');
    process.exit(1);
}

const serverPath = path.join(__dirname, 'dist/index.js');
console.log(`Testing MCP Server at: ${serverPath}`);

const serverProcess = spawn('node', [serverPath], {
    env: { ...process.env, RAILWAY_API_TOKEN: token },
    stdio: ['pipe', 'pipe', 'inherit']
});

let buffer = '';

serverProcess.stdout.on('data', (data) => {
    const chunk = data.toString();
    buffer += chunk;

    const lines = buffer.split('\n');
    buffer = lines.pop(); // Keep incomplete line

    for (const line of lines) {
        if (!line.trim()) continue;
        try {
            const message = JSON.parse(line);
            console.log('Received:', message);

            if (message.method === 'ping') {
                // Respond to ping if needed, or ignore
            }
        } catch (e) {
            console.log('Non-JSON output:', line);
        }
    }
});

// Simulate client handshake
const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0' }
    }
};

const listToolsRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list'
};

setTimeout(() => {
    console.log('Sending initialize...');
    serverProcess.stdin.write(JSON.stringify(initRequest) + '\n');
}, 1000);

setTimeout(() => {
    console.log('Sending tools/list...');
    serverProcess.stdin.write(JSON.stringify(listToolsRequest) + '\n');
}, 2000);

setTimeout(() => {
    console.log('Closing...');
    serverProcess.kill();
}, 4000);
