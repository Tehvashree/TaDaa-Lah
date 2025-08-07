import React, { useState, useEffect } from 'react';
import { grantSellerBadge, fetchUserSellerProfile, verifyTicketWithOracle } from "../utils/sui.js";

function SellerVerification({ userAddress,walletProvider,onVerificationComplete }) {
    const [isVerifying, setIsVerifying] =useState(false);
    const [ticketFile, setTicketFile] = useState(null);
    const [confirmationNumber, setConfirmationNumber] = useState('');
    const [sellerProfile, setSellerProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [step, setStep] = useState('upload');

    //check if user is already a seller
    useEffect(() => {
        const checkSellerProfile = async () => {
            if (userAddress) {
                try {
                    const profile = await fetchUserSellerProfile(userAddress);
                    setSellerProfile(profile);
                    if (profile && profile.verified_badge) {
                        setStep('success');
                    }
                } catch (error) {
                    console.error('Error checking seller profile:', error);
                    setError('Failed to check verification status');
                }
            }
            setLoading(false);
        };

        checkSellerProfile();
    },[userAddress]);

    const handleVerification = async () => {
        if (!ticketFile || !confirmationNumber.trim()) {
            setError('Please provide both ticket file and confirmation number');
            return;
        }
        setIsVerifying(true);
        setError('');
        setStep('verifying');

        try {
            console.log('🔍 Starting oracle verification...');
            const oracleVerified = await verifyTicketWithOracle(ticketFile, confirmationNumber);
            
            if (!oracleVerified) {
                throw new Error('Ticket verification failed with Ticketmaster');
            }

            console.log('📝 Creating seller profile on blockchain...');
            await grantSellerBadge(userAddress, walletProvider);

            console.log('🔄 Refreshing profile data...');
            const newProfile = await fetchUserSellerProfile(userAddress);
            setSellerProfile(newProfile);

            if (newProfile && newProfile.verified_badge) {
                setStep('success');
                onVerificationComplete(true);
            } else {
                throw new Error('Failed to confirm badge creation');
            }

        } catch (error) {
            console.error('❌ Verification failed:', error);
            setError(`Verification failed. ${error.message}`);
            setStep('upload');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setTicketFile(file);
        setError('');
    };

    if (loading) {
        return (
            <div className="verification-loading">
                <div className="spinner">⏳</div>
                <p>Loading verification status...</p>
            </div>
        );
    }

    if (step === 'success' && sellerProfile?.verified_badge) {
        return (
            <div className="verification-success">
                <div className="success-icon">✅</div>
                <h3>Verified Seller</h3>
                <p>Congratulations! You are now authorized to list tickets.</p>
                <div className="profile-details">
                <p><strong>Profile ID:</strong> {sellerProfile.id}</p>
                <p><strong>Status:</strong> ✅ Verified</p>
                </div>
                <button 
                onClick={() => window.location.href = '/sell'}
                className="sell-now-button"
                >
                    Start Selling Tickets
                </button>
            </div>
        );
    }

    return (
        <div className="seller-verification">
            <div className="verification-header">
                <h2>🎫 Become a Verified Seller</h2>
                <p>Upload your original ticket to get verified and start selling on TadaaLah</p>
            </div>

            {step === 'verifying' && (
                <div className="verification-progress">
                <div className="progress-steps">
                    <div className="step active">
                    <div className="step-icon">🔍</div>
                    <p>Verifying with Ticketmaster...</p>
                    </div>
                    <div className="step active">
                    <div className="step-icon">📝</div>
                    <p>Creating blockchain profile...</p>
                    </div>
                    <div className="step">
                    <div className="step-icon">✅</div>
                    <p>Verification complete</p>
                    </div>
                </div>
                <div className="loading-text">
                    <p>Please wait while we verify your ticket...</p>
                    <p><em>This may take up to 30 seconds</em></p>
                </div>
                </div>
            )}

            {step === 'upload' && (
                <div className="verification-form">
                <div className="form-section">
                    <label htmlFor="ticket-file" className="form-label">
                    <strong>Original Ticket (PDF/Image)</strong>
                    </label>
                    <div className="file-upload-area">
                    <input
                        id="ticket-file"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="file-input"
                    />
                    {ticketFile ? (
                        <div className="file-preview">
                        <span className="file-icon">📄</span>
                        <span className="file-name">{ticketFile.name}</span>
                        <span className="file-size">
                            ({(ticketFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                        </div>
                    ) : (
                        <div className="upload-placeholder">
                        <span className="upload-icon">📁</span>
                        <p>Click to upload your ticket</p>
                        <p className="upload-hint">PDF, JPG, PNG supported</p>
                        </div>
                    )}
                    </div>
                </div>

                <div className="form-section">
                    <label htmlFor="confirmation" className="form-label">
                    <strong>Ticket Confirmation Number</strong>
                    </label>
                    <input
                    id="confirmation"
                    type="text"
                    placeholder="e.g. TM123456789, AXS789456123"
                    value={confirmationNumber}
                    onChange={(e) => {
                        setConfirmationNumber(e.target.value);
                        setError('');
                    }}
                    className="confirmation-input"
                    />
                    <p className="input-hint">
                    Find this on your original ticket or confirmation email
                    </p>
                </div>

                {error && (
                    <div className="error-message">
                    <span className="error-icon">❌</span>
                    <p>{error}</p>
                    </div>
                )}

                <div className="verification-info">
                    <h4>🔒 How Verification Works</h4>
                    <ul>
                    <li>We check your ticket with the original issuer (Ticketmaster, etc.)</li>
                    <li>If valid, we create your verified seller profile on blockchain</li>
                    <li>You can then list tickets with full buyer trust</li>
                    </ul>
                </div>

                <button
                    onClick={handleVerification}
                    disabled={!ticketFile || !confirmationNumber.trim() || isVerifying}
                    className={`verify-button ${
                    !ticketFile || !confirmationNumber.trim() ? 'disabled' : 'active'
                    }`}
                >
                    {isVerifying ? (
                    <>
                        <span className="button-spinner">⏳</span>
                        Verifying with Ticketmaster...
                    </>
                    ) : (
                    <>
                        <span className="button-icon">🔍</span>
                        Verify My Ticket
                    </>
                    )}
                </button>
                </div>
            )}
        </div>
    );
}

export default SellerVerification;