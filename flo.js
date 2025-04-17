const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 현재 날짜를 YYYY-MM-DD 형식으로 포맷
const current_date = new Date().toISOString().split('T')[0];
const folderPath = 'flo';
const filename = path.join(folderPath, `flo100_${current_date}.json`);

// 디렉토리가 없으면 생성
if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath, { recursive: true });
}

(async () => {
  // 브라우저 시작
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
  
  // 페이지 로드
  await page.goto("https://www.music-flo.com/browse", { waitUntil: 'networkidle2' });
  
  // 페이지가 완전히 로드될 때까지 대기
  await page.waitForSelector('.chart_lst');
  
  // 더보기 버튼을 찾아 클릭
try {
    const moreButton = await page.$('.btn_list_more');
    if (moreButton) {
      console.log("Clicking '더보기' button.");
      await page.evaluate(button => button.click(), moreButton);
      // waitForTimeout 대신 Promise로 대기
      await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 3000)));
    }
  } catch (error) {
    console.error("Error clicking '더보기':", error);
  }
  
  // 데이터 추출
  const musicData = await page.evaluate(() => {
    const tracks = document.querySelectorAll('.chart_lst .track_list_table tbody tr');
    const data = [];
    
    tracks.forEach(track => {
      const rank = track.querySelector('.num').textContent.trim();
      const title = track.querySelector('.tit__text').textContent.trim();
      const artist = track.querySelector('.artist__link').textContent.trim();
      const album = track.querySelector('.album').textContent.trim();
      const imageUrl = track.querySelector('.thumb img').getAttribute('src');
      
      data.push({
        rank: rank,
        title: title,
        artist: artist,
        imageURL: imageUrl,
        album: album
      });
    });
    
    return data;
  });
  
  // 결과 저장
  fs.writeFileSync(filename, JSON.stringify(musicData, null, 4), 'utf-8');
  console.log(`✅ JSON 저장 완료: ${filename}`);
  
  // 브라우저 종료
  await browser.close();
})();