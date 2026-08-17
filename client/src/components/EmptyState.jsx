import PropTypes from 'prop-types';

const EmptyState = ({ icon, title, message, actionLabel, onAction }) => <div className="py-16 text-center" role="status"><div className="text-6xl mb-4" aria-hidden="true">{icon}</div><h2 className="text-2xl font-bold text-gray-300 mb-2">{title}</h2><p className="text-gray-500 max-w-md mx-auto">{message}</p>{actionLabel && <button onClick={onAction} className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium">{actionLabel}</button>}</div>;
EmptyState.propTypes = { icon: PropTypes.string.isRequired, title: PropTypes.string.isRequired, message: PropTypes.string.isRequired, actionLabel: PropTypes.string, onAction: PropTypes.func };
export default EmptyState;
