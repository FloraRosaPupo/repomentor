export default function Toast({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="toast" key={message}>
      <span className="toast-icon" aria-hidden="true">
        !
      </span>
      <div className="toast-content" role="alert" aria-atomic="true">
        <strong>Não foi possível continuar</strong>
        <p>{message}</p>
      </div>
      <button
        className="toast-close"
        type="button"
        aria-label="Fechar notificação"
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
}
