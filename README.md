# FitConsult — Site + Painel Admin

## 📁 Estrutura do projeto

```
/
├── index.html          → Site público (João Pedro - Treinamento & Consultoria)
├── admin.html           → Atalho que redireciona para /admin/
├── middleware.js        → Protege as páginas do painel no servidor
├── package.json
├── .env.example          → Modelo das variáveis de ambiente (não sobe segredo nenhum)
├── api/
│   ├── login.mjs         → Verifica a senha no servidor e cria a sessão
│   └── logout.mjs        → Encerra a sessão
└── admin/
    ├── index.html         → Tela de login do painel
    ├── dashboard.html
    ├── alunos.html
    ├── agenda.html
    ├── treinos.html
    ├── avaliacoes.html
    ├── evolucao.html
    ├── financeiro.html
    ├── relatorios.html
    ├── configuracoes.html
    ├── style.css
    ├── script.js
    └── db.js
```

## 🔐 Como funciona o login agora

Diferente da primeira versão (onde a senha ficava escrita no JavaScript do navegador), agora:

1. Você digita a senha em `/admin/`.
2. O navegador manda essa senha para `/api/login.mjs`, uma função que roda **no servidor da Vercel**, não no seu navegador.
3. Essa função compara com a senha guardada na variável de ambiente `ADMIN_PASSWORD` (configurada só no painel da Vercel, nunca no código).
4. Se bater, o servidor cria um cookie de sessão assinado (`fc_session`), válido por 12 horas, e só então libera o acesso.
5. Toda vez que alguém tenta abrir uma página do painel (`dashboard.html`, `financeiro.html` etc.), o `middleware.js` verifica esse cookie **antes de entregar a página**. Sem cookie válido, a pessoa é redirecionada pro login — mesmo digitando a URL direto, e mesmo mexendo no navegador (diferente da versão anterior).

**Resultado:** a senha não aparece em nenhum lugar do código-fonte, do repositório do GitHub ou do "Ver código-fonte" do navegador — só existe dentro da Vercel, como variável de ambiente.

## ⚙️ Configuração obrigatória antes do primeiro deploy

Sem isso, o painel bloqueia o acesso de todo mundo (por segurança, se as variáveis não existem o middleware nega tudo).

1. Suba o projeto pro GitHub normalmente (pode ser repositório público ou privado — agora a senha não fica exposta em nenhum dos dois casos).
2. Na Vercel, importe o repositório.
3. Antes (ou depois) de fazer o deploy, vá em **Settings → Environment Variables** do projeto e adicione:
   - `ADMIN_PASSWORD` → a senha que você quer usar pra entrar no painel
   - `SESSION_SECRET` → uma string longa e aleatória (não precisa decorar, só precisa existir). Pra gerar uma boa, rode no terminal: `openssl rand -hex 32`
4. Clique em **Deploy** (ou refaça o deploy, se já tiver feito antes de configurar as variáveis).

Veja `.env.example` para o formato esperado.

## 🚀 Deploy na Vercel via GitHub

1. Suba todos esses arquivos ao GitHub mantendo a estrutura de pastas (`admin/` e `api/` precisam continuar como pastas).
2. Na Vercel: **Add New → Project** → importe o repositório.
3. Framework Preset: **Other** (não precisa de build command especial).
4. Configure as variáveis de ambiente do passo anterior.
5. Deploy.

Depois de publicado:
- Site público: `https://seu-projeto.vercel.app/`
- Painel admin: `https://seu-projeto.vercel.app/admin/`

## ⚠️ O que isso resolve e o que continua sendo limitação

**Resolvido:** a senha não fica mais visível no código; acessar uma página do painel direto pela URL sem estar logado agora é bloqueado de verdade (no servidor, não só por JavaScript no navegador).

**Continua sendo limitação:** os dados de alunos, treinos, pagamentos etc. **ainda ficam salvos no `localStorage` do navegador**, não em um banco de dados de verdade. Isso significa que:
- Só aparecem no navegador/computador onde foram cadastrados (não sincronizam entre celular e computador, por exemplo);
- Se limpar os dados do navegador, os dados do painel somem (a menos que você tenha exportado um backup em Configurações).

Se no futuro você quiser que os dados fiquem disponíveis de qualquer aparelho, o próximo passo seria trocar o `localStorage` por um banco de dados de verdade (ex: Postgres via Vercel, Supabase) — isso é um projeto à parte, maior que essa correção.

## 💾 Backup dos dados

Use a opção de exportação em **Configurações** dentro do painel para baixar um JSON com todos os dados cadastrados regularmente, já que eles ficam só no navegador.

## 🧪 Testando localmente (opcional)

Se quiser testar antes de subir pra Vercel:

```
npm i -g vercel
cp .env.example .env      # e preencha com valores de teste
vercel dev
```

© 2026 FitConsult
