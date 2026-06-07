import React from 'react';

export default function Alert({ visible, title, message, buttons = [], onDismiss }) {
  if (!visible) return null;

  const defaultButtons = buttons.length > 0 ? buttons : [{ text: 'OK', onPress: onDismiss }];

  return (
    <div className="alert-overlay" onClick={onDismiss} role="dialog" aria-modal="true">
      <div className="alert-box animate-slide-up" onClick={(e) => e.stopPropagation()}>
        {title && <div className="alert-title">{title}</div>}
        {message && <div className="alert-message">{message}</div>}
        <div className="alert-buttons">
          {defaultButtons.map((btn, i) => (
            <button
              key={i}
              className={`btn ${btn.style === 'destructive' ? 'btn-danger' : btn.style === 'cancel' ? 'btn-secondary' : 'btn-primary'}`}
              onClick={() => { if (btn.onPress) btn.onPress(); if (onDismiss) onDismiss(); }}
            >
              {btn.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Hook for programmatic alert usage
export function useAlert() {
  const [alertState, setAlertState] = React.useState({ visible: false, title: '', message: '', buttons: [] });

  const showAlert = (title, message, buttons) => {
    setAlertState({ visible: true, title, message, buttons: buttons || [] });
  };

  const hideAlert = () => setAlertState(s => ({ ...s, visible: false }));

  return {
    alertProps: { ...alertState, onDismiss: hideAlert },
    showAlert,
    hideAlert,
  };
}
