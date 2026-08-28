# stock-hear

시각장애인을 위한 **실시간 주식정보 소리화(Sonification) 서비스**입니다.

한국투자증권(KIS) Open API의 국내주식 실시간 체결정보를 백엔드에서 수신하고, 프론트엔드는 현재가·등락률·거래량을 **화면 텍스트 + 사운드 + 음성 안내(TTS/STT)** 세 가지 채널로 동시에 전달합니다. 시각 정보에 의존하지 않고도 시장의 움직임을 "듣고" 이해할 수 있게 하는 것이 목표입니다.

> 2025 Bitamin 여름 프로젝트

## 서비스 소개

| 기능 | 설명 |
|---|---|
| 실시간 체결 소리화 | 가격 변화 → 음높이, 거래량 → 음량으로 변환해 체결마다 소리로 재생 |
| 실시간 체결 텍스트 표시 | 현재가, 등락률, 체결량, 누적거래량, 마지막 체결시각을 화면에 표시 |
| 음성 명령 (STT) | "삼성전자 들려줘", "천천히 들려줘", "방금 무슨 소리였어" 같은 자연어 명령 인식 |
| 음성 안내 (TTS) | 현재가·등락률·거래량을 말로 안내, 소리 이벤트를 말로 설명 |
| 청취 모드 설정 | 가격 중심 / 가격+거래량 / 큰 변화만 알림 중 선택, 속도·볼륨·거래량 포함 여부 조절 |
| 접근성 | 키보드 내비게이션, 화면낭독기용 라벨(`aria-live` 등), WCAG AA 대비 기준 색상 |

구현하지 않는 기능: 매수, 매도, 계좌조회, 투자추천 (정보 전달 전용 MVP)

## 시스템 아키텍처

```text
┌────────────────────┐        WebSocket (실시간)        ┌──────────────────────┐        WebSocket        ┌────────────────────┐
│   한국투자증권(KIS)   │ ───────────────────────────────▶ │   Backend (Express)   │ ───────────────────────▶ │   Frontend (React)   │
│   Open API 서버      │                                  │   apps/server          │       /ws               │   apps/web            │
│                      │ ◀─────────────────────────────── │                        │ ◀─────────────────────  │                       │
└────────────────────┘   REST: approval key / access token └──────────────────────┘   subscribe / unsubscribe └────────────────────┘
                                                                     │                                                  │
                                                                     │ approval_key, appkey/secret                     ├─ Web Audio API   → 소리화 (음높이/음량)
                                                                     │  (.env, 서버 전용 보관)                          ├─ Web Speech API  → STT(명령 인식) / TTS(음성 안내)
                                                                     ▼                                                  └─ localStorage    → 선택 종목·소리 설정 유지
                                                             종목별 구독 카운팅
                                                          (여러 프론트가 같은 종목을
                                                           볼 때 KIS 구독은 1회만 유지)
```

**데이터 흐름**

1. 서버가 기동 시 KIS REST API로 `access token` / `approval key` 발급 (`apps/server/src/kis/auth.ts`)
2. 서버가 KIS 실시간 WebSocket(`H0STCNT0`, 국내주식 체결가)에 연결 (`apps/server/src/kis/websocket.ts`)
3. 프론트가 `/ws`로 접속해 `{ type: "subscribe", symbol }` 전송 → 서버가 해당 종목을 KIS에 구독 요청
4. KIS가 체결 데이터를 보내면 서버가 파싱(`parser.ts`)해 `RealtimeTrade`로 변환
5. 서버는 그 종목을 구독 중인 프론트에만 `{ type: "trade", trade }`로 전달 (전체 브로드캐스트 아님)
6. 프론트는 수신한 trade를 화면에 표시하는 동시에 `Sonification` 엔진으로 소리를 재생하고, 필요 시 TTS로 안내

**보안 원칙**: `KIS_APP_KEY`, `KIS_APP_SECRET`, access token, approval key는 서버(`apps/server/.env`)에만 존재하며 프론트엔드로 절대 전달되지 않습니다. 프론트는 우리 백엔드하고만 통신하고 KIS와 직접 연결하지 않습니다.

