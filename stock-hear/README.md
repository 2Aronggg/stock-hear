# stock-hear

시각장애인을 위한 실시간 주식정보 소리화 MVP입니다.

한국투자증권 Open API의 국내주식 실시간 체결정보를 백엔드에서 수신하고, 프론트엔드에서는 현재가, 등락률, 거래량을 화면, 소리, 음성 안내로 전달하는 것을 목표로 합니다.

## MVP 범위

- 한국투자증권 실시간 체결정보 수신 구조
- 가격 변화의 음높이 변환
- 거래량의 음량 변환
- 체결빈도의 리듬 변환
- 버튼 기반 음성 명령
- 현재가, 등락률, 거래량 음성 안내
- 키보드와 화면낭독기 접근성 지원

구현하지 않는 기능:

- 매수
- 매도
- 계좌조회
- 투자추천

## 폴더 구조

```text
stock-hear/
  apps/
    web/
      src/
        components/
        audio/
        api/
        types.ts
        App.tsx
        main.tsx
        styles.css
    server/
      src/
        kis/
        config.ts
        server.ts
  docs/
  package.json
```

## 실행

```bash
npm install
npm run dev
```

개별 실행:

```bash
npm run dev:server
npm run dev:web
```

기본 주소:

- frontend: `http://localhost:5173`
- backend health: `http://localhost:4000/api/health`
- backend websocket: `ws://localhost:4000/ws`

## 검증

```bash
npm run typecheck
npm run build
```

## 환경변수

실제 한국투자증권 인증정보는 `apps/server/.env`에만 저장합니다.

프론트엔드의 `VITE_` 환경변수에는 공개 가능한 서버 주소만 둡니다. `KIS_APP_KEY`, `KIS_APP_SECRET`, access token, approval key를 프론트엔드로 보내지 않습니다.

## 프로젝트 문서

- [파일 및 폴더 역할](docs/FILE_STRUCTURE.md)
- [개발 규칙](docs/DEVELOPMENT_RULES.md)
- [전체 체크리스트](docs/TEAM_CHECKLIST.md)
- [보안 규칙](docs/SECURITY_RULES.md)
- [한국투자증권 API 연동 기록](docs/API_INTEGRATION.md)
- [작업 배정표](docs/TASKS.md)

## 다음 구현 우선순위

1. 한국투자증권 인증과 approval key 발급
2. 한국투자증권 실시간 WebSocket 연결과 체결 메시지 파싱
3. 실제 체결정보 기반 소리화와 음성 안내 연결

