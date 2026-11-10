// components/schedule/submit-button.tsx

'use client'

import { useFormStatus } from 'react-dom'

type Props = {
  label: string
  pendingLabel?: string
  className?: string
}

export default function SubmitButton({
  label,
  pendingLabel = 'Saving...',
  className = '',
}: Props) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
    >
      {pending ? pendingLabel : label}
    </button>
  )
}