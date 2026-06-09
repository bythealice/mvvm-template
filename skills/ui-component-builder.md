---
name: ui-component-builder
description: Cria componentes genéricos em src/shared/ui/ seguindo os padrões do projeto — Tailwind, cva para variantes, forwardRef quando interativo, acessibilidade básica. Trigger em: cria um componente de X, adiciona Badge/Input/Modal no shared, preciso de um componente reutilizável, extrai isso pra shared/ui.
---

# ui-component-builder

Gera componentes em `src/shared/ui/`. Esses componentes não têm opinião de produto — são primitivos que qualquer feature pode usar sem acoplar a um contexto específico. Nada de `useQuery`, nada de import de feature, nada de lógica de negócio.

## Lê antes de gerar

1. **Abre `src/shared/ui/Button.tsx`** — o padrão de referência: `cva`, `cn()`, `forwardRef`.
2. **Verifica o que já existe em `src/shared/ui/`** — não duplica componente existente.
3. **Confirma `tailwind.config.ts`** — usa tokens de cor customizados quando existirem. Se o projeto tem `text-brand-dark`, não usa `text-gray-700`.
4. **Checa `package.json`** — `class-variance-authority`, `clsx` e `tailwind-merge` precisam estar instalados.

## Estrutura de um componente shared/ui

### Componente sem estado (Badge, Tag, Label)

Sem `forwardRef`, sem estado interno. Só recebe props e renderiza.

```tsx
// src/shared/ui/Badge.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/ui/utils'

const badgeVariants = cva(
  // classes base — sempre presentes
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:  'bg-gray-100 text-gray-700',
        success:  'bg-green-100 text-green-700',
        warning:  'bg-yellow-100 text-yellow-700',
        danger:   'bg-red-100 text-red-700',
        pending:  'bg-blue-100 text-blue-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode
}

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    >
      {children}
    </span>
  )
}
```

### Componente interativo (Input, Textarea, Select)

Usa `forwardRef` — permite que o componente pai controle o foco, que o React Hook Form registre o elemento, e que testes Cypress o localizem corretamente. Sem `forwardRef`, `register` do React Hook Form não funciona. Sempre define `displayName` explicitamente — sem ele, o React DevTools mostra `ForwardRef` sem contexto.

```tsx
// src/shared/ui/Input.tsx
import { forwardRef } from 'react'
import { cn } from '@/shared/ui/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      <input
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2',
          'text-sm placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-1',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${props.id}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${props.id}-error`} className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
)

Input.displayName = 'Input'
```

### Componente composto (Card, Modal, Dropdown)

Divide em subcomponentes quando a interface é mais rica. Cada parte é exportada separadamente — quem usa monta o que precisa.

```tsx
// src/shared/ui/Card.tsx
import { cn } from '@/shared/ui/utils'

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-lg border border-gray-200 bg-white shadow-sm', className)}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center justify-between p-6 pb-4', className)} {...props} />
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-0', className)} {...props} />
}

// Uso: <Card><CardHeader>título</CardHeader><CardContent>conteúdo</CardContent></Card>
```

## Checklist antes de entregar

- Props extendem o elemento HTML nativo (`React.HTMLAttributes<HTMLDivElement>`)
- `cn()` pra composição de classes — nunca concatenação manual de strings
- `cva` quando tiver mais de 1 variante visual
- `forwardRef` em todo elemento interativo (input, button, textarea, select)
- `displayName` explícito quando usar `forwardRef`
- Sem lógica de produto, sem import de feature, sem chamada de API
- `aria-invalid` e `aria-describedby` em inputs com estado de erro
- Tokens do `tailwind.config` quando disponíveis

## O que não faz

Não cria componente com `useQuery` ou `useMutation` — isso é ViewModel. Não importa dados de feature específica — esses dados chegam como props. Não usa `any` nas props. Não recria o que o shadcn já tem instalado.

## Como invocar

```
/ui-component-builder Badge — variantes: default, success, warning, danger
/ui-component-builder Input — com suporte a erro e label
/ui-component-builder DataTable — props: columns, data, isLoading, emptyMessage
/ui-component-builder Modal — com título, children, onClose e backdrop
/ui-component-builder StatusBadge — mapeia OrderStatus pra variant visual
```
