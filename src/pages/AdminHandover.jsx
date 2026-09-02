import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { STATUS } from '../constants';
import PasswordGate from '../components/PasswordGate';
import OrderTicket from '../components/OrderTicket';

function AdminHandoverInner() {
  const [done, setDone] = useState([]);

  useEffect(() => {
    // Everything currently ready, oldest first — not capped, unlike the
    // 5-ticket window shown on the public stall display.
    const qDone = query(collection(db, 'orders'), where('status', '==', STATUS.DONE), orderBy('doneAt', 'asc'));
    const unsub = onSnapshot(qDone, (s) => setDone(s.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, []);

  async function complete(order) {
    await updateDoc(doc(db, 'orders', order.id), { status: STATUS.COMPLETED, completedAt: serverTimestamp() });
  }

  function logout() {
    sessionStorage.removeItem('hopper_admin_handover_auth');
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-cream px-6 py-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <p className="text-turmeric font-medium">Hopper Station</p>
          <h1 className="font-display text-3xl text-brown-900">Pickup counter</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/admin" className="text-sm text-brown-900/60 hover:text-brown-900">
            Order desk
          </Link>
          <button onClick={logout} className="text-sm text-brown-900/60 hover:text-brown-900">
            Log out
          </button>
        </div>
      </header>

      <div className="max-w-xl mx-auto space-y-2">
        {done.length === 0 && (
          <p className="text-brown-900/40 text-sm text-center py-12">No orders waiting for pickup</p>
        )}
        {done.map((o) => (
          <OrderTicket key={o.id} order={o} actionLabel="Handed over" onAction={complete} />
        ))}
      </div>
    </div>
  );
}

export default function AdminHandover() {
  return (
    <PasswordGate title="Pickup counter login" storageKey="hopper_admin_handover_auth">
      <AdminHandoverInner />
    </PasswordGate>
  );
}
