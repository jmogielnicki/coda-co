'use client';

import { useActionState } from 'react';
import { loginAction } from './actions';

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen bg-pl2 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-tr mb-2">CodaCo</p>
          <h1 className="font-serif text-3xl text-ch">Admin Access</h1>
          <p className="text-cm text-sm mt-1.5">Enter the admin password to continue.</p>
        </div>

        <form action={formAction} className="bg-white rounded-lg border border-pl2 shadow-sm p-6 space-y-4">
          <div>
            <label htmlFor="password" className="block text-xs font-medium uppercase tracking-wider text-cm mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoFocus
              autoComplete="current-password"
              required
              className="w-full h-10 px-3 text-sm rounded border border-pl2 bg-pl text-ch placeholder:text-cl focus:outline-none focus:border-tr-l focus:bg-white transition-colors"
              placeholder="Enter password"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-tr-d bg-tr-p rounded px-3 py-2">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full h-10 bg-tr text-white text-sm font-medium rounded hover:bg-tr-d transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
