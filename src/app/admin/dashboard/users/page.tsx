"use client";

import { useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authProvider";
import styles from "./page.module.css";
import AdminNav from "../../_components/adminNav";
import { mockUsers } from "@/mocks/user";
import AuthChecking from "@/app/admin/_components/AuthChecking";
import { UserProfile } from "@/shared/types/user";

interface AdminUserData extends UserProfile {
  lastLogin: string;
  orders: number;
  totalSpent: string;
}

interface UserStats {
  total: number;
  active: number;
  admin: number;
  newUsers: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isUserDataLoading, loading, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState<AdminUserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUserData[]>([]);
  const [stats, setStats] = useState<UserStats>({ total: 0, active: 0, admin: 0, newUsers: 0 });

  useEffect(() => {
    if (!isUserDataLoading && !loading) {
      if (!user || !isAdmin) {
        router.push('/auth/login');
      }
    }
  }, [user, isUserDataLoading, isAdmin, router, loading]);

  useEffect(() => {
    setUsers(mockUsers.map(user => ({
      ...user,
      lastLogin: '2024-08-04 14:30',
      orders: Math.floor(Math.random() * 50),
      totalSpent: `${(Math.random() * 1000000).toLocaleString()}원`
    })));

    // 통계 계산
    const newStats = {
      total: users.length,
      active: users.filter(user => user.status === "active").length,
      admin: users.filter(user => user.role === "admin").length,
      newUsers: users.filter(user => {
        const joinDate = new Date(user.joinDate);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return joinDate >= weekAgo;
      }).length
    };
    setStats(newStats);
  }, [router, user]);

  // 필터링 로직
  useEffect(() => {
    let filtered = users;

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 역할 필터링
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // 상태 필터링
    if (statusFilter !== "all") {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [users, searchTerm, roleFilter, statusFilter]);

  // 권한 체크 로딩
  if (!isAdmin && !isUserDataLoading) {
    return <AuthChecking />;
  }

  const handleStatusChange = (userId: string, newStatus: 'active' | 'inactive' | 'banned') => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  const handleRoleChange = (userId: string, newRole: 'user' | 'admin') => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "활성";
      case "inactive": return "비활성";
      case "banned": return "정지";
      default: return status;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin": return "관리자";
      case "user": return "사용자";
      default: return role;
    }
  };

  const handleExport = () => {
    alert("사용자 데이터를 CSV로 내보냅니다.");
  };

  const handleAddUser = () => {
    alert("새 사용자 추가 기능을 구현해야 합니다.");
  };

  // 페이지네이션
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className={styles.container}>
      {/* 관리자 헤더 */}
      <div className={styles.adminHeader}>
        <div className={styles.headerContainer}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <h1 className={styles.adminTitle}>HEBIMALL Admin</h1>
              <AdminNav />
            </div>
            <div className={styles.headerRight}>
              <div className={styles.userInfo}>
                👨‍💼 관리자
              </div>
              <Link href="/" className={styles.logoutButton}>
                홈으로
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* 페이지 헤더 */}
        <div className={styles.pageHeader}>
          <h2 className={styles.pageTitle}>사용자 관리</h2>
          <p className={styles.pageSubtitle}>
            전체 사용자 계정을 관리하고 권한을 설정하세요
          </p>
        </div>

        {/* 통계 카드 */}
        <div className={styles.statsCards}>
          <div className={`${styles.statsCard} ${styles.total}`}>
            <div className={styles.statsValue}>{stats.total}</div>
            <div className={styles.statsLabel}>전체 사용자</div>
          </div>
          <div className={`${styles.statsCard} ${styles.active}`}>
            <div className={styles.statsValue}>{stats.active}</div>
            <div className={styles.statsLabel}>활성 사용자</div>
          </div>
          <div className={`${styles.statsCard} ${styles.admin}`}>
            <div className={styles.statsValue}>{stats.admin}</div>
            <div className={styles.statsLabel}>관리자</div>
          </div>
          <div className={`${styles.statsCard} ${styles.newUsers}`}>
            <div className={styles.statsValue}>{stats.newUsers}</div>
            <div className={styles.statsLabel}>신규 가입</div>
          </div>
        </div>

        {/* 컨트롤 섹션 */}
        <div className={styles.controlsSection}>
          <div className={styles.controlsGrid}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="이름, 이메일로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              <span className={styles.searchIcon}>🔍</span>
            </div>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">전체 역할</option>
              <option value="user">사용자</option>
              <option value="admin">관리자</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">전체 상태</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
              <option value="banned">정지</option>
            </select>

            <button onClick={handleAddUser} className={styles.addButton}>
              ➕ 사용자 추가
            </button>

            <button onClick={handleExport} className={styles.exportButton}>
              📊 CSV 내보내기
            </button>
          </div>
        </div>

        {/* 사용자 테이블 */}
        <div className={styles.usersTable}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>👥 사용자 목록</h3>
          </div>
          
          <table className={styles.table}>
            <thead>
              <tr>
                <th>사용자</th>
                <th>역할</th>
                <th>상태</th>
                <th>가입일</th>
                <th>마지막 로그인</th>
                <th>주문수</th>
                <th>총 구매액</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((userData) => (
                <tr key={userData.id}>
                  <td>
                    <div className={styles.userInfo}>
                      <div className={styles.userAvatar}>
                        {userData.name.charAt(0)}
                      </div>
                      <div>
                        <div className={styles.userName}>{userData.name}</div>
                        <div className={styles.userEmail}>{userData.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.userRole} ${styles[userData.role]}`}>
                      {getRoleText(userData.role)}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.userStatus} ${styles[userData.status]}`}>
                      {getStatusText(userData.status)}
                    </span>
                  </td>
                  <td>{userData.joinDate}</td>
                  <td>{userData.lastLogin}</td>
                  <td>{userData.orders}건</td>
                  <td><strong>{userData.totalSpent}</strong></td>
                  <td>
                    <button className={`${styles.actionButton} ${styles.primary}`}>
                      상세
                    </button>
                    {userData.status === "active" ? (
                      <button 
                        className={`${styles.actionButton} ${styles.warning}`}
                        onClick={() => handleStatusChange(userData.id, "banned")}
                      >
                        정지
                      </button>
                    ) : userData.status === "banned" ? (
                      <button 
                        className={styles.actionButton}
                        onClick={() => handleStatusChange(userData.id, "active")}
                      >
                        활성화
                      </button>
                    ) : (
                      <button 
                        className={styles.actionButton}
                        onClick={() => handleStatusChange(userData.id, "active")}
                      >
                        활성화
                      </button>
                    )}
                    {userData.role === "user" ? (
                      <button 
                        className={styles.actionButton}
                        onClick={() => handleRoleChange(userData.id, "admin")}
                      >
                        관리자화
                      </button>
                    ) : (
                      <button 
                        className={styles.actionButton}
                        onClick={() => handleRoleChange(userData.id, "user")}
                      >
                        사용자화
                      </button>
                    )}
                    <button className={`${styles.actionButton} ${styles.danger}`}>
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageButton}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              이전
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            
            <button
              className={styles.pageButton}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
