# Checklist pedagógico — cada aula da plataforma

Uso: revisar **toda** aula antes de publicar para escola ou produção. Marque cada item.

## 1. Contexto

- [ ] Um parágrafo diz **para quem** é a aula (nível, público).
- [ ] **Pré-requisitos** explícitos (o que o aluno já precisa saber).
- [ ] Linguagem **neutra**, frases curtas, sem assumir equipamento além do navegador + material da plataforma.

## 2. Objetivo

- [ ] O campo `objective` no banco está **alinhado** ao texto.
- [ ] O objetivo é **verificável** (“ao terminar, o aluno consegue…”).

## 3. Conteúdo teórico

- [ ] **Conceitos** definidos em linguagem simples; jargão novo é explicado na primeira vez.
- [ ] Pelo menos **um exemplo guiado** (passo a passo ou antes/depois).
- [ ] **Erros comuns** (2–3 bullets), principalmente se houver exercício de código.

## 4. Alinhamento com o editor de código (MVP)

- [ ] Se a aula fala de React/TS mas o desafio é **expressão JavaScript**, o texto **ensina** o JS necessário (strings, `JSON.stringify`, arrays, etc.) **antes** do desafio, ou há um aviso claro.
- [ ] Frase única no `prompt` de cada exercício: **“Você já viu X nesta aula.”** (ou equivalente).

## 5. Conexão com os desafios

- [ ] Seção final **“O que você vai praticar”** (ou “Nos desafios abaixo você vai…”) listando **cada** desafio e a competência cobrada (quiz, lacunas, expressão).

## 6. Tempo e acessibilidade

- [ ] `estimatedMinutes` revisado após enriquecer o texto.
- [ ] Listas e títulos em ordem lógica; código em blocos com linguagem indicada quando útil.

## 7. Metadados dos exercícios

- [ ] `explanation` coerente com o enunciado.
- [ ] Onde existir `hints` no `payload`, coerência com o texto da aula.

## Curso piloto recomendado

**React — fundamentos** (`react-fundamentos` + `react-formularios-ui` no seed): primeiro módulo a ser tratado como **ouro** para calibrar tom e extensão das demais trilhas.

## Status no repositório (seed `seed-new-tracks.ts`)

- **React** (8 aulas) e **Algoritmos** (8 aulas): texto ampliado com **Contexto**, **ligação com JavaScript do editor**, **erros comuns** e rodapé **O que você vai praticar**; enunciados dos desafios alinhados.
- **TypeScript** (8 aulas): mesmo padrão aplicado.
- **HTTP na prática**: primeira aula (`REST como recursos`) no mesmo padrão; demais aulas HTTP e trilha **Qualidade** podem ser estendidas com o mesmo molde (conteúdo + `blocoPraticaDesafios` no seed ou edição via admin).
