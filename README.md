# PeçonhaFlora — protótipo de evidência territorial

Site estático (4 arquivos, sem build, sem backend) inspirado na arquitetura do
BioMapaBrasil, adaptado para plantas medicinais e animais peçonhentos. Todos os registros
de dados de exemplo estão marcados como placeholder — **substitua antes de qualquer uso real**.

## Estrutura

Agora são **4 arquivos**, cada um com uma responsabilidade — precisam estar todos na mesma pasta:

- **`index.html`** — só a estrutura (HTML). Não tem estilo nem lógica dentro.
- **`style.css`** — toda a aparência (cores, fontes, layout).
- **`app.js`** — toda a lógica (mapa, filtros, tabela, fichas, CSV). Carrega `dados.json` via `fetch` antes de renderizar.
- **`dados.json`** — só os registros, em JSON puro. **É o único arquivo que você precisa editar** para adicionar/trocar espécies.

Cada registro em `dados.json`:

```js
{
  id, organismo, tipo, uf, lat, lng,
  territorio: { grau, fonte },
  especie:    { grau, fonte },
  molecula:   { grau, nome, fonte },
  atividade:  { grau, desc, fonte }
}
```

- `grau` é `'A' | 'B' | 'C'` (definidos na seção "Como lemos evidência" da página).
- `grauFinal` é calculado automaticamente em `grauRegistro()` — é sempre o **pior** grau
  entre os quatro elos, nunca uma média. Não edite esse campo manualmente.

## Como adaptar com seus próprios dados

1. Rode uma consulta real no [GBIF](https://www.gbif.org/occurrence/search) para cada espécie
   e pegue `decimalLatitude`/`decimalLongitude` e o link da ocorrência.
2. Preencha `molecula.nome` e `molecula.fonte` com o CID do [PubChem](https://pubchem.ncbi.nlm.nih.gov)
   quando houver composto identificado, ou com o PDB ID quando houver estrutura cristalográfica
   ([rcsb.org](https://www.rcsb.org)).
3. Preencha `atividade.desc` e `atividade.fonte` com a referência real (DOI) do achado pré-clínico
   ou etnobotânico.
4. Atribua o `grau` de cada elo seguindo a régua da seção "Como lemos evidência" — decida essa régua
   com cuidado, é a peça metodológica mais importante do projeto.
5. Abra `dados.json` (direto no GitHub, ícone de lápis) e remova os seis registros de exemplo,
   colando os seus no lugar. Como agora é um arquivo isolado, você nunca precisa abrir `app.js`
   nem `index.html` só para atualizar dados.

## Melhorias que valem a pena antes de usar em produção

- **Malha territorial do IBGE**: já implementada. O mapa busca, direto na
  [API oficial de malhas do IBGE](https://servicodados.ibge.gov.br/api/docs/malhas?versao=4),
  o contorno do estado de Roraima e a subdivisão por município — sem precisar de mapshaper
  nem de baixar arquivo nenhum. Se a malha não aparecer, o `app.js` mostra um aviso na tela
  (o serviço do IBGE eventualmente fica instável; não é bug do código).
- **Fundo de satélite**: a base atual usa o World Imagery da Esri (sem chave de API).
- **Fotos com licença verificada**: se for usar fotos de exemplares do GBIF, filtre apenas por
  `license` = CC0 1.0 ou CC BY 4.0 (campo legível por máquina no registro de ocorrência) e credite
  autor + link, como no site original.
- **Escala de evidência**: a régua A/B/C aqui é um ponto de partida simples. Documente a régua
  final de forma pública e estável — ela é o que dá credibilidade científica ao projeto.
- **Filtro por estado**: o filtro por clique num polígono foi removido temporariamente quando o
  mapa passou a mostrar só Roraima (não fazia mais sentido filtrar por UF com um único estado
  visível). Se voltar a mostrar o Brasil inteiro, o gancho de clique pode ser reintroduzido.

## Publicar no GitHub Pages

```bash
git init
git add index.html style.css app.js dados.json README.md
git commit -m "primeira versão do protótipo"
git branch -M main
git remote add origin <seu-repositorio>
git push -u origin main
```

Depois, em **Settings → Pages** do repositório, aponte para a branch `main` (pasta raiz).
Não precisa de build step: é HTML puro servido como está.

## Aviso

Este protótipo não se destina a recomendação terapêutica, orientação de automedicação ou
decisão clínica. Uso tradicional documentado não constitui comprovação de eficácia.
