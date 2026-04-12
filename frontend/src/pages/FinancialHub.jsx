import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const FinancialHub = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('donation');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Donation Form State
  const [donationForm, setDonationForm] = useState({
    donorType: 'Person',
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    amount: '',
    purpose: 'Infrastructure',
    paymentMethod: 'UPI'
  });

  // Fee Payment Form State
  const [feeForm, setFeeForm] = useState({
    studentId: '',
    studentName: '',
    parentId: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    studentClass: '',
    feeType: 'Tuition',
    amount: '',
    paymentMethod: 'UPI',
    academicYear: '2025-26',
    term: 'Q1'
  });

  const handleDonation = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      
      const queryParams = new URLSearchParams({
        donor_type: donationForm.donorType,
        donor_name: donationForm.donorName,
        donor_email: donationForm.donorEmail,
        donor_phone: donationForm.donorPhone,
        amount: donationForm.amount,
        purpose: donationForm.purpose,
        payment_method: donationForm.paymentMethod,
        transaction_id: `TXN${Date.now()}`
      });

      const response = await fetch(`${API_URL}/api/donations/create?${queryParams}`, {
        method: 'POST'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Donation failed');
      }

      setSuccess(`✅ Donation successful! Receipt: ${data.receipt_number}`);
      
      // Download PDF
      if (data.pdf_path) {
        window.open(`${API_URL}${data.pdf_path}`, '_blank');
      }

      // Reset form
      setDonationForm({
        donorType: 'Person',
        donorName: '',
        donorEmail: '',
        donorPhone: '',
        amount: '',
        purpose: 'Infrastructure',
        paymentMethod: 'UPI'
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFeePayment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      
      const queryParams = new URLSearchParams({
        student_id: feeForm.studentId,
        student_name: feeForm.studentName,
        parent_id: feeForm.parentId,
        parent_name: feeForm.parentName,
        parent_email: feeForm.parentEmail,
        parent_phone: feeForm.parentPhone,
        student_class: feeForm.studentClass,
        fee_type: feeForm.feeType,
        amount: feeForm.amount,
        payment_method: feeForm.paymentMethod,
        academic_year: feeForm.academicYear,
        term: feeForm.term,
        transaction_id: `FEE${Date.now()}`
      });

      const response = await fetch(`${API_URL}/api/fees/pay?${queryParams}`, {
        method: 'POST'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Fee payment failed');
      }

      setSuccess(`✅ Fee payment successful! Receipt: ${data.receipt_number}`);
      
      // Download PDF
      if (data.pdf_path) {
        window.open(`${API_URL}${data.pdf_path}`, '_blank');
      }

      // Reset form
      setFeeForm({
        studentId: '',
        studentName: '',
        parentId: '',
        parentName: '',
        parentEmail: '',
        parentPhone: '',
        studentClass: '',
        feeType: 'Tuition',
        amount: '',
        paymentMethod: 'UPI',
        academicYear: '2025-26',
        term: 'Q1'
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight-black">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute top-20 right-10 w-96 h-96 bg-royal-red/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gold/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black text-gradient mb-2">
              💰 {t('Financial Hub') || 'Financial Hub'}
            </h1>
            <p className="text-white/80">{t('Donations & Fee Payments with Automated Receipts') || 'Donations & Fee Payments with Automated Receipts'}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="glass px-6 py-3 rounded-xl text-gold font-bold border border-gold/30 hover:bg-gold/10 transition-all"
          >
            <i className="fas fa-home mr-2"></i>
            {t('Home') || 'Home'}
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={() => setActiveTab('donation')}
            className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
              activeTab === 'donation'
                ? 'bg-gradient-royal text-white glow-gold'
                : 'glass text-gold border border-gold/30 hover:bg-gold/10'
            }`}
          >
            <i className="fas fa-hand-holding-heart mr-2"></i>
            {t('Make Donation') || 'Make Donation'}
          </button>
          <button
            onClick={() => setActiveTab('fee')}
            className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
              activeTab === 'fee'
                ? 'bg-gradient-royal text-white glow-gold'
                : 'glass text-gold border border-gold/30 hover:bg-gold/10'
            }`}
          >
            <i className="fas fa-money-bill-wave mr-2"></i>
            {t('Pay Fee') || 'Pay Fee'}
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="glass-strong border border-green-500/50 rounded-xl p-4 mb-6 animate-pulse">
            <p className="text-green-400 text-center font-bold">{success}</p>
          </div>
        )}

        {error && (
          <div className="glass-strong border border-royal-red/50 rounded-xl p-4 mb-6">
            <p className="text-royal-red text-center">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </p>
          </div>
        )}

        {/* Donation Form */}
        {activeTab === 'donation' && (
          <div className="glass-strong p-8 rounded-2xl">
            <h2 className="text-2xl font-bold text-gradient mb-6">
              <i className="fas fa-gift mr-2"></i>
              Donation Details
            </h2>
            <form onSubmit={handleDonation} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Donor Type */}
                <div>
                  <label className="block text-gold font-semibold mb-2">Donor Type</label>
                  <select
                    value={donationForm.donorType}
                    onChange={(e) => setDonationForm({...donationForm, donorType: e.target.value})}
                    className="w-full glass border border-gold/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold transition-all"
                    required
                  >
                    <option value="Person">Individual</option>
                    <option value="Trust">Trust</option>
                    <option value="Company">Company</option>
                  </select>
                </div>

                {/* Donor Name */}
                <div>
                  <label className="block text-gold font-semibold mb-2">Full Name / Organization</label>
                  <input
                    type="text"
                    value={donationForm.donorName}
                    onChange={(e) => setDonationForm({...donationForm, donorName: e.target.value})}
                    placeholder="Rajesh Kumar / Kumar Foundation"
                    className="w-full glass border border-gold/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-all"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-gold font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={donationForm.donorEmail}
                    onChange={(e) => setDonationForm({...donationForm, donorEmail: e.target.value})}
                    placeholder="donor@example.com"
                    className="w-full glass border border-gold/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-all"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-gold font-semibold mb-2">Phone</label>
                  <input
                    type="tel"
                    value={donationForm.donorPhone}
                    onChange={(e) => setDonationForm({...donationForm, donorPhone: e.target.value})}
                    placeholder="+919876543210"
                    className="w-full glass border border-gold/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-all"
                    required
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-gold font-semibold mb-2">Amount (₹)</label>
                  <input
                    type="number"
                    value={donationForm.amount}
                    onChange={(e) => setDonationForm({...donationForm, amount: e.target.value})}
                    placeholder="50000"
                    min="1"
                    className="w-full glass border border-gold/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-all"
                    required
                  />
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-gold font-semibold mb-2">Purpose</label>
                  <select
                    value={donationForm.purpose}
                    onChange={(e) => setDonationForm({...donationForm, purpose: e.target.value})}
                    className="w-full glass border border-gold/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold transition-all"
                    required
                  >
                    <option value="Infrastructure">Infrastructure Development</option>
                    <option value="Scholarship Fund">Scholarship Fund</option>
                    <option value="Library">Library & Resources</option>
                    <option value="Technology">Technology Upgrade</option>
                    <option value="Sports">Sports Facilities</option>
                    <option value="General">General Fund</option>
                  </select>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-gold font-semibold mb-2">Payment Method</label>
                  <select
                    value={donationForm.paymentMethod}
                    onChange={(e) => setDonationForm({...donationForm, paymentMethod: e.target.value})}
                    className="w-full glass border border-gold/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold transition-all"
                    required
                  >
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-royal py-4 rounded-xl text-white font-bold text-lg hover:glow-gold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Processing Donation...
                  </>
                ) : (
                  <>
                    <i className="fas fa-heart mr-2"></i>
                    Donate Now & Get Receipt
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Fee Payment Form */}
        {activeTab === 'fee' && (
          <div className="glass-strong p-8 rounded-2xl">
            <h2 className="text-2xl font-bold text-gradient mb-6">
              <i className="fas fa-graduation-cap mr-2"></i>
              Fee Payment Details
            </h2>
            <form onSubmit={handleFeePayment} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Student ID */}
                <div>
                  <label className="block text-gold font-semibold mb-2">Student ID</label>
                  <input
                    type="text"
                    value={feeForm.studentId}
                    onChange={(e) => setFeeForm({...feeForm, studentId: e.target.value})}
                    placeholder="STU001"
                    className="w-full glass border border-gold/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-all"
                    required
                  />
                </div>

                {/* Student Name */}
                <div>
                  <label className="block text-gold font-semibold mb-2">Student Name</label>
                  <input
                    type="text"
                    value={feeForm.studentName}
                    onChange={(e) => setFeeForm({...feeForm, studentName: e.target.value})}
                    placeholder="Priya Sharma"
                    className="w-full glass border border-gold/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-all"
                    required
                  />
                </div>

                {/* Class */}
                <div>
                  <label className="block text-gold font-semibold mb-2">Class</label>
                  <input
                    type="text"
                    value={feeForm.studentClass}
                    onChange={(e) => setFeeForm({...feeForm, studentClass: e.target.value})}
                    placeholder="Class 10"
                    className="w-full glass border border-gold/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-all"
                    required
                  />
                </div>

                {/* Parent ID */}
                <div>
                  <label className="block text-gold font-semibold mb-2">Parent ID</label>
                  <input
                    type="text"
                    value={feeForm.parentId}
                    onChange={(e) => setFeeForm({...feeForm, parentId: e.target.value})}
                    placeholder="PAR001"
                    className="w-full glass border border-gold/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-all"
                    required
                  />
                </div>

                {/* Parent Name */}
                <div>
                  <label className="block text-gold font-semibold mb-2">Parent Name</label>
                  <input
                    type="text"
                    value={feeForm.parentName}
                    onChange={(e) => setFeeForm({...feeForm, parentName: e.target.value})}
                    placeholder="Mr. Sharma"
                    className="w-full glass border border-gold/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-all"
                    required
                  />
                </div>

                {/* Parent Email */}
                <div>
                  <label className="block text-gold font-semibold mb-2">Parent Email</label>
                  <input
                    type="email"
                    value={feeForm.parentEmail}
                    onChange={(e) => setFeeForm({...feeForm, parentEmail: e.target.value})}
                    placeholder="parent@example.com"
                    className="w-full glass border border-gold/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-all"
                    required
                  />
                </div>

                {/* Parent Phone */}
                <div>
                  <label className="block text-gold font-semibold mb-2">Parent Phone</label>
                  <input
                    type="tel"
                    value={feeForm.parentPhone}
                    onChange={(e) => setFeeForm({...feeForm, parentPhone: e.target.value})}
                    placeholder="+919876543210"
                    className="w-full glass border border-gold/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-all"
                    required
                  />
                </div>

                {/* Fee Type */}
                <div>
                  <label className="block text-gold font-semibold mb-2">Fee Type</label>
                  <select
                    value={feeForm.feeType}
                    onChange={(e) => setFeeForm({...feeForm, feeType: e.target.value})}
                    className="w-full glass border border-gold/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold transition-all"
                    required
                  >
                    <option value="Tuition">Tuition Fee</option>
                    <option value="Exam">Exam Fee</option>
                    <option value="Library">Library Fee</option>
                    <option value="Transport">Transport Fee</option>
                    <option value="Sports">Sports Fee</option>
                    <option value="Lab">Lab Fee</option>
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-gold font-semibold mb-2">Amount (₹)</label>
                  <input
                    type="number"
                    value={feeForm.amount}
                    onChange={(e) => setFeeForm({...feeForm, amount: e.target.value})}
                    placeholder="25000"
                    min="1"
                    className="w-full glass border border-gold/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-all"
                    required
                  />
                </div>

                {/* Academic Year */}
                <div>
                  <label className="block text-gold font-semibold mb-2">Academic Year</label>
                  <select
                    value={feeForm.academicYear}
                    onChange={(e) => setFeeForm({...feeForm, academicYear: e.target.value})}
                    className="w-full glass border border-gold/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold transition-all"
                    required
                  >
                    <option value="2025-26">2025-26</option>
                    <option value="2026-27">2026-27</option>
                  </select>
                </div>

                {/* Term */}
                <div>
                  <label className="block text-gold font-semibold mb-2">Term</label>
                  <select
                    value={feeForm.term}
                    onChange={(e) => setFeeForm({...feeForm, term: e.target.value})}
                    className="w-full glass border border-gold/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold transition-all"
                    required
                  >
                    <option value="Q1">Quarter 1</option>
                    <option value="Q2">Quarter 2</option>
                    <option value="Q3">Quarter 3</option>
                    <option value="Q4">Quarter 4</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-gold font-semibold mb-2">Payment Method</label>
                  <select
                    value={feeForm.paymentMethod}
                    onChange={(e) => setFeeForm({...feeForm, paymentMethod: e.target.value})}
                    className="w-full glass border border-gold/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold transition-all"
                    required
                  >
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-royal py-4 rounded-xl text-white font-bold text-lg hover:glow-gold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check-circle mr-2"></i>
                    Pay Fee & Get Receipt
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialHub;
