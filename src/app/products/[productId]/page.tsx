import Button from "../../../components/common/Button";

interface ProductPageProps {
  params: {
    productId: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 상품 상세 정보 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* 상품 이미지 */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-lg">상품 이미지</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded border-2 border-transparent hover:border-gray-300 cursor-pointer">
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400 text-xs">{i}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 상품 정보 */}
          <div className="space-y-6">
            <div>
              <p className="text-gray-500 mb-2">브랜드명</p>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                상품명 (ID: {params.productId})
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-2xl font-bold text-gray-900">29,900원</span>
                <span className="text-lg text-gray-400 line-through">39,900원</span>
                <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">25%</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>★ 4.5</span>
                <span>(128개 리뷰)</span>
              </div>
            </div>

            {/* 옵션 선택 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">사이즈</label>
                <div className="flex gap-2">
                  {['S', 'M', 'L', 'XL'].map((size) => (
                    <button
                      key={size}
                      className="px-4 py-2 border rounded-lg hover:border-gray-400 focus:border-black focus:ring-1 focus:ring-black"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">색상</label>
                <div className="flex gap-2">
                  {['Black', 'White', 'Gray'].map((color) => (
                    <button
                      key={color}
                      className="px-4 py-2 border rounded-lg hover:border-gray-400 focus:border-black focus:ring-1 focus:ring-black"
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">수량</label>
                <div className="flex items-center border rounded-lg w-32">
                  <button className="p-2 hover:bg-gray-50">-</button>
                  <span className="flex-1 text-center">1</span>
                  <button className="p-2 hover:bg-gray-50">+</button>
                </div>
              </div>
            </div>

            {/* 구매 버튼들 */}
            <div className="space-y-3">
              <Button className="w-full" size="lg">
                장바구니 담기
              </Button>
              <Button variant="secondary" className="w-full" size="lg">
                바로 구매하기
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                ♡ 찜하기
              </Button>
            </div>

            {/* 배송 정보 */}
            <div className="border-t pt-6 space-y-2 text-sm text-gray-600">
              <p>• 무료배송 (3만원 이상 구매시)</p>
              <p>• 평균 2-3일 배송</p>
              <p>• 교환/반품 가능</p>
            </div>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="mt-16 border-t">
          <div className="flex border-b">
            <button className="px-6 py-4 border-b-2 border-black font-medium">상품정보</button>
            <button className="px-6 py-4 text-gray-500 hover:text-gray-700">리뷰 (128)</button>
            <button className="px-6 py-4 text-gray-500 hover:text-gray-700">Q&A (12)</button>
            <button className="px-6 py-4 text-gray-500 hover:text-gray-700">교환/반품</button>
          </div>
          
          <div className="py-8">
            <div className="prose max-w-none">
              <h3>상품 상세 정보</h3>
              <p>이 상품에 대한 자세한 설명이 여기에 들어갑니다.</p>
              <div className="bg-gray-100 p-8 rounded-lg text-center">
                <span className="text-gray-500">상품 상세 이미지 영역</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
