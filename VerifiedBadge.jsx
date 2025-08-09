export default function VerifiedBadge({ type }) {
  const text = type === 'seller' ? 'Verified Seller' : 'Verified Ticket';
  return (
    <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
      ✅ {text}
    </span>
  );
}
