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
  backgroundImage: string;
  modelImage: string;
  backgroundColor: string;
  textColor: 'white' | 'black';
}

const bannerSlides: BannerSlide[] = [
  {
    id: 1,
    title: "STYNA",
    subtitle: "NEW SEASON",
    description: "최신 패션 트렌드를 만나보세요\n특별한 스타일, 특별한 가격",
    buttonText: "쇼핑하러 가기",
    buttonLink: "/products",
    backgroundImage: "/tshirt-1.jpg",
    modelImage: "/main/banner_main01.png",
    backgroundColor: "#525d6dff",
    textColor: "white"
  },
  {
    id: 2,
    title: "SPRING COLLECTION",
    subtitle: "UP TO 70% OFF",
    description: "봄 신상품 특가 세일\n지금 놓치면 후회하는 기회",
    buttonText: "세일 상품 보기",
    buttonLink: "/main/sale",
    backgroundImage: "/shirt-2.jpg",
    modelImage: "/main/banner_main02.png",
    backgroundColor: "#614f6dff",
    textColor: "white"
  },
  {
    id: 3,
    title: "PREMIUM QUALITY",
    subtitle: "BEST SELLER",
    description: "검증된 베스트셀러\n고객 만족도 98%의 상품들",
    buttonText: "베스트 상품 보기",
    buttonLink: "/products?sort=bestseller",
    backgroundImage: "/product-placeholder.jpg",
    modelImage: "/main/banner_main03.png",
    backgroundColor: "#515c61ff",
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
                <Image
                  src={slide.backgroundImage}
                  alt={slide.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                />
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
