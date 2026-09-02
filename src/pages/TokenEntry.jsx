import { useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { STATUS, SPICE_LEVEL, SPICE_LABELS, DIET, DIET_LABELS } from '../constants';

// Atomically increments a shared counter doc so every customer gets a
// unique, sequential token even if two people submit at the same instant.
async function getNextToken() {
  const counterRef = doc(db, 'meta', 'tokenCounter');
  return runTransaction(db, async (transaction) => {
    const snap = await transaction.get(counterRef);
    const current = snap.exists() ? snap.data().value : 0;
    const next = current + 1;
    transaction.set(counterRef, { value: next });
    return next;
  });
}

export default function TokenEntry() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [spiceLevel, setSpiceLevel] = useState(SPICE_LEVEL.MILD);
  const [diet, setDiet] = useState(DIET.EGG);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!name.trim() || !phone.trim()) {
      setError('Fill in your name and phone number to join the line.');
      return;
    }
    if (phone.trim().length < 7) {
      setError('Enter a valid phone number.');
      return;
    }

    setSubmitting(true);
    try {
      const token = await getNextToken();
      await addDoc(collection(db, 'orders'), {
        token,
        name: name.trim(),
        phone: phone.trim(),
        spiceLevel,
        diet,
        status: STATUS.QUEUED,
        createdAt: serverTimestamp(),
      });
      setConfirmed({ token, name: name.trim() });
      setName('');
      setPhone('');
      setSpiceLevel(SPICE_LEVEL.MILD);
      setDiet(DIET.EGG);
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
              Enter next order
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
          Enter your details below and we'll give you a queue number. Watch the stall display and
          we'll call your order by name when it's ready — no need to keep standing in line.
        </p>

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

        <fieldset className="mb-5">
          <legend className="text-sm text-brown-900/70 mb-2">Side</legend>
          <div className="grid grid-cols-2 gap-2">
            <ChoiceButton
              active={spiceLevel === SPICE_LEVEL.MILD}
              onClick={() => setSpiceLevel(SPICE_LEVEL.MILD)}
              label={SPICE_LABELS[SPICE_LEVEL.MILD]}
            />
            <ChoiceButton
              active={spiceLevel === SPICE_LEVEL.SPICY}
              onClick={() => setSpiceLevel(SPICE_LEVEL.SPICY)}
              label={SPICE_LABELS[SPICE_LEVEL.SPICY]}
            />
          </div>
        </fieldset>

        <fieldset className="mb-8">
          <legend className="text-sm text-brown-900/70 mb-2">Hopper</legend>
          <div className="grid grid-cols-2 gap-2">
            <ChoiceButton
              active={diet === DIET.EGG}
              onClick={() => setDiet(DIET.EGG)}
              label={DIET_LABELS[DIET.EGG]}
            />
            <ChoiceButton
              active={diet === DIET.VEGETARIAN}
              onClick={() => setDiet(DIET.VEGETARIAN)}
              label={DIET_LABELS[DIET.VEGETARIAN]}
            />
          </div>
        </fieldset>

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

function ChoiceButton({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-lg border-2 px-3 py-3 text-sm text-left transition-colors ${
        active
          ? 'border-turmeric bg-turmeric/15 text-brown-900'
          : 'border-brown-900/15 text-brown-900/60 hover:border-brown-900/30'
      }`}
    >
      {label}
    </button>
  );
}
