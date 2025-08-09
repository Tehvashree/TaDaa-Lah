export default function TicketCard({ title, date, location, price, verified, image }) {
  return (
    <div className="ticket-card">
      <img src={image} alt={title} />
      <div className="details">
        <h3>{title}</h3>
        <p><strong>Date:</strong> {date}</p>
        <p><strong>Location:</strong> {location}</p>
        <p><strong>Price:</strong> {price}</p>
        {verified && <p style={{ color: 'green' }}>✔ Verified Ticket</p>}
      </div>
    </div>
  );
}
