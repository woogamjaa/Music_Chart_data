# 🎵 Music Chart Data Collector

한국 음악 차트 데이터를 자동으로 수집하고 저장하는 크롤링 프로젝트입니다. 다양한 음원 사이트의 실시간 차트 정보를 수집합니다.

---

## 🛠 기술 스택

### 언어
- JavaScript (Node.js)

### 주요 라이브러리
- Puppeteer

### 개발 환경
- GitHub Actions
- Node.js
- JSON 파일 저장

---

## 🎯 수집 대상 음원 사이트
- Apple Music  
- Melon  
- Bugs  
- FLO  

---

## 📁 프로젝트 구조
![image](https://github.com/user-attachments/assets/b5af91c4-bc30-4603-95e3-823138e48dd6)


## ⚙️ 워크플로우 동작 방식

### 🕒 자동 트리거
- 매일 오전 7시 (KST / UTC 22:00)에 GitHub Actions 자동 실행
- Push 또는 Pull Request 발생 시 수동 실행 가능

### 📊 데이터 수집 과정
1. Puppeteer를 사용해 각 음원 사이트 차트 페이지 접근
2. 실시간 차트 정보 추출  
   - 순위 (`ranking`)  
   - 곡명 (`title`)  
   - 아티스트 (`artist`)  
   - 앨범 (`album`)  
   - 앨범아트 (`image_url`)  

### 💾 데이터 저장
- 수집된 데이터는 JSON 파일로 저장
- GitHub Actions를 통해 자동 커밋 및 푸시

#### ✅ JSON 데이터 예시

```json
{
  "ranking": "1",
  "title": "봄이 좋냐??",
  "artist": "MVP",
  "album": "봄 싱글",
  "image_url": "https://example.com/album-art.jpg"
}

```

## 🔄 GitHub Actions 워크플로우 구성
- 저장소 체크아웃
- Node.js 환경 설정
- 의존성 설치 (npm install)
- Puppeteer 설치
- 크롤링 스크립트 실행
- 변경된 JSON 파일 자동 커밋 및 푸시
