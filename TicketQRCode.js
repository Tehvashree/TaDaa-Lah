import React, { useState, useEffect } from 'react';
import { generateTicketQRCode, fetchTicketById, confirmEscrow } from '../utils/sui.js';

function TicketQRCode({ ticketId, escrowId, userAddress, walletProvider, onEscrowSettled }) {
    const [ticketData, setTicketData] = useState(null);
    const [qrCode, setQrCode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [settling, setSettling] = useState(false);
    const [error, setError] = useState('');
    const [settled, setSettled] = useState(false);

    useEffect(() => {
        loadTicketData();
    }, [ticketId]);

    const loadTicketData = async () => {
        try {
            setLoading(true);
            setError('');

            // Fetch ticket details
            console.log('🎫 Loading ticket data for:', ticketId);
            const ticket = await fetchTicketById(ticketId);
            
            if (!ticket) {
                throw new Error('Ticket not found');
            }

            setTicketData(ticket);

            // Generate QR code for this ticket
            console.log('🔲 Generating QR code...');
            const qr = await generateTicketQRCode(ticketId, {
                eventName: ticket.event_name,
                eventDate: ticket.event_date,
                owner: userAddress,
                verified: ticket.original_issuer_verified
            });

            setQrCode(qr);
            console.log('✅ Ticket data loaded successfully');

        } catch (error) {
            console.error('❌ Error loading ticket:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSettleEscrow = async () => {
        if (!escrowId) {
            setError('No escrow found for this ticket');
            return;
        }

        try {
            setSettling(true);
            setError('');

            console.log('💰 Settling escrow:', escrowId);
            await confirmEscrow(escrowId, walletProvider);
            
            setSettled(true);
            console.log('✅ Escrow settled successfully');

            if (onEscrowSettled) {
                onEscrowSettled(escrowId);
            }

        } catch (error) {
            console.error('❌ Error settling escrow:', error);
            setError(error.message);
        } finally {
            setSettling(false);
        }
    };

    const formatEventDate = (dateString) => {
        if (!dateString) return 'Invalid Date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatEventTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const isEventToday = () => {
        if (!ticketData?.event_date) return false;
        const eventDate = new Date(ticketData.event_date);
        const today = new Date();
        return eventDate.toDateString() === today.toDateString();
    };

    const isEventSoon = () => {
        if (!ticketData?.event_date) return false;
        const eventDate = new Date(ticketData.event_date);
        const now = new Date();
        const timeDiff = eventDate.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 3600);
        return hoursDiff <= 24 && hoursDiff > 0; // Within 24 hours
    };

    if (loading) {
        return (
            <div className="ticket-qr-loading">
                <div className="spinner">⏳</div>
                <p>Loading your ticket...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="ticket-qr-error">
                <div className="error-icon">❌</div>
                <h3>Unable to Load Ticket</h3>
                <p>{error}</p>
                <button onClick={loadTicketData} className="retry-button">
                    Try Again
                </button>
            </div>
        );
    }

    if (settled) {
        return (
            <div className="escrow-settled">
                <div className="success-icon">🎉</div>
                <h3>Payment Settled!</h3>
                <p>Thanks for confirming! The seller has received payment.</p>
                <div className="settled-details">
                    <p><strong>Event:</strong> {ticketData.event_name}</p>
                    <p><strong>Date:</strong> {formatEventDate(ticketData.event_date)}</p>
                </div>
                <button onClick={() => window.location.href = '/profile'} className="back-button">
                    Back to Profile
                </button>
            </div>
        );
    }

    return (
        <div className="ticket-qr-container">
            <div className="ticket-header">
                <div className="ticket-status">
                    {ticketData.original_issuer_verified && (
                        <span className="verified-badge">✅ Verified Ticket</span>
                    )}
                    {isEventToday() && (
                        <span className="today-badge">🔥 Event Today!</span>
                    )}
                    {isEventSoon() && !isEventToday() && (
                        <span className="soon-badge">⏰ Event Soon!</span>
                    )}
                </div>
                <h2>{ticketData.event_name}</h2>
                <div className="event-details">
                    <p className="event-date">📅 {formatEventDate(ticketData.event_date)}</p>
                    <p className="event-time">🕐 {formatEventTime(ticketData.event_date)}</p>
                </div>
            </div>

            <div className="qr-section">
                <div className="qr-instructions">
                    <h3>🎫 Your Entry Ticket</h3>
                    <p>Show this QR code at the venue entrance</p>
                </div>

                <div className="qr-display">
                    {qrCode ? (
                        <div className="qr-code-wrapper">
                            <img 
                                src={qrCode.dataURL} 
                                alt="Ticket QR Code"
                                className="qr-code-image"
                            />
                            <div className="qr-info">
                                <p className="qr-id">Ticket ID: {ticketId.substring(0, 8)}...</p>
                                <p className="qr-owner">Owner: {userAddress.substring(0, 8)}...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="qr-generating">
                            <div className="spinner">⏳</div>
                            <p>Generating QR code...</p>
                        </div>
                    )}
                </div>

                <div className="qr-tips">
                    <h4>💡 Tips for Entry</h4>
                    <ul>
                        <li>Make sure your screen brightness is at maximum</li>
                        <li>Hold your phone steady when scanning</li>
                        <li>Have a backup screenshot saved</li>
                        <li>Arrive early to avoid gate rush</li>
                    </ul>
                </div>
            </div>

            {/* Ticket Image Preview */}
            {ticketData.ipfs_cid && (
                <div className="ticket-image-section">
                    <h4>📄 Original Ticket</h4>
                    <div className="ticket-preview">
                        <p>IPFS CID: {ticketData.ipfs_cid}</p>
                        <small>Original ticket stored on decentralized storage</small>
                    </div>
                </div>
            )}

            {/* Escrow Settlement */}
            {escrowId && !settled && (
                <div className="escrow-section">
                    <div className="escrow-info">
                        <h4>💰 Payment Status</h4>
                        <p>Your payment is held securely in escrow. After you enter the event successfully, confirm below to release payment to the seller.</p>
                    </div>

                    {error && (
                        <div className="error-message">
                            <span className="error-icon">❌</span>
                            <p>{error}</p>
                        </div>
                    )}

                    <button
                        onClick={handleSettleEscrow}
                        disabled={settling}
                        className={`settle-button ${settling ? 'loading' : ''}`}
                    >
                        {settling ? (
                            <>
                                <span className="button-spinner">⏳</span>
                                Settling Payment...
                            </>
                        ) : (
                            <>
                                <span className="button-icon">✅</span>
                                I'm at the Gate! Release Payment
                            </>
                        )}
                    </button>

                    <div className="escrow-disclaimer">
                        <small>
                            ⚠️ Only click this after successfully entering the event. 
                            This action cannot be undone.
                        </small>
                    </div>
                </div>
            )}

            <div className="ticket-actions">
                <button 
                    onClick={() => window.location.href = '/profile'}
                    className="back-button"
                >
                    ← Back to My Tickets
                </button>
                
                <button 
                    onClick={() => {
                        if (navigator.share && qrCode) {
                            navigator.share({
                                title: `Ticket for ${ticketData.event_name}`,
                                text: `My ticket for ${ticketData.event_name} on ${formatEventDate(ticketData.event_date)}`,
                                url: window.location.href
                            });
                        } else {
                            // Fallback: copy URL to clipboard
                            navigator.clipboard.writeText(window.location.href);
                            alert('Ticket link copied to clipboard!');
                        }
                    }}
                    className="share-button"
                >
                    📤 Share Ticket
                </button>
            </div>

            <div className="important-notes">
                <h4>⚠️ Important Notes</h4>
                <ul>
                    <li>This is your official ticket - do not share the QR code</li>
                    <li>Screenshots are valid backups but keep the original app handy</li>
                    <li>Contact support if you have any entry issues</li>
                    <li>Ticket is non-transferable once purchased</li>
                </ul>
            </div>
        </div>
    );
}

export default TicketQRCode;