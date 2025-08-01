import Link from "next/link";

export default function AdminDashboardPage() {
  const stats = [
    { title: '총 사용자', value: '1,234', change: '+12%', color: 'blue' },
    { title: '총 상품', value: '856', change: '+5%', color: 'green' },
    { title: '총 주문', value: '2,345', change: '+18%', color: 'purple' },
    { title: '매출액', value: '₩12,345,678', change: '+25%', color: 'red' },
  ];

  const recentOrders = [
    { id: '#12345', customer: '홍길동', amount: '59,900원', status: '배송중' },
    { id: '#12344', customer: '김영희', amount: '129,800원', status: '결제완료' },
    { id: '#12343', customer: '이철수', amount: '89,000원', status: '배송완료' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 관리자 헤더 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">HEBIMALL Admin</h1>
            </div>
            <nav className="flex space-x-8">
              <Link href="/admin/dashboard" className="text-blue-600 font-medium">대시보드</Link>
              <Link href="/admin/users" className="text-gray-600 hover:text-gray-900">사용자 관리</Link>
              <Link href="/admin/products" className="text-gray-600 hover:text-gray-900">상품 관리</Link>
              <Link href="/admin/orders" className="text-gray-600 hover:text-gray-900">주문 관리</Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.title} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`text-${stat.color}-600 text-sm font-medium`}>
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 최근 주문 */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">최근 주문</h2>
            </div>
            <div className="divide-y">
              {recentOrders.map((order) => (
                <div key={order.id} className="p-6 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{order.id}</p>
                    <p className="text-sm text-gray-600">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{order.amount}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      order.status === '배송완료' ? 'bg-green-100 text-green-800' :
                      order.status === '배송중' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t">
              <Link href="/admin/orders" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                모든 주문 보기 →
              </Link>
            </div>
          </div>

          {/* 빠른 작업 */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">빠른 작업</h2>
            </div>
            <div className="p-6 space-y-4">
              <Link href="/admin/products" className="block p-4 border rounded-lg hover:bg-gray-50">
                <h3 className="font-medium text-gray-900">새 상품 등록</h3>
                <p className="text-sm text-gray-600">새로운 상품을 추가합니다</p>
              </Link>
              <Link href="/admin/users" className="block p-4 border rounded-lg hover:bg-gray-50">
                <h3 className="font-medium text-gray-900">사용자 관리</h3>
                <p className="text-sm text-gray-600">회원 정보를 관리합니다</p>
              </Link>
              <Link href="/admin/orders" className="block p-4 border rounded-lg hover:bg-gray-50">
                <h3 className="font-medium text-gray-900">주문 처리</h3>
                <p className="text-sm text-gray-600">주문 상태를 업데이트합니다</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
