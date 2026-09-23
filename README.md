# CRUX — App de Escalada & Guia Digital Interativo

Aplicativo mobile moderno desenvolvido para escaladores com foco na representação visual de falésias, setores e paredes de escalada, incorporando o conceito pioneiro de **representação em 3 níveis com fallback automático**.

---

## 🪨 1. Arquitetura da Representação Visual da Parede

A entidade **Parede** escolhe dinamicamente a melhor tecnologia disponível para exibição, garantindo que o usuário nunca encontre uma parede vazia:

```text
MODELO 3D DISPONÍVEL?
        │
       SIM
        ↓
   MOSTRAR 3D (Three.js WebGL / Expo GL)
        │
       NÃO
        ↓
EXISTE CROQUI 2D INTERATIVO?
        │
       SIM
        ↓
 CROQUI 2D VETORIAL (SVG responsivo)
        │
       NÃO
        ↓
 FOTO DA PAREDE COM LISTAGEM ORDENADA (Fallback Nível 3)
```

### Nível 1: Modelo 3D Interativo (`Wall3DViewer.tsx`)
- **Renderização WebGL**: Malha tridimensional realista da rocha com relevo, fendas e tetos.
- **Geometria 3D Desacoplada**: Cada via possui coordenadas `[x, y, z]` próprias renderizadas como tubos 3D (`THREE.CatmullRomCurve3`) acompanhando a rocha.
- **Hardware 3D**: Chapeletas (discos metálicos) e Paradas Duplas (anéis dourados) posicionadas exatamente na rocha.
- **Controles**: Rotação com órbita travada para não perder o horizonte, zoom e simulação da incidência solar (Manhã, Meio-dia e Tarde) para leitura de sombra.
- **Interação**: Toque na via destaca o traçado e abre a ficha técnica completa.

### Nível 2: Croqui 2D Interativo (`WallTopo2DViewer.tsx`)
- Foto em alta resolução da falésia como plano de fundo.
- Camada vetorial SVG com coordenadas normalizadas `(0.0 a 1.0)`.
- Alternância de camadas: ligar/desligar marcações de chapeletas e nomes de vias.
- Destaca a via selecionada e escurece as demais com opacidade reduzida.

### Nível 3: Foto Simples de Fallback (`WallPhotoFallbackViewer.tsx`)
- Foto nítida da parede.
- Listagem sequencial ordenada rigorosamente da esquerda para a direita com numeração correspondente.

---

## 🇧🇷 2. Sistema de Graduação Brasileiro & Conversor
- Graduação padrão configurada para a **Escala Brasileira** (*3º, 4º, 5º sup, 6º, 6º sup, 7a, 7b, 7c, 8a, 8b, 9a, 10a...*).
- Conversão instantânea para **Escala Francesa** (*6a, 6b+, 7a...*) e **YDS / Americana** (*5.10b, 5.11c...*).
- Avaliação de risco e exposição à queda conforme norma brasileira:
  - **E1**: Proteção excelente, quedas limpas.
  - **E2**: Proteções espaçadas mas em terreno limpo.
  - **E3**: Quedas perigosas com possibilidade de choque em platôs.
  - **E4**: Risco de fratura ou queda no chão.
  - **E5**: Risco de morte em caso de queda.

---

## 📓 3. Logbook Pessoal & Modo 100% Offline
- Armazenamento local usando `@react-native-async-storage/async-storage`.
- Registro de cadenas com:
  - Estilo: *À Vista (Onsight)*, *Flash*, *Trabalhada (Redpoint)*, *Repetição*, *Projeto*.
  - Avaliação de 1 a 5 estrelas.
  - Opinião pessoal sobre a graduação da via.
  - Anotações de beta e nome do segurador/parceiro de corda.
- Ficha de Aproximação e Coordenadas GPS para localização remota no meio do mato sem sinal de celular.

---

## 📷 4. Pipeline de Fotogrametria

O sistema está preparado para receber arquivos `.glb` e `.gltf` otimizados:

```text
FOTOS DA PAREDE (DRONE + CHÃO COM 70% DE SOBREPOSIÇÃO)
       ↓
FOTOGRAMETRIA (Meshroom / RealityCapture / Metashape)
       ↓
NUVEM DE PONTOS DENSA & MALHA 3D
       ↓
SIMPLIFICAÇÃO & DECIMATION (< 60.000 polígonos para mobile)
       ↓
COMPRESSÃO DRACO & TEXTURA KTX2 (Arquivo .GLB de 3-8MB)
       ↓
STORAGE / CDN
       ↓
CRUX APP MOBILE
```

---

## 🚀 Como Executar o Projeto

No diretório `guia-escalada-app`:

### Pré-visualização Web Instantânea (Three.js 3D completo):
Dê dois cliques em `Iniciar_Web.bat` ou execute:
```bash
npm run web
```

### Executar no Celular via Expo Go ou Emulador Android:
Dê dois cliques em `Iniciar_App.bat` ou execute:
```bash
npm start
```
- Pressione `a` para abrir no Android Emulator;
- Ou escaneie o QR Code no terminal com o aplicativo **Expo Go** (Android/iOS).
