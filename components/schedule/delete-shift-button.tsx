// components/schedule/delete-shift-button.tsx

'use client'

type Props = {
  label?: string
}

export default function DeleteShiftButton({ label = 'Delete' }: Props) {
  return (
    <button
      type="submit"
      onClick={(event) => {
        const confirmed = window.confirm(
          'Delete this shift? This cannot be undone.'
        )

        if (!confirmed) {
          event.preventDefault()
        }
      }}
      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
    >
      {label}
    </button>
  )
}