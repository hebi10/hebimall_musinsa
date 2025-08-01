interface NoticePageProps {
  params: {
    noticeId: string;
  };
}

export default function NoticePage({ params }: NoticePageProps) {
  return (
    <div>
      <h1>공지사항 상세</h1>
      <p>공지사항 ID: {params.noticeId}</p>
    </div>
  );
}
