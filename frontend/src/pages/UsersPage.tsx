import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '../services/api';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { formatDate, maskAadhaar, maskPAN, truncate } from '../utils/helpers';
import type { User, GetUsersParams } from '../types';

interface UsersPageProps {
  onAddUser: () => void;
  onEditUser: (user: User) => void;
  onViewUser: (user: User) => void;
}

export function UsersPage({ onAddUser, onEditUser, onViewUser }: UsersPageProps) {
  const [params, setParams] = useState<GetUsersParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    order: 'DESC',
    search: '',
  });
  const [searchInput, setSearchInput] = useState('');

  const { data: statsData } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => userApi.getStats(),
    staleTime: 30_000,
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['users', params],
    queryFn: () => userApi.getAll(params),
    staleTime: 10_000,
  });

  const stats = statsData?.data;
  const users = data?.data ?? [];
  const pagination = data?.pagination;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setParams((p) => ({ ...p, page: 1, search: searchInput }));
  }

  function handleSort(field: string) {
    setParams((p) => ({
      ...p,
      sortBy: field,
      order: p.sortBy === field && p.order === 'ASC' ? 'DESC' : 'ASC',
    }));
  }

  function handlePage(next: number) {
    setParams((p) => ({ ...p, page: next }));
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage all registered users from one place</p>
        </div>
        <button id="btn-add-user" className="btn btn-primary" onClick={onAddUser}>
          <span>＋</span> Add User
        </button>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="stats-row">
          <StatCard label="Total Users" value={stats.total} icon="👥" color="linear-gradient(135deg,#6366f1,#818cf8)" />
          <StatCard label="Active" value={stats.active} icon="✅" color="linear-gradient(135deg,#10b981,#34d399)" />
          <StatCard label="Inactive" value={stats.inactive} icon="⏸" color="linear-gradient(135deg,#f59e0b,#fbbf24)" />
          <StatCard label="Suspended" value={stats.suspended} icon="🚫" color="linear-gradient(135deg,#ef4444,#f87171)" />
          <StatCard label="Deleted" value={stats.deleted} icon="🗑" color="linear-gradient(135deg,#6b7280,#9ca3af)" />
        </div>
      )}

      {/* Search bar */}
      <form className="search-bar" onSubmit={handleSearch}>
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            id="input-search"
            type="text"
            placeholder="Search by name, email or mobile…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="search-input"
          />
        </div>
        <button id="btn-search" type="submit" className="btn btn-secondary">
          Search
        </button>
        {params.search && (
          <button
            id="btn-clear-search"
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setSearchInput('');
              setParams((p) => ({ ...p, search: '', page: 1 }));
            }}
          >
            Clear
          </button>
        )}
      </form>

      {/* Table */}
      <div className="table-card">
        {isLoading && (
          <div className="table-placeholder">
            <div className="spinner" />
            <p>Loading users…</p>
          </div>
        )}

        {isError && (
          <div className="table-placeholder">
            <p className="error-text">Failed to load users.</p>
            <button className="btn btn-secondary" onClick={() => refetch()}>
              Retry
            </button>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => handleSort('name')}>
                      Name {params.sortBy === 'name' ? (params.order === 'ASC' ? '↑' : '↓') : ''}
                    </th>
                    <th className="sortable" onClick={() => handleSort('email')}>
                      Email {params.sortBy === 'email' ? (params.order === 'ASC' ? '↑' : '↓') : ''}
                    </th>
                    <th>Mobile</th>
                    <th>Aadhaar</th>
                    <th>PAN</th>
                    <th className="sortable" onClick={() => handleSort('dateOfBirth')}>
                      DOB {params.sortBy === 'dateOfBirth' ? (params.order === 'ASC' ? '↑' : '↓') : ''}
                    </th>
                    <th>Status</th>
                    <th className="sortable" onClick={() => handleSort('createdAt')}>
                      Joined {params.sortBy === 'createdAt' ? (params.order === 'ASC' ? '↑' : '↓') : ''}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="empty-row">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="table-row">
                        <td>
                          <div className="user-name-cell">
                            <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
                            <span>{truncate(user.name, 25)}</span>
                          </div>
                        </td>
                        <td className="text-muted">{truncate(user.email, 30)}</td>
                        <td>{user.primaryMobile}</td>
                        <td className="mono">{maskAadhaar(user.aadhaar)}</td>
                        <td className="mono">{maskPAN(user.pan)}</td>
                        <td>{formatDate(user.dateOfBirth)}</td>
                        <td>
                          <StatusBadge status={user.status} />
                        </td>
                        <td className="text-muted">{formatDate(user.createdAt)}</td>
                        <td>
                          <div className="action-btns">
                            <button
                              id={`btn-view-${user.id}`}
                              className="icon-btn icon-btn-view"
                              title="View"
                              onClick={() => onViewUser(user)}
                            >
                              👁
                            </button>
                            <button
                              id={`btn-edit-${user.id}`}
                              className="icon-btn icon-btn-edit"
                              title="Edit"
                              onClick={() => onEditUser(user)}
                            >
                              ✏️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="pagination">
                <span className="pagination-info">
                  Page {pagination.page} of {pagination.totalPages} &nbsp;·&nbsp; {pagination.total} users
                </span>
                <div className="pagination-controls">
                  <button
                    id="btn-prev-page"
                    className="btn btn-ghost btn-sm"
                    disabled={!pagination.hasPreviousPage}
                    onClick={() => handlePage(pagination.page - 1)}
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        id={`btn-page-${pageNum}`}
                        className={`btn btn-ghost btn-sm ${pagination.page === pageNum ? 'active' : ''}`}
                        onClick={() => handlePage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    id="btn-next-page"
                    className="btn btn-ghost btn-sm"
                    disabled={!pagination.hasNextPage}
                    onClick={() => handlePage(pagination.page + 1)}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
