'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MainBannerContent, SiteContentService } from '@/shared/services/siteContentService';
import styles from './MainBanner.module.css';

type BannerSlideStyle = CSSProperties & {
  '--banner-image-position': string;
  '--banner-image-position-tablet': string;
  '--banner-image-position-mobile': string;
};

const SLIDE_DELAY_MS = 4500;

const fallbackSlides: MainBannerContent[] = [
  {
    id: 'event-2026-06-midyear-sale',
    eyebrow: '오늘 마감',
    title: '상반기 베스트 최대 60%',
    description: '인기 아이템을 가장 강한 혜택으로 정리한 마지막 하루입니다.',
    ctaLabel: '미드이어 세일 보기',
    href: '/events/event-2026-06-midyear-sale',
    image: '/main/main_event_midyear_sale.webp',
    backgroundColor: '#c9c0b3',
    order: 1,
  },
  {
    id: 'event-2026-07-vacation-coupon',
    eyebrow: '7월 쿠폰팩',
    title: '휴가룩 쿠폰 3종',
    description: '상의, 하의, 아우터까지 여름 준비에 바로 쓰는 쿠폰 혜택입니다.',
    ctaLabel: '쿠폰팩 보기',
    href: '/events/event-2026-07-vacation-coupon',
    image: '/main/main_event_vacation_coupon.webp',
    backgroundColor: '#d4c4ad',
    order: 2,
  },
  {
    id: 'event-2026-07-cool-touch',
    eyebrow: '한여름 데일리 세일',
    title: '쿨터치 최대 35%',
    description: '더운 날에도 편하게 입는 시원한 소재 아이템을 모았습니다.',
    ctaLabel: '쿨터치 세일 보기',
    href: '/events/event-2026-07-cool-touch',
    image: '/main/main_event_cool_touch.webp',
    backgroundColor: '#b9c8cf',
    order: 3,
  },
];

export default function MainBanner() {
  const [slides, setSlides] = useState<MainBannerContent[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [rotationKey, setRotationKey] = useState(0);

  useEffect(() => {
    SiteContentService.getMainBanners()
      .then((nextSlides) => {
        setSlides(nextSlides.length > 0 ? nextSlides : fallbackSlides);
        setActiveIndex(0);
      })
      .catch((error) => {
        console.error('메인 배너 조회 실패:', error);
        setSlides(fallbackSlides);
      });
  }, []);

  useEffect(() => {
    if (slides.length < 2) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, SLIDE_DELAY_MS);

    return () => window.clearInterval(timer);
  }, [slides.length, rotationKey]);

  if (slides.length === 0) {
    return null;
  }

  const showPrevious = () => {
    setActiveIndex((index) => (index - 1 + slides.length) % slides.length);
    setRotationKey((key) => key + 1);
  };

  const showNext = () => {
    setActiveIndex((index) => (index + 1) % slides.length);
    setRotationKey((key) => key + 1);
  };

  const showSlide = (index: number) => {
    setActiveIndex(index);
    setRotationKey((key) => key + 1);
  };

  const getSlideStyle = (slide: MainBannerContent): BannerSlideStyle => {
    const isCoolTouchSlide = slide.id === 'event-2026-07-cool-touch'
      || slide.image.includes('main_event_cool_touch');
    const imagePosition = slide.imagePosition ?? (isCoolTouchSlide ? '25% top' : 'center top');
    const tabletImagePosition = slide.tabletImagePosition
      ?? (isCoolTouchSlide ? '45% top' : imagePosition);

    return {
      '--banner-image-position': imagePosition,
      '--banner-image-position-tablet': tabletImagePosition,
      '--banner-image-position-mobile':
        slide.mobileImagePosition ?? (isCoolTouchSlide ? '62% top' : tabletImagePosition),
    };
  };

  return (
    <section
      className={styles.bannerSection}
      aria-label="메인 이벤트 배너"
      style={{ '--banner-bg': slides[activeIndex].backgroundColor } as CSSProperties}
    >
      <div className={styles.bannerStage}>
        {slides.map((slide, index) => (
          <article
            key={slide.id}
            className={`${styles.bannerSlide} ${index === activeIndex ? styles.activeSlide : ''}`}
            aria-hidden={index !== activeIndex}
            style={getSlideStyle(slide)}
          >
            <Image
              src={slide.image}
              alt=""
              fill
              priority={index === 0}
              sizes="(min-width: 1920px) 1920px, 100vw"
              className={styles.bannerImage}
            />

            <div className={styles.bannerCopy}>
              <p className={styles.bannerEyebrow}>{slide.eyebrow}</p>
              <h1 className={styles.bannerTitle}>{slide.title}</h1>
              <p className={styles.bannerDescription}>{slide.description}</p>
              <Link href={slide.href} className={styles.bannerCta}>
                {slide.ctaLabel}
              </Link>
            </div>
          </article>
        ))}

        {slides.length > 1 && (
          <>
            <button
              type="button"
              className={`${styles.navButton} ${styles.prevButton}`}
              aria-label="이전 배너"
              onClick={showPrevious}
            >
              ‹
            </button>
            <button
              type="button"
              className={`${styles.navButton} ${styles.nextButton}`}
              aria-label="다음 배너"
              onClick={showNext}
            >
              ›
            </button>

            <div className={styles.pagination} aria-label="배너 순서">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  className={`${styles.paginationDot} ${index === activeIndex ? styles.activeDot : ''}`}
                  aria-label={`${slide.eyebrow} 배너 보기`}
                  aria-current={index === activeIndex}
                  onClick={() => showSlide(index)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
