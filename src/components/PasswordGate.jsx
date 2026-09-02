import { useEffect, useState } from 'react';
import { ADMIN_PASSWORD } from '../constants';

// Simple app-level password gate. This is a convenience lock for a shared
// staff device, not real authentication — see the README's security notes.
export default function PasswordGate({ title, storageKey, children }) {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionStorage.getItem(storageKey) === 'true') setAuthed(true);
  }, [storageKey]);

  function handleSubmit(e) {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) {
      sessionStorage.setItem(storageKey, 'true');
      setAuthed(true);
      setError('');
    } else {
      setError('Wrong password. Try again.');
      setInput('');
    }
  }

  if (authed) return children;

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white border border-brown-900/10 rounded-2xl p-8 shadow-sm">
        <p className="text-turmeric font-medium mb-1">Hopper Station</p>
        <h1 className="font-display text-2xl text-brown-900 mb-1">{title}</h1>
        <p className="text-brown-900/60 text-sm mb-6">Enter the staff password to continue.</p>
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Password"
          autoFocus
          className="w-full rounded-lg border border-brown-900/20 px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-turmeric"
        />
        {error && <p className="text-chili text-sm mb-3">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-brown-900 text-cream py-3 font-medium hover:bg-brown-700 transition-colors"
        >
          Enter dashboard
        </button>
      </form>
    </div>
  );
}
