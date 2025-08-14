"use client";

import { useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authProvider";
import styles from "./page.module.css";
import AdminNav from "../../_components/adminNav";
import AuthChecking from "@/app/admin/_components/AuthChecking";
import { AdminUserService, AdminUserData, UserStats, UserFilter } from "@/shared/services/adminUserService";

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserDataLoading && !loading) {
      if (!user || !isAdmin) {
        router.push('/auth/login');
      }
    }
  }, [user, isUserDataLoading, isAdmin, router, loading]);

  // 사용자 데이터 로드
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const filters: UserFilter = {
        searchTerm: searchTerm || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };

      const { users: fetchedUsers } = await AdminUserService.getUsers(filters, currentPage, 10);
      const userStats = await AdminUserService.getUserStats();
      
      setUsers(fetchedUsers);
      setStats(userStats);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('사용자 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin, searchTerm, roleFilter, statusFilter, currentPage]);

  // 필터링된 사용자 설정
  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  // 권한 체크 로딩
  if (!isAdmin && !isUserDataLoading) {
    return <AuthChecking />;
  }

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'inactive' | 'banned') => {
    try {
      await AdminUserService.updateUserStatus(userId, newStatus);
      await loadUsers(); // 데이터 새로고침
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('사용자 상태 변경에 실패했습니다.');
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      await AdminUserService.updateUserRole(userId, newRole);
      await loadUsers(); // 데이터 새로고침
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('사용자 역할 변경에 실패했습니다.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('정말 이 사용자를 삭제하시겠습니까?')) {
      try {
        await AdminUserService.deleteUser(userId);
        await loadUsers(); // 데이터 새로고침
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('사용자 삭제에 실패했습니다.');
      }
    }
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const handleExport = async () => {
    try {
      const csvContent = await AdminUserService.exportUsersToCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (error) {
      console.error('Error exporting users:', error);
      alert('사용자 데이터 내보내기에 실패했습니다.');
    }
  };

  const handleAddUser = () => {
    const name = prompt('사용자 이름을 입력하세요:');
    const email = prompt('사용자 이메일을 입력하세요:');
    
    if (name && email) {
      AdminUserService.createUser({ name, email })
        .then(() => {
          alert('사용자가 성공적으로 추가되었습니다.');
          loadUsers();
        })
        .catch(error => {
          console.error('Error creating user:', error);
          alert('사용자 추가에 실패했습니다.');
        });
    }
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
          
          {isLoading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>사용자 데이터를 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <p>{error}</p>
              <button onClick={loadUsers} className={styles.retryButton}>
                다시 시도
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className={styles.emptyState}>
              <p>검색 조건에 맞는 사용자가 없습니다.</p>
            </div>
          ) : (
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
                  <td>{formatDate(userData.lastLogin)}</td>
                  <td>{userData.orders}건</td>
                  <td><strong>{formatCurrency(userData.totalSpent)}</strong></td>
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
                    <button 
                      className={`${styles.actionButton} ${styles.danger}`}
                      onClick={() => handleDeleteUser(userData.id)}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
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
