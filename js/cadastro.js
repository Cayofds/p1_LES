const form = document.getElementById('cadastroForm');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usuario = document.getElementById('usuario').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const senhaConfirm = document.getElementById('senha_confirm').value;
    const foto = document.getElementById('foto').files[0];

    if (senha !== senhaConfirm) {
        alert('As senhas não coincidem!');
        return;
    }

    let tipo = document.body.dataset.tipo;

    let nivel = null;
    let cnpj = null;
    let nome_real = null;

    if (tipo === 'empresa') {
        nivel = 3;
        cnpj = document.getElementById('cnpj')?.value;
    } else if (tipo === 'criador') {
        nivel = 2;
        nome_real = document.getElementById('nome_real')?.value;
    } else {
        nivel = 1;
    }

    const formData = new FormData();
    formData.append('acao', 'cadastro');
    formData.append('usuario', usuario);
    formData.append('email', email);
    formData.append('senha', senha);
    formData.append('nivel', nivel);

    if (cnpj) formData.append('cnpj', cnpj);
    if (nome_real) formData.append('nome_real', nome_real);
    if (foto) formData.append('foto', foto);

    try {
        const res = await fetch('http://localhost/p1_LES/api.php', {
            method: 'POST',
            body: formData
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