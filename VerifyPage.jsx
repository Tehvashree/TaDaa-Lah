import { useState } from 'react';

export default function VerifyPage() {
  const [ticketId, setTicketId] = useState('');
  const [result, setResult] = useState(null);

  const handleScan = (e) => {
    e.preventDefault();
    // Simulated logic: accepts only specific ID format
    if (ticketId.startsWith('0x') && ticketId.length > 10) {
      setResult('✅ VALID TICKET');
    } else {
      setResult('❌ INVALID TICKET');
    }
  };

  return (
    <div className="py-8 max-w-lg mx-auto text-left">
      <h1 className="text-3xl font-bold mb-6 text-center">Gate Scanner</h1>
      <form onSubmit={handleScan} className="space-y-4">
        <input
          type="text"
          placeholder="Enter Ticket NFT Object ID"
          className="w-full border p-2 rounded"
          value={ticketId}
          onChange={(e) => setTicketId(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">
          Scan Ticket
        </button>
      </form>
      {result && (
        <div className={`mt-4 px-4 py-2 rounded text-center font-semibold ${
          result.includes('VALID') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {result}
        </div>
      )}
    </div>
  );
}
