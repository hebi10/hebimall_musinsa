"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/authProvider";
import { useCartItemCount } from "@/shared/hooks/useCart";
import styles from "./Header.module.css";
import { useCategories } from '@/context/categoryProvider';

export default function Header() {
  const { user, isAdmin, logout } = useAuth();
  const { data: cartItemCount = 0 } = useCartItemCount(user?.uid || null);
  const { categories, loading: categoriesLoading } = useCategories();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 컴포넌트 마운트 확인
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // SSR 안전한 장바구니 카운트 표시
  const safeCartItemCount = isMounted ? cartItemCount : 0;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.headerContent}>
          {/* 로고 */}
          <div className={styles.logo}>
            <Link href="/" className={styles.logoLink}>
              HEBIMALL
            </Link>
          </div>

          {/* 햄버거 메뉴 버튼 (모바일) */}
          <button
            className={styles.mobileMenuButton}
            onClick={toggleMobileMenu}
            aria-label="메뉴"
          >
            <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.line1Active : ''}`}></span>
            <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.line2Active : ''}`}></span>
            <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.line3Active : ''}`}></span>
          </button>

          {/* 네비게이션 (데스크톱) */}
          <nav className={styles.nav}>
            <div className={styles.navList}>
              <Link href="/products" className={styles.navLink}>
                전체상품
              </Link>
              
              {/* 카테고리 드롭다운 */}
              <div 
                className={styles.categoryDropdown}
                onMouseEnter={() => setIsCategoryOpen(true)}
                onMouseLeave={() => setIsCategoryOpen(false)}
              >
                <Link href="/categories" className={styles.navLink}>
                  카테고리
                </Link>
                {isCategoryOpen && !categoriesLoading && categories.length > 0 && (
                  <div className={styles.dropdownMenu}>
                    {categories.map((category) => (
                      category?.id ? (
                        <Link
                          key={category.id}
                          href={`/categories/${category.id}`}
                          className={styles.dropdownItem}
                        >
                          {category.icon && <span className={styles.categoryIcon}>{category.icon}</span>}
                          {category.name}
                        </Link>
                      ) : null
                    ))}
                  </div>
                )}
              </div>
              <Link href="/recommend" className={styles.navLink}>
                추천
              </Link>
              <Link href="/events" className={styles.navLink}>
                이벤트
              </Link>
              <Link href="/reviews" className={styles.navLink}>
                리뷰
              </Link>
              <Link href="/main/sale" className={styles.navLink}>
                세일
              </Link>
              <Link href="/cs/inquiry" className={styles.navLink}>
                1:1문의
              </Link>
              <Link href="/qna" className={styles.navLink}>
                QnA
              </Link>
            </div>
          </nav>

          {/* 사용자 메뉴 (데스크톱) */}
          <div className={styles.userMenu}>
            <Link href="/search" className={styles.userLink}>
              검색
            </Link>
            <Link href="/orders/cart" className={styles.userLink}>
              장바구니
              {safeCartItemCount > 0 && (
                <span className={styles.cartBadge}>{safeCartItemCount}</span>
              )}
            </Link>
            {user && (
              <Link href="/mypage" className={styles.userLink}>마이페이지</Link>
            )}
            {!user && (
              <Link href="/auth/login" className={styles.userLink}>로그인</Link>
            )}
            {isAdmin && (
              <Link href="/admin" className={styles.userLink}>Admin</Link>
            )}
          </div>
        </div>

        {/* 모바일 메뉴 */}
        <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
          <div className={styles.mobileMenuContent}>
            {/* 카테고리 */}
            <div className={styles.mobileCategory}>
              <h3 className={styles.mobileCategoryTitle}>카테고리</h3>
              <div className={styles.mobileCategoryList}>
                {!categoriesLoading && categories.length > 0 && categories.map((category) => (
                  category?.id ? (
                    <Link
                      key={category.id}
                      href={`/categories/${category.id}`}
                      className={styles.mobileCategoryItem}
                      onClick={closeMobileMenu}
                    >
                      {category.icon && <span className={styles.categoryIcon}>{category.icon}</span>}
                      {category.name}
                    </Link>
                  ) : null
                ))}
                {categoriesLoading && (
                  <div className={styles.loadingText}>카테고리 로딩 중...</div>
                )}
                {!categoriesLoading && categories.length === 0 && (
                  <div className={styles.loadingText}>카테고리를 불러올 수 없습니다.</div>
                )}
              </div>
            </div>

            {/* 메인 네비게이션 */}
            <div className={styles.mobileNavList}>
              <Link href="/products" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                전체상품
              </Link>
              <Link href="/categories" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                카테고리
              </Link>
              <Link href="/recommend" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                추천
              </Link>
              <Link href="/events" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                이벤트
              </Link>
              <Link href="/reviews" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                리뷰
              </Link>
              <Link href="/main/sale" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                세일
              </Link>
              <Link href="/cs/inquiry" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                1:1문의
              </Link>
              <Link href="/qna" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                QnA
              </Link>
            </div>

            {/* 사용자 메뉴 */}
            <div className={styles.mobileUserMenu}>
              <Link href="/search" className={styles.mobileUserLink} onClick={closeMobileMenu}>
                검색
              </Link>
              <Link href="/orders/cart" className={styles.mobileUserLink} onClick={closeMobileMenu}>
                장바구니
                {safeCartItemCount > 0 && (
                  <span className={styles.cartBadge}>{safeCartItemCount}</span>
                )}
              </Link>
              {user && (
                <Link href="/mypage" className={styles.mobileUserLink} onClick={closeMobileMenu}>마이페이지</Link>
              )}
              {!user && (
                <Link href="/auth/login" className={styles.mobileUserLink} onClick={closeMobileMenu}>로그인</Link>
              )}
              {isAdmin && (
                <Link href="/admin" className={styles.mobileUserLink} onClick={closeMobileMenu}>Admin</Link>
              )}
              {user && (
                <button
                  className={styles.menuItem}
                  onClick={logout}
                >
                  로그아웃
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 모바일 메뉴 오버레이 */}
        {isMobileMenuOpen && (
          <div className={styles.mobileMenuOverlay} onClick={closeMobileMenu}></div>
        )}
      </div>
    </header>
  );
}
