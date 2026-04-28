const form = document.getElementById('loginForm');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;

    try {
        const res = await fetch('http://localhost/p1_LES/api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                acao: 'login',
                usuario,
                senha
            })
        });

        const data = await res.json();

        if (data.success) {
            localStorage.setItem('usuarioId', data.usuarioId);

            alert('Login realizado com sucesso!');
            window.location.href = './telaHome.html';
        } else {
            alert('Usuário ou senha inválidos');
        }

    } catch (err) {
        console.error(err);
        alert('Erro no servidor');
    }
});