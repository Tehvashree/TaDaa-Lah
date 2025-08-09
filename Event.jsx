import React from "react";
import { useNavigate } from "react-router-dom";

export default function Event() {
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate("/buyer");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "#F9F9F9",
      }}
    >
      {/* Page Content */}
      <div style={{ flex: 1, padding: "40px 20px" }}>
        <h1
          style={{
            color: "#222",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            fontSize: "clamp(32px, 6vw, 96px)",
            fontWeight: "700",
            marginBottom: "40px",
          }}
        >
          Available Tickets !!!!
        </h1>

        {/* Event 1 */}
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/f7b45d265a7ca49a17ed87b61e5ae0cf32ac7789?width=2560"
            alt="Event 1"
            style={{
              maxWidth: "100%",
              height: "auto",
              borderRadius: "10px",
            }}
          />
          <button
            onClick={handleBookNow}
            style={{
              marginTop: "20px",
              padding: "15px 40px",
              fontSize: "clamp(18px, 2vw, 36px)",
              fontWeight: "700",
              color: "#FFF",
              background: "#DD4255",
              border: "none",
              borderRadius: "15px",
              cursor: "pointer",
            }}
          >
            Book Now →
          </button>
        </div>

        {/* Event 2 */}
        <div style={{ textAlign: "center" }}>
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/e10ab11286ec8b56a5789b968e5b41e64a7346ab?width=2560"
            alt="Event 2"
            style={{
              maxWidth: "100%",
              height: "auto",
              borderRadius: "10px",
            }}
          />
          <button
            onClick={handleBookNow}
            style={{
              marginTop: "20px",
              padding: "15px 40px",
              fontSize: "clamp(18px, 2vw, 36px)",
              fontWeight: "700",
              color: "#FFF",
              background: "#DD4255",
              border: "none",
              borderRadius: "15px",
              cursor: "pointer",
            }}
          >
            Book Now →
          </button>
        </div>
      </div>
    </div>
  );
}
