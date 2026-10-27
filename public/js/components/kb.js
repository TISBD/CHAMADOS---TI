/**
 * Base de Conhecimento e Sugestão Automática de Autoajuda (Ticket Deflection)
 */

class KnowledgeBaseComponent {
  constructor() {
    this.articles = [];
  }

  async loadArticles(search = '') {
    const container = document.getElementById('kbArticlesList');
    if (!container) return;

    container.innerHTML = '<div style="text-align:center; padding:30px;"><i class="fa-solid fa-spinner fa-spin"></i> Carregando artigos...</div>';

    try {
      const res = await window.api.get('/kb', { search });
      this.articles = res.data;
      this.render();
    } catch (err) {
      container.innerHTML = `<div style="color:var(--danger); text-align:center;">Erro: ${window.appState.escapeHtml(err.message)}</div>`;
    }
  }

  render() {
    const container = document.getElementById('kbArticlesList');
    if (!container) return;

    if (this.articles.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:40px; color:var(--text-dim);">
          <i class="fa-solid fa-book-open" style="font-size:2rem; margin-bottom:10px; display:block;"></i>
          Nenhum artigo encontrado.
        </div>
      `;
      return;
    }

    container.innerHTML = this.articles.map(art => `
      <div class="kpi-card" style="cursor:pointer; flex-direction:column; align-items:flex-start;" onclick="window.kbComponent.openArticleModal('${art.id}')">
        <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
          <span style="font-size:0.75rem; color:var(--primary); font-weight:700; text-transform:uppercase;">
            ${window.appState.escapeHtml(art.category_name || 'Geral')}
          </span>
          <span style="font-size:0.75rem; color:var(--text-dim);">
            <i class="fa-regular fa-eye"></i> ${art.views_count} | <i class="fa-regular fa-thumbs-up"></i> ${art.helpful_count}
          </span>
        </div>
        <h4 style="font-size:1.05rem; font-weight:700; margin:8px 0 4px; color:var(--text-main);">
          ${window.appState.escapeHtml(art.title)}
        </h4>
        <p style="font-size:0.85rem; color:var(--text-muted); display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
          ${window.appState.escapeHtml(art.content)}
        </p>
      </div>
    `).join('');
  }

  async openArticleModal(id) {
    const modal = document.getElementById('kbDetailModal');
    if (!modal) return;

    modal.classList.add('active');
    const body = document.getElementById('kbDetailBody');
    body.innerHTML = '<div style="text-align:center; padding:30px;"><i class="fa-solid fa-spinner fa-spin"></i></div>';

    try {
      const res = await window.api.get(`/kb/${id}`);
      const art = res.data;
      body.innerHTML = `
        <span style="font-size:0.8rem; color:var(--primary); font-weight:700; text-transform:uppercase;">${window.appState.escapeHtml(art.category_name || 'Geral')}</span>
        <h2 style="font-size:1.4rem; font-weight:700; margin:6px 0 16px;">${window.appState.escapeHtml(art.title)}</h2>
        <div style="font-size:0.95rem; line-height:1.7; white-space:pre-wrap; color:var(--text-main); margin-bottom:24px;">
          ${window.appState.escapeHtml(art.content)}
        </div>
        <div style="border-top:1px solid var(--border-color); padding-top:16px; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.8rem; color:var(--text-dim);">Criado por ${window.appState.escapeHtml(art.author_name || 'TI')}</span>
          <button class="btn-secondary" onclick="window.kbComponent.markHelpful('${art.id}')">
            <i class="fa-regular fa-thumbs-up"></i> Este artigo foi útil? (${art.helpful_count})
          </button>
        </div>
      `;
    } catch (err) {
      body.innerHTML = `<div style="color:var(--danger);">${window.appState.escapeHtml(err.message)}</div>`;
    }
  }

  async markHelpful(id) {
    try {
      await window.api.post(`/kb/${id}/helpful`);
      window.app.showToast('Obrigado pelo seu feedback!', 'success');
      this.openArticleModal(id);
    } catch (e) {}
  }

  /**
   * Monitora a digitação do título no modal de Novo Chamado para sugerir autoajuda
   */
  setupDeflectionListener() {
    const titleInput = document.getElementById('newTicketTitle');
    const suggestionBox = document.getElementById('kbSuggestionsBox');
    if (!titleInput || !suggestionBox) return;

    let timeout = null;
    titleInput.addEventListener('input', (e) => {
      clearTimeout(timeout);
      const val = e.target.value.trim();
      if (val.length < 3) {
        suggestionBox.style.display = 'none';
        return;
      }

      timeout = setTimeout(async () => {
        try {
          const res = await window.api.get('/kb/suggest', { q: val });
          if (res.data && res.data.length > 0) {
            suggestionBox.style.display = 'block';
            suggestionBox.innerHTML = `
              <div style="background:rgba(99, 102, 241, 0.1); border:1px solid rgba(99, 102, 241, 0.3); border-radius:var(--radius-md); padding:12px; margin-bottom:14px;">
                <div style="font-weight:700; font-size:0.82rem; color:var(--primary); margin-bottom:6px;">
                  <i class="fa-solid fa-lightbulb"></i> Artigos recomendados que podem resolver seu problema agora:
                </div>
                <div style="display:flex; flex-direction:column; gap:6px;">
                  ${res.data.map(item => `
                    <div style="font-size:0.85rem; color:var(--text-main); cursor:pointer; text-decoration:underline;" onclick="window.kbComponent.openArticleModal('${item.id}')">
                      • ${window.appState.escapeHtml(item.title)}
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          } else {
            suggestionBox.style.display = 'none';
          }
        } catch (e) {
          suggestionBox.style.display = 'none';
        }
      }, 400);
    });
  }
}

window.kbComponent = new KnowledgeBaseComponent();
