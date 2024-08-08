-- Insertar un registro en la tabla BANCO
INSERT INTO BANCO (id_cuenta_dueno, nombre_dueno, saldo) 
VALUES (1234567890, 'Juan Perez', 5000.00);
INSERT INTO BANCO (id_cuenta_dueno, nombre_dueno, saldo) 
VALUES (2535747894, 'Carlos Sandoval', 35000.00);
INSERT INTO BANCO (id_cuenta_dueno, nombre_dueno, saldo) 
VALUES (9876543210, 'Maria Gonzalez', 12000.00);
INSERT INTO BANCO (id_cuenta_dueno, nombre_dueno, saldo) 
VALUES (8765432198, 'Ana Ramirez', 7500.00);
INSERT INTO BANCO (id_cuenta_dueno, nombre_dueno, saldo) 
VALUES (4567891230, 'Pedro Martinez', 28000.00);

-- Insertar un registro en la tabla TARJETA
INSERT INTO TARJETA (nombre_tarjeta, numero_tarjeta, cvv, fecha_vencimiento, id_banco)
VALUES ('Visa', '1234567890123456', '123', '05/25', 1);
INSERT INTO TARJETA (nombre_tarjeta, numero_tarjeta, cvv, fecha_vencimiento, id_banco)
VALUES ('Visa', '2222222222222222', '777', '08/28', 2);
INSERT INTO TARJETA (nombre_tarjeta, numero_tarjeta, cvv, fecha_vencimiento, id_banco)
VALUES ('Visa', '8997564785214569', '666', '07/25', 3);
INSERT INTO TARJETA (nombre_tarjeta, numero_tarjeta, cvv, fecha_vencimiento, id_banco)
VALUES ('MasterCard', '5555444433331111', '456', '09/27', 4);
INSERT INTO TARJETA (nombre_tarjeta, numero_tarjeta, cvv, fecha_vencimiento, id_banco)
VALUES ('American Express', '378282246310005', '321', '12/26', 5);

-- Insertar registros en la tabla TIPO_USUARIO
INSERT INTO TIPO_USUARIO (nombre) VALUES ('Administrador');
INSERT INTO TIPO_USUARIO (nombre) VALUES ('Cliente');

-- Insertar un registro en la tabla USUARIO
INSERT INTO USUARIO (id_tipo, nombre, apellido, correo, telefono, contrasena)
VALUES (1, 'Admin', 'Admin', 'admin@gmail.com', '123456789', 'admin2003');

-- Insertar un registro en la tabla IDIOMA
INSERT INTO IDIOMA (idioma) VALUES ('Espanol');

-- Insertar un registro en la tabla PAIS
INSERT INTO PAIS (nombre_pais) VALUES ('Guatemala');

-- Categoria principal: Tecnologia
INSERT INTO CATEGORIA_PRODUCTO (id, id_categoria_padre, nombre_categoria) VALUES (1, NULL, 'Tecnologia');

-- Subcategorias de Tecnologia
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (1, 'Computadores y Accesorios');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (1, 'Celulares y Accesorios');

-- Subcategorias de Computadores 
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (2, 'Computadoras');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (2, 'Componentes');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (2, 'Accesorios Computadoras');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (2, 'Impresoras');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (2, 'Monitores');

-- Subcategorias de Celulares
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (3, 'Celulares');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (3, 'Accesorios Celulares');

-- Categoria principal: Moda
INSERT INTO CATEGORIA_PRODUCTO (id, id_categoria_padre, nombre_categoria) VALUES (11, NULL, 'Moda');

-- Subcategorias de Moda
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (11, 'Hombres');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (11, 'Mujeres');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (11, 'Ninos');

-- Subcategorias de Hombres
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (14, 'Ropa Ninos');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (14, 'Zapatos Ninos');

-- Subcategorias de Mujeres
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (12, 'Ropa Hombre');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (12, 'Zapatos Hombre');

-- Subcategorias de Ninos
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (13, 'Ropa Mujer');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (13, 'Zapatos Mujer');

-- Categoria principal: Hogar
INSERT INTO CATEGORIA_PRODUCTO (id, id_categoria_padre, nombre_categoria) VALUES (21, NULL, 'Hogar');

-- Subcategorias de Hogar
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (21, 'Electrodomesticos');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (21, 'Muebles');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (21, 'Cocina');

-- Subcategorias de Muebles
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (23, 'Sala');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (23, 'Comedor');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (23, 'Dormitorio');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (23, 'Oficina');

