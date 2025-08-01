"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  gender: string;
  termsAgree: boolean;
  privacyAgree: boolean;
  marketingAgree: boolean;
}

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
    gender: "",
    termsAgree: false,
    privacyAgree: false,
    marketingAgree: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // 에러 메시지 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 이메일 검증
    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식을 입력해주세요.";
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요.";
    } else if (formData.password.length < 8) {
      newErrors.password = "비밀번호는 8자 이상이어야 합니다.";
    }

    // 비밀번호 확인
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호 확인을 입력해주세요.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }

    // 이름 검증
    if (!formData.name) {
      newErrors.name = "이름을 입력해주세요.";
    }

    // 전화번호 검증
    if (!formData.phone) {
      newErrors.phone = "전화번호를 입력해주세요.";
    } else if (!/^01[0-9]-?[0-9]{4}-?[0-9]{4}$/.test(formData.phone)) {
      newErrors.phone = "올바른 전화번호 형식을 입력해주세요.";
    }

    // 생년월일 검증
    if (!formData.birthYear || !formData.birthMonth || !formData.birthDay) {
      newErrors.birth = "생년월일을 모두 선택해주세요.";
    }

    // 성별 검증
    if (!formData.gender) {
      newErrors.gender = "성별을 선택해주세요.";
    }

    // 약관 동의 검증
    if (!formData.termsAgree) {
      newErrors.terms = "이용약관에 동의해주세요.";
    }

    if (!formData.privacyAgree) {
      newErrors.privacy = "개인정보처리방침에 동의해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("회원가입이 완료되었습니다!");
      router.push("/auth/login");
    } catch (error) {
      alert("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 년도 옵션 생성
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className={styles.container}>
      {/* 배경 애니메이션 요소들 */}
      <div className={styles.floatingShape}></div>
      <div className={styles.floatingShape}></div>
      <div className={styles.floatingShape}></div>

      <div className={styles.signupCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>회원가입</h1>
          <p className={styles.subtitle}>HEBIMALL과 함께 시작하세요</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.signupForm}>
          {/* 이메일 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              이메일 <span className={styles.required}>*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@hebimall.com"
              className={styles.input}
            />
            {errors.email && <div className={styles.errorMessage}>{errors.email}</div>}
          </div>

          {/* 비밀번호 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              비밀번호 <span className={styles.required}>*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="8자 이상 입력해주세요"
              className={styles.input}
            />
            {errors.password && <div className={styles.errorMessage}>{errors.password}</div>}
          </div>

          {/* 비밀번호 확인 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              비밀번호 확인 <span className={styles.required}>*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="비밀번호를 다시 입력해주세요"
              className={styles.input}
            />
            {errors.confirmPassword && <div className={styles.errorMessage}>{errors.confirmPassword}</div>}
          </div>

          {/* 이름 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              이름 <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="실명을 입력해주세요"
              className={styles.input}
            />
            {errors.name && <div className={styles.errorMessage}>{errors.name}</div>}
          </div>

          {/* 전화번호 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              전화번호 <span className={styles.required}>*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="010-1234-5678"
              className={styles.input}
            />
            {errors.phone && <div className={styles.errorMessage}>{errors.phone}</div>}
          </div>

          {/* 생년월일 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              생년월일 <span className={styles.required}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                name="birthYear"
                value={formData.birthYear}
                onChange={handleChange}
                className={styles.select}
                style={{ flex: 1 }}
              >
                <option value="">년도</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}년</option>
                ))}
              </select>
              <select
                name="birthMonth"
                value={formData.birthMonth}
                onChange={handleChange}
                className={styles.select}
                style={{ flex: 1 }}
              >
                <option value="">월</option>
                {months.map(month => (
                  <option key={month} value={month}>{month}월</option>
                ))}
              </select>
              <select
                name="birthDay"
                value={formData.birthDay}
                onChange={handleChange}
                className={styles.select}
                style={{ flex: 1 }}
              >
                <option value="">일</option>
                {days.map(day => (
                  <option key={day} value={day}>{day}일</option>
                ))}
              </select>
            </div>
            {errors.birth && <div className={styles.errorMessage}>{errors.birth}</div>}
          </div>

          {/* 성별 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              성별 <span className={styles.required}>*</span>
            </label>
            <div className={styles.genderGroup}>
              <label className={styles.radioItem}>
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === "male"}
                  onChange={handleChange}
                />
                <span>남성</span>
              </label>
              <label className={styles.radioItem}>
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === "female"}
                  onChange={handleChange}
                />
                <span>여성</span>
              </label>
            </div>
            {errors.gender && <div className={styles.errorMessage}>{errors.gender}</div>}
          </div>

          {/* 약관 동의 */}
          <div className={styles.agreementSection}>
            <label className={styles.label}>약관 동의</label>
            <div className={styles.agreementGroup}>
              <div className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  name="termsAgree"
                  checked={formData.termsAgree}
                  onChange={handleChange}
                />
                <label className={`${styles.checkboxLabel} ${styles.required}`}>
                  이용약관에 동의합니다 (필수)
                </label>
                <Link href="/legal/terms" className={styles.linkButton}>
                  보기
                </Link>
              </div>
              <div className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  name="privacyAgree"
                  checked={formData.privacyAgree}
                  onChange={handleChange}
                />
                <label className={`${styles.checkboxLabel} ${styles.required}`}>
                  개인정보처리방침에 동의합니다 (필수)
                </label>
                <Link href="/legal/privacy" className={styles.linkButton}>
                  보기
                </Link>
              </div>
              <div className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  name="marketingAgree"
                  checked={formData.marketingAgree}
                  onChange={handleChange}
                />
                <label className={styles.checkboxLabel}>
                  마케팅 정보 수신에 동의합니다 (선택)
                </label>
              </div>
            </div>
            {errors.terms && <div className={styles.errorMessage}>{errors.terms}</div>}
            {errors.privacy && <div className={styles.errorMessage}>{errors.privacy}</div>}
          </div>

          {/* 회원가입 버튼 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? "가입 처리 중..." : "회원가입"}
          </button>
        </form>

        {/* 로그인 링크 */}
        <div className={styles.loginSection}>
          <span className={styles.loginText}>이미 계정이 있으신가요?</span>
          <Link href="/auth/login" className={styles.loginLink}>
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
