
  # SpotMap 🗺️

실시간 스팟 탐색과 혼잡도 시각화를 제공하는 인터랙티브 지도 애플리케이션입니다.

## 🚀 기능

- 📍 스팟 등록 및 관리 (우클릭 컨텍스트 메뉴)
- 🎯 카테고리별 스팟 분류 (맛집, 카페, 관광지, 쇼핑)
- ⭐ 별점 및 리뷰 시스템
- 👍 좋아요/싫어요 및 댓글 기능
- 📊 실시간 혼잡도 시각화
- 🔍 스팟 검색 기능
- 📱 반응형 디자인

## 🛠️ 기술 스택

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, Radix UI, Lucide React
- **지도**: Leaflet.js
- **애니메이션**: Motion/React
- **상태관리**: React Hooks + LocalStorage

## 📦 설치 및 실행

### 개발 환경

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 프로덕션 빌드

```bash
# 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 🚀 Vercel 배포

### 1. Vercel CLI 설치 및 로그인

```bash
npm i -g vercel
vercel login
```

### 2. 프로젝트 배포

```bash
# 프로젝트 루트에서 실행
vercel

# 프로덕션 배포
vercel --prod
```

### 3. 자동 배포 설정

1. GitHub 저장소에 코드 푸시
2. [Vercel Dashboard](https://vercel.com/dashboard)에서 프로젝트 연결
3. 자동 배포 활성화

### 4. 환경 변수 설정 (필요시)

Vercel Dashboard → Project Settings → Environment Variables에서 설정:

```
NODE_ENV=production
```

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── ui/           # Radix UI 컴포넌트
│   ├── Map.tsx       # 지도 컴포넌트
│   ├── SpotModal.tsx # 스팟 등록 모달
│   ├── SpotList.tsx  # 스팟 목록
│   └── ...
├── styles/
│   └── globals.css   # 전역 스타일
├── App.tsx           # 메인 앱 컴포넌트
└── main.tsx          # 앱 진입점
```

## 🎯 사용법

1. **스팟 추가**: 지도에서 우클릭 → "새 스팟 기록하기"
2. **스팟 상세**: 지도의 스팟 마커 클릭
3. **스팟 검색**: 헤더의 검색바 사용
4. **스팟 목록**: 우상단 메뉴 버튼 클릭

## 🔧 배포 설정 파일

- `vercel.json`: Vercel 배포 설정
- `vite.config.ts`: Vite 빌드 설정 최적화
- `.gitignore`: Git 무시 파일 설정

## 📝 라이센스

MIT License
  