-- Subcategorias de Sala
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (25, 'Sillones');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (25, 'Mesas Sala');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (25, 'Estanterias');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (25, 'Muebles Varios Sala');

-- Subcategorias de Comedor
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (26, 'Mesas Comedor');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (26, 'Sillas Comedor');

-- Subcategorias de Dormitorio
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (27, 'Camas');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (27, 'Armarios');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (27, 'Mesas de Noche');

-- Subcategorias de Oficina
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (28, 'Escritorios');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (28, 'Sillas Oficina');

-- Subcategorias de Cocina
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (24, 'Utensilios');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (24, 'Vajilla');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (24, 'Recipientes');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (24, 'Accesorios de Cocina');

-- Subcategorias de Ninos
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (15, 'Camisas Ninos');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (15, 'Pantalones Ninos');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (15, 'Shorts Ninos');

-- Subcategorias de Zapatos Hombre
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (16, 'Zapatos Deportivos Ninos');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (16, 'Sneakers Ninos');

-- Subcategorias de Hombre
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (17, 'Camisas Hombre');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (17, 'Pantalones Hombre');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (17, 'Shorts Hombre');

-- Subcategorias de Zapatos Mujer
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (18, 'Zapatos Deportivos Hombre');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (18, 'Sneakers Hombre');

-- Subcategorias de Ropa Ninos
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (19, 'Camisas Mujer');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (19, 'Pantalones Mujer');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (19, 'Shorts Mujer');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (19, 'Blusas');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (19, 'Vestidos');

-- Subcategorias de Zapatos Ninos
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (20, 'Zapatos Deportivos Mujer');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (20, 'Sneakers Mujer');

-- Creacion de variaciones
INSERT INTO VARIACION (nombre) VALUES ('TallaLetra');
INSERT INTO VARIACION (nombre) VALUES ('TallaNumerica');
INSERT INTO VARIACION (nombre) VALUES ('Color');
INSERT INTO VARIACION (nombre) VALUES ('Almacenamiento');

-- Opciones de variacion para Color
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (3, 'Rojo');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (3, 'Azul');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (3, 'Verde');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (3, 'Negro');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (3, 'Blanco');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (3, 'Gris');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (3, 'Amarillo');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (3, 'Naranja');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (3, 'Morado');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (3, 'Rosa');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (3, 'Marron');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (3, 'Dorado');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (3, 'Beige');

-- Opciones de variacion para TallaLetra
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (1, 'XS');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (1, 'S');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (1, 'M');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (1, 'L');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (1, 'XL');

-- Opciones de variacion para TallaNumerica
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (2, '5');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (2, '6');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (2, '7');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (2, '8');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (2, '9');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (2, '10');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (2, '11');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (2, '12');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (2, '14');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (2, '16');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (2, '18');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (2, '20');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (2, '22');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (2, '24');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (2, '26');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (2, '28');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (2, '30');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (2, '32');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (2, '34');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (2, '36');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (2, '38');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (2, '40');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (2, '42');

-- Opciones de variacion para Almacenamiento
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (4, '32GB');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (4, '64GB');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (4, '128GB');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (4, '256GB');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (4, '500GB');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (4, '1TB');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (4, '2TB');

-- Metodos de Envio
INSERT INTO METODO_ENVIO (nombre, precio) VALUES ('Envio estandar', 10);
INSERT INTO METODO_ENVIO (nombre, precio) VALUES ('Envio Express', 25);
INSERT INTO METODO_ENVIO (nombre, precio) VALUES ('Cargo Expreso', 25);

-- Inserciones para la tabla ESTADO_ORDEN
INSERT INTO ESTADO_ORDEN (estado) VALUES ('Pendiente');
INSERT INTO ESTADO_ORDEN (estado) VALUES ('En proceso');
INSERT INTO ESTADO_ORDEN (estado) VALUES ('Enviado');
INSERT INTO ESTADO_ORDEN (estado) VALUES ('Entregado');

-- Inserciones para la tabla ESTADO_PRODUCTO
INSERT INTO ESTADO_PRODUCTO (estado) VALUES ('DISPONIBLE');
INSERT INTO ESTADO_PRODUCTO (estado) VALUES ('AGOTADO');
INSERT INTO ESTADO_PRODUCTO (estado) VALUES ('ELIMINADO');



SELECT * FROM CATEGORIA_PRODUCTO;


