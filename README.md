# Sistema PDV — ponto de venda para pequenas lojas

[![CI](https://github.com/Claudeir20/Sistema_PVD/actions/workflows/ci.yml/badge.svg)](https://github.com/Claudeir20/Sistema_PVD/actions/workflows/ci.yml)

Sistema de ponto de venda (PDV) para lojas pequenas, como uma loja de acessórios de celular. Tem o caixa operado pelo teclado, controle de estoque com histórico, cancelamento auditado, importação de produtos por planilha e comprovante para impressora térmica.

**Backend:** Java 21 · Spring Boot 4 · Spring Security · Spring Data JPA · PostgreSQL · Flyway
**Frontend:** React 19 · TypeScript · Vite · Tailwind CSS 4
**Qualidade:** JUnit 5 · Mockito · MockMvc · Vitest · GitHub Actions · Docker

<!-- Coloque os prints em docs/ e troque os caminhos abaixo -->
![Venda no PDV](docs/pdv.gif)

| Painel | Vendas | Importação de produtos |
|---|---|---|
| ![Painel](docs/painel.png) | ![Vendas](docs/vendas.png) | ![Importação](docs/importacao.png) |

---

## Funcionalidades

### Caixa (PDV)
- Venda por **leitor de código de barras** ou pelo nome do produto; também aceita códigos internos para produtos sem código de barras (ex.: `CAP20`).
- Operação pelo teclado: **F2** busca, **F4** CPF na nota, **F6** desconto, **F10** finaliza e **F8** imprime o comprovante.
- Desconto, pagamento em dinheiro (calcula o **troco**), Pix, débito e crédito.
- **Comprovante não fiscal** na largura da bobina da impressora térmica (80 ou 58 mm).

### Gestão (perfil Administrador)
- **Painel** com o faturamento, o número de vendas, o ticket médio e um gráfico de vendas por dia, além dos produtos abaixo do estoque mínimo, que podem ser repostos ali mesmo.
- **Vendas:** consulta por período com o total por forma de pagamento, detalhe com os itens, reimpressão do comprovante e **cancelamento com motivo obrigatório**. O cancelamento devolve os itens ao estoque e registra quem cancelou e quando.
- **Produtos:** cadastro, edição, arquivamento e reativação, e **importação por CSV** (o formato do Excel em português) com prévia e erros apontados por linha.
- **Estoque:** entradas, ajuste por contagem física com motivo e histórico de movimentações de cada produto.
- **Usuários:** perfis **Administrador** e **Caixa**, troca de perfil, redefinição de senha e desativação.

---

## Decisões técnicas

### Regras de negócio nas entidades
As entidades (`Product`, `Sale`, `StockMovement`, `User`) não têm setters públicos. Toda mudança passa por um método com nome de negócio (`sale.cancel(...)`, `product.restock(...)`) que valida a regra antes de alterar o estado. Os services ficam finos: buscam, chamam a entidade e salvam.

### Transações "tudo ou nada"
- **Venda:** o backend confere o estoque, usa o **preço do banco** (nunca o que veio do navegador), baixa o estoque, calcula os totais e gera o número da venda (`V-0042`) por uma *sequence* do PostgreSQL. Se um item falha, nada é gravado.
- **Importação de CSV:** primeiro todas as linhas são conferidas, com **uma única consulta** para descobrir os códigos já cadastrados. Só depois tudo é gravado. Os erros voltam por linha (`{ line, message }`) e o frontend mostra cada um na sua linha da prévia.

### Concorrência
Os produtos e as vendas usam `@Version` (*optimistic locking*). Se duas pessoas editam o mesmo produto, a segunda recebe um aviso e o formulário reabre com os dados atuais. Dois admins cancelando a mesma venda ao mesmo tempo não devolvem o estoque duas vezes.

### Dinheiro em centavos
Todos os valores são `long` em centavos, no banco, na API e no frontend. Nada de `double` para dinheiro.

### Banco versionado
O schema é criado pelo **Flyway** (7 migrações). O Hibernate só valida que as entidades batem com as tabelas (`ddl-auto=validate`). As regras críticas também ficam no banco, como `CHECK` constraints: o total bate com o subtotal menos o desconto, o valor recebido em dinheiro cobre o total e uma venda cancelada tem data de cancelamento.

### Frontend sem biblioteca de estado
O carrinho, o troco e a busca são funções puras (`cart.ts`, `cashPayment.ts`, `productSearch.ts`, `productCsv.ts`) com testes próprios. Os componentes só chamam essas funções e desenham o resultado.

---

## Segurança

| Ponto | Como foi feito |
|---|---|
| Autenticação | Sessão no servidor (cookie), não JWT: dá para encerrar a sessão de alguém na hora |
| Senhas | BCrypt; limite de 72 caracteres (o limite do algoritmo) |
| CSRF | `CookieCsrfTokenRepository` (padrão SPA): o frontend devolve o token no cabeçalho `X-XSRF-TOKEN` |
| Cookie de sessão | `HttpOnly`, `SameSite=Lax`, `Secure` em produção, só por cookie (nunca na URL), expira após 4 h sem uso |
| Força bruta | 5 erros por e-mail ou 20 por IP em 15 min bloqueiam por 15 min (HTTP 429 com `Retry-After`) |
| Fixação de sessão | Troca o id da sessão no login |
| Sessões abertas | Desativar um usuário, mudar o perfil dele ou redefinir a senha **encerra as sessões dele na hora** (`SessionRegistry`) |
| Autorização | Regras por perfil no `SecurityConfig`. O frontend só esconde o que o perfil não pode usar; quem barra de verdade é o backend |
| Auditoria | Cancelamento de venda guarda quem cancelou, quando e o motivo |
| Erros | Respostas `{ "message": "..." }` em português, sem stack trace |

---

## Como rodar

### Pré-requisitos
- Java 21+
- Node 22 e pnpm 10
- PostgreSQL rodando localmente, com um banco chamado `sistema_pdv`

### Backend (porta 8080)
```bash
cd sistema-pdv/backend

# Linux/macOS
export DB_PASSWORD=senha-do-postgres
export ADMIN_EMAIL=admin@loja.com      # primeiro admin, criado só se o banco estiver vazio
export ADMIN_PASSWORD=uma-senha-forte
./mvnw spring-boot:run

# Windows (PowerShell)
$env:DB_PASSWORD = "senha-do-postgres"
$env:ADMIN_EMAIL = "admin@loja.com"
$env:ADMIN_PASSWORD = "uma-senha-forte"
.\mvnw.cmd spring-boot:run
```
O Flyway cria as tabelas na primeira execução. O banco padrão é `jdbc:postgresql://localhost:5432/sistema_pdv`, com o usuário `postgres`; para mudar, use `DB_URL` e `DB_USER`.

### Frontend (porta 8443)
```bash
cd sistema-pdv/frontend
pnpm install
pnpm dev
```
Acesse `http://localhost:8443`. O Vite repassa as chamadas `/api` para o backend.

Para personalizar a loja, crie `sistema-pdv/frontend/.env.local` (todas as variáveis são opcionais):
```
VITE_STORE_NAME=Celulares do João
VITE_STORE_CNPJ=12.345.678/0001-90
VITE_STORE_ADDRESS=Rua das Flores, 123 - Centro
VITE_RECEIPT_WIDTH=80mm
```

### Testes
```bash
cd sistema-pdv/backend && ./mvnw test     # JUnit, Mockito, MockMvc, H2 em memória
cd sistema-pdv/frontend && pnpm test      # Vitest
```
O **GitHub Actions** roda os dois a cada push e pull request, junto com a checagem de tipos e o build do frontend.

### Docker (produção)
O `Dockerfile` compila o frontend, roda **todos os testes** e gera **um único JAR** que serve a API e as telas. Se algum teste falhar, a imagem não é gerada.
```bash
cd sistema-pdv
docker build --build-arg VITE_STORE_NAME="Minha Loja" -t sistema-pdv .
docker run -p 8080:8080 \
  -e DATABASE_URL=jdbc:postgresql://host:5432/sistema_pdv \
  -e DATABASE_USER=... -e DATABASE_PASSWORD=... \
  -e ADMIN_EMAIL=... -e ADMIN_PASSWORD=... \
  sistema-pdv
```

---

## Estrutura

```
sistema-pdv/
├── backend/                    Spring Boot, organizado por funcionalidade
│   └── src/main/java/.../
│       ├── auth/               login, limite de tentativas, sessões
│       ├── user/               usuários e perfis
│       ├── product/            produtos, importação CSV, arquivados
│       ├── movements/          movimentações de estoque
│       ├── sale/               vendas e cancelamento
│       ├── config/             segurança e rotas do React
│       └── shared/error/       respostas de erro padronizadas
│   └── src/main/resources/db/migration/   migrações Flyway (V1 a V7)
├── frontend/                   React, organizado por tela
│   └── src/
│       ├── features/           pos, sales, products, stock, users, dashboard, receipt, auth
│       ├── services/           chamadas à API
│       ├── domain/             tipos e formatação (dinheiro, datas)
│       └── components/ui/      botões, diálogos, cartões
└── Dockerfile                  build integrado (frontend + backend em um JAR)
```

### Principais rotas da API

| Método | Rota | Perfil |
|---|---|---|
| `POST` | `/api/auth/login` · `/api/auth/logout` | público |
| `GET` | `/api/products` | Admin, Caixa |
| `POST` | `/api/sales` | Admin, Caixa |
| `GET` | `/api/sales?from=&to=` | Admin |
| `POST` | `/api/sales/{id}/cancel` | Admin |
| `POST` | `/api/products/import` | Admin |
| `GET` | `/api/products/archived` | Admin |
| `POST` | `/api/products/{id}/adjust` | Admin |
| `*` | `/api/users/**` | Admin |

---

## Limitações conhecidas

- **Pix simulado:** o QR Code e a confirmação são simulados no frontend; falta integrar com um provedor de pagamento.
- **Comprovante não fiscal:** não emite NFC-e/SAT. Isso exige certificado digital e integração com a SEFAZ.
- **Uma loja por instalação:** cada loja roda a sua própria instância e o seu próprio banco.
- **Estado em memória:** o limite de tentativas de login e o registro de sessões ficam na memória, o que basta para um servidor só.

---

## Autor

**Claudeir Francisco Mota** — estudante de Engenharia de Software, com foco em back-end Java.
[LinkedIn](https://www.linkedin.com/in/claudeir-mota-990033263/) · [GitHub](https://github.com/Claudeir20)
