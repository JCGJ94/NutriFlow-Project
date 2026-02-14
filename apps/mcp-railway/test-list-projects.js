const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const token = process.env.RAILWAY_API_TOKEN;
if (!token) {
    console.error('ERROR: RAILWAY_API_TOKEN not found in .env file');
    process.exit(1);
}

const serverPath = path.join(__dirname, 'dist/index.js');
console.log(`Testing MCP Server Tool Execution at: ${serverPath}`);

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

            // Filter out logs/notifications if needed, focus on responses
            if (message.id === 2) {
                console.log('List Projects Response:', JSON.stringify(message, null, 2));
                serverProcess.kill();
            }
        } catch (e) {
            console.log('Non-JSON output:', line);
        }
    }
});

// Initialize
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

// Call Tool: railway_list_projects
const callToolRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
        name: 'railway_list_projects',
        arguments: {}
    }
};

// Send requests
setTimeout(() => {
    serverProcess.stdin.write(JSON.stringify(initRequest) + '\n');
}, 500);

setTimeout(() => {
    console.log('Calling railway_list_projects...');
    serverProcess.stdin.write(JSON.stringify(callToolRequest) + '\n');
}, 1000);

// Timeout safety
setTimeout(() => {
    console.log('Timeout reached, closing...');
    serverProcess.kill();
}, 8000);