## 폴더 구조

```text
stock-hear/
  apps/
    web/                      # React + Vite 프론트엔드
      src/
        components/           # StockSelector, MarketDisplay, AudioControls, VoiceControls
        audio/                # sonification.ts(소리화), speech.ts(STT/TTS), voiceIntent.ts(자연어 의도 해석)
        api/                  # marketSocket.ts(백엔드 WebSocket 클라이언트)
        types.ts
        App.tsx
        main.tsx
        styles.css
    server/                   # Express + ws 백엔드
      src/
        kis/                  # auth.ts, websocket.ts, parser.ts
        config.ts
        server.ts
  docs/                       # 팀 운영 문서
  package.json
```

## 기술 스택

- **Frontend**: React, TypeScript, Vite, Web Audio API, Web Speech API
- **Backend**: Node.js, Express, `ws`(WebSocket), Zod(환경변수 검증), dotenv
- **외부 연동**: 한국투자증권(KIS) Open API — REST(인증) + WebSocket(실시간 체결)
- **모노레포**: npm workspaces

## 실행 방법

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

| 대상 | 주소 |
|---|---|
| Frontend | `http://localhost:5173` |
| Backend health check | `http://localhost:4000/api/health` |
| Backend WebSocket | `ws://localhost:4000/ws` |

검증:

```bash
npm run typecheck
npm run build
```

## 환경변수

실제 한국투자증권 인증정보는 `apps/server/.env`에만 저장합니다 (Git에 커밋되지 않음).

```env
# apps/server/.env
KIS_APP_KEY=
KIS_APP_SECRET=
KIS_REST_BASE_URL=
KIS_WEBSOCKET_URL=
KIS_ENVIRONMENT=real   # real | virtual
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
```

```env
# apps/web/.env (선택, 공개 가능한 값만)
VITE_API_BASE_URL=http://localhost:4000
VITE_WEBSOCKET_URL=ws://localhost:4000/ws
```

## 브랜치 & 팀원 역할

| 브랜치 | 담당자 | 작업 내용 |
|---|---|---|
| `feature/kis-auth` | 웅주 (나웅주) | 한국투자증권 인증 — access token, approval key 발급 (`kis/auth.ts`) |
| `feature/backend-websocket` | 수민 (김수민) | 백엔드 WebSocket — KIS 실시간 연결, 재연결, 프론트 중계 서버 (`server.ts`, `kis/websocket.ts`) |
| `feature/realtime-integration` | 수민 | KIS 실시간 데이터 연동 및 파싱 구현 |
| `feature/frontend-backend-integration` | 수민 | 프론트엔드 종목 선택 ↔ 백엔드 실시간 연동 |
| `feature/web-audio` | 수아 (오수아) | 소리화(Sonification) 엔진 — 가격→음높이, 거래량→음량 매핑, 임계치 조정 (`audio/sonification.ts`) |
| `feature/voice-command`, `feature/voice-guidance-fields` | 아형 (이아형) | 음성 명령(STT) 처리, 음성 안내(TTS), 자연어 의도 해석, 상태 표시·오류 처리 (`audio/speech.ts`, `VoiceControls.tsx`) |
| `dev` | 전체 | 기능 브랜치 통합, UI 리디자인, 접근성/문구 정비 |
| `main` | 전체 | 배포 기준 브랜치 |

> 담당자 매핑은 커밋 이력과 [docs/TASKS.md](docs/TASKS.md) 작업 배정표를 기준으로 정리했습니다. 최신 담당/상태는 TASKS.md를 우선합니다.

## 프로젝트 문서

- [파일 및 폴더 역할](docs/FILE_STRUCTURE.md)
- [디자인 시스템](docs/DESIGN.md)
- [개발 규칙](docs/DEVELOPMENT_RULES.md)
- [전체 체크리스트](docs/TEAM_CHECKLIST.md)
- [보안 규칙](docs/SECURITY_RULES.md)
- [한국투자증권 API 연동 기록](docs/API_INTEGRATION.md)
- [작업 배정표](docs/TASKS.md)
