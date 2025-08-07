import React, { useState, useEffect } from 'react';
import { mintTicket, listTicket, fetchUserSellerProfile,
    uploadToIPFS, extractObjectIdFromResponse, convertSuiToMist
} from '../utils/sui.js';

function SellTicketForm({ userAddress, walletProvider,onListingCreated }) {
    const [formData, setFormData] = useState({
        eventName: '',
        eventDate: '',
        venue: '',
        price: '',
        ticketFile: null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sellerProfile, setSellerProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentStep, setCurrentStep] = useState('');
    const [success,setSuccess] = useState(false);

    useEffect(() => {
        const checkSellerStatus = async () => {
            if (userAddress) {
                try {
                    const profile = await fetchUserSellerProfile(userAddress);
                    setSellerProfile(profile);
                } catch (error) {
                    console.error('Error fetching seller profile:', error);
                    setError('Failed to check seller profile');
                }
            }
            setLoading(false);
        };

        checkSellerStatus();
    }, [userAddress]);

    const handleInputChange = (field,value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if(file.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                return;
            }
            handleInputChange('ticketFile', file);
        }
    };

    const validateForm = () => {
        if (!formData.eventName.trim()) {
            setError('Event name is required');
            return false;
        } 
        if (!formData.eventDate) {
            setError('Event date is required');
            return false;
        }
        if (!formData.venue.trim()) {
            setError('Venue is required');
            return false;
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
            setError('Valid price is required');
            return false;
        }
        if (!formData.ticketFile) {
            setError('Ticket image/PDF is required');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        if (!sellerProfile || !sellerProfile.verified_badge) {
            setError('Please get verified as a seller first!');
            return;
        }
        setIsSubmitting(true);
        setError('');
        setCurrentStep('Uploading to IPFS...');

        try {
            //upload to IPFS
            console.log('📁 Uploading to IPFS...');
            const ipfsCid = await uploadToIPFS(formData.ticketFile);

            setCurrentStep('Minting NFT...');

            console.log('🎫 Minting ticket NFT...');
            //mint ticket
            const mintResponse = await mintTicket(
                formData.eventName,
                formData.eventDate,
                ipfsCid,
                walletProvider
            );

            //extract ticket ID from mint response
            const ticketObjectId = extractObjectIdFromResponse(mintResponse);
            console.log('✅ Ticket minted with ID:', ticketObjectId);

            setCurrentStep('Creating listing...');

            //list ticket
            console.log('📋 Creating marketplace listing...');
            const priceInMist = convertSuiToMist(formData.price);
            const listResponse=await listTicket(
                ticketObjectId,
                sellerProfile.id,
                priceInMist,
                walletProvider
            );

            const listingObjectId = extractObjectIdFromResponse(listResponse, '::ticket::Listing');
            console.log('✅ Listing created with ID:', listingObjectId);

            setSuccess(true);
            setCurrentStep('Listing created successfully!');

            if(onListingCreated) {
                onListingCreated({
                    ticketId: ticketObjectId,
                    listingId: listingObjectId,
                    eventName: formData.eventName,
                    price: formData.price
                });
            }

            setTimeout(() => {
                setFormData({
                    eventName: '',
                    eventDate: '',
                    venue: '',
                    price: '',
                    ticketFile: null
                });
                setSuccess(false);
                setCurrentStep('');
            }, 3000);

    } catch (error) {
            console.error('❌ Error creating listing:', error);
            setError(`Failed to create listing. ${error.message}`);
            setCurrentStep('');
    } finally {
        setIsSubmitting(false);
    }
};

if (loading) {
    return (
        <div className="loading-state">
            <div className="spinner">⏳</div>
            <p>Loading seller status...</p>
        </div>
    );
}

if (!sellerProfile || !sellerProfile.verified_badge) {
    return (
        <div className="verification-required">
            <div className="lock-icon">🔒</div>
            <h3>Verification Required</h3>
            <p>You need to be a verified seller to list tickets on TadaaLah.</p>
            <div className="verification-benefits">
            <h4>Why get verified?</h4>
            <ul>
                <li>✅ Build buyer trust</li>
                <li>✅ Prevent fraud</li>
                <li>✅ Access to all platform features</li>
            </ul>
            </div>
            <button 
            onClick={() => window.location.href = '/verify'}
            className="get-verified-button"
            >
            Get Verified Now
            </button>
        </div>
    );
}

if (success) {
    return (
        <div className="success-state">
            <div className="success-icon">🎉</div>
            <h3>Ticket Listed Successfully!</h3>
            <p>Your ticket is now live on the TadaaLah marketplace.</p>
            <div className="success-details">
            <p><strong>Event:</strong> {formData.eventName}</p>
            <p><strong>Price:</strong> {formData.price} SUI</p>
            </div>
            <div className="success-actions">
            <button onClick={() => window.location.href = '/profile'}>
                View My Listings
            </button>
            <button 
                onClick={() => setSuccess(false)}
                className="secondary-button"
            >
                List Another Ticket
            </button>
            </div>
        </div>
    );
}

return (
    <div className="sell-ticket-form">
      <div className="form-header">
        <h2>🎫 List Your Ticket</h2>
        <p>Create an NFT listing for your event ticket</p>
        <div className="seller-badge">
          ✅ Verified Seller
        </div>
      </div>

      <form onSubmit={handleSubmit} className="listing-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="event-name">Event Name *</label>
            <input
              id="event-name"
              type="text"
              placeholder="e.g. Taylor Swift Eras Tour"
              value={formData.eventName}
              onChange={(e) => handleInputChange('eventName', e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="event-date">Event Date *</label>
            <input
              id="event-date"
              type="date"
              value={formData.eventDate}
              onChange={(e) => handleInputChange('eventDate', e.target.value)}
              disabled={isSubmitting}
              min={new Date().toISOString().split('T')[0]} // Can't select past dates
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="venue">Venue *</label>
            <input
              id="venue"
              type="text"
              placeholder="e.g. Madison Square Garden"
              value={formData.venue}
              onChange={(e) => handleInputChange('venue', e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Price (SUI) *</label>
            <div className="price-input-wrapper">
              <input
                id="price"
                type="number"
                step="0.1"
                min="0.1"
                placeholder="e.g. 1.5"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                disabled={isSubmitting}
                required
              />
              <span className="currency-label">SUI</span>
            </div>
            <p className="price-hint">
              {formData.price && parseFloat(formData.price) > 0 && (
                <>≈ ${(parseFloat(formData.price) * 2.5).toFixed(2)} USD</>
              )}
            </p>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="ticket-file">Ticket Image/PDF *</label>
            <div className="file-upload-area">
              <input
                id="ticket-file"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                disabled={isSubmitting}
                className="file-input"
                required
              />
              {formData.ticketFile ? (
                <div className="file-preview">
                  <span className="file-icon">📄</span>
                  <div className="file-info">
                    <span className="file-name">{formData.ticketFile.name}</span>
                    <span className="file-size">
                      {(formData.ticketFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInputChange('ticketFile', null)}
                    className="remove-file"
                    disabled={isSubmitting}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <span className="upload-icon">📁</span>
                  <p>Click to upload your ticket</p>
                  <p className="upload-hint">PDF, JPG, PNG supported (max 10MB)</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">❌</span>
            <p>{error}</p>
          </div>
        )}

        {isSubmitting && (
          <div className="progress-indicator">
            <div className="progress-steps">
              <div className="progress-step active">
                <span className="step-icon">📁</span>
                <span>Upload to IPFS</span>
              </div>
              <div className="progress-step active">
                <span className="step-icon">🎫</span>
                <span>Mint NFT</span>
              </div>
              <div className="progress-step active">
                <span className="step-icon">📋</span>
                <span>Create Listing</span>
              </div>
            </div>
            <div className="current-step">
              <span className="spinner">⏳</span>
              <span>{currentStep}</span>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`submit-button ${isSubmitting ? 'loading' : ''}`}
          >
            {isSubmitting ? (
              <>
                <span className="button-spinner">⏳</span>
                Creating Listing...
              </>
            ) : (
              <>
                <span className="button-icon">🚀</span>
                List Ticket for Sale
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => window.history.back()}
            disabled={isSubmitting}
            className="cancel-button"
          >
            Cancel
          </button>
        </div>

        <div className="listing-info">
          <h4>📋 What happens next?</h4>
          <ul>
            <li>Your ticket image gets stored on IPFS (decentralized storage)</li>
            <li>We mint an NFT representing your ticket ownership</li>
            <li>Your listing goes live on the TadaaLah marketplace</li>
            <li>Buyers can purchase with confidence knowing it's verified</li>
          </ul>
        </div>
      </form>
    </div>
);
}

export default SellTicketForm;