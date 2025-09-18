import styles from '../terms/page.module.css';

export default function PrivacyPage() {
  return (
    <div className={styles.container}>
      <div className={styles.effectiveDate}>
        시행일자: 2025년 1월 1일
      </div>

      <div className={styles.section}>
        <h1 className={styles.title}>개인정보처리방침</h1>
        
        <div className={styles.important}>
          <strong>중요:</strong> ㈜스티나몰은 개인정보보호법에 따라 이용자의 개인정보 보호 및 권익을 보호하고자 다음과 같은 처리방침을 두고 있습니다.
        </div>

        <div className={styles.article}>
          <div className={styles.articleNumber}>제1조 (개인정보의 처리목적)</div>
          <div className={styles.content}>
            ㈜스티나몰은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
          </div>
          <ul className={styles.list}>
            <li className={styles.listItem}>회원 가입 및 관리</li>
            <li className={styles.listItem}>상품 및 서비스 제공</li>
            <li className={styles.listItem}>고충처리</li>
            <li className={styles.listItem}>마케팅 및 광고에의 활용</li>
          </ul>
        </div>

        <div className={styles.article}>
          <div className={styles.articleNumber}>제2조 (개인정보의 처리 및 보유기간)</div>
          <div className={styles.content}>
            ① ㈜스티나몰은 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
            <br /><br />
            ② 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다:
          </div>
          
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.tableHeader}>개인정보 유형</th>
                  <th className={styles.tableHeader}>보유기간</th>
                  <th className={styles.tableHeader}>근거</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.tableCell}>회원 가입 및 관리</td>
                  <td className={styles.tableCell}>회원 탈퇴 시까지</td>
                  <td className={styles.tableCell}>서비스 이용계약 이행</td>
                </tr>
                <tr>
                  <td className={styles.tableCell}>계약 또는 청약철회 등에 관한 기록</td>
                  <td className={styles.tableCell}>5년</td>
                  <td className={styles.tableCell}>전자상거래법</td>
                </tr>
                <tr>
                  <td className={styles.tableCell}>대금결제 및 재화 등의 공급에 관한 기록</td>
                  <td className={styles.tableCell}>5년</td>
                  <td className={styles.tableCell}>전자상거래법</td>
                </tr>
                <tr>
                  <td className={styles.tableCell}>소비자의 불만 또는 분쟁처리에 관한 기록</td>
                  <td className={styles.tableCell}>3년</td>
                  <td className={styles.tableCell}>전자상거래법</td>
                </tr>
                <tr>
                  <td className={styles.tableCell}>웹사이트 방문기록</td>
                  <td className={styles.tableCell}>3개월</td>
                  <td className={styles.tableCell}>통신비밀보호법</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.article}>
          <div className={styles.articleNumber}>제3조 (개인정보의 수집항목 및 수집방법)</div>
          <div className={styles.content}>
            ① 회사는 다음과 같은 개인정보를 수집하고 있습니다:
          </div>
          
          <div className={styles.subtitle}>■ 회원가입 시 수집하는 필수정보</div>
          <ul className={styles.list}>
            <li className={styles.listItem}>이름, 이메일주소, 비밀번호</li>
            <li className={styles.listItem}>휴대폰번호 (본인인증 시)</li>
          </ul>

          <div className={styles.subtitle}>■ 주문/배송 시 수집하는 정보</div>
          <ul className={styles.list}>
            <li className={styles.listItem}>수령인 정보: 이름, 휴대폰번호, 배송주소</li>
            <li className={styles.listItem}>결제정보: 결제수단 정보</li>
          </ul>

          <div className={styles.subtitle}>■ 서비스 이용과정에서 자동 수집되는 정보</div>
          <ul className={styles.list}>
            <li className={styles.listItem}>IP주소, 쿠키, MAC주소, 서비스 이용기록</li>
            <li className={styles.listItem}>방문일시, 접속 로그, 기기정보</li>
          </ul>
        </div>

        <div className={styles.article}>
          <div className={styles.articleNumber}>제4조 (개인정보의 제3자 제공)</div>
          <div className={styles.content}>
            ① 회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다:
          </div>
          <ul className={styles.list}>
            <li className={styles.listItem}>이용자들이 사전에 동의한 경우</li>
            <li className={styles.listItem}>법령의 규정에 의거하거나, 수사 목적으로 법집행기관이 요구하는 경우</li>
          </ul>

          <div className={styles.content}>
            ② 배송업무 처리를 위한 개인정보 제공:
          </div>
          
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.tableHeader}>제공받는 자</th>
                  <th className={styles.tableHeader}>제공목적</th>
                  <th className={styles.tableHeader}>제공항목</th>
                  <th className={styles.tableHeader}>보유기간</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.tableCell}>배송업체<br/>(CJ대한통운, 롯데택배 등)</td>
                  <td className={styles.tableCell}>상품배송</td>
                  <td className={styles.tableCell}>수령인명, 주소, 연락처</td>
                  <td className={styles.tableCell}>배송완료 후 즉시 파기</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.article}>
          <div className={styles.articleNumber}>제5조 (정보주체의 권리·의무 및 행사방법)</div>
          <div className={styles.content}>
            ① 정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:
          </div>
          <ul className={styles.list}>
            <li className={styles.listItem}>개인정보 처리현황 통지요구</li>
            <li className={styles.listItem}>개인정보 열람요구</li>
            <li className={styles.listItem}>개인정보 정정·삭제요구</li>
            <li className={styles.listItem}>개인정보 처리정지요구</li>
          </ul>

          <div className={styles.content}>
            ② 제1항에 따른 권리 행사는 회사에 대해 개인정보 보호법 시행규칙 별지 제8호 서식에 따라 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 회사는 이에 대해 지체없이 조치하겠습니다.
          </div>
        </div>

        <div className={styles.article}>
          <div className={styles.articleNumber}>제6조 (개인정보의 파기)</div>
          <div className={styles.content}>
            ① 회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
            <br /><br />
            ② 정보주체로부터 동의받은 개인정보 보유기간이 경과하거나 처리목적이 달성되었음에도 불구하고 다른 법령에 따라 개인정보를 계속 보존하여야 하는 경우에는, 해당 개인정보를 별도의 데이터베이스(DB)로 옮기거나 보관장소를 달리하여 보존합니다.
            <br /><br />
            ③ 개인정보 파기의 절차 및 방법은 다음과 같습니다:
          </div>
          <ul className={styles.list}>
            <li className={styles.listItem}><span className={styles.highlight}>파기절차:</span> 회사는 파기 사유가 발생한 개인정보를 선정하고, 회사의 개인정보 보호책임자의 승인을 받아 개인정보를 파기합니다.</li>
            <li className={styles.listItem}><span className={styles.highlight}>파기방법:</span> 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다.</li>
          </ul>
        </div>

        <div className={styles.article}>
          <div className={styles.articleNumber}>제7조 (개인정보 보호책임자)</div>
          <div className={styles.content}>
            ① 회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다:
          </div>
          
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.tableHeader}>구분</th>
                  <th className={styles.tableHeader}>개인정보 보호책임자</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.tableCell}>성명</td>
                  <td className={styles.tableCell}>이프라이버시</td>
                </tr>
                <tr>
                  <td className={styles.tableCell}>직책</td>
                  <td className={styles.tableCell}>개인정보보호팀장</td>
                </tr>
                <tr>
                  <td className={styles.tableCell}>연락처</td>
                  <td className={styles.tableCell}>
                    전화: 1588-1234<br/>
                    이메일: privacy@hebimall.com
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.note}>
          <strong>※ 참고사항:</strong>
          <br />
          • 개인정보 처리방침은 시행일자부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
          <br />
          • 개인정보 관련 문의나 신고가 있으시면 위의 개인정보 보호책임자에게 연락주시기 바랍니다.
        </div>
      </div>
    </div>
  );
}
