/**
 * Load Testing Script for Middle+ Requirement
 * Target: 1,000,000 comments throughput benchmark
 * Run with: node load-test.js
 */

const http = require('http');

const TARGET_HOST = process.env.HOST || 'localhost';
const TARGET_PORT = process.env.PORT || 3000;
const TOTAL_REQUESTS = 1000;
const CONCURRENCY = 50;

console.log(`🚀 Starting load test against http://${TARGET_HOST}:${TARGET_PORT}/api/comments ...`);
console.log(`Concurrent Workers: ${CONCURRENCY} | Total Requests: ${TOTAL_REQUESTS}\n`);

let completed = 0;
let success = 0;
let failed = 0;
const startTime = Date.now();

function sendRequest(index) {
  const data = JSON.stringify({
    userName: `user_${index % 100}`,
    email: `user_${index % 100}@example.com`,
    text: `Test comment #${index} <strong>load test</strong> <i>content</i>`,
  });

  const req = http.request(
    {
      hostname: TARGET_HOST,
      port: TARGET_PORT,
      path: '/api/comments',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
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

  req.on('error', () => {
    failed++;
    completed++;
    checkCompletion();
  });

  req.write(data);
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

// Dispatch concurrent batches
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
}, 5);
