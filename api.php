<?php
header('Content-Type: application/json');

// conexão com banco
$conn = new mysqli("localhost", "root", "", "studio360");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Erro conexão"]);
    exit;
}

// detecta se veio FormData ou JSON
$isJson = strpos($_SERVER["CONTENT_TYPE"] ?? '', "application/json") !== false;

if ($isJson) {
    $data = json_decode(file_get_contents("php://input"), true);
} else {
    $data = $_POST;
}

$acao = $data['acao'] ?? '';

// ================= LOGIN =================
if($acao === "login"){
    $usuario = $data['usuario'] ?? '';
    $senha = $data['senha'] ?? '';

    $sql = "SELECT * FROM usuarios WHERE usuario = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $usuario);
    $stmt->execute();

    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();

        if (password_verify($senha, $user['senha'])) {
            echo json_encode([
                "success" => true,
                "usuarioId" => $user['id'],
                "nivel" => $user['nivel'],
                "usuario" => $user['usuario']
            ]);
        } else {
            echo json_encode(["success" => false]);
        }
    } else {
        echo json_encode(["success" => false]);
    }
}

// ================= CADASTRO =================
if ($acao === 'cadastro') {
    $usuario = $data['usuario'] ?? '';
    $email = $data['email'] ?? '';
    $senha = $senha = password_hash($data['senha'], PASSWORD_DEFAULT);
    $nivel = $data['nivel'] ?? 1;
    $cnpj = $data['cnpj'] ?? null;
    $nome_real = $data['nome_real'] ?? null;

    // 📸 imagem (opcional)
    $foto = null;
    if (isset($_FILES['foto']) && $_FILES['foto']['tmp_name']) {
        $foto = file_get_contents($_FILES['foto']['tmp_name']);
    }

    $sql = "INSERT INTO usuarios 
        (usuario, email, senha, nivel, cnpj, nome_real, foto_perfil) 
        VALUES (?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);

    // bind_param precisa de tipos
    $stmt->bind_param(
        "sssissb",
        $usuario,
        $email,
        $senha,
        $nivel,
        $cnpj,
        $nome_real,
        $null
    );

    if ($foto !== null) {
        $stmt->send_long_data(6, $foto);
    }

    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode([
            "success" => false,
            "error" => $stmt->error
        ]);
    }
}

// ================= BUSCAR POSTS =================
if ($acao === 'get_posts') {

    $sql = "SELECT 
                p.id,
                p.titulo,
                p.img,
                c.descricao AS categoria,
                u.usuario,
                u.foto_perfil
            FROM posts p
            LEFT JOIN categorias c ON p.id_categoria = c.id
            LEFT JOIN usuarios u ON p.id_usuario = u.id
            ORDER BY p.id DESC";

    $res = $conn->query($sql);

    $posts = [];

    while ($row = $res->fetch_assoc()) {

        // imagem do post
        $img = null;
        if (!empty($row['img'])) {
            $img = "data:image/jpeg;base64," . base64_encode($row['img']);
        }

        // foto do usuário
        $foto = null;
        if (!empty($row['foto_perfil'])) {
            $foto = "data:image/jpeg;base64," . base64_encode($row['foto_perfil']);
        }

        $posts[] = [
            "id" => $row['id'],
            "titulo" => $row['titulo'],
            "categoria" => $row['categoria'],
            "usuario" => $row['usuario'],
            "img" => $img,
            "foto" => $foto
        ];
    }

    echo json_encode([
        "success" => true,
        "posts" => $posts
    ]);
}

// ================= RESET SENHA =================
if ($acao === 'reset_senha') {

    $usuario = $data['usuario'] ?? '';
    $novaSenha = $data['novaSenha'] ?? '';

    if ($usuario === '' || $novaSenha === '') {
        echo json_encode([
            "success" => false,
            "error" => "Dados incompletos"
        ]);
        exit;
    }

    // verifica se usuário existe
    $stmt = $conn->prepare("SELECT id FROM usuarios WHERE usuario = ?");
    $stmt->bind_param("s", $usuario);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode([
            "success" => false,
            "error" => "Usuário não encontrado"
        ]);
        exit;
    }

    $user = $result->fetch_assoc();
    $userId = $user['id'];

    // criptografa a nova senha
    $senhaHash = password_hash($novaSenha, PASSWORD_DEFAULT);

    // atualiza no banco
    $stmt = $conn->prepare("UPDATE usuarios SET senha = ? WHERE id = ?");
    $stmt->bind_param("si", $senhaHash, $userId);

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "error" => "Erro ao atualizar senha"
        ]);
    }
}


// ================= PEGAR PERFIL =================
if ($acao === 'get_user') {

    $id = $data['usuarioId'];

    $stmt = $conn->prepare("SELECT usuario, email, nivel, foto_perfil FROM usuarios WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();

    $res = $stmt->get_result();

    if ($res->num_rows > 0) {
        $user = $res->fetch_assoc();

        if ($user['foto_perfil']) {
            $user['foto_perfil'] = "data:image/jpeg;base64," . base64_encode($user['foto_perfil']);
        }

        echo json_encode([
            "success" => true,
            "user" => $user
        ]);
    } else {
        echo json_encode(["success" => false]);
    }
}

// ================= PEGAR CATEGORIAS =================
if ($acao === 'get_categorias') {
    $res = $conn->query("SELECT id, descricao FROM categorias");

    $cats = [];
    while ($row = $res->fetch_assoc()) {
        $cats[] = $row;
    }

    echo json_encode([
        "success" => true,
        "categorias" => $cats
    ]);
}

// ================= CRIAR POST =================
if ($acao === 'create_post') {

    $titulo = $_POST['titulo'] ?? '';
    $id_categoria = $_POST['id_categoria'] ?? 0;
    $usuarioId = $_POST['usuarioId'] ?? 0;

    if (!$titulo || !$id_categoria || !$usuarioId) {
        echo json_encode([
            "success" => false,
            "error" => "Dados incompletos"
        ]);
        exit;
    }

    $img = null;

    if (isset($_FILES['img']) && $_FILES['img']['tmp_name']) {
        $img = file_get_contents($_FILES['img']['tmp_name']);
    }

    $stmt = $conn->prepare("
        INSERT INTO posts (titulo, id_categoria, id_usuario, img)
        VALUES (?, ?, ?, ?)
    ");

    $null = NULL;
    $stmt->bind_param("siib", $titulo, $id_categoria, $usuarioId, $null);

    if ($img) {
        $stmt->send_long_data(3, $img);
    }

    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode([
            "success" => false,
            "error" => "Erro ao inserir"
        ]);
    }

    exit;
}

$conn->close();
?>