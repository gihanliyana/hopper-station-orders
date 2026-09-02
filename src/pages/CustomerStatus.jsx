import { useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { STATUS, STATUS_LABELS } from '../constants';

const STEPS = [STATUS.QUEUED, STATUS.ACCEPTED, STATUS.PREPARING, STATUS.DONE, STATUS.COMPLETED];

export default function CustomerStatus() {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch(e) {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    setError('');
    try {
      const q = query(
        collection(db, 'orders'),
        where('phone', '==', phone.trim()),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const snap = await getDocs(q);
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      setError('Could not check your order right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream px-4 py-10">
      <div className="max-w-md mx-auto">
        <p className="text-turmeric font-medium mb-1">Hopper Station</p>
        <h1 className="font-display text-3xl text-brown-900 mb-6">Check your order</h1>

        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number used at the queue"
            inputMode="tel"
            className="flex-1 rounded-lg border border-brown-900/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-turmeric"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brown-900 text-cream px-5 py-3 font-medium hover:bg-brown-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Checking…' : 'Check'}
          </button>
        </form>

        {error && <p className="text-chili text-sm mb-4">{error}</p>}

        {orders && orders.length === 0 && (
          <p className="text-brown-900/50 text-sm mb-4">
            No order found for that phone number. Double check the number you gave at the queue.
          </p>
        )}

        <div className="space-y-4">
          {orders &&
            orders.map((o) => (
              <div key={o.id} className="bg-white rounded-2xl border border-brown-900/10 p-5">
                <div className="flex items-baseline justify-between mb-4">
                  <span className="font-display text-xl text-brown-900">Token #{o.token}</span>
                  <span className="text-sm text-brown-900/50">{o.name}</span>
                </div>
                <StatusTrack status={o.status} />
              </div>
            ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/" className="text-sm text-brown-900/40 hover:text-brown-900/70">
            Back to token entry
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatusTrack({ status }) {
  const currentIndex = STEPS.indexOf(status);
  return (
    <div className="space-y-2">
      {STEPS.map((step, i) => {
        const reached = i <= currentIndex;
        return (
          <div key={step} className="flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full ${reached ? 'bg-curry' : 'bg-brown-900/15'}`} />
            <span className={`text-sm ${reached ? 'text-brown-900' : 'text-brown-900/40'}`}>
              {STATUS_LABELS[step]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
