// Vercel serverless entry point: re-exports the Express app (server.js).
// All /api/* requests are rewritten here by vercel.json; the React build
// in frontend/dist is served as static files by Vercel.
module.exports = require('../server.js');
