# 청렴 신고 사건 조회 정적 웹페이지

## 구성
- `index.html`: 신고유형·처리상태 필터, 검색, 사건 카드, 결과 건수 및 행정안전부 RSS 표시
- `cases.json`: 신고일자·신고유형·지역·처리상태 필드만 포함
- `vercel.json`: Vercel 정적 배포 설정

## 배포
Vercel 대시보드에서 이 저장소를 Import하고 Framework Preset을 Other로 선택하세요. Build Command는 비워 두고 Root Directory는 저장소 루트로 설정한 후 Deploy를 실행합니다.

## RSS
행정안전부 공식 RSS: https://www.korea.kr/rss/dept_mois.xml
브라우저에서 표시하기 위해 공개 RSS-to-JSON 변환 API를 사용합니다. 외부 API 장애나 CORS 제한 시 공식 RSS 링크로 확인할 수 있습니다.

## 공개 전 필수 확인
이 저장소는 Public으로 설정되어 있습니다. 신고 사건 데이터는 실제 민원·신고 정보가 아니더라도 공개 권한, 개인정보 및 재식별 위험을 검토한 뒤 배포해야 합니다. 화면에 요청된 네 필드만 표시하도록 구성했지만 날짜·지역·유형·상태의 조합 역시 특정 사건 추정에 이용될 수 있습니다.
