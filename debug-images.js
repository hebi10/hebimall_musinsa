// 브라우저 개발자 도구 콘솔에서 실행할 수 있는 테스트 코드
// 이 코드를 콘솔에 복사-붙여넣기 하면 현재 주문 데이터를 확인할 수 있습니다.

console.log('=== 주문 목록 이미지 디버깅 ===');

// 1. 현재 페이지에 표시된 모든 상품 이미지 확인
const productImages = document.querySelectorAll('.productImg, .productImage img');
console.log('페이지에서 찾은 상품 이미지 개수:', productImages.length);

productImages.forEach((img, index) => {
  console.log(`이미지 ${index + 1}:`, {
    src: img.src,
    alt: img.alt,
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
    complete: img.complete,
    loaded: img.naturalWidth > 0
  });
});

// 2. public 폴더의 이미지들이 접근 가능한지 테스트
const testImages = [
  '/tshirt-1.jpg',
  '/shirt-2.jpg', 
  '/product-placeholder.jpg',
  '/placeholder-image.svg'
];

console.log('=== 테스트 이미지 접근성 확인 ===');
testImages.forEach(imagePath => {
  const testImg = new Image();
  testImg.onload = () => console.log('✅ 접근 가능:', imagePath);
  testImg.onerror = () => console.log('❌ 접근 불가:', imagePath);
  testImg.src = imagePath;
});

// 3. 현재 주문 데이터 구조 확인 (React DevTools 필요)
if (window.React) {
  console.log('React 감지됨 - 컴포넌트 데이터를 확인하세요');
} else {
  console.log('로컬 스토리지나 세션 데이터 확인...');
}

// 4. 임시 이미지 테스트
console.log('=== 임시 이미지 테스트 ===');
const testContainer = document.createElement('div');
testContainer.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 9999; background: white; padding: 10px; border: 1px solid #ccc;';

testImages.forEach(imagePath => {
  const img = document.createElement('img');
  img.src = imagePath;
  img.style.cssText = 'width: 50px; height: 50px; margin: 5px; border: 1px solid #ddd;';
  img.title = imagePath;
  testContainer.appendChild(img);
});

document.body.appendChild(testContainer);
console.log('화면 우측 상단에 테스트 이미지들이 표시됩니다');

// 5초 후 테스트 컨테이너 제거
setTimeout(() => {
  document.body.removeChild(testContainer);
  console.log('테스트 이미지 제거됨');
}, 5000);