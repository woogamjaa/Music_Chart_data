const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 현재 날짜를 YYYY-MM-DD 형식으로 포맷
const current_date = new Date().toISOString().split('T')[0];
const folderPath = 'melon';
const filename = path.join(folderPath, `melon100_${current_date}.json`);

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
  
  // 사용자 에이전트 설정
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
  
  await page.goto("https://www.melon.com/chart/index.htm", { waitUntil: 'networkidle2' });

  // 데이터 추출
  const data = await page.evaluate(() => {
    const rankings = Array.from(document.querySelectorAll("tbody .wrap.t_center > .rank"))
      .map(el => el.textContent.trim());
      
    const titles = Array.from(document.querySelectorAll("tbody .wrap_song_info .ellipsis.rank01 span > a"))
      .map(el => el.textContent.trim());
      
    const artists = Array.from(document.querySelectorAll("tbody .wrap_song_info .ellipsis.rank02 span > a:nth-child(1)"))
      .map(el => el.textContent.trim());
      
    const images = Array.from(document.querySelectorAll("tbody .image_typeAll > img"))
      .map(el => el.getAttribute('src'));
      
    const albums = Array.from(document.querySelectorAll("tbody .wrap_song_info .ellipsis.rank03 > a"))
      .map(el => el.textContent.trim());
    
    // 데이터 구성
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