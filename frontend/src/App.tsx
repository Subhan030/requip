import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './components/ToastContext';
import { UsersPage } from './pages/UsersPage';
import { UserFormPage } from './pages/UserFormPage';
import { UserDetailPage } from './pages/UserDetailPage';
import type { User } from './types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

type View = 'list' | 'create' | 'edit' | 'detail';

export default function App() {
  const [view, setView] = useState<View>('list');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  function handleAddUser() {
    setSelectedUser(null);
    setView('create');
  }

  function handleEditUser(user: User) {
    setSelectedUser(user);
    setView('edit');
  }

  function handleViewUser(user: User) {
    setSelectedUser(user);
    setView('detail');
  }

  function handleClose() {
    setView('list');
    setSelectedUser(null);
  }

  // Switch directly from detail -> edit without going back to list
  function handleEditFromDetail(user: User) {
    setSelectedUser(user);
    setView('edit');
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div className="app-shell">
          <aside className="sidebar">
            <div className="sidebar-logo">
              <div className="logo-icon">R</div>
              <span className="logo-text">Requip</span>
            </div>
            <nav className="sidebar-nav">
              <button
                id="nav-users"
                className={`nav-item ${view === 'list' ? 'nav-active' : ''}`}
                onClick={handleClose}
              >
                <span className="nav-icon">👥</span>
                <span>Users</span>
              </button>
            </nav>
            <div className="sidebar-footer">
              <p className="sidebar-version">v1.0.0</p>
            </div>
          </aside>

          <main className="main-content">
            <UsersPage
              onAddUser={handleAddUser}
              onEditUser={handleEditUser}
              onViewUser={handleViewUser}
            />
          </main>
        </div>

        {/* Modals mount on top */}
        {(view === 'create' || view === 'edit') && (
          <UserFormPage
            user={view === 'edit' ? selectedUser : null}
            onClose={handleClose}
          />
        )}

        {view === 'detail' && selectedUser && (
          <UserDetailPage
            user={selectedUser}
            onClose={handleClose}
            onEdit={handleEditFromDetail}
          />
        )}
      </ToastProvider>
    </QueryClientProvider>
  );
}
