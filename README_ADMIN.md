# Configuração do Painel Administrativo (/admin)

## 1. Variáveis de ambiente

Crie `.env` na raiz do projeto:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

> Nunca exponha a `service_role_key` no frontend. Apenas `anon_key` é segura para o navegador.

## 2. Tabela `guests`

```sql
create table guests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  guest_count int default 1,
  companion_name text,
  dietary_restrictions text,
  message text,
  status text check (status in ('confirmed','pending','declined')) default 'pending',
  confirmed_at timestamptz,
  source text check (source in ('public','admin')) default 'public',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## 3. Tabela `guest_history`

```sql
create table guest_history (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid references guests(id) on delete cascade,
  admin_id uuid,
  action text not null,
  field text,
  old_value text,
  new_value text,
  created_at timestamptz default now()
);
```

## 4. RLS (Row Level Security) — obrigatório

Ative RLS nas tabelas e crie políticas:

```sql
-- Permitindo que apenas autenticados vejam dados
alter table guests enable row level security;
alter table guest_history enable row level security;

create policy guests_select on guests for select
  using (auth.uid() is not null);

create policy guests_insert_public on guests for insert
  with check (source = 'public');

create policy guests_update_admin on guests for update
  using (auth.uid() is not null);

create policy guests_delete_admin on guests for delete
  using (auth.uid() is not null);

create policy history_select on guest_history for select
  using (auth.uid() is not null);

create policy history_insert on guest_history for insert
  with check (auth.uid() is not null);
```

## 5. Autenticação (Supabase Auth)

- Ative Email + Password em Authentication > Providers.
- Crie o usuário admin diretamente no painel Supabase Auth (ou via `auth.signUp` no console).
- Não use credenciais fixas no frontend.

## 6. Como acessar

O painel não está ligado no `App.tsx` público automaticamente para não interferir no site do casamento.

Use o arquivo separado:

```
/src/admin-entry.tsx
```

Para testar localmente, mude temporariamente `index.html` para carregar `src/admin-entry.tsx` em vez de `src/main.tsx`, ou crie uma rota no Vite para `/admin`.

## 7. Exportação CSV

O botão **Exportar** na tabela de convidados gera arquivos `.csv` com codificação UTF-8 (BOM para Excel abrir corretamente em português).

## 8. Dados simulados vs reais

> ⚠️ O painel consulta os mesmos registros que o formulário público (`submitRsvp`). Não há dados simulados: se a tabela está vazia, o dashboard mostra zero até que convidados respondam pelo site ou sejam cadastrados manualmente pelo admin.
