const fs = require('fs');
const path = require('path');

// 정적 파일들을 out 폴더로 복사
const copyStaticFiles = () => {
  try {
    // favicon.ico 복사
    const faviconSrc = path.join(__dirname, '../public/favicon.ico');
    const faviconDest = path.join(__dirname, '../out/favicon.ico');
    
    if (fs.existsSync(faviconSrc)) {
      fs.copyFileSync(faviconSrc, faviconDest);
      console.log('✅ favicon.ico 복사 완료');
    }

    // 기타 정적 파일들 복사
    const publicDir = path.join(__dirname, '../public');
    const outDir = path.join(__dirname, '../out');
    
    const files = fs.readdirSync(publicDir);
    files.forEach(file => {
      if (file !== 'favicon.ico') { // 이미 복사됨
        const srcPath = path.join(publicDir, file);
        const destPath = path.join(outDir, file);
        
        if (fs.statSync(srcPath).isFile()) {
          fs.copyFileSync(srcPath, destPath);
          console.log(`✅ ${file} 복사 완료`);
        }
      }
    });

  } catch (error) {
    console.error('정적 파일 복사 중 오류:', error);
  }
};

copyStaticFiles();
