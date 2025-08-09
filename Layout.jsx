import { Link } from "react-router-dom";
import { ConnectButton } from "@mysten/wallet-kit";

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header/Navbar */}
      <nav className="bg-black text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: App Name */}
          <div className="text-2xl font-bold font-[cursive]">🎟️ TaDaa-Lah</div>

          {/* Center: Navigation Links */}
          <div className="flex gap-6 justify-center items-center text-sm">
            <Link to="/">Home</Link>
            <Link to="/sell">Sell Ticket</Link>
            <Link to="/verify">Verify</Link>
            <Link to="/profile">Profile</Link>
          </div>

          {/* Right: Wallet Connect Button */}
          <div>
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-4">{children}</main>

      {/* Sticky Footer */}
      <footer className="bg-black text-white text-center py-4 text-sm mt-auto">
        © 2025 TaDaa-Lah. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;
