// proteção
if (!localStorage.getItem('usuarioId')) {
    window.location.href = '../login/telaLogin.html';
  }
  
  // escape (mantido)
function escapeHtml(text) {
if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

  // mensagem
  function mostrarMensagem(message, type) {
    const container = document.getElementById('message-container');
    const className = type === 'error' ? 'error-message' : 'success-message';
    container.innerHTML = `<div class="${className}">${escapeHtml(message)}</div>`;
  }
  
  // ================= CARREGAR CATEGORIAS =================
  async function carregarCategorias() {
    try {
      const res = await fetch('http://localhost/p1_LES/api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao: 'get_categorias' })
      });
  
      const data = await res.json();
  
      if (!data.success) {
        throw new Error('Erro ao carregar categorias');
      }
  
      mostrarCategorias(data.categorias || []);
  
    } catch (err) {
      console.error(err);
      mostrarMensagem('Erro ao carregar categorias', 'error');
      ligarInputCategoria(true);
    }
  }
  
  // preencher select
  function mostrarCategorias(categorias) {
    const select = document.getElementById('id_categoria');
  
    if (!categorias.length) {
      ligarInputCategoria(true);
      return;
    }
  
    select.innerHTML = '<option disabled selected>— escolha —</option>';
  
    categorias.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = escapeHtml(cat.descricao);
      select.appendChild(option);
    });
  
    ligarInputCategoria(false);
  }
  
  // toggle manual
  function ligarInputCategoria(show) {
    document.getElementById('categoria-manual-input').style.display = show ? 'block' : 'none';
    document.getElementById('id_categoria').style.display = show ? 'none' : 'block';
  }
  
  // ================= PREVIEW =================
  document.getElementById('img').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const preview = document.getElementById('preview');
  
    if (!file) return preview.style.display = 'none';
  
    if (file.size > 5 * 1024 * 1024) {
      mostrarMensagem('Imagem muito grande (máx 5MB)', 'error');
      e.target.value = '';
      return;
    }
  
    const url = URL.createObjectURL(file);
    preview.src = url;
    preview.style.display = 'block';
  });
  
  // ================= ENVIAR POST =================
  document.getElementById('post-form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const titulo = document.getElementById('titulo').value.trim();
    let id_categoria = document.getElementById('id_categoria').value;
  
    if (document.getElementById('categoria-manual-input').style.display !== 'none') {
      id_categoria = document.getElementById('id_categoria_manual').value;
    }
  
    if (!titulo) {
      mostrarMensagem('Título é obrigatório', 'error');
      return;
    }
  
    if (!id_categoria) {
      mostrarMensagem('Categoria é obrigatória', 'error');
      return;
    }
  
    const formData = new FormData();
    formData.append('acao', 'create_post');
    formData.append('titulo', titulo);
    formData.append('id_categoria', id_categoria);
    formData.append('usuarioId', localStorage.getItem('usuarioId'));
  
    const imgInput = document.getElementById('img');
    if (imgInput.files.length > 0) {
      formData.append('img', imgInput.files[0]);
    }
  
    const btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.textContent = 'Publicando...';
  
    try {
      const res = await fetch('http://localhost/p1_LES/api.php', {
        method: 'POST',
        body: formData
      });
  
      const data = await res.json();
      // const text = await res.text();
      // console.log(text);
  
      if (!data.success) {
        throw new Error(data.error || 'Erro ao criar post');
      }
  
      mostrarMensagem('Post criado com sucesso!', 'success');
  
      setTimeout(() => {
        window.location.href = '../telaHome.html';
      }, 1500);
  
    } catch (err) {
      console.error(err);
      mostrarMensagem(err.message, 'error');
  
      btn.disabled = false;
      btn.textContent = 'Publicar';
    }
  });
  
document.addEventListener('DOMContentLoaded', carregarCategorias);