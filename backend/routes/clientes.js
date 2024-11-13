const express = require('express');
const Cliente = require('../models/Cliente'); // Asegúrate de que tu modelo esté bien definido
const router = express.Router();

// Ruta para crear un nuevo cliente
router.post('/', async (req, res) => {
    try {
        const newCliente = await Cliente.create(req.body);
        res.status(201).json({ message: 'Cliente creado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el cliente' });
    }
});

// Ruta para obtener todos los clientes habilitados
router.get('/', async (req, res) => {
    try {
        const estado = req.query.estado || 'habilitado'; // Default to habilitado
        const clientes = await Cliente.findByEstado(estado); // Filtra por estado
        res.status(200).json(clientes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los clientes' });
    }
});

// Ruta para obtener todos los clientes deshabilitados
router.get('/deshabilitados', async (req, res) => {
    try {
        const clientes = await Cliente.findByEstado('deshabilitado'); // Obtener solo deshabilitados
        res.status(200).json(clientes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los clientes deshabilitados' });
    }
});

// Ruta para actualizar un cliente
router.put('/:id', async (req, res) => {
    try {
        const updatedCliente = await Cliente.update(req.params.id, req.body); // Actualiza el cliente por ID
        if (updatedCliente.affectedRows === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.status(200).json({ message: 'Cliente actualizado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el cliente' });
    }
});

// Ruta para eliminar un cliente
router.delete('/:id', async (req, res) => {
    try {
        const deletedCliente = await Cliente.delete(req.params.id); // Elimina el cliente por ID
        if (deletedCliente.affectedRows === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.status(200).json({ message: 'Cliente eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar el cliente' });
    }
});

// Ruta para habilitar/deshabilitar un cliente
router.patch('/:id/habilitar', async (req, res) => {
    try {
        const estado = req.body.estado; // Obtener el nuevo estado del cuerpo de la solicitud
        const updatedCliente = await Cliente.toggleEstado(req.params.id, estado); // Actualiza el estado
        if (updatedCliente.affectedRows === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.status(200).json({ message: 'Estado de cliente actualizado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el estado del cliente' });
    }
});

module.exports = router;
