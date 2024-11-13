const pool = require('../config/db');

// Función para obtener todos los pedidos incluyendo dirección del cliente y productos
const getPedidos = async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id, p.cliente_id, p.nombre_apellido, p.productos, p.tipo_pedido, p.fecha_solicitada, 
                p.hora_inicio, p.hora_fin, p.dias_recurrentes,
                c.calle_altura AS direccion_cliente 
            FROM pedidos p
            JOIN clientes c ON p.cliente_id = c.id
        `;
        const [rows] = await pool.query(query);

        // Formatear los productos como JSON
        rows.forEach(row => {
            row.productos = JSON.parse(row.productos);
        });

        res.json(rows);
    } catch (error) {
        console.error('Error al obtener los pedidos:', error);
        res.status(500).json({ error: 'Error al obtener los pedidos' });
    }
};


module.exports = {
    getPedidos,
};
