interface CampaignPageProps {
  params: {
    id: string;
  };
}

export default function AdidasSummerweekPage({ params }: CampaignPageProps) {
  return (
    <div>
      <h1>아디다스 썸머위크</h1>
      <p>캠페인 ID: {params.id}</p>
    </div>
  );
}
