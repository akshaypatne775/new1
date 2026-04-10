function Navbar({ statusText = 'System Online', statusType = 'online' }) {
  const statusIconClass =
    statusType === 'loading' ? 'fas fa-sync fa-spin' : 'fas fa-circle'
  const statusColor =
    statusType === 'error' ? '#dc3545' : statusType === 'loading' ? '#f4a261' : '#28a745'

  return (
    <div className="header">
      <h2>
        <i className="fas fa-satellite"></i> Droid Mining Solutions - Acquisition Hub
      </h2>
      <span id="syncStatus" className="sync-status">
        <i className={statusIconClass} style={{ color: statusColor }}></i> {statusText}
      </span>
    </div>
  )
}

export default Navbar
