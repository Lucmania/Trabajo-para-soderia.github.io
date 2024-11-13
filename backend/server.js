const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connection = require('./config/db');
const userRoutes = require('./routes/users');
const recorridoRoutes = require('./routes/recorridos');
const clienteRoutes = require('./routes/clientes');
const productoRoutes = require('./routes/productos');
const pedidosRoutes = require('./routes/pedidos');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rutas API
app.use('/api/users', userRoutes);
app.use('/api/recorridos', recorridoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/pedidos', pedidosRoutes);

// Endpoint para habilitar/deshabilitar un cliente
app.patch('/api/clientes/:id/habilitar', (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    connection.query('UPDATE clientes SET estado = ? WHERE id = ?', [estado, id], (error, results) => {
        if (error) {
            console.error('Error al actualizar el cliente:', error);
            return res.status(500).json({ message: 'Error al actualizar el cliente' });
        }
        res.status(200).json({ message: 'Cliente actualizado' });
    });
});

// Endpoint para obtener clientes
app.get('/api/clientes', (req, res) => {
    const estado = req.query.estado;
    let query = 'SELECT * FROM clientes';
    const params = [];

    if (estado) {
        query += ' WHERE estado = ?';
        params.push(estado);
    }

    connection.query(query, params, (error, results) => {
        if (error) {
            console.error('Error al obtener clientes:', error);
            return res.status(500).json({ message: 'Error al obtener clientes' });
        }
        res.json(results);
    });
});

// Manejador de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});