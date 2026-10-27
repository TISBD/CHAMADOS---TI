/**
 * Componente de Inventário de Ativos de TI (Patrimônio)
 */

class AssetsComponent {
  constructor() {
    this.assets = [];
  }

  async loadAssets() {
    const tbody = document.getElementById('assetsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px;"><i class="fa-solid fa-spinner fa-spin"></i> Carregando inventário...</td></tr>';

    try {
      const res = await window.api.get('/assets');
      this.assets = res.data;
      this.render();
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="7" style="color:var(--danger); text-align:center;">Erro: ${window.appState.escapeHtml(err.message)}</td></tr>`;
    }
  }

  render() {
    const tbody = document.getElementById('assetsTableBody');
    if (!tbody) return;

    if (this.assets.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:40px; color:var(--text-dim);">Nenhum ativo cadastrado.</td></tr>';
      return;
    }

    tbody.innerHTML = this.assets.map(a => `
      <tr>
        <td style="font-family:monospace; font-weight:700; color:var(--primary);">${window.appState.escapeHtml(a.asset_tag)}</td>
        <td style="font-weight:600;">${window.appState.escapeHtml(a.name)}</td>
        <td>${window.appState.escapeHtml(a.category)}</td>
        <td>${window.appState.escapeHtml(a.model || '-')}</td>
        <td>${window.appState.escapeHtml(a.user_name || 'Estoque / TI')}</td>
        <td>
          <span class="badge-status" style="background:rgba(16,185,129,0.15); color:var(--success);">
            ${a.status}
          </span>
        </td>
        <td style="text-align:center;">
          <span style="font-weight:700; color:var(--text-muted);">${a.ticket_count || 0}</span>
        </td>
      </tr>
    `).join('');
  }
}

window.assetsComponent = new AssetsComponent();
