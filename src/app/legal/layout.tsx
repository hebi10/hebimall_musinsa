import PageHeader from '@/app/_components/PageHeader';

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <PageHeader title="회사정보" />
      {children}
    </div>
  );
}
