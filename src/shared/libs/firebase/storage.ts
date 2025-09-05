import { storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * 상품 이미지를 카테고리별로 구조화된 경로에 업로드합니다
 * 경로: images/{category}/{productId}/{filename}
 */
export const uploadProductImages = async (
  files: File[],
  category: string,
  productId: string,
  onProgress?: (progress: number, fileName: string) => void
): Promise<string[]> => {
  try {
    console.log('📤 Firebase Storage 업로드 시작:', {
      files: files.length,
      category,
      productId
    });

    // Storage 연결 확인
    if (!storage) {
      throw new Error('Firebase Storage가 초기화되지 않았습니다.');
    }

    const uploadPromises = files.map((file, index) => {
      return new Promise<string>((resolve, reject) => {
        // 카테고리를 영어로 변환 (한글 경로 문제 방지)
        const categoryPath = getCategoryPath(category);
        
        // 파일명 생성: timestamp_index_originalName
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${timestamp}_${index}.${fileExtension}`;
        
        // 구조화된 경로: images/{category}/{productId}/{filename}
        const filePath = `images/${categoryPath}/${productId}/${fileName}`;
        
        console.log(`📁 업로드 경로: ${filePath}`);
        
        const storageRef = ref(storage, filePath);
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`📊 업로드 진행률: ${file.name} - ${Math.round(progress)}%`);
            onProgress?.(progress, file.name);
          },
          (error) => {
            console.error(`❌ 이미지 업로드 실패: ${file.name}`, error);
            
            // Firebase Storage 에러 코드별 처리
            switch (error.code) {
              case 'storage/unauthorized':
                reject(new Error('업로드 권한이 없습니다. 관리자에게 문의하세요.'));
                break;
              case 'storage/canceled':
                reject(new Error('업로드가 취소되었습니다.'));
                break;
              case 'storage/quota-exceeded':
                reject(new Error('저장 공간이 부족합니다.'));
                break;
              case 'storage/invalid-format':
                reject(new Error('지원하지 않는 파일 형식입니다.'));
                break;
              case 'storage/object-not-found':
                reject(new Error('파일을 찾을 수 없습니다.'));
                break;
              default:
                reject(new Error(`업로드 중 오류가 발생했습니다: ${error.message}`));
            }
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log(`✅ 업로드 완료: ${file.name} -> ${downloadURL}`);
              resolve(downloadURL);
            } catch (error) {
              console.error(`❌ 다운로드 URL 생성 실패: ${file.name}`, error);
              reject(new Error('업로드 완료 후 URL 생성에 실패했습니다.'));
            }
          }
        );
      });
    });

    const urls = await Promise.all(uploadPromises);
    console.log('✅ 모든 이미지 업로드 완료:', urls.length, '개');
    return urls;
  } catch (error) {
    console.error('❌ 이미지 업로드 중 전체 오류:', error);
    throw error;
  }
};

/**
 * Firebase Storage에서 이미지를 삭제합니다
 */
export const deleteProductImage = async (imageUrl: string): Promise<void> => {
  try {
    console.log('🗑️ Firebase Storage 이미지 삭제 시작:', imageUrl);

    // Storage 연결 확인
    if (!storage) {
      throw new Error('Firebase Storage가 초기화되지 않았습니다.');
    }

    // Firebase Storage URL에서 파일 경로 추출
    const url = new URL(imageUrl);
    const pathname = url.pathname;
    
    console.log('📁 URL 경로 분석:', pathname);
    
    // Firebase Storage URL 패턴 매칭 개선
    // 패턴: /v0/b/{bucket}/o/{encodedPath}
    const match = pathname.match(/\/v0\/b\/[^/]+\/o\/(.+)/);
    if (!match) {
      throw new Error('유효하지 않은 Firebase Storage URL입니다');
    }
    
    const encodedPath = match[1];
    
    // 쿼리 파라미터 제거 (alt=media 등)
    const cleanEncodedPath = encodedPath.split('?')[0];
    
    // URL 디코딩
    const filePath = decodeURIComponent(cleanEncodedPath);
    
    const imageRef = ref(storage, filePath);
    
    await deleteObject(imageRef);
    console.log('✅ 이미지 삭제 완료:', filePath);
    
  } catch (error) {
    console.error('❌ 이미지 삭제 실패:', error);
    
    // Firebase Storage 에러 코드별 처리
    if (error instanceof Error) {
      if (error.message.includes('storage/object-not-found')) {
        console.warn('⚠️ 삭제하려는 파일이 이미 존재하지 않습니다.');
        // 파일이 없어도 UI에서는 성공으로 처리
        return;
      } else if (error.message.includes('storage/unauthorized')) {
        throw new Error('삭제 권한이 없습니다. 관리자에게 문의하세요.');
      } else if (error.message.includes('유효하지 않은')) {
        throw new Error('올바르지 않은 이미지 URL입니다.');
      }
    }
    
    throw new Error(`이미지 삭제 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
};

/**
 * 상품의 모든 이미지를 삭제합니다 (상품 삭제 시 사용)
 */
export const deleteAllProductImages = async (category: string, productId: string): Promise<void> => {
  try {
    const categoryPath = getCategoryPath(category);
    const folderPath = `images/${categoryPath}/${productId}`;
    
    // 폴더 내 모든 파일을 삭제하는 것은 클라이언트에서 직접 할 수 없으므로
    // Firebase Functions를 통해 처리하거나, 개별 이미지 URL을 통해 삭제해야 합니다.
    console.log('상품 폴더 삭제 요청:', folderPath);
    
    // 실제로는 상품 수정 시 기존 이미지 URL 배열을 받아서 개별 삭제해야 합니다.
  } catch (error) {
    console.error('상품 이미지 폴더 삭제 실패:', error);
    throw error;
  }
};

/**
 * 카테고리명을 영어 경로로 변환합니다
 */
const getCategoryPath = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    '상의': 'tops',
    '하의': 'bottoms', 
    '신발': 'shoes',
    '액세서리': 'accessories',
    '가방': 'bags',
    '기타': 'others'
  };
  
  return categoryMap[category] || 'others';
};

/**
 * 영어 경로를 한글 카테고리명으로 변환합니다
 */
export const getCategoryFromPath = (path: string): string => {
  const pathMap: { [key: string]: string } = {
    'tops': '상의',
    'bottoms': '하의',
    'shoes': '신발', 
    'accessories': '액세서리',
    'bags': '가방',
    'others': '기타'
  };
  
  return pathMap[path] || '기타';
};

/**
 * Storage 경로에서 카테고리와 상품 ID를 추출합니다
 */
export const parseStoragePath = (imageUrl: string): { category: string; productId: string } | null => {
  try {
    const url = new URL(imageUrl);
    const pathname = url.pathname;
    
    const match = pathname.match(/\/v0\/b\/[^/]+\/o\/images%2F([^%]+)%2F([^%]+)%2F/);
    if (!match) {
      return null;
    }
    
    const categoryPath = match[1];
    const productId = match[2];
    
    return {
      category: getCategoryFromPath(categoryPath),
      productId
    };
  } catch (error) {
    console.error('Storage 경로 파싱 실패:', error);
    return null;
  }
};

/**
 * 파일 크기를 사람이 읽기 쉬운 형태로 변환합니다
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 이미지 파일인지 확인합니다
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

/**
 * 파일 크기가 제한을 초과하는지 확인합니다
 */
export const isFileSizeExceeded = (file: File, maxSizeMB: number = 5): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size > maxSizeBytes;
};

/**
 * 이미지 파일들의 유효성을 검사합니다
 */
export const validateImageFiles = (files: File[]): { valid: File[]; errors: string[] } => {
  const valid: File[] = [];
  const errors: string[] = [];
  
  files.forEach((file, index) => {
    if (!isImageFile(file)) {
      errors.push(`${file.name}은(는) 이미지 파일이 아닙니다.`);
      return;
    }
    
    if (isFileSizeExceeded(file)) {
      errors.push(`${file.name}의 크기가 5MB를 초과합니다. (${formatFileSize(file.size)})`);
      return;
    }
    
    valid.push(file);
  });
  
  return { valid, errors };
};

/**
 * 이미지 미리보기 URL을 생성합니다
 */
export const createPreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * 미리보기 URL을 해제합니다
 */
export const revokePreviewUrl = (url: string): void => {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};
