<img src="https://readme-typing-svg.demolab.com/?lines=Taskly:+Gerencie+tarefas+com+prioridade;Filtros,+Ordena%C3%A7%C3%A3o+e+Categorias;UI+r%C3%A1pida+com+atualiza%C3%A7%C3%B5es+otimistas" />

# Taskly

Taskly é um web app de tarefas focado em praticidade, organização e desempenho. Ele permite criar, filtrar e ordenar tarefas por prioridade e categoria, com uma experiência de uso fluida graças a atualizações otimistas e um design limpo.

## Recursos
- Categorias: `Trabalho` e `Pessoal` (apenas estas duas, sem "Outras").
- Prioridades: `Alta`, `Média`, `Baixa` (preenchimento opcional na criação/edição).
- Filtros: por `Prioridade`, `Ordenação` e `Categoria`, com botões em ordem clara e textos amigáveis.
- Ordenação: `Altas` (tarefas de alta prioridade primeiro), `Baixas` (tarefas de baixa prioridade primeiro) ou `Mais recente`.
- Estatísticas: cards que mostram `Total`, `Pendentes` e `Concluídas`, e definem o filtro de status na listagem.
- UI de concluídas aprimorada: botão de ação menor e selo de `Concluída` integrado no card.
- Desempenho: revalidação com `keepPreviousData` e otimizações de mutação para resposta imediata.
- Supabase (opcional): persistência real com schema e políticas RLS de desenvolvimento.

### Sessão de Anotações de Reuniões
- Página dedicada em `/notes` acessível pelo botão “Ir para Anotações” no Dashboard.
- Botão “Voltar às Tasks” visível no topo da página de Anotações.
- CRUD completo (criar, editar e excluir) com persistência em Supabase quando configurado; fallback em mock quando não.
- Data pré-preenchida com a data atual; exibição como “Criada em: dd/MM/yyyy, HH:mm”.
- Título destacado visualmente após salvar.
- Acessibilidade/atalhos: pressionar `Tab` no campo de título foca a caixa de anotações.
- Modo “Tópicos”: anotações em bullets, `Enter` cria novo tópico e `Backspace` em linha vazia remove o bullet.

## Stack
- React + Vite
- TailwindCSS + tailwindcss-animate
- React Query (@tanstack/react-query)
- Framer Motion
- Lucide Icons
- Axios (com mock adapter quando Supabase está desabilitado)
- Supabase (opcional)

## Requisitos
- Node.js 18+ (recomendado LTS)
- npm 9+ ou pnpm/yarn (npm usado nos exemplos)
- Opcional: Supabase CLI e um projeto no Supabase

## Instalação

### macOS
1. Instale Node.js (via Homebrew):
   ```bash
   brew install node
   ```
2. Clone o repositório e instale dependências:
   ```bash
   git clone <seu-repo-url> Taskly && cd Taskly
   npm install
   ```
3. Execute em desenvolvimento:
   ```bash
   npm run dev
   ```
   - A URL do dev server aparecerá no terminal (ex.: `http://localhost:5173`).

### Linux (Debian/Ubuntu)
1. Instale Node.js:
   ```bash
   sudo apt update && sudo apt install -y nodejs npm
   ```
   - Para versões mais novas, considere `nvm`.
2. Clone e instale:
   ```bash
   git clone <seu-repo-url> Taskly && cd Taskly
   npm install
   ```
3. Execute:
   ```bash
   npm run dev
   ```
   - Abra a URL exibida no terminal.

