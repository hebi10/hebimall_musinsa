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
  backgroundColor: string;
  meta: string[];
}

const bannerSlides: BannerSlide[] = [
  {
    id: 1,
    eyebrow: '봄 메인 셀렉션',
    title: '가볍게 걸치는 간절기 아우터',
    description:
      '지금 입기 좋은 트렌치, 재킷, 셔츠 아우터를 메인 셀렉션으로 묶어 한 번에 볼 수 있게 정리했습니다.',
    primaryLabel: '신상품 보러가기',
    primaryLink: '/products?sort=newest',
    secondaryLabel: '추천 상품 보기',
    secondaryLink: '/recommend',
    image: '/main/banner_main01.png',
    imagePosition: 'center center',
    backgroundColor: 'linear-gradient(135deg, var(--hero-one) 0%, #3f3732 100%)',
    meta: ['신상 업데이트', '가벼운 레이어드', '빠른 출고'],
  },
  {
    id: 2,
    eyebrow: '시즌오프 세일',
    title: '에센셜 라인 시즌 세일',
    description:
      '데일리로 오래 입을 수 있는 니트, 팬츠, 가방만 골라 이번 시즌 세일 구간으로 다시 구성했습니다.',
    primaryLabel: '세일 상품 보기',
    primaryLink: '/main/sale',
    secondaryLabel: '전체 상품 보기',
    secondaryLink: '/products',
    image: '/main/banner_main02.png',
    imagePosition: 'center center',
    backgroundColor: 'linear-gradient(135deg, var(--hero-two) 0%, #453533 100%)',
    meta: ['최대 30% 할인', '선별 상품', '한정 수량'],
  },
  {
    id: 3,
    eyebrow: '베스트 랭킹',
    title: '리뷰로 검증된 이번 주 인기 상품',
    description:
      '구매 반응이 빠르게 이어지는 베스트셀러만 따로 모아 메인에서 바로 비교하고 살펴볼 수 있게 준비했습니다.',
    primaryLabel: '베스트 보기',
    primaryLink: '/products?sort=bestseller',
    secondaryLabel: '랭킹 구간 이동',
    secondaryLink: '/#best-ranking',
    image: '/main/banner_main03.png',
    imagePosition: 'center center',
    backgroundColor: 'linear-gradient(135deg, var(--hero-three) 0%, #323836 100%)',
    meta: ['리뷰 상위', '재구매 다수', '주간 업데이트'],
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
              <div
                className={styles.bannerSlide}
                style={{ background: slide.backgroundColor }}
              >
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

                  <div className={styles.visualPanel}>
                    <div className={styles.bannerModelImage}>
                      <Image
                        src={slide.image}
                        alt={`${slide.title} 배너 이미지`}
                        fill
                        priority={index === 0}
                        sizes="(max-width: 768px) 88vw, 44vw"
                        style={{
                          objectFit: 'contain',
                          objectPosition: slide.imagePosition ?? 'center center',
                        }}
                      />
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
