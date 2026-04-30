// ================= PROTEÇÃO =================
if (!localStorage.getItem('usuarioId')) {
    window.location.href = '../login/telaLogin.html';
}

// ================= ESCAPE (FALTAVA) =================
function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>"']/g, m => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[m]));
}

// ================= CARREGAR POSTS =================
async function loadUserPostsData() {
    try {

        const response = await fetch('http://localhost/p1_LES/api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                acao: 'get_posts',
                usuarioId: localStorage.getItem('usuarioId')
            })
        });

        const data = await response.json();

        console.log('API:', data); // 🔍 DEBUG

        if (!data.success) {
            throw new Error('Erro ao carregar posts');
        }

        document.getElementById('user-greeting').textContent =
            `Olá, ${localStorage.getItem('usuarioNome') || 'Você'}`;

        carregarPosts(data.posts);

    } catch (error) {
        console.error(error);

        document.getElementById('posts-container').innerHTML =
            `<p class="error-message">Erro ao carregar seus posts</p>`;
    }
}

// ================= RENDER =================
function carregarPosts(posts) {
    const container = document.getElementById('posts-container');

    if (!posts || posts.length === 0) {
        container.innerHTML = '<p>Você ainda não publicou nenhum post.</p>';
        return;
    }

    let html = '';

    posts.forEach(post => {

        const title = escapeHtml(post.titulo || 'Sem título');
        const categoria = escapeHtml(post.categoria || '-');
        const nome = escapeHtml(post.usuario || 'Usuário');

        const perfilSrc = post.foto || '../img/default.png';

        const bg = post.img
            ? `background-image: url('${post.img}');`
            : `background-image: url('https://picsum.photos/600/400?random=${post.id}');`;

        html += `
            <div class="card" style="${bg}">
                <div class="card-content">
                    <h2>${title}</h2>
                    <p>Categoria: ${categoria}</p>

                    <div class="profile">
                        <img src="${perfilSrc}" class="foto-usuario-post">
                        <span>${nome}</span>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ================= INIT =================
document.addEventListener('DOMContentLoaded', loadUserPostsData);