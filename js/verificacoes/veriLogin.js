const usuarioId = localStorage.getItem('usuarioId');
const paginaAtual = window.location.pathname;

if (!usuarioId && !paginaAtual.includes('telaLogin.html')) {
    window.location.href = '/p1_LES/view/login/telaLogin.html';
}

if (usuarioId && paginaAtual.includes('telaLogin.html')) {
    window.location.href = '/p1_LES/view/telaHome.html';
}