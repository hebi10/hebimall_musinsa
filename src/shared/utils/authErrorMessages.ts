export function getErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return '등록되지 않은 이메일입니다.';
    case 'auth/wrong-password':
      return '비밀번호가 올바르지 않습니다.';
    case 'auth/invalid-email':
      return '유효하지 않은 이메일 형식입니다.';
    case 'auth/user-disabled':
      return '비활성화된 계정입니다.';
    case 'auth/too-many-requests':
      return '너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
    case 'auth/network-request-failed':
      return '네트워크 오류가 발생했습니다. 연결을 확인해주세요.';
    case 'auth/invalid-credential':
      return '이메일 또는 비밀번호가 올바르지 않습니다.';
    case 'auth/email-already-in-use':
      return '이미 사용 중인 이메일입니다.';
    case 'auth/weak-password':
      return '비밀번호가 너무 간단합니다. 6자 이상으로 설정해주세요.';
    case 'auth/operation-not-allowed':
      return '이메일/비밀번호 로그인이 비활성화되어 있습니다.';
    case 'auth/popup-closed-by-user':
      return '팝업이 사용자에 의해 닫혔습니다.';
    case 'auth/cancelled-popup-request':
      return '팝업 요청이 취소되었습니다.';
    default:
      return '로그인 중 오류가 발생했습니다. 다시 시도해주세요.';
  }
}
