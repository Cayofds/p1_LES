async function carregarPosts() {
    try {
        const res = await fetch('http://localhost/p1_LES/api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                acao: 'get_posts'
            })
        });

        const data = await res.json();

        const container = document.getElementById('postsContainer');
        container.innerHTML = '';

        if (!data.success) {
            container.innerHTML = '<p>Erro ao carregar posts</p>';
            return;
        }

        data.posts.forEach(post => {

            const card = document.createElement('div');
            card.classList.add('card');

            const bg = post.img || 'https://picsum.photos/600/400';

            card.style.backgroundImage = `url('${bg}')`;

            card.innerHTML = `
                <div class="card-content">
                    <h2>${post.titulo}</h2>
                    <p>Categoria: ${post.categoria || '-'}</p>

                    <div class="profile">
                        <img src="${post.foto || '../img/default.png'}" class="foto-usuario-post">
                        <span>${post.usuario}</span>
                    </div>
                </div>
            `;

            container.appendChild(card);
        });

    } catch (err) {
        console.error(err);
    }
}

carregarPosts();

const nav = document.getElementById('navLinks');

// dados do usuário
const usuarioId = localStorage.getItem('usuarioId');
const nivel = localStorage.getItem('nivel');
const nome = localStorage.getItem('usuarioNome') || 'Usuário';

if (!usuarioId) {
    nav.innerHTML += `
        <li><a href="./login/telaLogin.html">Login</a></li>
    `;
}

if (usuarioId) {
    if (nivel == 2) {
        nav.innerHTML += `
            <li><a href="./posts/telaNovoPost.html">Novo post</a></li>
            <li><a href="./posts/telaMeusPosts.html">Meus posts</a></li>
        `;
    }

    // usuário geral
    nav.innerHTML += `
        <li>
            <span>Olá, <a href="./telaPerfil.html">${nome}</a></span>
        </li>
        <li>
            <a href="#" id="logoutBtn" style="color:#00ff00">Sair</a>
        </li>
    `;
}

document.addEventListener('click', (e) => {
    if (e.target.id === 'logoutBtn') {
        localStorage.clear();
        window.location.href = './login/telaLogin.html';
    }
});