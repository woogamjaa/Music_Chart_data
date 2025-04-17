const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 현재 날짜를 YYYY-MM-DD 형식으로 포맷
const current_date = new Date().toISOString().split('T')[0];
const folderPath = 'bugs';
const filename = path.join(folderPath, `bugs100_${current_date}.json`);

// 디렉토리가 없으면 생성
if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath, { recursive: true });
}

(async () => {
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
  const page = await browser.newPage();
  await page.goto("https://music.bugs.co.kr/chart", { waitUntil: 'networkidle2' });

  const data = await page.evaluate(() => {
    const rankings = Array.from(document.querySelectorAll("#CHARTrealtime > table > tbody > tr > td:nth-child(4) > div > strong"))
      .map(el => el.textContent.trim());
      
    const titles = Array.from(document.querySelectorAll("#CHARTrealtime > table > tbody > tr > th > p > a"))
      .map(el => el.textContent.trim());
      
    const artists = Array.from(document.querySelectorAll("#CHARTrealtime > table > tbody > tr > td:nth-child(8) > p > a:nth-child(1)"))
      .map(el => el.textContent.trim());
      
    const images = Array.from(document.querySelectorAll("#CHARTrealtime > table > tbody > tr > td:nth-child(5) > a > img"))
      .map(el => el.getAttribute('src').trim());
      
    const albums = Array.from(document.querySelectorAll("#CHARTrealtime > table > tbody > tr > td:nth-child(9) > a"))
      .map(el => el.textContent.trim());

    // 데이터를 배열로 구성
    const chartData = [];
    for (let i = 0; i < rankings.length; i++) {
      chartData.push({
        rank: rankings[i],
        title: titles[i],
        artist: artists[i],
        imageURL: images[i],
        album: albums[i]
      });
    }

    return chartData;
  });

  // 결과 저장
  fs.writeFileSync(filename, JSON.stringify(data, null, 4), 'utf-8');
  console.log(`✅ JSON 저장 완료: ${filename}`);

  await browser.close();
})();