/**
 * Componente de Gestão de Usuários (RBAC) e Auditoria (Admin)
 */

class UsersComponent {
  constructor() {
    this.users = [];
  }

  async loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px;"><i class="fa-solid fa-spinner fa-spin"></i> Carregando usuários...</td></tr>';

    try {
      const res = await window.api.get('/users');
      this.users = res.data;
      this.render();
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="6" style="color:var(--danger); text-align:center;">Erro: ${window.appState.escapeHtml(err.message)}</td></tr>`;
    }
  }

  render() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    tbody.innerHTML = this.users.map(u => {
      const roleMap = {
        admin: '<span class="user-role-badge role-admin">Administrador Master</span>',
        technician: '<span class="user-role-badge role-technician">Técnico de TI</span>',
        employee: '<span class="user-role-badge role-employee">Colaborador</span>'
      };

      return `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:10px;">
              <img src="${u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}" style="width:32px; height:32px; border-radius:50%; object-fit:cover;">
              <strong>${window.appState.escapeHtml(u.name)}</strong>
            </div>
          </td>
          <td>${window.appState.escapeHtml(u.email)}</td>
          <td>${roleMap[u.role_id] || u.role_id}</td>
          <td>${window.appState.escapeHtml(u.department_name || '-')}</td>
          <td>
            <span class="badge-status" style="${u.is_active ? 'background:rgba(16,185,129,0.15); color:var(--success);' : 'background:rgba(239,68,68,0.15); color:var(--danger);'}">
              ${u.is_active ? 'Ativo' : 'Inativo'}
            </span>
          </td>
          <td style="text-align:right;">
            ${u.id !== 'usr-admin' ? `
              <button class="btn-secondary" style="padding:4px 8px; font-size:0.75rem;" onclick="window.usersComponent.toggleUserActive('${u.id}', ${u.is_active ? 0 : 1})">
                ${u.is_active ? 'Desativar' : 'Ativar'}
              </button>
            ` : '<span style="font-size:0.75rem; color:var(--text-dim);">Protegido</span>'}
          </td>
        </tr>
      `;
    }).join('');
  }

  async toggleUserActive(userId, newStatus) {
    try {
      await window.api.put(`/users/${userId}`, { is_active: newStatus });
      window.app.showToast('Status do usuário atualizado.', 'success');
      this.loadUsers();
    } catch (err) {
      window.app.showToast(err.message, 'danger');
    }
  }
}

class AuditComponent {
  async loadAuditLogs() {
    const tbody = document.getElementById('auditTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px;"><i class="fa-solid fa-spinner fa-spin"></i> Carregando logs de auditoria...</td></tr>';

    try {
      const res = await window.api.get('/audit', { limit: 50 });
      const logs = res.data;
      if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-dim);">Nenhum log registrado.</td></tr>';
        return;
      }

      tbody.innerHTML = logs.map(log => `
        <tr>
          <td style="font-size:0.8rem; color:var(--text-dim);">${window.appState.formatDate(log.created_at)}</td>
          <td><strong>${window.appState.escapeHtml(log.user_name || 'Sistema')}</strong></td>
          <td><span class="badge-priority prio-MEDIA">${log.action}</span></td>
          <td>${log.entity_type} ${log.entity_id ? `(#${log.entity_id})` : ''}</td>
          <td style="font-family:monospace; font-size:0.78rem; max-width:300px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
            ${window.appState.escapeHtml(log.details || '-')}
          </td>
          <td style="font-size:0.8rem; color:var(--text-dim);">${log.ip_address || '-'}</td>
        </tr>
      `).join('');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="6" style="color:var(--danger); text-align:center;">Erro: ${window.appState.escapeHtml(err.message)}</td></tr>`;
    }
  }
}

window.usersComponent = new UsersComponent();
window.auditComponent = new AuditComponent();
