'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './MainBanner.module.css';

interface BannerSlide {
  id: number;
  tone: 'outer' | 'new' | 'best';
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  primaryLink: string;
  secondaryLabel: string;
  secondaryLink: string;
  image: string;
  mobileImage?: string;
  imagePosition?: string;
  meta: string[];
}

const SLIDE_DELAY_MS = 5000;

const bannerSlides: BannerSlide[] = [
  {
    id: 1,
    tone: 'outer',
    eyebrow: '시즌 기획전',
    title: '아우터와 니트 할인',
    description:
      '겨울 상품과 데일리웨어를 할인 혜택과 함께 확인하세요.',
    primaryLabel: '할인 상품 보기',
    primaryLink: '/main/sale',
    secondaryLabel: '전체 상품',
    secondaryLink: '/products',
    image: '/main/hero_editorial_outer_fixed.webp',
    mobileImage: '/main/hero_editorial_outer_mobile.webp',
    imagePosition: 'center top',
    meta: ['아우터 할인', '니트 신상품', '시즌오프'],
  },
  {
    id: 2,
    tone: 'new',
    eyebrow: '신상품 업데이트',
    title: '이번 주 새 상품',
    description:
      '최근 등록된 의류와 잡화 상품을 카테고리별로 살펴보세요.',
    primaryLabel: '신상품 보기',
    primaryLink: '/recommend?filter=new',
    secondaryLabel: '카테고리 보기',
    secondaryLink: '/products',
    image: '/main/hero_editorial_sale_fixed.webp',
    mobileImage: '/main/hero_editorial_sale_mobile.webp',
    imagePosition: 'center top',
    meta: ['주간 업데이트', '의류/잡화', '신상품'],
  },
  {
    id: 3,
    tone: 'best',
    eyebrow: '베스트 상품',
    title: '많이 찾는 상품',
    description:
      '리뷰와 구매 반응이 좋은 상품을 한 번에 비교해보세요.',
    primaryLabel: '베스트 보기',
    primaryLink: '/recommend?filter=review',
    secondaryLabel: '리뷰 랭킹',
    secondaryLink: '/recommend?filter=review',
    image: '/main/hero_editorial_best_fixed.webp',
    mobileImage: '/main/hero_editorial_best_mobile.webp',
    imagePosition: 'center top',
    meta: ['리뷰 많은 상품', '판매 인기', '랭킹'],
  },
];

export default function MainBanner() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % bannerSlides.length);
    }, SLIDE_DELAY_MS);

    return () => window.clearInterval(timer);
  }, []);

  const showPrevious = () => {
    setActiveIndex((index) => (index - 1 + bannerSlides.length) % bannerSlides.length);
  };

  const showNext = () => {
    setActiveIndex((index) => (index + 1) % bannerSlides.length);
  };

  return (
    <section className={styles.bannerSection}>
      <div className={styles.bannerFrame}>
        <div className={styles.bannerCarousel}>
          {bannerSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`${styles.bannerSlide} ${index === activeIndex ? styles.activeSlide : ''}`}
              data-tone={slide.tone}
              aria-hidden={index !== activeIndex}
            >
              <Image
                src={slide.image}
                alt={`${slide.title} 배너 이미지`}
                fill
                priority={index === 0}
                sizes="100vw"
                className={`${styles.bannerBackground} ${styles.desktopBackground}`}
                style={{ objectPosition: slide.imagePosition ?? 'center center' }}
              />
              {slide.mobileImage && (
                <Image
                  src={slide.mobileImage}
                  alt=""
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className={`${styles.bannerBackground} ${styles.mobileBackground}`}
                  aria-hidden="true"
                />
              )}
              <div className={styles.bannerBackdrop}></div>

              <div className={styles.bannerContent}>
                <div className={styles.copyPanel}>
                  <div className={styles.copyHeader}>
                    <span className={styles.bannerEyebrow}>{slide.eyebrow}</span>
                    <span className={styles.bannerCounterMobile}>
                      {String(slide.id).padStart(2, '0')}
                    </span>
                  </div>

                  <h1 className={styles.bannerTitle}>{slide.title}</h1>
                  <p className={styles.bannerDescription}>{slide.description}</p>

                  <div className={styles.bannerMetaList}>
                    {slide.meta.map((item) => (
                      <span key={item} className={styles.bannerMetaItem}>
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className={styles.bannerActions}>
                    <Link href={slide.primaryLink} className={styles.primaryAction}>
                      {slide.primaryLabel}
                      <span className={styles.buttonArrow}>→</span>
                    </Link>
                    <Link
                      href={slide.secondaryLink}
                      className={styles.secondaryAction}
                    >
                      {slide.secondaryLabel}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className={styles.controlBar}>
            <div className={styles.controlCounter}>
              <strong>{String(activeIndex + 1).padStart(2, '0')}</strong>
              <span>/ {String(bannerSlides.length).padStart(2, '0')}</span>
            </div>

            <div className={styles.controlCenter}>
              <div className={styles.pagination}>
                {bannerSlides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    className={`${styles.paginationBullet} ${index === activeIndex ? styles.activeBullet : ''}`}
                    onClick={() => setActiveIndex(index)}
                    aria-label={`${slide.id}번 배너 보기`}
                    aria-current={index === activeIndex}
                  />
                ))}
              </div>
            </div>

            <div className={styles.controlButtons}>
              <button
                type="button"
                className={styles.navButton}
                aria-label="이전 배너"
                onClick={showPrevious}
              >
                ‹
              </button>
              <button
                type="button"
                className={styles.navButton}
                aria-label="다음 배너"
                onClick={showNext}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
