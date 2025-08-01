import PageHeader from "../../../components/common/PageHeader";
import Button from "../../../components/common/Button";

export default function CartPage() {
  const cartItems = [
    {
      id: '1',
      name: '오버핏 후드 티셔츠',
      brand: 'HEBIMALL',
      size: 'L',
      color: 'Black',
      price: 29900,
      quantity: 2,
      image: null,
    },
    {
      id: '2',
      name: '슬림핏 청바지',
      brand: 'DENIM BRAND',
      size: '32',
      color: 'Dark Blue',
      price: 79900,
      quantity: 1,
      image: null,
    },
  ];

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = totalPrice >= 30000 ? 0 : 2500;
  const finalPrice = totalPrice + deliveryFee;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="장바구니" 
        description="선택한 상품들을 확인하세요"
        breadcrumb={[
          { label: '홈', href: '/' },
          { label: '장바구니' }
        ]}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 장바구니 상품 목록 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">장바구니 상품 ({cartItems.length}개)</h2>
                  <button className="text-sm text-gray-500 hover:text-gray-700">전체 삭제</button>
                </div>
              </div>
              
              <div className="divide-y">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-6 flex items-center">
                    <input type="checkbox" className="mr-4" defaultChecked />
                    
                    <div className="w-20 h-20 bg-gray-100 rounded-lg mr-4 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">이미지</span>
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">{item.brand}</p>
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        {item.size} / {item.color}
                      </p>
                      <p className="font-semibold text-gray-900 mt-1">
                        {item.price.toLocaleString()}원
                      </p>
                    </div>
                    
                    <div className="flex items-center border rounded-lg">
                      <button className="p-2 hover:bg-gray-50">-</button>
                      <span className="px-4 py-2">{item.quantity}</span>
                      <button className="p-2 hover:bg-gray-50">+</button>
                    </div>
                    
                    <button className="ml-4 text-gray-400 hover:text-gray-600">×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 주문 요약 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">주문 요약</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>상품금액</span>
                  <span>{totalPrice.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span>배송비</span>
                  <span>{deliveryFee === 0 ? '무료' : `${deliveryFee.toLocaleString()}원`}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                  <span>총 결제금액</span>
                  <span className="text-blue-600">{finalPrice.toLocaleString()}원</span>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <Button className="w-full" size="lg">
                  주문하기
                </Button>
                <Button variant="outline" className="w-full">
                  쇼핑 계속하기
                </Button>
              </div>
              
              {totalPrice < 30000 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-600">
                  {(30000 - totalPrice).toLocaleString()}원 더 구매하시면 무료배송!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
