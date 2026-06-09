# [Component] — `src/shared/ui/[Component].tsx`

[Uma frase: o que esse componente é e quando usar.]

## Props

| Prop | Tipo | Padrão | O que faz |
|------|------|--------|-----------|
| `variant` | `'[a]' \| '[b]'` | `'[a]'` | [descrição] |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | [descrição] |
| `disabled` | `boolean` | `false` | Desabilita interação e esmaece visualmente |
| `className` | `string` | — | Classes Tailwind extras — merge automático via `cn()` |
| `...props` | `React.HTMLAttributes<[elemento]>` | — | Repassa qualquer atributo HTML nativo |

## Variantes

```tsx
// variante [a]
<[Component] variant="[a]">[conteúdo]</[Component]>

// variante [b]
<[Component] variant="[b]">[conteúdo]</[Component]>

// com className customizado
<[Component] className="mt-4 w-full">[conteúdo]</[Component]>
```

## Quando usar

[Quando faz sentido usar esse componente. Se tem alternativa (ex: use Badge pra status, não Tag), aponta.]

## O que NÃO está no componente

[Se tem lógica de produto que propositalmente ficou fora — ex: "não tem estado interno de open/close, o pai controla via prop" — documenta aqui para evitar confusão.]
