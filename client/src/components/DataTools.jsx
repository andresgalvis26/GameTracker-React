import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import { gamesApi } from '../services/api';
import { exportCsv, exportJson, parseImportFile } from '../utils/dataExport';

const DataTools = ({ games, filteredGames }) => {
    const inputRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    const importFile = async (event) => {
        const [file] = event.target.files;
        event.target.value = '';
        if (!file) return;
        setIsImporting(true);
        try {
            const importedGames = await parseImportFile(file);
            const confirmation = await Swal.fire({ title: '¿Importar colección?', text: `Se añadirán ${importedGames.length} juegos a tu colección. Los existentes no se modificarán.`, icon: 'question', showCancelButton: true, confirmButtonText: 'Importar', cancelButtonText: 'Cancelar', background: '#1f2937', color: '#f9fafb' });
            if (!confirmation.isConfirmed) return;
            for (const game of importedGames) await gamesApi.create(game);
            await Swal.fire({ title: 'Importación completada', text: `${importedGames.length} juegos añadidos.`, icon: 'success', timer: 1600, showConfirmButton: false, background: '#1f2937', color: '#f9fafb' });
            window.location.reload();
        } catch (error) {
            await Swal.fire({ title: 'No se pudo importar', text: error.message || 'Comprueba el archivo y vuelve a intentarlo.', icon: 'error', background: '#1f2937', color: '#f9fafb' });
        } finally {
            setIsImporting(false);
        }
    };

    return <div className="relative"><button type="button" onClick={() => setIsOpen((value) => !value)} aria-expanded={isOpen} className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-300 hover:border-blue-400 hover:text-white">⇩ Datos</button>{isOpen && <div className="absolute right-0 top-11 z-20 w-64 rounded-xl border border-gray-700 bg-gray-900 p-2 shadow-2xl"><p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-500">Copia y comparte</p><button type="button" onClick={() => exportJson(games)} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-800">↓ Exportar JSON completo</button><button type="button" onClick={() => exportCsv(games)} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-800">↓ Exportar CSV completo</button><button type="button" onClick={() => exportJson(filteredGames)} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-800">↓ Exportar resultados filtrados</button><div className="my-2 border-t border-gray-800" /><button type="button" disabled={isImporting} onClick={() => inputRef.current?.click()} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-blue-300 hover:bg-gray-800 disabled:opacity-50">↑ {isImporting ? 'Importando...' : 'Importar JSON'}</button><input ref={inputRef} type="file" accept="application/json,.json" onChange={importFile} className="hidden" /></div>}</div>;
};

DataTools.propTypes = { games: PropTypes.array.isRequired, filteredGames: PropTypes.array.isRequired };
export default DataTools;
