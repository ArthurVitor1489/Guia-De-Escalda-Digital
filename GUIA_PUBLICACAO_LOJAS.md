# Guia Completo: Publicação do CRUX na Google Play Store e Apple App Store 🚀🧗

Este documento contém o passo a passo prático para transformar o projeto CRUX em um aplicativo instalado nos smartphones de escaladores de todo o Brasil e publicado oficialmente nas lojas de aplicativos.

---

## 📱 Fase 1: Gerar o APK de Teste Imediato (Para você e amigos escaladores)

Antes de pagar contas de desenvolvedor, você pode gerar um instalador direto **`.apk`** para Android. Qualquer pessoa com um celular Android poderá instalar o CRUX através de um link ou arquivo WhatsApp/Drive!

### Passo 1.1: Instalar o utilitário oficial do Expo (EAS CLI)
No terminal, execute:
```bash
npm install -g eas-cli
```

### Passo 1.2: Fazer login na sua conta gratuita do Expo
Crie uma conta gratuita em [expo.dev](https://expo.dev) e faça login no terminal:
```bash
eas login
```

### Passo 1.3: Gerar o instalador APK para Android (Gratuito na nuvem do Expo)
Na pasta do projeto, execute:
```bash
eas build -p android --profile preview
```
> **Como funciona:** O Expo compila todo o projeto na nuvem (sem precisar instalar Android Studio ou Java no seu computador) e no final gera um link de download com QR Code. Basta abrir no celular, baixar o APK e instalar!

---

## 🛒 Fase 2: Publicação Oficial na Google Play Store (Android)

### Requisitos:
1. **Conta Google Play Console**:
   - Taxa única de **$25 dólares** (vitalícia).
   - Cadastro em: [play.google.com/console](https://play.google.com/console).
2. **Pacote do App**:
   - Já configurado no [`app.json`](./app.json): `com.arthurvitor.crux`
3. **Política de Privacidade**:
   - Já criada em [`public/privacy-policy.html`](./public/privacy-policy.html) (pode ser hospedada gratuitamente pelo GitHub Pages do seu repositório).

### Passo a passo para gerar o pacote oficial (.aab):
1. No terminal, execute:
   ```bash
   eas build -p android --profile production
   ```
2. O EAS vai gerar um arquivo com extensão **`.aab`** (Android App Bundle).
3. No painel do Google Play Console:
   - Clique em **"Criar app"**.
   - Nome: **CRUX - Guia de Escalada**
   - Idioma: **Português (Brasil)**
   - Categoria: **Esportes / Viagem e Local**
   - Suba o arquivo `.aab` gerado na faixa de teste ou produção.
   - Cole a URL da Política de Privacidade.
   - Envie para a revisão do Google (costuma levar de 2 a 5 dias úteis).

---

## 🍏 Fase 3: Publicação Oficial na Apple App Store (iOS)

### Requisitos:
1. **Apple Developer Program**:
   - Assinatura anual de **$99 dólares**.
   - Cadastro em: [developer.apple.com](https://developer.apple.com).
2. **Identificador de Pacote**:
   - Já configurado no [`app.json`](./app.json): `com.arthurvitor.crux`

### Passo a passo para compilar para iOS:
1. No terminal, execute:
   ```bash
   eas build -p ios --profile production
   ```
   *(Você não precisa de um Mac físico — a nuvem do Expo compila em servidores Mac da própria Expo!)*
2. Envie para o **TestFlight** para testar em iPhones da sua comunidade ou publique direto na App Store Connect.

---

## ☁️ Fase 4: Conectar o Banco de Dados em Nuvem (Supabase)

Para que os escaladores compartilhem vias, fotos e comentários em tempo real entre diferentes celulares:

1. Acesse [supabase.com](https://supabase.com) e crie um projeto gratuito.
2. Abra a aba **SQL Editor** e cole todo o conteúdo do arquivo [`supabase_schema.sql`](./supabase_schema.sql) e clique em **Run**.
3. Copie a **URL do Projeto** e a chave **anon key** no painel de API do Supabase.
4. Preencha no arquivo [`src/services/supabaseClient.ts`](./src/services/supabaseClient.ts) ou crie um arquivo `.env`:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
   ```
5. Pronto! O app manterá o funcionamento 100% offline nas falésias e sincronizará automaticamente sempre que o escalador tiver sinal de internet!

---

## 🖼️ Materiais Visuais Recomendados para a Loja

- **Ícone do App**: 512x512 px (PNG 32 bits sem transparência).
- **Banner Gráfico de Destaque**: 1024x500 px (PNG ou JPEG).
- **Screenshots (Capturas de tela)**:
  - Pelo menos 4 prints de boa qualidade:
    1. *Explorador de Destinos (Algodão de Jandaíra, Campina Grande)*.
    2. *Visualizador 3D da Parede com Simulador Solar*.
    3. *Croqui 2D Interativo e Lista de Vias*.
    4. *Perfil do Escalador e Fotos da Comunidade*.
