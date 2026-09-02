import { useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { STATUS } from '../constants';

export default function TokenEntry() {
  const [token, setToken] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!token.trim() || !name.trim() || !phone.trim()) {
      setError('Fill in the token, name and phone number to join the line.');
      return;
    }
    if (phone.trim().length < 7) {
      setError('Enter a valid phone number.');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'orders'), {
        token: token.trim(),
        name: name.trim(),
        phone: phone.trim(),
        status: STATUS.QUEUED,
        createdAt: serverTimestamp(),
      });
      setConfirmed({ token: token.trim(), name: name.trim() });
      setToken('');
      setName('');
      setPhone('');
    } catch (err) {
      console.error(err);
      setError('Could not join the queue. Please try again or ask a staff member for help.');
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <p className="text-curry font-medium mb-2">You're in the queue</p>
          <h1 className="font-display text-5xl text-brown-900 mb-3">#{confirmed.token}</h1>
          <p className="text-brown-900/70 mb-8">
            Thanks, {confirmed.name}. Watch the stall display for your order, or check your status
            online any time.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setConfirmed(null)}
              className="rounded-lg bg-brown-900 text-cream px-6 py-3 font-medium hover:bg-brown-700 transition-colors"
            >
              Enter next token
            </button>
            <Link to="/status" className="text-sm text-brown-900/60 hover:text-brown-900">
              Check order status
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <p className="text-turmeric font-medium mb-1">Hopper Station</p>
        <h1 className="font-display text-3xl text-brown-900 mb-2">Join the order line</h1>
        <p className="text-brown-900/60 mb-8">
          Bring the token from the order counter and enter your details below. We'll call your
          order by name when it's ready — no need to keep standing in line.
        </p>

        <label className="block mb-4">
          <span className="text-sm text-brown-900/70 mb-1 block">Token number</span>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full rounded-lg border border-brown-900/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-turmeric"
            placeholder="e.g. 42"
            inputMode="numeric"
          />
        </label>

        <label className="block mb-4">
          <span className="text-sm text-brown-900/70 mb-1 block">Your name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-brown-900/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-turmeric"
            placeholder="e.g. Nimal"
          />
        </label>

        <label className="block mb-6">
          <span className="text-sm text-brown-900/70 mb-1 block">Phone number</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-brown-900/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-turmeric"
            placeholder="e.g. 0771234567"
            inputMode="tel"
          />
        </label>

        {error && <p className="text-chili text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-brown-900 text-cream py-3 font-medium hover:bg-brown-700 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Joining queue…' : 'Join queue'}
        </button>

        <div className="flex justify-center gap-4 mt-8 text-xs text-brown-900/40">
          <Link to="/status" className="hover:text-brown-900/70">
            Check order status
          </Link>
          <span>·</span>
          <Link to="/display" className="hover:text-brown-900/70">
            Stall display
          </Link>
          <span>·</span>
          <Link to="/admin" className="hover:text-brown-900/70">
            Staff login
          </Link>
        </div>
      </form>
    </div>
  );
}
