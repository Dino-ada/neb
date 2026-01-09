const http = require('http');

const url = "http://localhost:3001/api/graph?policy=279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3f";

http.get(url, (res) => {
    console.log('Status:', res.statusCode);
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => console.log('Body:', data));
}).on('error', (e) => {
    console.error('Error:', e);
});
