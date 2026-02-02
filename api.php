<?php
/**
 * NEXT TI - PHP 7.0+ BACKEND API
 * Este arquivo processa todas as requisições do Service Desk.
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// Configurações e Persistência
$storageFile = 'database_store.json';

// Inicializa o arquivo se não existir
if (!file_exists($storageFile)) {
    $initialData = [
        'tickets' => [],
        'users' => [],
        'equipments' => []
    ];
    file_put_contents($storageFile, json_encode($initialData));
}

function getData() {
    global $storageFile;
    return json_decode(file_get_contents($storageFile), true);
}

function saveData($data) {
    global $storageFile;
    file_put_contents($storageFile, json_encode($data, JSON_PRETTY_PRINT));
}

// Roteamento Simples
$action = isset($_GET['action']) ? $_GET['action'] : '';
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

$data = getData();

switch ($action) {
    case 'check_connection':
        echo json_encode(['status' => 'connected', 'php_version' => phpversion()]);
        break;

    case 'tickets':
        if ($method === 'GET') {
            echo json_encode($data['tickets']);
        } elseif ($method === 'POST') {
            $data['tickets'][] = $input;
            saveData($data);
            echo json_encode(['success' => true]);
        }
        break;

    case 'update_ticket_status':
        if ($method === 'PATCH') {
            foreach ($data['tickets'] as &$t) {
                if ($t['id'] === $_GET['id']) {
                    $t['status'] = $input['status'];
                    $t['updatedAt'] = date('c');
                }
            }
            saveData($data);
            echo json_encode(['success' => true]);
        }
        break;

    case 'users':
        if ($method === 'GET') {
            echo json_encode($data['users']);
        } elseif ($method === 'PUT') {
            $found = false;
            foreach ($data['users'] as &$u) {
                if ($u['id'] === $input['id']) {
                    $u = $input;
                    $found = true;
                }
            }
            if (!$found) $data['users'][] = $input;
            saveData($data);
            echo json_encode(['success' => true]);
        }
        break;

    case 'equipments':
        if ($method === 'GET') {
            echo json_encode($data['equipments']);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Action not found']);
        break;
}
?>