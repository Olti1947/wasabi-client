const os = require("os");

// The backend runs on the developer's machine, so devices and emulators must reach it via its LAN IP
// (localhost would point at the phone itself). Set API_URL in .env.local to override.
function detectLanIp() {
  for (const addresses of Object.values(os.networkInterfaces())) {
    for (const address of addresses ?? []) {
      if (address.family === "IPv4" && !address.internal) {
        return address.address;
      }
    }
  }
  return "localhost";
}

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    API_URL: process.env.API_URL || `http://${detectLanIp()}:8080`,
  },
});
