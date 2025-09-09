import { CategoryService } from '@/shared/services/categoryService';

// 카테고리 이름 매핑을 캐시하기 위한 변수
let categoryNamesCache: Record<string, string> | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5분 캐시

/**
 * Firebase에서 카테고리 이름을 동적으로 가져와서 매핑을 생성
 */
export async function getCategoryNames(): Promise<Record<string, string>> {
  const now = Date.now();
  
  // 캐시가 있고 유효하면 캐시된 데이터 반환
  if (categoryNamesCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return categoryNamesCache;
  }

  try {
    const categories = await CategoryService.getCategories();
    const categoryNames: Record<string, string> = {};
    
    categories.forEach(category => {
      if (category.id && category.name) {
        categoryNames[category.id] = category.name;
      }
    });

    // 캐시 업데이트
    categoryNamesCache = categoryNames;
    cacheTimestamp = now;
    
    return categoryNames;
  } catch (error) {
    console.error('카테고리 이름 가져오기 실패:', error);
    
    // 에러 시 기본 매핑 반환
    return getDefaultCategoryNames();
  }
}

/**
 * 특정 카테고리 ID에 대한 이름 반환
 */
export async function getCategoryName(categoryId: string): Promise<string> {
  try {
    const categoryNames = await getCategoryNames();
    return categoryNames[categoryId] || categoryId;
  } catch (error) {
    console.error('카테고리 이름 가져오기 실패:', error);
    return categoryId;
  }
}

/**
 * 기본 카테고리 이름 매핑 (백업용)
 */
export function getDefaultCategoryNames(): Record<string, string> {
  return {
    'accessories': '액세서리',
    'bags': '가방',
    'bottoms': '하의', 
    'shoes': '신발',
    'tops': '상의',
    'clothing': '의류',
    'jewelry': '주얼리',
    'outdoor': '아웃도어',
    'sports': '스포츠'
  };
}

/**
 * 캐시 무효화 (필요시 사용)
 */
export function invalidateCategoryNamesCache(): void {
  categoryNamesCache = null;
  cacheTimestamp = 0;
}

/**
 * 카테고리 ID 배열을 이름 배열로 변환
 */
export async function getCategoryNamesByIds(categoryIds: string[]): Promise<string[]> {
  const categoryNames = await getCategoryNames();
  return categoryIds.map(id => categoryNames[id] || id);
}

/**
 * 카테고리 이름으로 ID 찾기
 */
export async function getCategoryIdByName(categoryName: string): Promise<string | null> {
  const categoryNames = await getCategoryNames();
  const entries = Object.entries(categoryNames);
  const found = entries.find(([id, name]) => name === categoryName);
  return found ? found[0] : null;
}

/**
 * React Hook에서 사용할 수 있는 동기적 카테고리 이름 가져오기
 * (useEffect와 함께 사용)
 */
export function useCategoryNames() {
  return {
    getCategoryNames,
    getCategoryName,
    invalidateCache: invalidateCategoryNamesCache,
    getDefaultNames: getDefaultCategoryNames
  };
}
