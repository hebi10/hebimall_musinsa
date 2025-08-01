import Link from "next/link";
import Button from "../components/common/Button";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* 메인 배너 */}
      <section className="relative h-96 bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            HEBIMALL
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            최신 패션 트렌드를 만나보세요
          </p>
          <Link href="/main/recommend">
            <Button size="lg">
              쇼핑하러 가기
            </Button>
          </Link>
        </div>
      </section>

      {/* 카테고리 섹션 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">인기 카테고리</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Link href="/category/tops" className="group">
            <div className="bg-gray-100 aspect-square rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <span className="text-lg font-medium">상의</span>
            </div>
          </Link>
          <Link href="/category/bottoms" className="group">
            <div className="bg-gray-100 aspect-square rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <span className="text-lg font-medium">하의</span>
            </div>
          </Link>
          <Link href="/category/shoes" className="group">
            <div className="bg-gray-100 aspect-square rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <span className="text-lg font-medium">신발</span>
            </div>
          </Link>
          <Link href="/category/accessories" className="group">
            <div className="bg-gray-100 aspect-square rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <span className="text-lg font-medium">액세서리</span>
            </div>
          </Link>
        </div>
      </section>

      {/* 추천 상품 섹션 */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">추천 상품</h2>
            <Link href="/main/recommend" className="text-gray-600 hover:text-gray-900">
              더보기 →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* 예시 상품 카드들 */}
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow-sm overflow-hidden group cursor-pointer">
                <div className="aspect-square bg-gray-100 group-hover:bg-gray-200 transition-colors"></div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-1">상품명 {item}</h3>
                  <p className="text-sm text-gray-500 mb-2">브랜드명</p>
                  <p className="font-semibold text-gray-900">29,900원</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
