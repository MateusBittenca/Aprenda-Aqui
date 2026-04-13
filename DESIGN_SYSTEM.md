# Design system (web)

Referência rápida para manter o app consistente.

## Marca

- Componente [`BrandLogo`](apps/web/src/components/BrandLogo.tsx): uso único no header da landing, shell de auth e layout logado (`size`: `sm` | `md` | `lg`, `linkTo` opcional).

## Tipografia

- Título de página (área logada): `text-3xl font-bold`.
- Subtítulo / seção: `text-sm font-semibold uppercase tracking-wide text-slate-500` quando for label de seção.

## Cores de ação

- Primária: `bg-blue-600` / `hover:bg-blue-700` (botões principais, links fortes).
- Sucesso / estado positivo: `emerald` em badges e mensagens de matrícula.
- Erro: componente [`ErrorState`](apps/web/src/components/ui/ErrorState.tsx) (`border-red-200`, `bg-red-50/80`).

## Componentes UI

| Arquivo | Uso |
|--------|-----|
| `components/ui/Button.tsx` | Botões com variantes `primary`, `secondary`, `danger`, `ghost` e `loading`. |
| `components/ui/Card.tsx` | Container `rounded-3xl` + `shadow-soft`. |
| `components/ui/PageLoader.tsx` | Loading padrão com `Loader2` e `role="status"`. |
| `components/ui/ErrorState.tsx` | Erro de query com `queryErrorMessage` de `lib/errors.ts`. |
| `components/ui/EmptyState.tsx` | Lista vazia. |

## Feedback global

- Toasts: **Sonner** em [`App.tsx`](apps/web/src/App.tsx) (`<Toaster richColors />`). Preferir `toast.success` / `toast.error` em vez de `alert()`.

## Dados do usuário

- Tipo [`MeProfile`](apps/web/src/types/user.ts) e hook [`useMe`](apps/web/src/hooks/useMe.ts) para `GET /me` com opção `syncStore` para espelhar gamificação no Zustand.
