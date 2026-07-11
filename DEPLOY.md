# Deploy — Fabelle Imobiliária

Guia passo-a-passo para publicar o sistema. Total: ~1h se rodar liso.

## Stack

- **Banco**: Neon (Postgres serverless, free tier)
- **Backend**: Render (free tier, dorme após 15min ociosa)
- **Frontend**: Vercel (free tier)
- **Repositório**: GitHub

## ⚠️ Limitações do free tier

- Backend dorme após 15min sem tráfego → primeira request após ociosidade leva ~30s
- Uploads são **efêmeros** — arquivos somem em cada redeploy. Ok para demo, precisa de storage antes de aceitar dados reais
- Neon free: 0.5GB storage, 1 branch, boa pra demo
- Vercel: 100GB bandwidth/mês, mais que suficiente pra demo

---

## Passo 1 — GitHub

1. Crie conta em https://github.com se ainda não tem
2. Crie um repositório privado chamado **fabelle-imobiliaria**
3. Na raiz do projeto local:
   ```bash
   cd "C:\Users\Olá\OneDrive\Área de Trabalho\Sist.Imob"
   git init
   git add .
   git commit -m "initial commit"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/fabelle-imobiliaria.git
   git push -u origin main
   ```

**Verificação**: abrir o repo no browser e conferir que `backend/`, `frontend/`, `render.yaml` estão lá. `.env` e `dev.db` **NÃO** devem estar.

---

## Passo 2 — Postgres no Neon

1. Cria conta em https://neon.tech (login com GitHub é mais rápido)
2. Cria projeto chamado **fabelle**
3. Region: **AWS us-east-1** (mais próximo do Render free)
4. Postgres version: 16
5. Após criar, copia a **connection string** (formato `postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require`)

**Guarda essa string** — vai precisar no próximo passo.

---

## Passo 3 — Backend no Render

1. Cria conta em https://render.com (login com GitHub)
2. Botão **New** → **Blueprint**
3. Conecta o repositório GitHub `fabelle-imobiliaria`
4. Render lê `render.yaml` e propõe criar `fabelle-backend`
5. Antes de dar deploy, **preencher os 3 env vars** que estão marcados como "required":
   - `DATABASE_URL` = a connection string do Neon (colar exata, incluindo `?sslmode=require`)
   - `JWT_SECRET` = gerar novo, rodar no terminal local:
     ```bash
     node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
     ```
   - `FRONTEND_URL` = deixa em branco por enquanto, atualiza depois de subir a Vercel
6. Clica **Apply** → deploy inicia
7. Primeiro build leva ~5min (npm install + prisma generate + build + migrate deploy)

**Verificação**: quando ficar verde, abrir `https://fabelle-backend-XXXX.onrender.com/health` no browser. Deve retornar `{"status":"ok",...}`.

**Rodar o seed uma vez** para popular usuários e imóveis de exemplo:
- No painel do Render → **Shell** do serviço → executar:
  ```bash
  npx ts-node prisma/seed.ts
  ```

---

## Passo 4 — Frontend na Vercel

1. Cria conta em https://vercel.com (login com GitHub)
2. **Add New** → **Project** → importar o repo
3. **Root Directory** → clicar em Edit → escolher `frontend`
4. Framework Preset: **Next.js** (autodetecta)
5. Em **Environment Variables**, adicionar:
   - `NEXT_PUBLIC_API_URL` = URL do Render do passo anterior (ex: `https://fabelle-backend-abc.onrender.com`)
6. **Deploy** → ~3min

**Verificação**: acessar a URL da Vercel, tentar login com `admin@fabelle.com.br` / `admin123`.

---

## Passo 5 — Fechar o loop do CORS

1. Copiar a URL final da Vercel (`https://fabelle-imobiliaria-XXXX.vercel.app`)
2. Voltar no Render → serviço `fabelle-backend` → **Environment** → editar `FRONTEND_URL`
3. Colar a URL da Vercel
4. Salvar (Render reinicia automaticamente)

Agora o login funciona sem CORS error. Se você usar domínio próprio depois, adiciona também separado por vírgula: `https://vercel.app,https://fabelle.com.br`.

---

## Passo 6 — Configurar o admin da imobiliária

Para o cliente ver o sistema com dados reais:

1. Loga como `admin@fabelle.com.br` na URL da Vercel
2. Vai em **Equipe & Usuários** → cria os usuários da imobiliária com senhas novas
3. Deleta os usuários de demonstração (opcional)
4. Cadastra 3-4 imóveis de amostra com fotos

**Aviso obrigatório pro cliente**: "as fotos que você subir serão perdidas no próximo deploy — quando fecharmos contrato, migro pra storage permanente."

---

## Ordem de teste antes de mostrar

- [ ] Login e logout
- [ ] Cadastrar imóvel (sem foto)
- [ ] Cadastrar imóvel com foto — abrir e ver a foto carregada
- [ ] Cadastrar cliente
- [ ] Criar visita
- [ ] Criar contrato → assinar
- [ ] Ver dashboard com números aparecendo
- [ ] Recuperação de senha (opcional em prod — vai logar no console do Render, cliente não pode usar; precisa plugar e-mail)

## Quando o cliente aceitar contrato

Migrações necessárias antes de aceitar dados reais:

1. **Storage persistente**: Cloudflare R2 (10GB grátis, depois $0.015/GB)
2. **Plano Render Starter** ($7/mês) — sem sleep, sempre online
3. **Neon Launch** ($19/mês) — backup automático, maior storage
4. **Domínio próprio** (Registro.br + certificado SSL grátis pela Vercel)
5. **E-mail transacional**: Resend (3.000 emails/mês grátis) — recuperação de senha real
6. **Sentry** (grátis até 5k errors/mês) — monitoramento
7. **Auditoria** — log de quem alterou o quê
8. **Contrato de prestação de serviço**
9. **Política de privacidade** (LGPD)

---

## Troubleshooting

### Backend não sobe no Render
- Ver **Logs** → costuma ser `DATABASE_URL` malformada ou faltando `?sslmode=require`
- Neon exige SSL

### CORS error no login
- Confere que `FRONTEND_URL` no Render bate exatamente com a URL da Vercel (com `https://`, sem barra no final)
- Sem espaço, sem aspas

### Prisma migrate falha
- Neon free tier tem limite de conexões — se der `too many connections`, aguarda 1 min e reroda
- Se schema já existir do passo anterior, `migrate deploy` só aplica novas migrações

### Backend "cold start" demorado
- Free tier do Render dorme após 15 min sem tráfego
- Primeira request depois de dormir leva 20-40s
- Solução: usar UptimeRobot (grátis) fazendo ping em `/health` a cada 5min. Não é oficial mas funciona pra demo.
