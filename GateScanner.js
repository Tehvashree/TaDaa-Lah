import React, { useState, useEffect } from 'react';
import QRCodeScanner from '../components/QRCodeScanner';
import { fetchTicketById } from '../utils/sui.js';

function GateScannerPage() {
    const [scanResults, setScanResults] = useState([]);
    const [showScanner, setShowScanner] = useState(false);
    const [currentScan, setCurrentScan] = useState(null);
    const [statistics, setStatistics] = useState({
        totalScans: 0,
        validTickets: 0,
        invalidTickets: 0,
        duplicateScans: 0
    });

    useEffect(() => {
        console.log('📊 Gate Scanner initialized');
    }, []);

    const handleScanResult = async (validationResult) => {
        console.log('🔍 Gate scan result:', validationResult);

        const scanRecord = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...validationResult
        };

        // Check for duplicate scans
        const isDuplicate = scanResults.some(scan => 
            scan.ticketId === validationResult.ticketId && 
            Date.now() - new Date(scan.timestamp).getTime() < 300000 // 5 minutes
        );

        if (isDuplicate) {
            scanRecord.isDuplicate = true;
            scanRecord.warning = 'This ticket was scanned recently';
        }

        setScanResults(prev => [scanRecord, ...prev.slice(0, 49)]); // Keep last 50 scans
        setCurrentScan(scanRecord);

        setStatistics(prev => ({
            totalScans: prev.totalScans + 1,
            validTickets: prev.validTickets + (validationResult.valid ? 1 : 0),
            invalidTickets: prev.invalidTickets + (!validationResult.valid ? 1 : 0),
            duplicateScans: prev.duplicateScans + (isDuplicate ? 1 : 0)
        }));

        setTimeout(() => {
            setShowScanner(false);
        }, 3000);
    };

    const clearResults = () => {
        setScanResults([]);
        setCurrentScan(null);
        setStatistics({
            totalScans: 0,
            validTickets: 0,
            invalidTickets: 0,
            duplicateScans: 0
        });
    };

    const formatEventDate = (dateString) => {
        if (!dateString) return 'Unknown Date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    const getSuccessRate = () => {
        if (statistics.totalScans === 0) return 0;
        return ((statistics.validTickets / statistics.totalScans) * 100).toFixed(1);
    };

    if (showScanner) {
        return (
            <QRCodeScanner
                onScanResult={handleScanResult}
                onClose={() => setShowScanner(false)}
            />
        );
    }

    return (
        <div className="gate-scanner-page">
            <div className="scanner-header">
                <div className="header-info">
                    <h1>🎫 Gate Scanner</h1>
                    <p>TadaaLah Event Entry Verification System</p>
                </div>
                <div className="scanner-stats">
                    <div className="stat-badge">
                        <span className="stat-value">{statistics.totalScans}</span>
                        <span className="stat-label">Total Scans</span>
                    </div>
                    <div className="stat-badge success">
                        <span className="stat-value">{statistics.validTickets}</span>
                        <span className="stat-label">Valid</span>
                    </div>
                    <div className="stat-badge error">
                        <span className="stat-value">{statistics.invalidTickets}</span>
                        <span className="stat-label">Invalid</span>
                    </div>
                    <div className="stat-badge warning">
                        <span className="stat-value">{getSuccessRate()}%</span>
                        <span className="stat-label">Success Rate</span>
                    </div>
                </div>
            </div>

            <div className="scanner-actions">
                <button 
                    onClick={() => setShowScanner(true)}
                    className="scan-button primary"
                >
                    📷 Start Scanning
                </button>
                <button 
                    onClick={clearResults}
                    className="clear-button secondary"
                    disabled={scanResults.length === 0}
                >
                    🗑️ Clear Results
                </button>
            </div>

            {/* Current Scan Display */}
            {currentScan && (
                <div className={`current-scan ${currentScan.valid ? 'valid' : 'invalid'}`}>
                    <div className="scan-header">
                        <h3>{currentScan.valid ? '✅ VALID TICKET' : '❌ INVALID TICKET'}</h3>
                        <span className="scan-time">
                            {new Date(currentScan.timestamp).toLocaleTimeString()}
                        </span>
                    </div>
                    
                    {currentScan.valid && currentScan.ticket ? (
                        <div className="ticket-info">
                            <div className="info-row">
                                <span className="label">Event:</span>
                                <span className="value">{currentScan.ticket.event_name}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Date:</span>
                                <span className="value">{formatEventDate(currentScan.ticket.event_date)}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Ticket ID:</span>
                                <span className="value">{currentScan.ticketId?.substring(0, 12)}...</span>
                            </div>
                            {currentScan.ticket.original_issuer_verified && (
                                <div className="verification-badge">
                                    ✅ Original Issuer Verified
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="error-info">
                            <p className="error-message">{currentScan.error || 'Invalid or unrecognized ticket'}</p>
                        </div>
                    )}

                    {currentScan.isDuplicate && (
                        <div className="duplicate-warning">
                            ⚠️ {currentScan.warning}
                        </div>
                    )}
                </div>
            )}

            {/* Scan History */}
            <div className="scan-history">
                <h3>Scan History</h3>
                
                {scanResults.length === 0 ? (
                    <div className="no-scans">
                        <span className="empty-icon">📭</span>
                        <p>No scans yet. Start by scanning a ticket!</p>
                    </div>
                ) : (
                    <div className="history-list">
                        {scanResults.map(scan => (
                            <div 
                                key={scan.id}
                                className={`history-item ${scan.valid ? 'valid' : 'invalid'} ${scan.isDuplicate ? 'duplicate' : ''}`}
                            >
                                <div className="scan-status">
                                    {scan.valid ? '✅' : '❌'}
                                    {scan.isDuplicate && '⚠️'}
                                </div>
                                
                                <div className="scan-details">
                                    <div className="primary-info">
                                        {scan.valid && scan.ticket ? (
                                            <>
                                                <span className="event-name">{scan.ticket.event_name}</span>
                                                <span className="event-date">{formatEventDate(scan.ticket.event_date)}</span>
                                            </>
                                        ) : (
                                            <span className="error-text">{scan.error || 'Invalid ticket'}</span>
                                        )}
                                    </div>
                                    <div className="secondary-info">
                                        <span className="ticket-id">
                                            {scan.ticketId ? `${scan.ticketId.substring(0, 8)}...` : 'No ID'}
                                        </span>
                                        <span className="scan-time">
                                            {new Date(scan.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="scan-badges">
                                    {scan.valid && scan.ticket?.original_issuer_verified && (
                                        <span className="verified-badge">Verified</span>
                                    )}
                                    {scan.isDuplicate && (
                                        <span className="duplicate-badge">Duplicate</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Instructions */}
            <div className="scanner-instructions">
                <h4>📋 Gate Scanner Instructions</h4>
                <ul>
                    <li>Click "Start Scanning" to open the camera</li>
                    <li>Point the camera at the QR code on the customer's ticket</li>
                    <li>Wait for automatic validation against the blockchain</li>
                    <li>Allow entry for ✅ valid tickets, deny ❌ invalid ones</li>
                    <li>Watch for ⚠️ duplicate scan warnings (recent entries)</li>
                </ul>
            </div>
        </div>
    );
}

export default GateScannerPage;