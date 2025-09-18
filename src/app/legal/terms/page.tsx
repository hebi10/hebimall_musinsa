import styles from './page.module.css';

export default function TermsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.effectiveDate}>
        시행일자: 2025년 1월 1일
      </div>

      <div className={styles.section}>
        <h1 className={styles.title}>STYNA 이용약관</h1>
        
        <div className={styles.important}>
          <strong>중요:</strong> 본 약관은 STYNA 서비스 이용에 관한 중요한 법적 문서입니다. 
          서비스를 이용하기 전에 반드시 전체 내용을 숙지하시기 바랍니다.
        </div>

        <div className={styles.article}>
          <div className={styles.articleNumber}>제1조 (목적)</div>
          <div className={styles.content}>
            본 약관은 ㈜스티나몰(이하 "회사")이 운영하는 STYNA 웹사이트 및 모바일 애플리케이션(이하 "서비스")을 
            이용함에 있어 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
          </div>
        </div>

        <div className={styles.article}>
          <div className={styles.articleNumber}>제2조 (정의)</div>
          <div className={styles.content}>
            본 약관에서 사용하는 용어의 정의는 다음과 같습니다:
          </div>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              <span className={styles.highlight}>"서비스"</span>란 회사가 제공하는 STYNA 전자상거래 플랫폼을 의미합니다.
            </li>
            <li className={styles.listItem}>
              <span className={styles.highlight}>"이용자"</span>란 본 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 의미합니다.
            </li>
            <li className={styles.listItem}>
              <span className={styles.highlight}>"회원"</span>이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며 회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 의미합니다.
            </li>
            <li className={styles.listItem}>
              <span className={styles.highlight}>"비회원"</span>이란 회원에 가입하지 않고 회사가 제공하는 서비스를 이용하는 자를 의미합니다.
            </li>
          </ul>
        </div>

        <div className={styles.article}>
          <div className={styles.articleNumber}>제3조 (약관의 효력 및 변경)</div>
          <div className={styles.content}>
            ① 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력을 발생합니다.
            <br /><br />
            ② 회사는 합리적인 사유가 발생할 경우에는 관련 법령에 위배되지 않는 범위에서 본 약관을 변경할 수 있습니다.
            <br /><br />
            ③ 약관이 변경되는 경우 회사는 변경된 약관의 내용과 시행일을 정하여, 그 시행일의 최소 7일 이전부터 시행일 후 상당한 기간 동안 공지하고, 기존 이용자에게는 변경된 약관, 적용일자 및 변경사유를 명시하여 현행 약관과 함께 서비스 초기화면에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다.
          </div>
        </div>

        <div className={styles.article}>
          <div className={styles.articleNumber}>제4조 (회원가입)</div>
          <div className={styles.content}>
            ① 이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로서 회원가입을 신청합니다.
            <br /><br />
            ② 회사는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다:
          </div>
          <ul className={styles.list}>
            <li className={styles.listItem}>가입신청자가 본 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
            <li className={styles.listItem}>실명이 아니거나 타인의 명의를 이용한 경우</li>
            <li className={styles.listItem}>허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우</li>
            <li className={styles.listItem}>이용자의 귀책사유로 인하여 승인이 불가능하거나 기타 규정한 제반 사항을 위반하며 신청하는 경우</li>
          </ul>
        </div>

        <div className={styles.article}>
          <div className={styles.articleNumber}>제5조 (서비스의 제공 및 변경)</div>
          <div className={styles.content}>
            ① 회사는 다음과 같은 업무를 수행합니다:
          </div>
          <ul className={styles.list}>
            <li className={styles.listItem}>상품 정보 제공 및 구매계약의 체결</li>
            <li className={styles.listItem}>구매계약이 체결된 상품의 배송</li>
            <li className={styles.listItem}>기타 회사가 정하는 업무</li>
          </ul>
          <div className={styles.content}>
            ② 회사는 상품의 품절 또는 기술적 사양의 변경 등의 경우에는 장차 체결되는 계약에 의해 제공할 상품의 내용을 변경할 수 있습니다. 이 경우에는 변경된 상품의 내용 및 제공일자를 명시하여 현재의 상품의 내용을 게시한 곳에 즉시 공지합니다.
          </div>
        </div>

        <div className={styles.article}>
          <div className={styles.articleNumber}>제6조 (서비스의 중단)</div>
          <div className={styles.content}>
            ① 회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.
            <br /><br />
            ② 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 이용자 또는 제3자가 입은 손해에 대하여 회사는 배상하지 않습니다. 단, 회사가 고의 또는 중과실인 경우에는 그러하지 아니합니다.
          </div>
        </div>

        <div className={styles.article}>
          <div className={styles.articleNumber}>제7조 (구매신청 및 개인정보 제공 동의 등)</div>
          <div className={styles.content}>
            ① 이용자는 회사상에서 다음 또는 이와 유사한 방법에 의하여 구매를 신청하며, 회사는 이용자가 구매신청을 함에 있어서 다음의 각 내용을 알기 쉽게 제공하여야 합니다:
          </div>
          
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.tableHeader}>구매 단계</th>
                  <th className={styles.tableHeader}>제공 정보</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.tableCell}>상품 정보 검색 및 선택</td>
                  <td className={styles.tableCell}>상품의 상세 정보, 가격, 배송정보</td>
                </tr>
                <tr>
                  <td className={styles.tableCell}>주문서 작성</td>
                  <td className={styles.tableCell}>받는 사람 정보, 결제수단 선택</td>
                </tr>
                <tr>
                  <td className={styles.tableCell}>구매신청 확인</td>
                  <td className={styles.tableCell}>구매신청의 확인 또는 회사의 확인에 대한 거부</td>
                </tr>
                <tr>
                  <td className={styles.tableCell}>결제</td>
                  <td className={styles.tableCell}>결제수단의 선택</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.note}>
          <strong>※ 참고사항:</strong>
          <br />
          • 본 약관의 전체 내용은 회원가입 시 및 서비스 이용 중 언제든지 확인하실 수 있습니다.
          <br />
          • 약관에 대한 문의사항이 있으시면 고객센터(1588-1234)로 연락주시기 바랍니다.
          <br />
          • 본 약관은 대한민국법에 의해 규율되며, 서비스 관련 분쟁은 회사 소재지 관할법원에서 해결합니다.
        </div>
      </div>
    </div>
  );
}
