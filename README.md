# MotoLog

Aplicativo web para registrar abastecimentos, manutenção e viagens de moto. Os
dados são armazenados no navegador usando `localStorage`; não é necessário
configurar um servidor ou banco de dados.

## Requisitos

- Node.js 20.19 ou superior
- npm

## Instalação

Na pasta do projeto, instale as dependências:

```bash
npm install
```

## Executar em desenvolvimento

```bash
npm run dev
```

Abra no navegador o endereço informado pelo Vite (normalmente
http://localhost:5173).

## Publicar no GitHub Pages

O workflow do GitHub Actions publica o site automaticamente quando há uma
atualização na branch `main`. No repositório, abra **Settings > Pages**, escolha
**GitHub Actions** como origem de publicação e salve. Após a execução do
workflow, o site estará disponível em:

https://jicsdev.github.io/motolog/

## Build de produção

```bash
npm run build
npm run preview
```

Os arquivos de produção são gerados na pasta `dist`.

## Mapas e navegação

Na aba **Viagem**, permita o acesso à localização, informe o endereço de
destino e toque em buscar para ver o mapa e as instruções. É possível ativar
orientações faladas em português antes ou durante a navegação. O recurso usa
OpenStreetMap para o mapa, Nominatim para pesquisar endereços e OSRM para
calcular rotas; esses serviços precisam de conexão com a internet. O cálculo
disponível usa rotas para carros, não recalcula automaticamente desvios e não
substitui a sinalização ou um aplicativo de navegação dedicado. O endereço
pesquisado e as coordenadas necessárias para traçar a rota são enviados aos
serviços de mapas mencionados.

## Verificações

```bash
npm run lint
```
