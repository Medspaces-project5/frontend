import React, { useEffect, useState } from 'react';
import NavigationShell from '../components/NavigationShell';
import Card from '../components/Card';
import Toast from '../components/Toast';
import Skeleton from '../components/Skeleton';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import { CreditCard, FileText, Download, CheckCircle, Smartphone, MapPin, X, Info } from 'lucide-react';

const MyBills = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState([]);
  const [activeTab, setActiveTab] = useState('outstanding'); // 'outstanding' or 'paid'
  const [selectedBill, setSelectedBill] = useState(null);
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [successDetails, setSuccessDetails] = useState(null);

  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info');

  const triggerToast = (msg, type = 'info') => {
    setToastType(type);
    setToastMessage(msg);
  };

  const fetchBills = async () => {
    try {
      const res = await api.get('/patient/bills', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.success) {
        setBills(res.data || []);
      }
    } catch (err) {
      triggerToast(err.error || 'Failed to fetch bills', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBills();
    }
  }, [token]);

  const loadRazorpaySDK = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayNowClick = (bill) => {
    setSelectedBill(bill);
    setShowMethodModal(true);
  };

  const processUPIPayment = async () => {
    setShowMethodModal(false);
    const sdkLoaded = await loadRazorpaySDK();
    if (!sdkLoaded) {
      triggerToast('Razorpay Checkout SDK failed to load.', 'error');
      return;
    }

    try {
      // 1. Create Order
      const orderRes = await api.post('/billing/create-order', {
        appointmentId: selectedBill.appointment_id || '00000000-0000-0000-0000-000000000000',
        amount: selectedBill.amount
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!orderRes.success) {
        triggerToast('Failed to initialize transaction order', 'error');
        return;
      }

      const { orderId, amount, currency } = orderRes.data;

      // 2. Open Razorpay Widget
      const options = {
        key: 'rzp_test_T0cRqCmnc2pb2H',
        amount: amount,
        currency: currency,
        name: 'MEDSPACES',
        description: 'OPD Consultation Fee',
        order_id: orderId,
        handler: async (response) => {
          try {
            const verifyRes = await api.post('/billing/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });

            if (verifyRes.success) {
              const updatedBill = {
                ...selectedBill,
                collected_flag: 'Yes',
                payment_mode: 'ONLINE',
                payment_status: 'PAID',
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id
              };

              setSuccessDetails({
                amount: selectedBill.amount,
                receiptNo: `RCP-2026-${selectedBill.id.slice(0, 4).toUpperCase()}`,
                transactionId: response.razorpay_payment_id,
                bill: updatedBill
              });

              setShowSuccessScreen(true);
              fetchBills();
            }
          } catch (err) {
            triggerToast(err.error || 'Payment signature check failed', 'error');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email
        },
        theme: {
          color: '#0D4846'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      triggerToast(err.error || 'Checkout initiation error', 'error');
    }
  };

  const processCashPayment = async () => {
    setShowMethodModal(false);
    const confirm = window.confirm(
      'You chose to pay at the clinic. Proceed to request frontdesk verification?'
    );
    if (!confirm) return;

    try {
      const res = await api.post('/billing/request-cash-payment', {
        billId: selectedBill.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.success) {
        triggerToast('Payment request logged. Please complete settlement at the front desk.', 'success');
        fetchBills();
      }
    } catch (err) {
      triggerToast(err.error || 'Failed to request cash payment', 'error');
    }
  };

  const downloadReceipt = (bill) => {
    const receiptWin = window.open('', '_blank');
    receiptWin.document.write(`
      <html>
        <head>
          <title>Receipt - ${bill.id}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
            .receipt-box { max-width: 600px; margin: auto; border: 1px solid #eee; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
            .logo { font-size: 24px; font-weight: bold; color: #0D4846; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 20px; }
            .header { border-bottom: 2px solid #0D4846; padding-bottom: 10px; margin-bottom: 20px; }
            .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .details-table td { padding: 10px 0; border-bottom: 1px solid #f6f6f6; }
            .details-table td.label { color: #666; font-weight: 500; }
            .details-table td.value { text-align: right; font-weight: bold; }
            .total { font-size: 20px; font-weight: bold; color: #0D4846; border-top: 2px solid #eee; padding-top: 15px; margin-top: 15px; display: flex; justify-content: space-between; }
            .footer { text-align: center; font-size: 11px; color: #999; margin-top: 40px; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="receipt-box">
            <div class="header">
              <div class="logo">MEDSPACES</div>
              <p style="margin: 5px 0 0 0; font-size: 13px; color: #666;">Payment Receipt / Invoice Statement</p>
            </div>
            <h3>Transaction Details</h3>
            <table class="details-table">
              <tr>
                <td class="label">Hospital / Clinic</td>
                <td class="value">MedSpaces Multi Speciality Hospital</td>
              </tr>
              <tr>
                <td class="label">Patient Name</td>
                <td class="value">${user?.name || 'Valued Patient'}</td>
              </tr>
              <tr>
                <td class="label">Invoice Reference</td>
                <td class="value">INV-${bill.id.slice(0, 8).toUpperCase()}</td>
              </tr>
              <tr>
                <td class="label">Date</td>
                <td class="value">${new Date(bill.created_at).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td class="label">Payment Method</td>
                <td class="value">${bill.payment_mode || 'ONLINE'}</td>
              </tr>
              <tr>
                <td class="label">Transaction Reference</td>
                <td class="value">${bill.transactionId || bill.razorpay_payment_id || 'Cash Verified'}</td>
              </tr>
            </table>
            <div class="total">
              <span>Total Paid</span>
              <span>₹${parseFloat(bill.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="footer">
              <p>Thank you for choosing MedSpaces. This is a computer-generated receipt and requires no physical signature.</p>
              <p>&copy; 2026 MedSpaces. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `);
    receiptWin.document.close();
  };

  const getStatusBadge = (bill) => {
    if (bill.collected_flag === 'Yes' || bill.payment_status === 'PAID') {
      return (
        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-full uppercase tracking-wider">
          Paid
        </span>
      );
    }
    if (bill.payment_status === 'CASH_PAYMENT_PENDING' || bill.payment_status === 'CASH_PENDING') {
      return (
        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-full uppercase tracking-wider">
          Awaiting Cash
        </span>
      );
    }
    if (bill.payment_status === 'PAYMENT_EXPIRED') {
      return (
        <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 text-xs font-semibold rounded-full uppercase tracking-wider">
          Expired
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold rounded-full uppercase tracking-wider">
        Pending
      </span>
    );
  };

  const outstandingBills = bills.filter(b => b.collected_flag !== 'Yes' && b.payment_status !== 'PAYMENT_EXPIRED');
  const paidBills = bills.filter(b => b.collected_flag === 'Yes');
  // We can show expired bills under outstanding tab but without payment actions, or in active list
  const displayedBills = activeTab === 'outstanding' 
    ? bills.filter(b => b.collected_flag !== 'Yes') 
    : paidBills;

  if (showSuccessScreen && successDetails) {
    return (
      <NavigationShell role="patient" userName={user?.name} onLogout={logout}>
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-[#D8E7E5] shadow-[0_8px_32px_rgba(13,72,70,0.08)] p-8 text-center space-y-6 animate-float-card">
          <div className="w-20 h-20 bg-[#F0FDFA] text-primary rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle size={44} className="stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-heading text-[#082F2D]">Payment Successful!</h2>
            <p className="font-sans text-sm text-text-secondary mt-1">
              Your payment of ₹{parseFloat(successDetails.amount).toLocaleString('en-IN', {
                minimumFractionDigits: 2
              })}{' '}
              was successful.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left text-xs font-sans space-y-2 text-text-primary">
            <p>
              <span className="text-text-secondary font-medium">Receipt No:</span>{' '}
              <span className="font-semibold">{successDetails.receiptNo}</span>
            </p>
            <p>
              <span className="text-text-secondary font-medium">Transaction ID:</span>{' '}
              <span className="font-semibold">{successDetails.transactionId}</span>
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => downloadReceipt(successDetails.bill)}
              className="w-full text-white font-sans font-semibold text-xs py-3.5 rounded-2xl hover:scale-[1.02] active:scale-100 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #0D4846, #11615D)' }}
            >
              <Download size={14} /> Download Receipt
            </button>
            <button
              onClick={() => {
                setShowSuccessScreen(false);
                setSuccessDetails(null);
              }}
              className="w-full bg-transparent border border-[#D8E7E5] text-[#0D4846] font-sans font-semibold text-xs py-3.5 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer"
            >
              Back to Bills
            </button>
          </div>
        </div>
      </NavigationShell>
    );
  }

  return (
    <NavigationShell role="patient" userName={user?.name} onLogout={logout}>
      <div className="max-w-4xl mx-auto space-y-6 select-none">
        <div className="text-left">
          <h1 className="text-3xl font-bold font-heading text-secondary mb-2">My Bills & Invoices</h1>
          <p className="font-sans text-sm text-text-secondary">
            View your billing history and process online payments securely.
          </p>
        </div>

        {/* Tabs for Outstanding & Paid */}
        <div className="flex border-b border-[#D8E7E5] font-sans">
          <button
            onClick={() => setActiveTab('outstanding')}
            className={`py-3 px-6 font-bold text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'outstanding'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Outstanding
          </button>
          <button
            onClick={() => setActiveTab('paid')}
            className={`py-3 px-6 font-bold text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'paid'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Paid
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton variant="rect" height="100px" />
            <Skeleton variant="rect" height="100px" />
          </div>
        ) : displayedBills.length > 0 ? (
          <div className="space-y-4">
            {displayedBills.map((bill) => (
              <div
                key={bill.id}
                className="bg-white rounded-3xl border border-[#D8E7E5] shadow-[0_4px_24px_rgba(13,72,70,0.04)] p-6 hover:shadow-[0_12px_36px_rgba(13,72,70,0.08)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4 text-left font-sans">
                  <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center shrink-0">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-base text-text-primary">
                      {bill.appointment?.doctor?.name
                        ? `Consultation — ${bill.appointment.doctor.name}`
                        : bill.doctorName 
                        ? `Consultation — ${bill.doctorName}`
                        : `INV-${bill.id.slice(0, 8).toUpperCase()}`}
                    </h4>
                    <p className="text-xs text-[#527774] mt-0.5 font-semibold">
                      Invoice: INV-{bill.id.slice(0, 8).toUpperCase()}
                    </p>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-xs text-text-secondary">
                      <span>
                        Date:{' '}
                        <span className="font-semibold text-text-primary">
                          {bill.appointment?.appointment_date || new Date(bill.created_at).toLocaleDateString()}
                        </span>
                      </span>
                      {bill.appointment?.start_time && (
                        <span>
                          Time:{' '}
                          <span className="font-semibold text-text-primary">
                            {bill.appointment.start_time.slice(0, 5)}
                          </span>
                        </span>
                      )}
                      {bill.payment_mode && (
                        <span>
                          Method: <span className="font-semibold text-text-primary uppercase">{bill.payment_mode}</span>
                        </span>
                      )}
                    </div>
                    {(bill.payment_status === 'CASH_PAYMENT_PENDING' || bill.payment_status === 'CASH_PENDING') && (
                      <p className="text-xs text-indigo-600 font-semibold mt-2">
                        Cash payment selected. Please pay at the clinic front office at least 30 minutes before your appointment.
                      </p>
                    )}
                    {bill.payment_status === 'PAYMENT_EXPIRED' && (
                      <p className="text-xs text-red-600 font-semibold mt-2">
                        Payment window closed. This invoice has expired.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 font-sans">
                  <p className="text-lg font-bold font-heading text-text-primary">
                    ₹{parseFloat(bill.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>

                  {getStatusBadge(bill)}

                  {bill.collected_flag !== 'Yes' && 
                   bill.payment_status !== 'CASH_PAYMENT_PENDING' && 
                   bill.payment_status !== 'CASH_PENDING' && 
                   bill.payment_status !== 'PAYMENT_EXPIRED' && (
                    <button
                      onClick={() => handlePayNowClick(bill)}
                      className="text-white font-sans font-semibold text-xs py-2 px-4 rounded-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                      style={{ background: 'linear-gradient(135deg, #0D4846, #11615D)' }}
                    >
                      Pay Now
                    </button>
                  )}

                  {bill.collected_flag === 'Yes' && (
                    <button
                      onClick={() => downloadReceipt(bill)}
                      className="p-2 border border-[#D8E7E5] text-[#0D4846] hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                      title="Download Receipt"
                    >
                      <Download size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Note info */}
            <div className="bg-[#EFF6FF] border border-[#D8E7E5] rounded-2xl p-4 flex items-start gap-3 text-left">
              <Info size={18} className="text-secondary shrink-0 mt-0.5" />
              <p className="font-sans text-xs text-text-secondary leading-relaxed">
                All payments are securely processed and encrypted. Receipts will be issued instantly upon
                successful transaction verification.
              </p>
            </div>
          </div>
        ) : (
          <Card>
            <div className="py-16 text-center max-w-sm mx-auto space-y-4">
              <div className="w-16 h-16 bg-[#F4F8F7] text-primary rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CreditCard size={32} />
              </div>
              {activeTab === 'outstanding' ? (
                <div>
                  <h3 className="font-heading font-bold text-lg text-text-primary">No outstanding bills</h3>
                  <p className="font-sans text-xs text-text-secondary mt-1">
                    You do not have any pending billing statements registered on your account profile.
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="font-heading font-bold text-lg text-text-primary">No paid invoices</h3>
                  <p className="font-sans text-xs text-text-secondary mt-1">
                    You do not have any completed billing transactions on your profile.
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Payment Selection Modal */}
      {showMethodModal && selectedBill && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-3xl border border-[#D8E7E5] shadow-[0_20px_50px_rgba(13,72,70,0.15)] p-6 relative animate-float-card animate-duration-300">
            <button
              onClick={() => setShowMethodModal(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="font-heading font-bold text-lg text-text-primary text-center mb-6">
              Choose Payment Method
            </h3>

            <div className="space-y-4">
              {/* UPI Option */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white border border-[#D8E7E5] rounded-xl text-primary">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-text-primary">ONLINE PAYMENT</h4>
                    <p className="font-sans text-[11px] text-text-secondary mt-0.5">
                      Pay securely using Razorpay (Cards, NetBanking, UPI)
                    </p>
                  </div>
                </div>
                <button
                  onClick={processUPIPayment}
                  className="w-full text-white font-sans font-semibold text-xs py-2.5 rounded-xl transition-all duration-200 text-center cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #0D4846, #11615D)' }}
                >
                  Pay ₹{selectedBill.amount} Online
                </button>
              </div>

              {/* Cash Option */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white border border-[#D8E7E5] rounded-xl text-primary">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-text-primary">CASH PAYMENT</h4>
                    <p className="font-sans text-[11px] text-text-secondary mt-0.5">
                      Please pay at the Front Office at least 30 minutes before your appointment.
                    </p>
                  </div>
                </div>
                <button
                  onClick={processCashPayment}
                  className="w-full bg-white border border-[#D8E7E5] text-[#0D4846] font-sans font-semibold text-xs py-2.5 rounded-xl hover:bg-slate-50 transition-all text-center cursor-pointer"
                >
                  Choose Cash Payment
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowMethodModal(false)}
              className="w-full mt-6 py-3 bg-transparent border border-[#D8E7E5] text-text-secondary font-sans font-semibold text-xs rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {toastMessage && (
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
      )}
    </NavigationShell>
  );
};

export default MyBills;