### Windows
1. Instale Node.js (https://nodejs.org/) usando o instalador oficial.
2. Clone e instale:
   ```powershell
   git clone <seu-repo-url> Taskly
   cd Taskly
   npm install
   ```
3. Execute:
   ```powershell
   npm run dev
   ```
   - Acesse a URL exibida no terminal.

## Variáveis de ambiente (Supabase opcional)
Crie um arquivo `.env` (ou use `.env.example` como referência) e defina:

```
VITE_SUPABASE_URL=https://<sua-instancia>.supabase.co
VITE_SUPABASE_ANON_KEY=<sua-anon-key>
```

- Com ambas definidas, o app usa Supabase; sem elas, usa dados mock.
- Se usar Supabase, execute `supabase/schema.sql` no SQL Editor para criar a tabela e políticas.

### Supabase: tabela `notes`
O schema inclui a tabela `public.notes` para persistir anotações de reuniões com RLS e trigger de atualização de data.

Resumo dos campos:
- `id` (UUID, PK)
- `title` (TEXT)
- `date` (DATE) — data da reunião (campo do formulário)
- `topics` (TEXT) — conteúdo das anotações (texto ou bullets)
- `created_date` (TIMESTAMP WITH TIME ZONE DEFAULT NOW())
- `updated_date` (TIMESTAMP WITH TIME ZONE DEFAULT NOW())

Políticas (ambiente dev):
- SELECT, INSERT, UPDATE, DELETE: permissivas para facilitar desenvolvimento (exibidas e aplicadas em `supabase/schema.sql`).

SQL (referência rápida — já incluso em `supabase/schema.sql`):
```sql
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  topics text,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

alter table public.notes enable row level security;

create policy notes_select_dev on public.notes for select using (true);
create policy notes_insert_dev on public.notes for insert with check (true);
create policy notes_update_dev on public.notes for update using (true);
create policy notes_delete_dev on public.notes for delete using (true);

create or replace function public.set_updated_date_notes()
returns trigger as $$
begin
  new.updated_date := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_date_notes_trigger on public.notes;
create trigger set_updated_date_notes_trigger
before update on public.notes
for each row
execute function public.set_updated_date_notes();
```

## Scripts NPM
- `npm run dev` — inicia o dev server e abre o navegador automaticamente (Vite `--open`).
- `npm run build` — gera produção em `dist/`.
- `npm run preview` — pré-visualiza o build localmente.

## Criar atalho "taskly" que abre o Web App

### macOS (zsh)
1. Abra seu arquivo de perfil:
   ```bash
   nano ~/.zshrc
   ```
2. Adicione um alias (ajuste o caminho para seu projeto):
   ```bash
   alias taskly='(cd "$HOME/Projetos/Taskly" && npm run dev &>/dev/null &) && sleep 1 && open http://localhost:5173'
   ```
   - Isso inicia o servidor em segundo plano e abre o navegador. O Vite pode escolher outra porta se 5173 estiver ocupada; verifique o terminal.
3. Recarregue o perfil:
   ```bash
   source ~/.zshrc
   ```

Alternativa (script em PATH):
```bash
mkdir -p "$HOME/bin"
cat > "$HOME/bin/taskly" <<'SH'
#!/usr/bin/env bash
cd "$HOME/Projetos/Taskly" || exit 1
npm run dev &
sleep 1
open "http://localhost:5173"
SH
chmod +x "$HOME/bin/taskly"
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
```

### Linux (bash)
1. Editar `~/.bashrc`:
   ```bash
   nano ~/.bashrc
   ```
2. Alias:
   ```bash
   alias taskly='(cd "$HOME/Projetos/Taskly" && npm run dev &>/dev/null &) && sleep 1 && xdg-open http://localhost:5173'
   ```
3. Recarregue:
   ```bash
   source ~/.bashrc
   ```

Alternativa (script em PATH):
```bash
mkdir -p "$HOME/bin"
cat > "$HOME/bin/taskly" <<'SH'
#!/usr/bin/env bash
cd "$HOME/Projetos/Taskly" || exit 1
npm run dev &
sleep 1
xdg-open "http://localhost:5173"
SH
chmod +x "$HOME/bin/taskly"
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc && source ~/.bashrc
```

### Windows
Opção simples com PowerShell (recomendado):
1. Crie um script em um diretório no PATH (por exemplo, `%USERPROFILE%\Scripts`):
   ```powershell
   New-Item -ItemType Directory -Force "$env:USERPROFILE\Scripts" | Out-Null
   Set-Content "$env:USERPROFILE\Scripts\taskly.ps1" @'
cd "$env:USERPROFILE\Projetos\Taskly"
Start-Process npm -ArgumentList "run dev"
Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"
'@
   ```
2. Adicione o diretório ao PATH do usuário (Painel de Controle → Sistema → Avançado → Variáveis de Ambiente).
3. Permita execução de scripts locais (se necessário):
   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
   ```
4. Agora, no PowerShell, digite `taskly` para abrir o app.

Alternativa com `.cmd`:
```bat
@echo off
cd "%USERPROFILE%\Projetos\Taskly"
start cmd /c npm run dev
timeout /t 2 >nul
start "" http://localhost:5173
```
Salve como `taskly.cmd` em um diretório do PATH.

> Nota: o script `dev` já usa `vite --open`, então o navegador abre automaticamente na porta correta.

## Supabase: esquema e migração de categorias
Para manter apenas `trabalho` e `pessoal`, aplique o conteúdo de `supabase/schema.sql` no SQL Editor. Caso tenha dados antigos (`pessoais` ou `outras`), rode:

```sql
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_category_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_category_check CHECK (category IN ('trabalho','pessoal','pessoais','outras'));
UPDATE public.tasks SET category = 'pessoal' WHERE category IN ('pessoais','outras');
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_category_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_category_check CHECK (category IN ('trabalho','pessoal'));
```

## Build de produção
```bash
npm run build
npm run preview
```
Os arquivos prontos ficam em `dist/`.

## Troubleshooting
- Porta em uso ao iniciar o dev server: o Vite escolhe outra porta automaticamente; verifique o terminal e use a URL exibida. Com `--open`, o navegador já abre na porta correta.
- Variáveis do Supabase ausentes: defina `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no `.env`. Sem elas, o app usa dados mock e não persiste no Supabase.
- Esquema não aplicado: execute `supabase/schema.sql` no SQL Editor do seu projeto Supabase antes de usar persistência real.
- Erros de RLS (Row Level Security): garanta que as políticas em `schema.sql` estejam ativas e que você está usando a anon key correta.

## Licença
Este projeto usa a licença MIT. Veja o arquivo `LICENSE` para detalhes.