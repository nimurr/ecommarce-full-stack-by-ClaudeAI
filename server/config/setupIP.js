import os from 'os';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get server IP address
function getServerIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.internal === false && iface.family === 'IPv4') {
        return iface.address;
      }
    }
  }
  
  return 'localhost';
}

const SERVER_IP = getServerIP();
const SERVER_PORT = process.env.PORT || 5000;
const CLIENT_PORT = 5173;
const ADMIN_PORT = 5174;

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🌐 Server IP Configuration                             ║
║                                                           ║
║   Server IP: ${SERVER_IP.padEnd(38)}║
║   Server Port: ${String(SERVER_PORT).padEnd(38)}║
║   Client Port: ${String(CLIENT_PORT).padEnd(38)}║
║   Admin Port: ${String(ADMIN_PORT).padEnd(38)}║
║                                                           ║
║   Server URL: http://${SERVER_IP}:${SERVER_PORT}${' '.repeat(30 - SERVER_IP.length)}║
║   Client URL: http://${SERVER_IP}:${CLIENT_PORT}${' '.repeat(30 - SERVER_IP.length)}║
║   Admin URL:  http://${SERVER_IP}:${ADMIN_PORT}${' '.repeat(30 - SERVER_IP.length)}║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

// Update .env files
function updateEnvFile(envPath, updates) {
  const fullPath = path.join(__dirname, '..', envPath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  ${envPath} not found, skipping...`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, 'gm');
    if (content.match(regex)) {
      content = content.replace(regex, `${key}=${value}`);
    } else {
      content += `\n${key}=${value}`;
    }
  }
  
  fs.writeFileSync(fullPath, content);
  console.log(`✅ Updated ${envPath}`);
}

// Update all .env files
const updates = {
  'API_URL': `http://${SERVER_IP}:${SERVER_PORT}/api`,
  'VITE_API_URL': `http://${SERVER_IP}:${SERVER_PORT}/api`,
  'CLIENT_URL': `http://${SERVER_IP}:${CLIENT_PORT}`,
  'ADMIN_URL': `http://${SERVER_IP}:${ADMIN_PORT}`,
};

updateEnvFile('.env', updates);
updateEnvFile('client/.env', {
  'VITE_API_URL': `http://${SERVER_IP}:${SERVER_PORT}/api`,
});
updateEnvFile('admin/.env', {
  'VITE_API_URL': `http://${SERVER_IP}:${SERVER_PORT}/api`,
});

console.log('\n✅ All .env files updated with server IP\n');

// Export for use in other files
export { SERVER_IP, SERVER_PORT, CLIENT_PORT, ADMIN_PORT };
