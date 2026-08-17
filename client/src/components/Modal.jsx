import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';

const Modal = ({ isOpen, onClose, title, children, showFooter = true, size = 'default' }) => {
    const dialogRef = useRef(null);
    const closeRef = useRef(onClose);
    useEffect(() => { closeRef.current = onClose; }, [onClose]);
    useEffect(() => {
        if (!isOpen) return undefined;
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') closeRef.current();
            if (event.key !== 'Tab' || !dialogRef.current) return;
            const elements = dialogRef.current.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (!elements.length) return;
            if (event.shiftKey && document.activeElement === elements[0]) { event.preventDefault(); elements[elements.length - 1].focus(); }
            if (!event.shiftKey && document.activeElement === elements[elements.length - 1]) { event.preventDefault(); elements[0].focus(); }
        };
        document.addEventListener('keydown', handleKeyDown); document.body.style.overflow = 'hidden'; dialogRef.current?.focus();
        return () => { document.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = ''; };
    }, [isOpen]);
    if (!isOpen) return null;
    return <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" role="presentation"><button type="button" className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} aria-label="Cerrar modal" /><div ref={dialogRef} tabIndex="-1" role="dialog" aria-modal="true" aria-labelledby="modal-title" className={`relative w-full ${size === 'wide' ? 'max-w-5xl' : 'max-w-2xl'} max-h-[92vh] overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl`}><header className="flex items-center justify-between border-b border-gray-800 bg-gray-900/95 p-5"><div><p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Game Tracker</p><h2 id="modal-title" className="text-xl font-bold truncate">{title}</h2></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-xl text-gray-400 hover:bg-gray-800 hover:text-white" aria-label="Cerrar modal">✕</button></header><div className="max-h-[calc(92vh-90px)] overflow-y-auto">{children}</div>{showFooter && <footer className="border-t border-gray-700 p-4 text-right"><button type="button" onClick={onClose} className="rounded bg-gray-700 px-4 py-2">Cerrar</button></footer>}</div></div>;
};

Modal.propTypes = { isOpen: PropTypes.bool.isRequired, onClose: PropTypes.func.isRequired, title: PropTypes.string.isRequired, children: PropTypes.node.isRequired, showFooter: PropTypes.bool, size: PropTypes.oneOf(['default', 'wide']) };
export default Modal;
