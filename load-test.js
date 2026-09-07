/**
 * Load Testing Script for Middle+ Requirement
 * Target: 1,000,000 comments / 100k users throughput benchmark (Read SLA with Redis Cache & TypeORM)
 * Run with: node load-test.js
 */

const http = require('http');

const TARGET_HOST = process.env.HOST || 'localhost';
const TARGET_PORT = process.env.PORT || 3000;
const TOTAL_REQUESTS = 1000;
const CONCURRENCY = 50;

console.log(`🚀 Starting load test against http://${TARGET_HOST}:${TARGET_PORT}/api/comments?page=1&limit=25 ...`);
console.log(`Concurrent Workers: ${CONCURRENCY} | Total Requests: ${TOTAL_REQUESTS}\n`);

let completed = 0;
let success = 0;
let failed = 0;
const startTime = Date.now();

function sendRequest(index) {
  const req = http.request(
    {
      hostname: TARGET_HOST,
      port: TARGET_PORT,
      path: '/api/comments?page=1&limit=25',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    },
    (res) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        success++;
      } else {
        failed++;
      }
      completed++;
      checkCompletion();
    }
  );

  req.on('error', (err) => {
    failed++;
    completed++;
    checkCompletion();
  });

  req.end();
}

function checkCompletion() {
  if (completed % 100 === 0 || completed === TOTAL_REQUESTS) {
    process.stdout.write(`Progress: ${completed}/${TOTAL_REQUESTS} requests completed...\r`);
  }

  if (completed === TOTAL_REQUESTS) {
    const totalTimeSec = (Date.now() - startTime) / 1000;
    const rps = (TOTAL_REQUESTS / totalTimeSec).toFixed(2);
    console.log(`\n\n✅ Load test completed in ${totalTimeSec} seconds!`);
    console.log(`⚡ Throughput: ${rps} requests/second`);
    console.log(`🟢 Successful: ${success} | 🔴 Failed: ${failed}`);
  }
}

// Dispatch concurrent initial batch
for (let i = 0; i < CONCURRENCY; i++) {
  sendRequest(i);
}

let nextIdx = CONCURRENCY;
const interval = setInterval(() => {
  if (nextIdx < TOTAL_REQUESTS) {
    sendRequest(nextIdx++);
  } else {
    clearInterval(interval);
  }
}, 2);

