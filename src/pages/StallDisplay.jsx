import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import QRCode from 'react-qr-code';
import { db } from '../firebase';
import { STATUS } from '../constants';
import Column from '../components/Column';
import OrderTicket from '../components/OrderTicket';

export default function StallDisplay() {
  const [accepted, setAccepted] = useState([]);
  const [preparing, setPreparing] = useState([]);
  const [done, setDone] = useState([]);

  useEffect(() => {
    const qAccepted = query(
      collection(db, 'orders'),
      where('status', '==', STATUS.ACCEPTED),
      orderBy('acceptedAt', 'asc')
    );
    const qPreparing = query(
      collection(db, 'orders'),
      where('status', '==', STATUS.PREPARING),
      orderBy('preparingAt', 'asc')
    );
    // "Done" is capped at 5 directly in the query, per the display spec.
    const qDone = query(
      collection(db, 'orders'),
      where('status', '==', STATUS.DONE),
      orderBy('doneAt', 'desc'),
      limit(5)
    );

    const unsub1 = onSnapshot(qAccepted, (snap) => setAccepted(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    const unsub2 = onSnapshot(qPreparing, (snap) => setPreparing(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    const unsub3 = onSnapshot(qDone, (snap) => setDone(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, []);

  const statusUrl = typeof window !== 'undefined' ? `${window.location.origin}/status` : '';

  return (
    <div className="min-h-screen bg-cream px-6 py-6 flex flex-col">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-turmeric font-medium">Sri Lankan Food Festival</p>
          <h1 className="font-display text-4xl text-brown-900">Hopper Station</h1>
        </div>
        <div className="flex items-center gap-4 bg-white rounded-2xl border border-brown-900/10 px-5 py-3">
          <div className="bg-white p-1.5 rounded-lg">
            {statusUrl && <QRCode value={statusUrl} size={72} fgColor="#2B1810" />}
          </div>
          <p className="text-sm text-brown-900/70 max-w-[160px]">
            Scan to check your order status on your phone
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1">
        <Column title="Orders accepted" count={accepted.length} accent="bg-turmeric/15" height="420px">
          {accepted.length === 0 && <EmptyNote text="No accepted orders yet" />}
          {accepted.map((o) => (
            <OrderTicket key={o.id} order={o} />
          ))}
        </Column>

        <Column title="Preparing" count={preparing.length} accent="bg-clay/15" height="660px">
          {preparing.length === 0 && <EmptyNote text="Kitchen is waiting on the next ticket" />}
          {preparing.map((o) => (
            <OrderTicket key={o.id} order={o} />
          ))}
        </Column>

        <Column title="Ready for pickup" count={done.length} accent="bg-curry/15" height="420px">
          {done.length === 0 && <EmptyNote text="Nothing ready yet" />}
          {done.map((o) => (
            <OrderTicket key={o.id} order={o} />
          ))}
        </Column>
      </div>
    </div>
  );
}

function EmptyNote({ text }) {
  return <p className="text-brown-900/40 text-sm px-2 py-6 text-center">{text}</p>;
}
