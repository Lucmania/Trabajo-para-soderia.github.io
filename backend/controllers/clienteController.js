const connection = require('../config/db');

// Función para obtener el nombre y apellido del cliente por ID
async function obtenerClientePorId(cliente_id) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT nombre_apellido FROM clientes WHERE id = ?', [cliente_id], (error, results) => {
            if (error) return reject(error);
            if (results.length === 0) return reject(new Error('Cliente no encontrado'));
            resolve(results[0]); // Retorna el cliente encontrado
        });
    });
}

module.exports = { obtenerClientePorId };
