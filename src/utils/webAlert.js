// webAlert.js — Pure web alert utility
// Replaces the React Native Alert API wrapper

export const showAlert = (title, message, buttons = [{ text: 'OK' }]) => {
  // For simple cases, use browser alert (we have a custom Alert component for UI)
  // This is just the async utility version for service layers
  return new Promise((resolve) => {
    const result = window.confirm(`${title}\n\n${message}`);
    const btn = result ? (buttons[buttons.length - 1]) : (buttons.find(b => b.style === 'cancel') || buttons[0]);
    if (btn?.onPress) btn.onPress();
    resolve(btn);
  });
};

export default showAlert;
