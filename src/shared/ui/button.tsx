import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './cn'
import { forwardRef } from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-semibold transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-brand-green text-brand-dark hover:opacity-90',
        outline: 'border border-brand-green text-brand-green hover:bg-brand-green/10',
        ghost:   'text-text-muted hover:text-text-primary hover:bg-surface-muted',
        danger:  'bg-red-500 text-white hover:opacity-90',
      },
      size: {
        sm:  'h-8 px-3 text-xs',
        md:  'h-9 px-4',
        lg:  'h-11 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
)
Button.displayName = 'Button'
