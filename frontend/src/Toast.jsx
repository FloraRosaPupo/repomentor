export default function Toast({
  message,
  onClose,
  title = "Não foi possível continuar",
  closeAria = "Fechar notificação",
}) {
  if (!message) return null;
  return (
    <div className="toast" key={message}>
      <span className="toast-icon" aria-hidden="true">
        !
      </span>
      <div className="toast-content" role="alert" aria-atomic="true">
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
      <button
        className="toast-close"
        type="button"
        aria-label={closeAria}
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
}
