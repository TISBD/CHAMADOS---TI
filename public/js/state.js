/**
 * Estado reativo e utilitários globais da SPA
 */

class AppState {
  constructor() {
    this.user = null;
    this.currentTab = 'tickets';
    this.categories = [];
    this.departments = [];
    this.technicians = [];
    this.assets = [];
  }

  setUser(user) {
    this.user = user;
    if (user) {
      localStorage.setItem('HELPDESK_USER', JSON.stringify(user));
    } else {
      localStorage.removeItem('HELPDESK_USER');
    }
  }

  getUser() {
    if (!this.user) {
      const stored = localStorage.getItem('HELPDESK_USER');
      if (stored) {
        try {
          this.user = JSON.parse(stored);
        } catch (e) {}
      }
    }
    return this.user;
  }

  isAdmin() {
    return this.user && this.user.role === 'admin';
  }

  isTechnician() {
    return this.user && (this.user.role === 'technician' || this.user.role === 'admin');
  }

  isEmployee() {
    return this.user && this.user.role === 'employee';
  }

  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

window.appState = new AppState();
