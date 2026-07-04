import React, { useEffect, useRef, useState } from 'react';
import { ScanBarcode, Trash2, Plus, Minus, CheckCircle2, Camera } from 'lucide-react';
import Layout from '../components/Layout';
import CameraScanner from '../components/CameraScanner';
import api from '../api/axios';

export default function POS() {
  const [barcode, setBarcode] = useState('');
  const [cart, setCart] = useState([]);
  const [scanError, setScanError] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [completedSale, setCompletedSale] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function lookupBarcode(code) {
    if (!code.trim()) return;
    setScanError('');

    try {
      const { data: product } = await api.get(`/products/barcode/${code.trim()}`);
      addToCart(product);
    } catch (err) {
      setScanError(err.response?.data?.message || 'Product not found.');
    }
  }

  async function handleScan(e) {
    e.preventDefault();
    await lookupBarcode(barcode);
    setBarcode('');
    inputRef.current?.focus();
  }

  function handleCameraDetected(code) {
    setShowCamera(false);
    lookupBarcode(code).finally(() => inputRef.current?.focus());
  }

  function addToCart(product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.qty + 1 > product.quantity) {
          setScanError(`Only ${product.quantity} units of "${product.name}" available.`);
          return prev;
        }
        return prev.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }

  function updateQty(id, delta) {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item))
        .filter((item) => item.qty > 0)
    );
  }

  function removeItem(id) {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }

  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);
  const total = Math.max(subtotal - Number(discount || 0), 0);

  async function handleCheckout() {
    if (cart.length === 0) return;
    setSubmitting(true);
    setScanError('');

    try {
      const { data } = await api.post('/sales', {
        items: cart.map((item) => ({ product_id: item.id, quantity: item.qty })),
        discount: Number(discount || 0),
        payment_method: paymentMethod,
      });
      setCompletedSale(data);
      setCart([]);
      setDiscount(0);
    } catch (err) {
      setScanError(err.response?.data?.message || 'Checkout failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">Point of Sale</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* Scan + Cart */}
        <div className="col-span-2 space-y-4">
          <form onSubmit={handleScan} className="bg-white rounded-xl border border-stone-100 p-4 flex gap-3">
            <ScanBarcode className="text-amber-dark shrink-0 mt-2.5" size={22} />
            <input
              ref={inputRef}
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Scan or type a barcode, then press Enter…"
              className="flex-1 px-3 py-2 rounded-lg border border-stone-100 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber/50 font-mono-num text-sm"
              autoFocus
            />
            <button type="submit" className="px-4 py-2 bg-ink text-white rounded-lg text-sm font-medium hover:bg-ink-light">
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowCamera(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber text-ink-dark rounded-lg text-sm font-medium hover:bg-amber-dark hover:text-white"
              title="Scan using your phone or laptop camera"
            >
              <Camera size={16} />
              Camera
            </button>
          </form>

          {scanError && <p className="text-sm text-brick px-1">{scanError}</p>}

          <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-ink/50 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Product</th>
                  <th className="text-center px-4 py-3">Qty</th>
                  <th className="text-right px-4 py-3">Unit Price</th>
                  <th className="text-right px-4 py-3">Subtotal</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {cart.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-ink/40">
                      Cart is empty — scan a product to begin.
                    </td>
                  </tr>
                )}
                {cart.map((item) => (
                  <tr key={item.id} className="border-t border-stone-100">
                    <td className="px-4 py-3 text-ink/80">{item.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => updateQty(item.id, -1)} className="p-1 rounded hover:bg-stone-100">
                          <Minus size={14} />
                        </button>
                        <span className="font-mono-num w-6 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="p-1 rounded hover:bg-stone-100">
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono-num">{Number(item.price).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-mono-num font-medium">
                      {(Number(item.price) * item.qty).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => removeItem(item.id)} className="text-brick/70 hover:text-brick">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Receipt / checkout panel */}
        <div className="receipt-panel rounded-xl p-5 h-fit sticky top-8">
          <h2 className="font-display font-semibold text-ink mb-4">Order Summary</h2>

          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between text-ink/60">
              <span>Subtotal</span>
              <span className="font-mono-num">{subtotal.toFixed(2)} TND</span>
            </div>
            <div className="flex justify-between items-center text-ink/60">
              <span>Discount</span>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-20 text-right font-mono-num px-2 py-1 rounded border border-stone-100 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber/50"
              />
            </div>
          </div>

          <div className="border-t border-dashed border-stone-100 pt-3 mb-4">
            <div className="flex justify-between items-baseline">
              <span className="font-display font-semibold text-ink">Total</span>
              <span className="font-mono-num text-2xl font-semibold text-ink">{total.toFixed(2)} TND</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-ink/50 uppercase mb-2">Payment Method</label>
            <div className="grid grid-cols-2 gap-2">
              {['cash', 'card'].map((m) => (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`py-2 rounded-lg text-sm font-medium capitalize border ${
                    paymentMethod === m ? 'bg-ink text-white border-ink' : 'border-stone-100 text-ink/60'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || submitting}
            className="w-full bg-amber text-ink-dark font-semibold py-3 rounded-lg hover:bg-amber-dark hover:text-white transition-colors disabled:opacity-50"
          >
            {submitting ? 'Processing…' : 'Complete Sale'}
          </button>

          {completedSale && (
            <div className="mt-4 p-3 rounded-lg bg-okgreen/10 border border-okgreen/20 flex items-start gap-2">
              <CheckCircle2 size={18} className="text-okgreen mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-okgreen">Sale completed</p>
                <p className="text-ink/60 font-mono-num text-xs mt-0.5">{completedSale.invoice_number}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCamera && (
        <CameraScanner onDetected={handleCameraDetected} onClose={() => setShowCamera(false)} />
      )}
    </Layout>
  );
}
