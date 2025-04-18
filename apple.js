//라이브러리 가져오기
const puppeteer = require('puppeteer'); //헤드리스 Chrome 또는 Chromium 브라우저를 제어하는 Node.js 라이브러리
const fs = require('fs'); // 파일 작업을 위한 Node.js 내장 파일 시스템 모듈
const path = require('path'); // 파일 및 디렉토리 경로를 처리하는 Node.js 모듈



// 날짜 및 파일 구성  - 현재 날짜를 YYYY-MM-DD 형식으로 포맷
// 현재 날짜를 한국 시간 기준으로 가져오기
const current_date = new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }).split(',')[0].replace(/\//g, '-');
const folderPath = 'apple'; // JSON 파일을 저장할 디렉토리 정의
const filename = path.join(folderPath, `apple100_${current_date}.json`); // 현재 날짜를 포함한 고유한 파일 이름 생성

// 디렉토리가 없으면 생성 - 디렉토리 존재여부 확인 후 생성  / recursive: true 는 필요한 경우 상위 디렉토리도 함께 생성
if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath, { recursive: true });
}

//브라우저 초기화 및 탐색
(async () => {
  const browser = await puppeteer.launch({
    headless: "new", // 새로운 헤드리스 브라우저 실행
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage(); // 새 페이지 오픈

  //Apple Music Top 100 한국 재생목록으로 이동 waitUntil: 'networkidle2'는 페이지가 완전히 로드될 때까지 대기
  await page.goto("https://music.apple.com/kr/playlist/%EC%98%A4%EB%8A%98%EC%9D%98-top-100-%EB%8C%80%ED%95%9C%EB%AF%BC%EA%B5%AD/pl.d3d10c32fbc540b38e266367dc8cb00c", { waitUntil: 'networkidle2' });

  //데이터 추출
  const data = await page.evaluate(() => { // page.evaluate()를 사용해 클라이언트 측 JavaScript 실행
    const songElements = document.querySelectorAll('div.songs-list-row[role="row"]');
    const songData = [];

    songElements.forEach(song => {
      const ranking = song.querySelector('div.songs-list-row__rank')?.innerText.trim() || ''; // 순위 
      const title = song.querySelector('div.songs-list-row__song-name')?.innerText.trim() || ''; // 제목 
      const artist = song.querySelectorAll('a[data-testid="click-action"]')[0]?.innerText.trim() || ''; // 아티스트 
      const album = song.querySelectorAll('a[data-testid="click-action"]')[1]?.innerText.trim() || ''; // 앨범 이름
      const img = song.querySelector('picture source[type="image/webp"]'); // rul 앨범 이미지
      let imageUrl = "No image available";

      if (img) {
        const sources = img.srcset.split(',');
        const match = sources.find(src => src.includes("80x80bb.webp")); // srcset에서 80x80 WebP 이미지 특별히 찾기
        if (match) {
          imageUrl = match.split(' ')[0];
        }
      }

      songData.push({ ranking, title, artist, album, image_url: imageUrl });
    });

    return songData;
  });

  // 결과 저장
  fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf-8'); // 추출된 노래 데이터를 JSON 파일에 쓰기 JSON.stringify(data, null, 2)로 2칸 들여쓰기된 형식의 JSON 생성
  console.log(`✅ JSON 저장 완료: ${filename}`);

  await browser.close();
})();