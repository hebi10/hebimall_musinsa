import PageHeader from '@/app/_components/PageHeader';

export default function CSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <PageHeader title="고객센터" />
      {children}
    </div>
  );
}
