const usuarioId = localStorage.getItem('usuarioId');
const paginaAtual = window.location.pathname;

if (!usuarioId && !paginaAtual.includes('telaLogin.html')) {
    window.location.href = './telaLogin.html';
}

if (usuarioId && paginaAtual.includes('telaLogin.html')) {
    window.location.href = './telaHome.html';
}