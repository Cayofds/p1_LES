let codigo = null;

function mostrarMensagem(texto, tipo = 'neutral') {
    const el = document.getElementById('mensagem');
    el.innerText = texto;
    el.className = `recover-message recover-${tipo}`;
    el.style.display = 'block';
}

document.getElementById('formStep1').addEventListener('submit', (e) => {
    e.preventDefault();

    const usuario = document.getElementById('usuario').value;

    if (!usuario) {
        mostrarMensagem('Digite um usuário', 'error');
        return;
    }

    codigo = Math.floor(100000 + Math.random() * 900000);

    document.getElementById('codigoGerado').innerText = codigo;

    mostrarMensagem('Guarde o código e digite abaixo', 'success');

    document.getElementById('formStep1').style.display = 'none';
    document.getElementById('step2').style.display = 'block';
});

document.getElementById('formStep2').addEventListener('submit', (e) => {
    e.preventDefault();

    const digitado = document.getElementById('codigoDigitado').value;

    if (digitado == codigo) {
        mostrarMensagem('Código confirmado! Agora escolha uma nova senha.', 'success');

        document.getElementById('step2').style.display = 'none';
        document.getElementById('formStep3').style.display = 'block';
    } else {
        mostrarMensagem('Código incorreto', 'error');
    }
});

document.getElementById('formStep3').addEventListener('submit', async (e) => {
    e.preventDefault();

    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('novaSenha').value;
    const confirmar = document.getElementById('confirmarSenha').value;

    if (senha !== confirmar) {
        mostrarMensagem('As senhas não coincidem', 'error');
        return;
    }

    try {
        const res = await fetch('http://localhost/p1_LES/api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                acao: 'reset_senha',
                usuario,
                novaSenha: senha
            })
        });

        const data = await res.json();

        if (data.success) {
            mostrarMensagem('Senha alterada com sucesso!', 'success');

            setTimeout(() => {
                window.location.href = '../login/telaLogin.html';
            }, 1500);
        } else {
            mostrarMensagem(data.error || 'Erro ao alterar senha', 'error');
        }

    } catch (err) {
        console.error(err);
        mostrarMensagem('Erro no servidor', 'error');
    }
});