const express = require('express');
const Recorrido = require('../models/Recorrido');
const router = express.Router();

// Ruta para crear un nuevo recorrido con sus pedidos
router.post('/', async (req, res) => {
    try {
        const { fecha, pedidos } = req.body;

        if (!fecha || !pedidos || !Array.isArray(pedidos) || pedidos.length === 0) {
            return res.status(400).json({
                message: 'Datos inválidos para crear el recorrido'
            });
        }

        const newRecorrido = await Recorrido.create({
            fecha,
            pedidos,
            estado: 'pendiente'
        });

        res.status(201).json({
            message: 'Recorrido creado exitosamente',
            recorridoId: newRecorrido.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el recorrido' });
    }
});

// Ruta para obtener todos los recorridos
router.get('/', async (req, res) => {
    try {
        const recorridos = await Recorrido.findAll();
        res.status(200).json(recorridos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener recorridos' });
    }
});

// Ruta para obtener recorridos por fecha
router.get('/fecha/:fecha', async (req, res) => {
    try {
        const recorridos = await Recorrido.findByDate(req.params.fecha);
        res.status(200).json(recorridos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener recorridos por fecha' });
    }
});

router.get('/pedidos-asignados', async (req, res) => {
    try {
        const pedidosAsignados = await Recorrido.getPedidosAsignados();
        res.status(200).json(pedidosAsignados);
    } catch (error) {
        console.error('Error al obtener pedidos asignados:', error);
        res.status(500).json({ message: 'Error al obtener pedidos asignados' });
    }
});

// Ruta para obtener un recorrido específico por ID
router.get('/:id', async (req, res) => {
    try {
        const recorrido = await Recorrido.findById(req.params.id);
        if (!recorrido) {
            return res.status(404).json({ message: 'Recorrido no encontrado' });
        }
        res.status(200).json(recorrido);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el recorrido' });
    }
});

// Ruta para actualizar el estado de un recorrido
router.patch('/:id/estado', async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!['pendiente', 'en_progreso', 'completado'].includes(estado)) {
            return res.status(400).json({ message: 'Estado inválido' });
        }

        await Recorrido.updateEstado(id, estado);
        res.status(200).json({ message: 'Estado del recorrido actualizado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el estado del recorrido' });
    }
});

// Ruta para actualizar el estado de un pedido en el recorrido
router.patch('/:recorridoId/pedidos/:pedidoId/estado', async (req, res) => {
    try {
        const { recorridoId, pedidoId } = req.params;
        const { estado } = req.body;

        await Recorrido.updateEstadoPedido(recorridoId, pedidoId, estado);
        res.status(200).json({ message: 'Estado del pedido actualizado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el estado del pedido' });
    }
});

// Ruta para reordenar pedidos en un recorrido
router.patch('/:recorridoId/reordenar', async (req, res) => {
    try {
        const { recorridoId } = req.params;
        const { ordenes } = req.body;

        await Recorrido.reordenarPedidos(recorridoId, ordenes);
        res.status(200).json({ message: 'Pedidos reordenados exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al reordenar los pedidos' });
    }
});

// Ruta para eliminar un recorrido
router.delete('/:id', async (req, res) => {
    try {
        const recorridoId = req.params.id;

        // Primero eliminar las referencias en recorrido_pedidos
        await connection.query('DELETE FROM recorrido_pedidos WHERE recorrido_id = ?', [recorridoId]);

        // Luego eliminar el recorrido
        await connection.query('DELETE FROM recorridos WHERE id = ?', [recorridoId]);

        res.status(200).json({ message: 'Recorrido eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar recorrido:', error);
        res.status(500).json({ message: 'Error al eliminar el recorrido' });
    }
});

module.exports = router;
