const express = require('express');
const Producto = require('../models/Producto');
const router = express.Router();

// Ruta para crear un nuevo producto
router.post('/', async (req, res) => {
    try {
        const newProducto = await Producto.create(req.body);
        res.status(201).json({ message: 'Producto creado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el producto' });
    }
});

// Ruta para obtener todos los productos
router.get('/', async (req, res) => {
    try {
        const productos = await Producto.findAll();
        res.status(200).json(productos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los productos' });
    }
});

// Ruta para actualizar un producto
router.put('/:id', async (req, res) => {
    try {
        const updatedProducto = await Producto.update(req.params.id, req.body);
        if (updatedProducto.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.status(200).json({ message: 'Producto actualizado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el producto' });
    }
});

// Ruta para eliminar un producto
router.delete('/:id', async (req, res) => {
    try {
        const deletedProducto = await Producto.delete(req.params.id);
        if (deletedProducto.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.status(200).json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar el producto' });
    }
});

module.exports = router;
