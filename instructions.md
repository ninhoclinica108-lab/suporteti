# 🚀 Guia de Implantação PHP - NEXT TI

Este sistema agora é totalmente compatível com **Hospedagem Compartilhada (cPanel)** rodando PHP 7.0 ou superior.

## 🛠️ Instalação Rápida (cPanel / FTP)

### 1. Preparação dos Arquivos
- Certifique-se de ter os arquivos:
  - `index.html` (o arquivo principal do app)
  - `api.php` (o motor do backend)
  - Pasta `dist/` (se gerado via build) ou todos os arquivos `.js` e `.css`.

### 2. Upload via Gerenciador de Arquivos
1. Acesse o seu cPanel -> **Gerenciador de Arquivos**.
2. Vá até a pasta `public_html` (ou a pasta do seu subdomínio).
3. Faça o upload de **todos** os arquivos da aplicação.
4. **IMPORTANTE:** Certifique-se de que o arquivo `api.php` está na mesma pasta que o `index.html`.

### 3. Permissões de Escrita
- O backend PHP utiliza um arquivo chamado `database_store.json` para salvar os dados.
- Verifique se a pasta onde está o `api.php` tem permissões de escrita (geralmente `755` ou `775`).
- O PHP criará o arquivo automaticamente no primeiro acesso.

## ⚙️ Requisitos do Servidor
- **PHP:** 7.0, 7.1, 7.2, 7.3, 7.4, 8.0+
- **Extensões:** JSON, MBString (padrão em 99% das hospedagens).
- **SSL:** Recomendado para segurança do chat em tempo real.

## 🔄 Migração para MySQL
Caso deseje usar MySQL em vez de JSON para maior performance com milhares de chamados:
1. Altere as funções `getData()` e `saveData()` no `api.php` para realizar consultas SQL via `PDO`.
2. As credenciais do banco podem ser definidas no topo do `api.php`.

## 📡 Monitoramento
Acesse `seu-site.com.br/api.php?action=check_connection` para validar se o backend está respondendo corretamente.