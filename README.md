# PeçonhaFlora — protótipo de evidência territorial

Site estático (um único `index.html`, sem build, sem backend) inspirado na arquitetura do
BioMapaBrasil, adaptado para plantas medicinais e animais peçonhentos. Todos os registros
de dados de exemplo estão marcados como placeholder — **substitua antes de qualquer uso real**.

## Estrutura

- **1 arquivo**: `index.html` (CSS e JS inline, propositalmente — mais simples de hospedar e editar).
- **Dados**: array `REGISTROS` dentro do `<script>`, um objeto por registro:

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
5. Remova os registros de exemplo e insira os seus no array `REGISTROS`.

## Melhorias que valem a pena antes de usar em produção

- **Malha territorial do IBGE**: já implementada. O mapa busca a malha de UFs direto na
  [API oficial de malhas do IBGE](https://servicodados.ibge.gov.br/api/docs/malhas?versao=4)
  (`/api/v4/malhas/paises/BR?intrarregiao=UF`) e desenha os estados como polígonos clicáveis —
  clicar num estado filtra os registros daquela UF, igual ao comportamento do BioMapaBrasil.
  Não precisa de mapshaper nem de baixar arquivo nenhum: é uma chamada de rede direta.
- **Fotos com licença verificada**: se for usar fotos de exemplares do GBIF, filtre apenas por
  `license` = CC0 1.0 ou CC BY 4.0 (campo legível por máquina no registro de ocorrência) e credite
  autor + link, como no site original.
- **Camada de imagem orbital**: a base atual usa tiles CARTO (leves, confiáveis, sem chave).
  Se quiser o visual de imagem de satélite do original, troque a URL do `L.tileLayer` pela camada
  Sentinel-2 cloudless da EOX (`tiles.maps.eox.at`), respeitando a atribuição CC BY-NC-SA 4.0 deles.
- **Escala de evidência**: a régua A/B/C aqui é um ponto de partida simples. Documente a régua
  final de forma pública e estável — ela é o que dá credibilidade científica ao projeto.

## Publicar no GitHub Pages

```bash
git init
git add index.html README.md
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
