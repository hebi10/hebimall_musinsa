"use client";

import Link from "next/link";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import styles from "./page.module.css";
import useInput from "@/src/hooks/useInput";

export default function LoginPage() {
  const [values, onChange] = useInput({
    id: '',
    password: ''
  });

  console.log(values);

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div>
          <h2 className={styles.title}>
            로그인
          </h2>
        </div>
        
        <form className={styles.form}>
          <Input
            label="이메일"
            type="email"
            name="id"
            placeholder="이메일을 입력하세요"
            required
            value={values.id}
            onChange={onChange}
          />
          
          <Input
            label="비밀번호"
            type="password"
            name="password"
            placeholder="비밀번호를 입력하세요"
            required
            value={values.password}
            onChange={onChange}
          />
            
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                style={{ marginRight: '0.5rem' }}
              />
              <label htmlFor="remember-me" style={{ fontSize: '0.875rem', color: '#111827' }}>
                로그인 상태 유지
              </label>
            </div>
            
            <Link href="/auth/find-password" className={styles.linkText}>
              비밀번호 찾기
            </Link>
          </div>
          
          <Button type="submit" size="lg" style={{ width: '100%' }}>
            로그인
          </Button>
        </form>
        
        <div className={styles.divider}>
          <span className={styles.dividerText}>또는</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button className={styles.socialButton}>
            <span className={`${styles.socialBtn} ${styles.kakaoIcon}`}>K</span>
            카카오 로그인
          </button>
          <button className={styles.socialButton}>
            <span className={`${styles.socialBtn} ${styles.naverIcon}`}>N</span>
            네이버 로그인
          </button>
          <button className={styles.socialButton}>
            <span className={`${styles.socialBtn} ${styles.googleIcon}`}>G</span>
            구글 로그인
          </button>
        </div>
        
        <div className={styles.link}>
          아직 계정이 없으신가요?{' '}
          <Link href="/auth/signup" className={styles.linkText}>
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}
