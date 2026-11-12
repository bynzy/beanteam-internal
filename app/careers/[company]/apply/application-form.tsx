
'use client'

import { useActionState } from 'react'
import { submitJobApplication } from './actions'

const initialState = {
    success: false,
    message: '',
}

export default function ApplicationForm({
    children,
}: {
    children: React.ReactNode
}) {
    const [state, formAction, isPending] = useActionState(
        async (_previousState: typeof initialState, formData: FormData) => {
            return await submitJobApplication(formData)
        },
        initialState
    )

    return (
        <form
            action={formAction}
            className="rounded-xl border p-8"
        >
            {children}

            {isPending && (
                <p
                    role="status"
                    className="mt-4 text-sm text-amber-700"
                >
                    Submitting your application...
                </p>
            )}


            {state.message && (
                <p
                    role="status"
                    aria-live="polite"
                    className={`mt-4 rounded-lg p-4 ${state.success
                        ? 'bg-green-50 text-green-800'
                        : 'bg-red-50 text-red-800'
                        }`}
                >
                    {state.message}
                </p>
            )}
        </form>
    )
}
