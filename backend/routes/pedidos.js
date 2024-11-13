const express = require('express');
const Pedido = require('../models/Pedido');
const { obtenerClientePorId } = require('../controllers/clienteController');
const router = express.Router();

// Ruta para crear un nuevo pedido
router.post('/', async (req, res) => {
    const { cliente_id, productos, tipo_pedido, fecha_solicitada, hora_inicio, hora_fin, dias_recurrentes } = req.body;

    try {
        // Validaciones iniciales
        if (!cliente_id) {
            return res.status(400).json({ message: "cliente_id es requerido." });
        }

        if (tipo_pedido === 'especifico' && (!fecha_solicitada || !hora_inicio)) {
            return res.status(400).json({ message: 'Faltan datos para el pedido específico (fecha u hora).' });
        }
        if (tipo_pedido === 'recurrente' && (!dias_recurrentes || dias_recurrentes.length === 0 || !hora_inicio)) {
            return res.status(400).json({ message: 'Faltan datos para el pedido recurrente (días u hora).' });
        }

        // Obtener nombre y apellido del cliente
        const clienteData = await obtenerClientePorId(cliente_id);
        if (!clienteData) {
            return res.status(400).json({ message: 'El cliente no existe.' });
        }

        // Crear el pedido
        const newPedido = {
            cliente_id,
            nombre_apellido: clienteData.nombre_apellido, // Añadir el nombre y apellido
            productos: JSON.stringify(productos),
            tipo_pedido,
            fecha_solicitada: tipo_pedido === 'especifico' ? fecha_solicitada : null,
            hora_inicio,
            hora_fin,
            dias_recurrentes: tipo_pedido === 'recurrente' ? JSON.stringify(dias_recurrentes) : null,
        };

        const result = await Pedido.create(newPedido);
        res.status(201).json({ message: 'Pedido creado exitosamente', pedidoId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el pedido', error: error.message });
    }
});

// Obtener todos los pedidos
router.get('/', async (req, res) => {
    try {
        const pedidos = await Pedido.findAll();
        const pedidosFormateados = pedidos.map(pedido => ({
            ...pedido,
            productos: JSON.parse(pedido.productos),
            dias_recurrentes: pedido.dias_recurrentes ? JSON.parse(pedido.dias_recurrentes) : null,
        }));

        res.status(200).json(pedidosFormateados);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener pedidos', error: error.message });
    }
});

// Ruta para obtener un pedido específico por ID
router.get('/:id', async (req, res) => {
    const pedidoId = req.params.id;

    try {
        const pedido = await Pedido.findById(pedidoId);
        if (!pedido) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        const pedidoFormateado = {
            ...pedido,
            productos: JSON.parse(pedido.productos),
            dias_recurrentes: pedido.dias_recurrentes ? JSON.parse(pedido.dias_recurrentes) : null,
        };

        res.status(200).json(pedidoFormateado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el pedido', error: error.message });
    }
});

// Ruta para actualizar un pedido
router.put('/:id', async (req, res) => {
    const pedidoId = req.params.id;
    const { cliente_id, productos, tipo_pedido, fecha_solicitada, hora_inicio, hora_fin, dias_recurrentes } = req.body;

    try {
        const updatedPedido = {
            cliente_id,
            productos: JSON.stringify(productos),
            tipo_pedido,
            fecha_solicitada,
            hora_inicio,
            hora_fin,
            dias_recurrentes: tipo_pedido === 'recurrente' ? JSON.stringify(dias_recurrentes) : null,
        };

        await Pedido.update(pedidoId, updatedPedido);
        res.status(200).json({ message: 'Pedido actualizado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el pedido', error: error.message });
    }
});

// Ruta para eliminar un pedido
router.delete('/:id', async (req, res) => {
    const pedidoId = req.params.id;

    try {
        // Primero eliminar las referencias en recorrido_pedidos
        await connection.query('DELETE FROM recorrido_pedidos WHERE pedido_id = ?', [pedidoId]);
        
        // Luego eliminar el pedido
        await Pedido.delete(pedidoId);
        
        res.status(200).json({ message: 'Pedido eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar el pedido' });
    }
});

// Ruta para cambiar el estado de un pedido a 'realizado'
router.patch('/:id/estado', async (req, res) => {
    const pedidoId = req.params.id;
    const { estado } = req.body; // Ahora recibiremos el estado del body

    try {
        const pedido = await Pedido.findById(pedidoId);
        if (!pedido) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        await Pedido.updateEstado(pedidoId, estado);
        res.status(200).json({ message: `El pedido ha sido marcado como ${estado}.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el estado del pedido.', error: error.message });
    }
});

// Exportar las rutas
module.exports = router;
