# FitConsult — Site + Painel Admin

## 📁 Estrutura do projeto

```
/
├── index.html          → Site público (João Pedro - Treinamento & Consultoria)
├── admin.html          → Atalho que redireciona para /admin/
├── package.json
└── admin/
    ├── index.html       → Tela de login do painel (senha: jppoubel01)
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

**Fluxo de acesso ao painel:**
```
seusite.com/admin  →  login (senha: jppoubel01)  →  dashboard e demais páginas
```

## 🔧 O que foi corrigido nesta versão

1. **`index.html` agora é o site institucional de verdade.** Antes, o arquivo que ficava na raiz (e por isso seria servido em `seusite.com/`) era uma cópia do dashboard do admin, sem nenhuma senha. Agora o site público fica na raiz e o painel inteiro foi movido para `/admin/`.
2. **`db.js` agora é carregado em todas as páginas do painel.** Antes nenhuma página incluía esse script, então nenhuma delas conseguia ler ou salvar dados (erro "db is not defined").
3. **Proteção de sessão.** Cada página do painel agora verifica, antes de carregar, se existe uma sessão de login ativa (`sessionStorage`). Se não existir, redireciona para a tela de login. Isso fecha a brecha de simplesmente digitar a URL de uma página interna (ex: `/admin/financeiro.html`) e acessar sem senha.
4. **Botão "Sair"** adicionado no cabeçalho de todas as páginas do painel, encerra a sessão e volta para o login.
5. **Ícones (Font Awesome) corrigidos.** O código antigo usava um ID de "Kit" do Font Awesome que era só um placeholder (`yourkitid`) e nunca carregava os ícones. Troquei pela versão gratuita via CDN pública (cdnjs), que não exige conta nem chave.

## ⚠️ Limitações que continuam existindo (importante saber)

- **A senha do painel (`jppoubel01`) fica visível no código-fonte.** Isso é inevitável em qualquer site 100% estático (sem servidor/back-end): o navegador precisa ler a senha em algum lugar para comparar, e qualquer pessoa pode abrir o "Ver código-fonte" ou olhar o repositório no GitHub e encontrá-la. A proteção de sessão que adicionamos impede o acesso *casual* por URL direta, mas **não é segurança de verdade** contra alguém que queira especificamente entrar. Se você vai guardar dados sensíveis de alunos (financeiro, avaliações físicas), o recomendável no futuro é ter um back-end com autenticação real (ex: Vercel + banco de dados + login com senha criptografada).
- **Os dados ficam salvos no `localStorage` do navegador**, ou seja, só no dispositivo/navegador onde você cadastrou. Não sincronizam entre celular e computador, e se limpar os dados do navegador, some tudo (a menos que exporte um backup em Configurações).
- Se o repositório do GitHub for **público**, qualquer pessoa pode ver a senha só de olhar os arquivos. Se possível, deixe o repositório como **privado** no GitHub (a Vercel consegue fazer o deploy de repositórios privados normalmente).

## 🚀 Como subir na Vercel via GitHub

1. Crie um repositório no GitHub (de preferência **privado**, pelo motivo explicado acima) e suba todos esses arquivos mantendo a estrutura de pastas (a pasta `admin/` precisa continuar como pasta).
2. Na Vercel, clique em **"Add New" → "Project"** e importe esse repositório.
3. Como é um site estático (HTML puro), pode deixar o **Framework Preset como "Other"** — não precisa de build command nem output directory especiais.
4. Clique em **Deploy**.
5. Depois de publicado:
   - Site público: `https://seu-projeto.vercel.app/`
   - Painel admin: `https://seu-projeto.vercel.app/admin/`

## 💾 Backup dos dados

Use a opção de exportação em **Configurações** dentro do painel para baixar um arquivo JSON com todos os dados cadastrados (alunos, treinos, avaliações, pagamentos etc.) regularmente, já que tudo fica salvo só no navegador.

© 2026 FitConsult
