# 한국투자증권 API 연동 기록

실제 키 값은 이 문서에 작성하지 않는다.

## 사용 환경

- [ ] 실전투자
- [ ] 모의투자

## 서버 환경변수

```env
KIS_APP_KEY=
KIS_APP_SECRET=
KIS_REST_BASE_URL=
KIS_WEBSOCKET_URL=
KIS_ENVIRONMENT=real
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
```

## 프론트엔드 환경변수

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_WEBSOCKET_URL=ws://localhost:4000/ws
```

프론트엔드 환경변수에는 비밀정보를 넣지 않는다.

## 인증 흐름

```text
apps/server/.env에 인증정보 저장
서버에서 access token 요청
서버에서 approval key 요청
서버에서 한국투자증권 실시간 WebSocket 연결
서버에서 종목 구독 요청
체결정보 수신
RealtimeTrade로 변환
프론트엔드 /ws로 전달
```

## RealtimeTrade 구조

프론트엔드와 서버는 같은 필드 구조를 유지한다.

| 필드 | 설명 |
|---|---|
| `symbol` | 종목코드 |
| `stockName` | 종목명 |
| `tradeTime` | 체결시각 |
| `currentPrice` | 현재가 |
| `changePrice` | 전일 대비 가격 |
| `changeRate` | 전일 대비 등락률 |
| `tradeVolume` | 체결량 |
| `accumulatedVolume` | 누적거래량 |
| `receivedAt` | 서버 수신 시각 |

## 필드 매핑 기록

공식 문서 확인 전에는 원본 필드명을 확정하지 않는다.

| 우리 필드 | 한국투자증권 원본 필드 | 확인 여부 |
|---|---|---|
| `symbol` | 미확인 | [ ] |
| `stockName` | 미확인 | [ ] |
| `tradeTime` | 미확인 | [ ] |
| `currentPrice` | 미확인 | [ ] |
| `changePrice` | 미확인 | [ ] |
| `changeRate` | 미확인 | [ ] |
| `tradeVolume` | 미확인 | [ ] |
| `accumulatedVolume` | 미확인 | [ ] |

## 테스트 기록

| 날짜 | 담당자 | 환경 | 종목 | 연결 성공 | 데이터 수신 | 오류 |
|---|---|---|---|---|---|---|
| 미정 | 미정 | 미정 | 미정 | [ ] | [ ] | 미정 |

