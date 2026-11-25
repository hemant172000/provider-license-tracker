import React from 'react';
import './SummaryCards.css'; 

const SummaryCards = ({ 
  providers, 
  providerFiles, 
  onAssignedProvidersClick,
  onExpiringClick,
  onExpiredClick,
  onGroupByPracticeClick,
  onRenewalsClick,
  onRecredentialingClick,
  onContractsClick,
  onPayorsClick
}) => {
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const total = providers.length;

  const expiring = providers.filter(p => {
    if (!p.licenseExpiry) return false;
    const expiry = new Date(p.licenseExpiry);
    return expiry > today && expiry <= thirtyDaysFromNow;
  }).length;

  const expired = providers.filter(p => {
    if (!p.licenseExpiry) return false;
    return new Date(p.licenseExpiry) < today;
  }).length;

  const allFiles = Object.values(providerFiles || {}).flat();
  const countByType = (type) => allFiles.filter(f => f.fileType === type).length;

  const cards = [
    {
      label: "Assigned Providers",
      value: total,
      icon: "📋",
      color: "#2980b9",
      clickable: true,
      onClick: onAssignedProvidersClick,
      filter: "ALL"
    },
    { 
      label: "Expiring Licenses", 
      value: expiring, 
      icon: "⚠️", 
      color: "#f39c12",
      clickable: true,
      onClick: onExpiringClick,
      filter: "EXPIRING"
    },
    { 
      label: "Expired Licenses", 
      value: expired, 
      icon: "🔔", 
      color: "#c0392b",
      clickable: true,
      onClick: onExpiredClick,
      filter: "EXPIRED"
    },
    { 
      label: "Group By Practice", 
      value: countByType("GROUP_BY_PRACTICE"), 
      icon: "🏥", 
      color: "#8e44ad",
      clickable: true,
      onClick: onGroupByPracticeClick,
      filter: "GROUP_BY_PRACTICE"
    },
    { 
      label: "Upcoming Renewals", 
      value: countByType("RENEWALS"), 
      icon: "🔄", 
      color: "#27ae60",
      clickable: true,
      onClick: onRenewalsClick,
      filter: "RENEWALS"
    },
    { 
      label: "Recredentialing", 
      value: countByType("RECREDENTIALING"), 
      icon: "📅", 
      color: "#16a085",
      clickable: true,
      onClick: onRecredentialingClick,
      filter: "RECREDENTIALING"
    },
    { 
      label: "Contracts", 
      value: countByType("CONTRACTS"), 
      icon: "📝", 
      color: "#d35400",
      clickable: true,
      onClick: onContractsClick,
      filter: "CONTRACTS"
    },
    { 
      label: "Payors", 
      value: countByType("PAYORS"), 
      icon: "💳", 
      color: "#2c3e50",
      clickable: true,
      onClick: onPayorsClick,
      filter: "PAYORS"
    },
  ];

  return (
    <div className="summary-cards">
      {cards.map((card) => (
        <div
          key={card.label}
          className="card"
          style={{
            borderTop: `3px solid ${card.color}`,
            cursor: card.clickable ? 'pointer' : 'default',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onClick={card.clickable && card.onClick ? card.onClick : undefined}
          title={card.clickable ? "Click to view details" : ""}
          onMouseEnter={e => {
            if (card.clickable) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }
          }}
          onMouseLeave={e => {
            if (card.clickable) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        >
          <div className="card-icon" style={{ color: card.color }}>{card.icon}</div>
          <h4>{card.label}</h4>
          <p style={{ color: card.value > 0 && card.label !== "Assigned Providers" ? card.color : 'inherit' }}>
            {card.value}
          </p>
          {card.clickable && (
            <span style={{ fontSize: '0.7rem', color: card.color, marginTop: '4px', display: 'block' }}>
              Click to view →
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;