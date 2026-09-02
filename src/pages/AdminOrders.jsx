import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { STATUS } from '../constants';
import PasswordGate from '../components/PasswordGate';
import OrderTicket from '../components/OrderTicket';

function AdminOrdersInner() {
  const [queued, setQueued] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [preparing, setPreparing] = useState([]);

  useEffect(() => {
    const qQueued = query(collection(db, 'orders'), where('status', '==', STATUS.QUEUED), orderBy('createdAt', 'asc'));
    const qAccepted = query(collection(db, 'orders'), where('status', '==', STATUS.ACCEPTED), orderBy('acceptedAt', 'asc'));
    const qPreparing = query(collection(db, 'orders'), where('status', '==', STATUS.PREPARING), orderBy('preparingAt', 'asc'));

    const u1 = onSnapshot(qQueued, (s) => setQueued(s.docs.map((d) => ({ id: d.id, ...d.data() }))));
    const u2 = onSnapshot(qAccepted, (s) => setAccepted(s.docs.map((d) => ({ id: d.id, ...d.data() }))));
    const u3 = onSnapshot(qPreparing, (s) => setPreparing(s.docs.map((d) => ({ id: d.id, ...d.data() }))));

    return () => {
      u1();
      u2();
      u3();
    };
  }, []);

  async function accept(order) {
    await updateDoc(doc(db, 'orders', order.id), { status: STATUS.ACCEPTED, acceptedAt: serverTimestamp() });
  }
  async function startPreparing(order) {
    await updateDoc(doc(db, 'orders', order.id), { status: STATUS.PREPARING, preparingAt: serverTimestamp() });
  }
  async function markDone(order) {
    await updateDoc(doc(db, 'orders', order.id), { status: STATUS.DONE, doneAt: serverTimestamp() });
  }

  function logout() {
    sessionStorage.removeItem('hopper_admin_orders_auth');
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-cream px-6 py-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <p className="text-turmeric font-medium">Hopper Station</p>
          <h1 className="font-display text-3xl text-brown-900">Order desk</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/handover" className="text-sm text-brown-900/60 hover:text-brown-900">
            Pickup counter
          </Link>
          <Link to="/display" className="text-sm text-brown-900/60 hover:text-brown-900">
            Stall display
          </Link>
          <button onClick={logout} className="text-sm text-brown-900/60 hover:text-brown-900">
            Log out
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Section title="New tokens" subtitle="Take the order and send it to the kitchen">
          {queued.length === 0 && <Empty text="No one waiting" />}
          {queued.map((o) => (
            <OrderTicket key={o.id} order={o} actionLabel="Accept order" onAction={accept} />
          ))}
        </Section>

        <Section title="Accepted" subtitle="Waiting for the kitchen to start">
          {accepted.length === 0 && <Empty text="Nothing waiting to start" />}
          {accepted.map((o) => (
            <OrderTicket key={o.id} order={o} actionLabel="Start preparing" onAction={startPreparing} />
          ))}
        </Section>

        <Section title="Preparing" subtitle="On the pan right now">
          {preparing.length === 0 && <Empty text="Nothing on the pan" />}
          {preparing.map((o) => (
            <OrderTicket key={o.id} order={o} actionLabel="Mark done" onAction={markDone} />
          ))}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <section className="bg-white/60 rounded-2xl border border-brown-900/10 overflow-hidden flex flex-col">
      <header className="px-5 py-4 border-b border-brown-900/10">
        <h2 className="font-display text-xl text-brown-900">{title}</h2>
        <p className="text-xs text-brown-900/50">{subtitle}</p>
      </header>
      <div className="p-3 space-y-2 max-h-[70vh] overflow-y-auto">{children}</div>
    </section>
  );
}

function Empty({ text }) {
  return <p className="text-brown-900/40 text-sm px-2 py-6 text-center">{text}</p>;
}

export default function AdminOrders() {
  return (
    <PasswordGate title="Order desk login" storageKey="hopper_admin_orders_auth">
      <AdminOrdersInner />
    </PasswordGate>
  );
}
