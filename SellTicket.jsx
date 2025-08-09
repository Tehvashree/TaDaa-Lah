import { useState } from 'react';

export default function SellTicket() {
  const [form, setForm] = useState({
    ticketConfirmationNumber: '',
    sellerName: '',
    concertName: '',
    price: '',
    seatNumber: '',
    showIdentityToBuyer: false,
    file: null,
  });

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (files ? files[0] : value),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submit ticket:', form);
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: 'calc(100vh - 160px)', // space for header/footer
        background: '#F9F9F9',
        padding: '20px',
        fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
        boxSizing: 'border-box',
        overflowX: 'hidden', // Prevent horizontal scrolling
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '40px',
          }}
        >
          <h1 style={{ fontSize: '40px', fontWeight: '700', margin: 0 }}>Seller page</h1>
        </div>

        {/* Greeting Section */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '40px', fontWeight: '700', margin: '0 0 10px 0' }}>Hello</h2>
          <p
            style={{
              fontSize: '20px',
              color: 'rgba(34, 34, 34, 0.5)',
              margin: 0,
            }}
          >
            Please upload your ticket here
          </p>
        </div>

        {/* Upload File Section */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '60px',
            border: '1px solid #222',
            borderRadius: '15px',
            background: '#FFF',
            marginBottom: '30px',
            position: 'relative',
            cursor: 'pointer',
            maxWidth: '100%',
          }}
        >
          <input
            type="file"
            name="file"
            accept=".pdf,.jpg,.png"
            onChange={handleChange}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer',
            }}
          />
          <span style={{ fontSize: '20px' }}>Upload file</span>
        </div>

        {/* Form Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[
            { label: 'Ticket Confirmation Number', name: 'ticketConfirmationNumber' },
            { label: 'Seller Name', name: 'sellerName' },
            { label: 'Concert Name', name: 'concertName' },
          ].map(({ label, name }) => (
            <div key={name} style={{ width: '100%' }}>
              <h3
                style={{
                  fontSize: '24px',
                  fontWeight: '400',
                  margin: '0 0 10px 0',
                  fontFamily: 'Inknut Antiqua, serif',
                }}
              >
                {label}
              </h3>
              <input
                type="text"
                name={name}
                placeholder="Type Here"
                value={form[name]}
                onChange={handleChange}
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  padding: '15px',
                  border: '1px solid #222',
                  borderRadius: '15px',
                  fontSize: '20px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          ))}

          {/* Bottom Row */}
          <div
            style={{
              display: 'flex',
              gap: '40px',
              marginTop: '20px',
              flexWrap: 'wrap',
            }}
          >
            {/* Price */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h3
                style={{
                  fontSize: '24px',
                  fontWeight: '400',
                  margin: '0 0 10px 0',
                  fontFamily: 'Inknut Antiqua, serif',
                }}
              >
                Price
              </h3>
              <input
                type="text"
                name="price"
                placeholder="RM"
                value={form.price}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '15px',
                  border: '1px solid #222',
                  borderRadius: '15px',
                  fontSize: '20px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Seat Number */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h3
                style={{
                  fontSize: '24px',
                  fontWeight: '400',
                  margin: '0 0 10px 0',
                  fontFamily: 'Inknut Antiqua, serif',
                }}
              >
                Seat Number
              </h3>
              <input
                type="text"
                name="seatNumber"
                placeholder="No"
                value={form.seatNumber}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '15px',
                  border: '1px solid #222',
                  borderRadius: '15px',
                  fontSize: '20px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Show Identity */}
            <div style={{ flex: 2, minWidth: '200px' }}>
              <h3
                style={{
                  fontSize: '24px',
                  fontWeight: '400',
                  margin: '0 0 10px 0',
                  fontFamily: 'Inknut Antiqua, serif',
                }}
              >
                Show My Identity to Buyer
              </h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  name="showIdentityToBuyer"
                  checked={form.showIdentityToBuyer}
                  onChange={handleChange}
                  style={{ width: '20px', height: '20px' }}
                />
                <span>Yes, show my identity</span>
              </label>
            </div>
          </div>
        </div>

        {/* Sell Now Button - Centered */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={handleSubmit}
            style={{
              width: '300px',
              padding: '15px 30px',
              background: '#DD4255',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              fontSize: '36px',
              fontWeight: '700',
              marginTop: '40px',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#c43750';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#DD4255';
            }}
          >
            Sell Now
          </button>
        </div>
      </div>
    </div>
  );
}
