<?php
header('Content-Type: application/json');

// conexão com banco
$conn = new mysqli("localhost", "root", "", "seu_banco");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Erro conexão"]);
    exit;
}

// pega JSON enviado pelo JS
$data = json_decode(file_get_contents("php://input"), true);

$acao = $data['acao'] ?? '';

// LOGIN
if ($acao === 'login') {
    $usuario = $data['usuario'];
    $senha = $data['senha'];

    $sql = "SELECT * FROM usuarios WHERE usuario = ? AND senha = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $usuario, $senha);
    $stmt->execute();

    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();

        echo json_encode([
            "success" => true,
            "usuarioId" => $user['id']
        ]);
    } else {
        echo json_encode(["success" => false]);
    }
}

// CADASTRO
if ($acao === 'cadastro') {
    $usuario = $data['usuario'];
    $senha = $data['senha'];

    $sql = "INSERT INTO usuarios (usuario, senha) VALUES (?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $usuario, $senha);

    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false]);
    }
}

$conn->close();
?>