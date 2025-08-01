interface CampaignPageProps {
  params: {
    id: string;
  };
}

export default function SpaFestivalPage({ params }: CampaignPageProps) {
  return (
    <div>
      <h1>SPA 페스티벌</h1>
      <p>캠페인 ID: {params.id}</p>
    </div>
  );
}
