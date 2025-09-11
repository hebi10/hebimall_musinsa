"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import useInput from "@/shared/hooks/useInput";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/shared/libs/firebase/firebase";
import { getErrorMessage } from "@/shared/utils/authErrorMessages";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [values, onChange] = useInput({
    password: '',
    confirmPassword: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidCode, setIsValidCode] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string>("");

  const oobCode = searchParams.get('oobCode');
  const mode = searchParams.get('mode');

  useEffect(() => {
    const verifyCode = async () => {
      if (!oobCode || mode !== 'resetPassword') {
        setError("올바르지 않은 접근입니다. 이메일의 링크를 다시 확인해주세요.");
        setIsValidCode(false);
        return;
      }

      try {
        const userEmail = await verifyPasswordResetCode(auth, oobCode);
        setEmail(userEmail);
        setIsValidCode(true);
      } catch (err: any) {
        console.error("Invalid reset code:", err);
        setError("링크가 만료되었거나 올바르지 않습니다. 비밀번호 찾기를 다시 시도해주세요.");
        setIsValidCode(false);
      }
    };

    verifyCode();
  }, [oobCode, mode]);

  const validateForm = (): boolean => {
    setError(null);

    if (!values.password) {
      setError("새 비밀번호를 입력해주세요.");
      return false;
    }

    if (values.password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return false;
    }

    if (!values.confirmPassword) {
      setError("비밀번호 확인을 입력해주세요.");
      return false;
    }

    if (values.password !== values.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !oobCode) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await confirmPasswordReset(auth, oobCode, values.password);
      setSuccess(true);
    } catch (err: any) {
      console.error("Password reset failed:", err);
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidCode === null) {
    return (
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <h2 className={styles.loadingTitle}>확인 중...</h2>
            <p className={styles.loadingText}>링크를 확인하고 있습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isValidCode === false) {
    return (
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>❌</div>
            <h2 className={styles.errorTitle}>링크가 올바르지 않습니다</h2>
            <div className={styles.errorMessage}>
              {error}
            </div>
            <div className={styles.actionButtons}>
              <Link href="/auth/find-password" className={styles.retryButton}>
                비밀번호 찾기 다시 시도
              </Link>
              <Link href="/auth/login" className={styles.loginButton}>
                로그인으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <div className={styles.successContainer}>
            <div className={styles.successIcon}>✅</div>
            <h2 className={styles.successTitle}>비밀번호가 변경되었습니다</h2>
            <div className={styles.successMessage}>
              <p>비밀번호가 성공적으로 변경되었습니다.</p>
              <p>새로운 비밀번호로 로그인해주세요.</p>
            </div>
            <Link href="/auth/login" className={styles.loginButton}>
              로그인하기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>새 비밀번호 설정</h2>
          <p className={styles.subtitle}>
            <strong>{email}</strong>의 새로운 비밀번호를 설정해주세요.
          </p>
        </div>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
          
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              새 비밀번호
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="8자 이상 입력해주세요"
              required
              value={values.password}
              onChange={onChange}
              className={styles.input}
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              새 비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="새 비밀번호를 다시 입력해주세요"
              required
              value={values.confirmPassword}
              onChange={onChange}
              className={styles.input}
              disabled={isSubmitting}
            />
          </div>
          
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isSubmitting || !values.password || !values.confirmPassword}
          >
            {isSubmitting ? "변경 중..." : "비밀번호 변경"}
          </button>
        </form>
        
        <div className={styles.footer}>
          <Link href="/auth/login" className={styles.loginLink}>
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
