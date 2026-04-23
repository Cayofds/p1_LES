const usuarioId = localStorage.getItem('usuarioId');

if (usuarioId) {
    window.location.href = './telaHome.html';
} else {
    window.location.href = './telaLogin.html';
}