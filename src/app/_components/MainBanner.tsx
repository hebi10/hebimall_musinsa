'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './MainBanner.module.css';

interface MainBannerSlide {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  image: string;
  backgroundColor: string;
}

const SLIDE_DELAY_MS = 4500;

const bannerSlides: MainBannerSlide[] = [
  {
    id: 'event-2026-06-midyear-sale',
    eyebrow: '오늘 마감',
    title: '상반기 베스트 최대 60%',
    description: '인기 아이템을 가장 강한 혜택으로 정리한 마지막 하루입니다.',
    ctaLabel: '미드이어 세일 보기',
    href: '/events/event-2026-06-midyear-sale',
    image: '/main/main_event_midyear_sale.webp',
    backgroundColor: '#c9c0b3',
  },
  {
    id: 'event-2026-07-vacation-coupon',
    eyebrow: '7월 쿠폰팩',
    title: '휴가룩 쿠폰 3종',
    description: '상의, 하의, 아우터까지 여름 준비에 바로 쓰는 쿠폰 혜택입니다.',
    ctaLabel: '쿠폰팩 보기',
    href: '/events/event-2026-07-vacation-coupon',
    image: '/main/main_event_vacation_coupon.webp',
    backgroundColor: '#d4c6b4',
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
    <section
      className={styles.bannerSection}
      aria-label="메인 이벤트 배너"
      style={{ '--banner-bg': bannerSlides[activeIndex].backgroundColor } as CSSProperties}
    >
      <div className={styles.bannerStage}>
        {bannerSlides.map((slide, index) => (
          <article
            key={slide.id}
            className={`${styles.bannerSlide} ${index === activeIndex ? styles.activeSlide : ''}`}
            aria-hidden={index !== activeIndex}
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
          {bannerSlides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={`${styles.paginationDot} ${index === activeIndex ? styles.activeDot : ''}`}
              aria-label={`${slide.eyebrow} 배너 보기`}
              aria-current={index === activeIndex}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
