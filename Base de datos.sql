CREATE DATABASE soderia;
SHOW DATABASES;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_apellido VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    calle_altura VARCHAR(255) NOT NULL,
    piso VARCHAR(10),
    departamento VARCHAR(10),
    estado ENUM('habilitado', 'deshabilitado') DEFAULT 'habilitado' -- Cambiar a ENUM
);

ALTER TABLE clientes 
ADD COLUMN barrio VARCHAR(100) NOT NULL AFTER ciudad;

CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    descripcion TEXT
);

CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    nombre_apellido VARCHAR(255) NOT NULL,
    tipo_pedido ENUM('especifico', 'recurrente') NOT NULL,
    fecha_solicitada DATE, -- Permitir NULL para pedidos recurrentes
    hora_inicio TIME, -- Permitir NULL para pedidos recurrentes
    hora_fin TIME, -- Permitir NULL para pedidos recurrentes
    productos JSON NOT NULL,
    dias_recurrentes JSON, -- Puede ser NULL para pedidos específicos
    estado ENUM('pendiente', 'realizado') DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE TABLE recorridos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    estado ENUM('pendiente', 'en_progreso', 'completado') DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE recorrido_pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recorrido_id INT NOT NULL,
    pedido_id INT NOT NULL,
    orden INT NOT NULL, -- Para mantener el orden de los pedidos en el recorrido
    estado ENUM('pendiente', 'completado') DEFAULT 'pendiente',
    hora_entrega TIMESTAMP NULL, -- Para registrar cuando se completó el pedido
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recorrido_id) REFERENCES recorridos(id),
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_recorrido_fecha ON recorridos(fecha);
CREATE INDEX idx_recorrido_pedidos_recorrido ON recorrido_pedidos(recorrido_id);
CREATE INDEX idx_recorrido_pedidos_pedido ON recorrido_pedidos(pedido_id);

drop table clientes;
drop table recorridos;
drop table recorrido_pedidos;

select * from recorridos;
select * from recorrido_pedidos;
select * from productos;
select * from clientes;
select * from pedidos;
select * from users;