import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Marks = () => {
  const navigate = useNavigate();
  const [marks, setMarks] = useState([
    { subject: 'Math', marks: 85 },
    { subject: 'Science', marks: 78 },
    { subject: 'English', marks: 90 }
  ]);

  const [stats, setStats] = useState({ total: 0, percentage: 0, result: '' });

  useEffect(() => {
    const total = marks.reduce((sum, item) => sum + item.marks, 0);
    const percentage = ((total / (marks.length * 100)) * 100).toFixed(2);
    const result = percentage >= 33 ? 'PASS' : 'FAIL';
    
    setStats({ total, percentage, result });
  }, [marks]);

  return (
    <div className="min-h-screen bg-midnight-black relative">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute top-20 right-10 w-96 h-96 bg-green-600/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-royal-red/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="glass-strong rounded-2xl p-8 mb-8 border border-gold/20 text-center">
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              <span className="text-gradient">Marks Report</span>
            </h1>
            <p className="text-white/90 text-lg">
              <i className="fas fa-chart-bar text-gold mr-2"></i>
              Academic Performance Summary
            </p>
          </div>

          {/* Marks Table */}
          <div className="glass-strong rounded-2xl p-8 border border-gold/20 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gold/30">
                  <th className="text-left py-4 px-4 text-gold font-bold text-lg">Subject</th>
                  <th className="text-right py-4 px-4 text-gold font-bold text-lg">Marks</th>
                </tr>
              </thead>
              <tbody>
                {marks.map((item, index) => (
                  <tr 
                    key={index} 
                    className="border-b border-gold/10 hover:bg-gold/5 transition-all"
                  >
                    <td className="py-4 px-4 text-white font-semibold">
                      <i className="fas fa-book text-royal-red mr-2"></i>
                      {item.subject}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={`font-bold text-lg ${
                        item.marks >= 75 ? 'text-green-400' : 
                        item.marks >= 50 ? 'text-yellow-400' : 
                        'text-red-400'
                      }`}>
                        {item.marks}
                      </span>
                    </td>
                  </tr>
                ))}
                
                {/* Total Row */}
                <tr className="border-t-2 border-gold/30 bg-gradient-royal/20">
                  <td className="py-4 px-4 text-white font-black text-lg">
                    <i className="fas fa-calculator text-gold mr-2"></i>
                    TOTAL
                  </td>
                  <td className="py-4 px-4 text-right text-gold font-black text-xl">
                    {stats.total}
                  </td>
                </tr>

                {/* Percentage Row */}
                <tr className="border-b border-gold/10 bg-gold/5">
                  <td className="py-4 px-4 text-white font-black text-lg">
                    <i className="fas fa-percent text-gold mr-2"></i>
                    PERCENTAGE
                  </td>
                  <td className="py-4 px-4 text-right text-gold font-black text-xl">
                    {stats.percentage}%
                  </td>
                </tr>

                {/* Result Row */}
                <tr className="bg-gradient-royal/30">
                  <td className="py-4 px-4 text-white font-black text-lg">
                    <i className="fas fa-trophy text-gold mr-2"></i>
                    RESULT
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={`font-black text-2xl ${
                      stats.result === 'PASS' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {stats.result}
                      {stats.result === 'PASS' && (
                        <i className="fas fa-check-circle ml-2"></i>
                      )}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-8 flex-wrap gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="glass px-6 py-3 rounded-full text-gold font-bold hover:glow-gold transition-all inline-flex items-center gap-2"
            >
              <i className="fas fa-arrow-left"></i>
              Back to Dashboard
            </button>
            
            <button
              onClick={() => window.print()}
              className="bg-gradient-royal px-8 py-3 rounded-full text-white font-bold hover:glow-gold transition-all inline-flex items-center gap-2"
            >
              <i className="fas fa-print"></i>
              Print Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marks;
