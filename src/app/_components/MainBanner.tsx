'use client';

import { useState } from 'react';
import type { Swiper as SwiperInstance } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import Link from 'next/link';
import Image from 'next/image';
import styles from './MainBanner.module.css';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

interface BannerSlide {
  id: number;
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  primaryLink: string;
  secondaryLabel: string;
  secondaryLink: string;
  image: string;
  imagePosition?: string;
  meta: string[];
}

const bannerSlides: BannerSlide[] = [
  {
    id: 1,
    eyebrow: 'STYNA',
    title: '시즌오프 세일',
    description:
      '겨울 시즌 상품 정리. 할인 상품을 먼저 확인하세요.',
    primaryLabel: '할인 상품 보기',
    primaryLink: '/main/sale',
    secondaryLabel: '전체상품',
    secondaryLink: '/products',
    image: '/main/hero_editorial_outer_fixed.webp',
    imagePosition: 'center top',
    meta: ['Up to 70%', 'Outer', 'Daily wear'],
  },
  {
    id: 2,
    eyebrow: 'New arrivals',
    title: '신상품 업데이트',
    description:
      '최근 등록된 상품을 빠르게 확인하고 새 스타일을 비교해보세요.',
    primaryLabel: '신상품 보기',
    primaryLink: '/recommend?filter=new',
    secondaryLabel: '카테고리',
    secondaryLink: '/products',
    image: '/main/hero_editorial_sale_fixed.webp',
    imagePosition: 'center top',
    meta: ['New', 'Weekly update', 'STYNA'],
  },
  {
    id: 3,
    eyebrow: 'Best ranking',
    title: '베스트셀러',
    description:
      '리뷰와 구매 반응이 좋은 상품을 순위로 확인하세요.',
    primaryLabel: '베스트 보기',
    primaryLink: '/recommend?filter=review',
    secondaryLabel: '랭킹 보기',
    secondaryLink: '/recommend?filter=review',
    image: '/main/hero_editorial_best_fixed.webp',
    imagePosition: 'center top',
    meta: ['Ranking', 'Review', 'Bestseller'],
  },
];

export default function MainBanner() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className={styles.bannerSection}>
      <div className={styles.bannerFrame}>
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          spaceBetween={0}
          slidesPerView={1}
          navigation={{
            nextEl: `.${styles.swiperButtonNext}`,
            prevEl: `.${styles.swiperButtonPrev}`,
          }}
          pagination={{
            el: `.${styles.swiperPagination}`,
            clickable: true,
            renderBullet: (index, className) =>
              `<span class="${className} ${styles.paginationBullet}"></span>`,
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          effect="fade"
          fadeEffect={{
            crossFade: true,
          }}
          speed={900}
          loop={true}
          onSlideChange={(swiper: SwiperInstance) =>
            setActiveIndex(swiper.realIndex)
          }
          className={styles.bannerSwiper}
        >
          {bannerSlides.map((slide, index) => (
            <SwiperSlide key={slide.id}>
              <div className={styles.bannerSlide}>
                <Image
                  src={slide.image}
                  alt={`${slide.title} 배너 이미지`}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className={styles.bannerBackground}
                  style={{ objectPosition: slide.imagePosition ?? 'center center' }}
                />
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
            </SwiperSlide>
          ))}

          <div className={styles.controlBar}>
            <div className={styles.controlCounter}>
              <strong>{String(activeIndex + 1).padStart(2, '0')}</strong>
              <span>/ {String(bannerSlides.length).padStart(2, '0')}</span>
            </div>

            <div className={styles.controlCenter}>
              <div className={styles.swiperPagination}></div>
            </div>

            <div className={styles.controlButtons}>
              <button
                type="button"
                className={styles.swiperButtonPrev}
                aria-label="이전 슬라이드"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                className={styles.swiperButtonNext}
                aria-label="다음 슬라이드"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </Swiper>
      </div>
    </section>
  );
}
