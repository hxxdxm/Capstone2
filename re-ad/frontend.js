// C:\Capstone2\re-ad\frontend.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// 배포 모드로 설정
const dev = false;
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> 프론트엔드 서버가 http://${hostname}:${port} 에서 실행 중입니다.`);
  });
});