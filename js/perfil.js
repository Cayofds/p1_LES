function pegarNivel(nivel) {
    const map = {
        1: 'Visitante',
        2: 'Criador',
        3: 'Empresarial'
    };
    return map[nivel] || 'Desconhecido';
}

async function carregarPerfil() {

    const usuarioId = localStorage.getItem('usuarioId');

    if (!usuarioId) {
        window.location.href = './telaLogin.html';
        return;
    }

    try {
        const res = await fetch('http://localhost/p1_LES/api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                acao: 'get_user',
                usuarioId: usuarioId
            })
        });

        const data = await res.json();

        console.log('API retorno:', data);

        if (!data.success || !data.user) {
            document.getElementById('profile-container').innerHTML =
                '<p>Erro ao carregar perfil</p>';
            return;
        }

        const user = data.user;

        const html = `
            <div class="profile-box">
                <div class="pf-avatar">
                    <img src="${user.foto_perfil || '../img/default.png'}">
                </div>

                <div class="pf-info">
                    <h2>${user.usuario}</h2>
                    <div class="pf-row"><strong>Nível:</strong> ${pegarNivel(user.nivel)}</div>
                    <div class="pf-row"><strong>Email:</strong> ${user.email}</div>

                    ${user.nome_real ? `
                        <div class="pf-row"><strong>Nome real:</strong> ${user.nome_real}</div>
                    ` : ''}

                    ${user.cnpj ? `
                        <div class="pf-row"><strong>CNPJ:</strong> ${user.cnpj}</div>
                    ` : ''}

                    <div class="actions">
                        <a class="btn-secondary" href="./telaMeusPosts.html">Meus posts</a>
                        <a class="auth-button" href="./telaHome.html">Voltar</a>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('profile-container').innerHTML = html;

    } catch (err) {
        console.error(err);

        document.getElementById('profile-container').innerHTML =
            '<p>Erro no servidor</p>';
    }
}

document.addEventListener('DOMContentLoaded', carregarPerfil);