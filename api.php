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
            "usuarioId" => $user['id']
        ]);
    } else {
        echo json_encode(["success" => false]);
    }
} else {
    echo json_encode(["success" => false]);
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
        $null // placeholder pro blob
    );

    // 👇 hack necessário para BLOB
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

$conn->close();
?>