const form = document.getElementById('cadastroForm');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usuario = document.getElementById('usuario').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    // tipo do cadastro (define no HTML)
    let tipo = document.body.dataset.tipo;
    const nivel = null;

    let cnpj = null;
    let nome_real = null;

    if (tipo === 'empresa') {
        nivel = 3;
        cnpj = document.getElementById('cnpj').value;
    }else if (tipo === 'criador') {
        nivel = 2;
        nome_real = document.getElementById('nome_real').value;
    }else nivel = 1;

    try {
        const res = await fetch('http://localhost/seu_projeto/api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                acao: 'cadastro',
                usuario,
                email,
                senha,
                nivel,
                cnpj,
                nome_real
            })
        });

        const data = await res.json();

        if (data.success) {
            alert('Cadastro realizado!');
            window.location.href = './telaLogin.html';
        } else {
            alert('Erro ao cadastrar');
        }

    } catch (err) {
        console.error(err);
        alert('Erro no servidor');
    }
});