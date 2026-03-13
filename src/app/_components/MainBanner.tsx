'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import Link from 'next/link';
import Image from 'next/image';
import styles from './MainBanner.module.css';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

interface BannerSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  modelImage: string;
  backgroundColor: string;
  textColor: 'white' | 'black';
}

const bannerSlides: BannerSlide[] = [
  {
    id: 1,
    title: "3월 신상 입고",
    subtitle: "STYNA",
    description: "봄 시즌에 맞춘 새로운 상품을\n지금 만나보세요",
    buttonText: "신상품 보기",
    buttonLink: "/products",
    modelImage: "/main/banner_main01.png",
    backgroundColor: "#495669",
    textColor: "white"
  },
  {
    id: 2,
    title: "시즌오프 세일",
    subtitle: "STYNA",
    description: "겨울 시즌 상품 정리\n할인가로 만나보세요",
    buttonText: "할인 상품 보기",
    buttonLink: "/main/sale",
    modelImage: "/main/banner_main02.png",
    backgroundColor: "#5b4469",
    textColor: "white"
  },
  {
    id: 3,
    title: "이번 주 인기 상품",
    subtitle: "STYNA",
    description: "고객 리뷰가 많은 상품을\n모아봤습니다",
    buttonText: "인기 상품 보기",
    buttonLink: "/products?sort=bestseller",
    modelImage: "/main/banner_main03.png",
    backgroundColor: "#515c61",
    textColor: "white"
  }
];

export default function MainBanner() {
  return (
    <section className={styles.bannerSection}>
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
          renderBullet: (index, className) => {
            return `<span class="${className} ${styles.paginationBullet}"></span>`;
          },
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        effect="fade"
        fadeEffect={{
          crossFade: true
        }}
        loop={true}
        className={styles.bannerSwiper}
      >
        {bannerSlides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div 
              className={styles.bannerSlide}
              style={{ backgroundColor: slide.backgroundColor }}
            >
              <div className={styles.bannerBackground}>
                <div className={styles.bannerOverlay}></div>
              </div>
              
              <div className={styles.bannerContent}>
                <div className={styles.bannerTextSection}>
                  <div className={styles.bannerText}>
                    <span className={`${styles.bannerSubtitle} ${styles[slide.textColor]}`}>
                      {slide.subtitle}
                    </span>
                    <h1 className={`${styles.bannerTitle} ${styles[slide.textColor]}`}>
                      {slide.title}
                    </h1>
                    <p className={`${styles.bannerDescription} ${styles[slide.textColor]}`}>
                      {slide.description.split('\n').map((line, index) => (
                        <span key={index}>
                          {line}
                          {index < slide.description.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                    <Link href={slide.buttonLink} className={styles.bannerButton}>
                      {slide.buttonText}
                      <span className={styles.buttonArrow}>→</span>
                    </Link>
                  </div>
                </div>
                
                <div className={styles.bannerModelSection}>
                  <div className={styles.bannerModelImage}>
                    <Image
                      src={slide.modelImage}
                      alt={`${slide.title} 모델컷`}
                      fill
                      style={{ objectFit: 'contain' }}
                      priority
                    />
                  </div>
                  {/* 모바일용 버튼 */}
                  <div className={styles.mobileButtonWrapper}>
                    <Link href={slide.buttonLink} className={styles.bannerButtonMobile}>
                      {slide.buttonText}
                      <span className={styles.buttonArrow}>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
        
        {/* Custom Navigation */}
        <div className={styles.swiperButtonPrev}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className={styles.swiperButtonNext}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        {/* Custom Pagination */}
        <div className={styles.swiperPagination}></div>
      </Swiper>
    </section>
  );
}
