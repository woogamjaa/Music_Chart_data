const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 현재 날짜를 YYYY-MM-DD 형식으로 포맷
const current_date = new Date().toISOString().split('T')[0];
const folderPath = 'apple';
const filename = path.join(folderPath, `apple100_${current_date}.json`);

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto("https://music.apple.com/kr/playlist/%EC%98%A4%EB%8A%98%EC%9D%98-top-100-%EB%8C%80%ED%95%9C%EB%AF%BC%EA%B5%AD/pl.d3d10c32fbc540b38e266367dc8cb00c", { waitUntil: 'networkidle2' });

  const data = await page.evaluate(() => {
    const songElements = document.querySelectorAll('div.songs-list-row[role="row"]');
    const songData = [];

    songElements.forEach(song => {
      const ranking = song.querySelector('div.songs-list-row__rank')?.innerText.trim() || '';
      const title = song.querySelector('div.songs-list-row__song-name')?.innerText.trim() || '';
      const artist = song.querySelectorAll('a[data-testid="click-action"]')[0]?.innerText.trim() || '';
      const album = song.querySelectorAll('a[data-testid="click-action"]')[1]?.innerText.trim() || '';
      const img = song.querySelector('picture source[type="image/webp"]');
      let imageUrl = "No image available";

      if (img) {
        const sources = img.srcset.split(',');
        const match = sources.find(src => src.includes("80x80bb.webp"));
        if (match) {
          imageUrl = match.split(' ')[0];
        }
      }

      songData.push({ ranking, title, artist, album, image_url: imageUrl });
    });

    return songData;
  });

  // 결과 저장
  fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ JSON 저장 완료: ${filename}`);

  await browser.close();
})();