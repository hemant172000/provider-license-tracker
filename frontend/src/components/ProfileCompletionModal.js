import React, { useState, useEffect } from 'react';
import API from '../services/api';
import './ProfileCompletionModal.css';
import PersonalInfoForm from './ProfileForms/PersonalInfoForm';
import LicensesForm from './ProfileForms/LicensesForm';
import CdsLicensesForm from './ProfileForms/CdsLicensesForm';
import BoardCertificationsForm from './ProfileForms/BoardCertificationsForm';
import EducationForm from './ProfileForms/EducationForm';
import PracticeLocationsForm from './ProfileForms/PracticeLocationsForm';
import WorkHistoryForm from './ProfileForms/WorkHistoryForm';
import MalpracticeForm from './ProfileForms/MalpracticeForm';
import PayerIdsForm from './ProfileForms/PayerIdsForm';
import HospitalPrivilegesForm from './ProfileForms/HospitalPrivilegesForm';

import AffiliateArrangementsForm from './ProfileForms/AffiliateArrangementsForm';
import SummaryReviewForm from './ProfileForms/SummaryReviewForm';

const ProfileCompletionModal = ({ isOpen, onClose, onComplete }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [signature, setSignature] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);
  const [sectionData, setSectionData] = useState({});
  const [loadingSection, setLoadingSection] = useState(false);

  const sections = [
    { id: 0, name: 'Personal Information', icon: 'fas fa-user' },
    { id: 1, name: 'State Licenses', icon: 'fas fa-id-card' },
    { id: 2, name: 'DEA & Controlled Substance', icon: 'fas fa-prescription-bottle' },
    { id: 3, name: 'Board Certifications', icon: 'fas fa-certificate' },
    { id: 4, name: 'Education & Training', icon: 'fas fa-graduation-cap' },
    { id: 5, name: 'Practice Locations', icon: 'fas fa-map-marker-alt' },
    { id: 6, name: 'Work History', icon: 'fas fa-briefcase' },
    { id: 7, name: 'Malpractice Insurance', icon: 'fas fa-shield-alt' },
    { id: 8, name: 'Payer IDs', icon: 'fas fa-credit-card' },
    { id: 9, name: 'Hospital Privileges', icon: 'fas fa-hospital' },
    { id: 10, name: 'Affiliate Arrangements', icon: 'fas fa-handshake' },
    { id: 11, name: 'Summary & Review', icon: 'fas fa-clipboard-list' },
    { id: 12, name: 'Attestation & Submit', icon: 'fas fa-file-signature' },
    
  ];

  useEffect(() => {
    if (isOpen) {
      fetchCompletionStatus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && currentSection !== 11) {
      fetchSectionData();
    }
  }, [currentSection, isOpen]);

  const fetchCompletionStatus = async () => {
    try {
      const response = await API.get('/provider-profile/completion-status');
      setCompletionPercentage(response.data.completionPercentage || 0);
    } catch (error) {
      console.error('Error fetching completion:', error);
    }
  };

  const fetchSectionData = async () => {
  setLoadingSection(true);
  try {
    let data = null;
    switch (currentSection) {
      case 0: // Personal Info
        try {
          const response = await API.get('/provider-profile/personal-info');
          data = response.data;
        } catch (err) {
          console.log('Personal info not found yet');
          data = null;
        }
        break;
      case 1: // State Licenses
        try {
          const response = await API.get('/provider-profile/licenses');
          data = response.data;
        } catch (err) {
          data = [];
        }
        break;
      case 2: // DEA/CDS
        try {
          const response = await API.get('/provider-profile/cds-licenses');
          data = response.data;
        } catch (err) {
          data = null;
        }
        break;
      case 3: // Board Certifications
        try {
          const response = await API.get('/provider-profile/board-certifications');
          data = response.data;
        } catch (err) {
          data = [];
        }
        break;
      case 4: // Education
        try {
          const response = await API.get('/provider-profile/education');
          data = response.data;
        } catch (err) {
          data = null;
        }
        break;
      case 5: // Practice Locations
        try {
          const response = await API.get('/provider-profile/practice-locations');
          data = response.data;
        } catch (err) {
          data = [];
        }
        break;
      case 6: // Work History
        try {
          const response = await API.get('/provider-profile/work-history');
          data = response.data;
        } catch (err) {
          data = [];
        }
        break;
      case 7: // Malpractice
        try {
          const response = await API.get('/provider-profile/malpractice');
          data = response.data;
        } catch (err) {
          data = null;
        }
        break;
      case 8: // Payer IDs
        try {
          const response = await API.get('/provider-profile/payer-ids');
          data = response.data;
        } catch (err) {
          data = [];
        }
        break;
      case 9: // Hospital Privileges
        try {
          const response = await API.get('/provider-profile/hospital-privileges');
          data = response.data;
        } catch (err) {
          data = [];
        }
        break;
      case 10: // Affiliate Arrangements
  try {
    const response = await API.get('/provider-profile/affiliate-arrangements');
    data = response.data;
  } catch (err) {
    data = [];
  }
  break;
      case 11:
  data = {};
  break;
      default:
        data = null;
    }
    setSectionData(prev => ({ ...prev, [currentSection]: data }));
  } catch (err) {
    console.error(`Failed to load section ${currentSection} data`, err);
    setSectionData(prev => ({ ...prev, [currentSection]: null }));
  } finally {
    setLoadingSection(false);
  }
};

  const updateCompletion = async () => {
    try {
      const response = await API.get('/provider-profile/completion-status');
      const newPercentage = response.data.completionPercentage || 0;
      setCompletionPercentage(newPercentage);
      // if (newPercentage === 100 && onComplete) {
      //   onComplete();
      //   onClose();
      // }
      return newPercentage;
    } catch (error) {
      console.error('Error updating completion:', error);
      return completionPercentage;
    }
  };

  const handleSectionComplete = async () => {
    setIsNavigating(true);
    await updateCompletion();
    setIsNavigating(false);
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrev = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSubmit = async () => {
    if (!signature.trim()) {
      alert('Please enter your signature to attest');
      return;
    }
    setLoading(true);
    try {
      await API.post('/provider-profile/submit', { signature });
      alert('Profile submitted successfully for review!');
      onClose();
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.error || 'Error submitting profile');
    } finally {
      setLoading(false);
    }
  };

  const renderSection = () => {
    const sectionProps = {
      onComplete: handleSectionComplete,
      onNext: handleNext,
      onPrev: handlePrev,
      isNavigating,
      initialData: sectionData[currentSection] || null,
      loading: loadingSection
    };

    switch (currentSection) {
      case 0: return <PersonalInfoForm {...sectionProps} />;
      case 1: return <LicensesForm {...sectionProps} />;
      case 2: return <CdsLicensesForm {...sectionProps} />;
      case 3: return <BoardCertificationsForm {...sectionProps} />;
      case 4: return <EducationForm {...sectionProps} />;
      case 5: return <PracticeLocationsForm {...sectionProps} />;
      case 6: return <WorkHistoryForm {...sectionProps} />;
      case 7: return <MalpracticeForm {...sectionProps} />;
      case 8: return <PayerIdsForm {...sectionProps} />;
      case 9: return <HospitalPrivilegesForm {...sectionProps} />;
      case 10:
  return <AffiliateArrangementsForm {...sectionProps} />;
      case 11:
  return <SummaryReviewForm {...sectionProps} />;
      case 12:
        return (
          <div className="attestation-section">
            <h3><i className="fas fa-file-signature"></i> Attestation</h3>
            <p>I hereby attest that all information provided in this profile is true, accurate, and complete to the best of my knowledge.</p>
            <div className="signature-field">
              <label>Electronic Signature:</label>
              <input 
                type="text" 
                value={signature} 
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Type your full name to sign"
              />
            </div>
            <button 
              className="submit-btn" 
              onClick={handleSubmit} 
              disabled={loading || completionPercentage < 100}
            >
              {loading ? 'Submitting...' : 'Submit for Review'}
            </button>
            {completionPercentage < 100 && (
              <p className="warning">Please complete all sections ({completionPercentage}%) before submitting.</p>
            )}
          </div>
        );
      default: return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal-container">
        <div className="profile-modal-header">
          <h2>Complete Your Credentialing Profile</h2>
        </div>

        <div className="profile-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${completionPercentage}%` }} />
          </div>
          <span className="progress-text">{completionPercentage}% Complete</span>
        </div>

        <div className="profile-sections-nav">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`section-nav-btn ${currentSection === section.id ? 'active' : ''}`}
              onClick={() => setCurrentSection(section.id)}
            >
              <i className={section.icon}></i>
              <span className="section-name">{section.name}</span>
            </button>
          ))}
        </div>

        <div className="profile-section-content">
          {renderSection()}
        </div>

        <div className="profile-modal-footer">
          <button 
            className="nav-btn prev-btn" 
            onClick={handlePrev}
            disabled={currentSection === 0}
          >
            <i className="fas fa-arrow-left"></i> Previous
          </button>
          {currentSection < sections.length - 1 && currentSection !== 11 && (
            <button 
              className="nav-btn next-btn" 
              onClick={handleNext}
              type="button"
            >
              Next <i className="fas fa-arrow-right"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionModal;