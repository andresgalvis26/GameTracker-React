import PropTypes from 'prop-types';

const EmptyState = ({ icon, title, message, actionLabel, onAction }) => (
    <div className="rounded-2xl border border-dashed border-gray-700 bg-gray-900/50 py-16 text-center" role="status">
        <div className="mb-4 text-6xl" aria-hidden="true">{icon}</div>
        <h2 className="mb-2 text-2xl font-bold text-gray-300">{title}</h2>
        <p className="mx-auto max-w-md text-gray-500">{message}</p>
        {actionLabel && (
            <button onClick={onAction} className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:bg-blue-500">{actionLabel}</button>
        )}
    </div>
);
EmptyState.propTypes = { icon: PropTypes.string.isRequired, title: PropTypes.string.isRequired, message: PropTypes.string.isRequired, actionLabel: PropTypes.string, onAction: PropTypes.func };
export default EmptyState;
