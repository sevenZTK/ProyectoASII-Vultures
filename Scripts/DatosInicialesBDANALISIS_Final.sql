-- Insertar un registro en la tabla BANCO
INSERT INTO BANCO (id_cuenta_dueño, nombre_dueño, saldo) 
VALUES (1234567890, 'Juan Perez', 5000.00);
INSERT INTO BANCO (id_cuenta_dueño, nombre_dueño, saldo) 
VALUES (2535747894, 'Carlos Sandoval', 35000.00);
INSERT INTO BANCO (id_cuenta_dueño, nombre_dueño, saldo) 
VALUES (9876543210, 'María González', 12000.00);
INSERT INTO BANCO (id_cuenta_dueño, nombre_dueño, saldo) 
VALUES (8765432198, 'Ana Ramirez', 7500.00);
INSERT INTO BANCO (id_cuenta_dueño, nombre_dueño, saldo) 
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



INSERT INTO TIPO_USUARIO (nombre) VALUES ('Administrador');//ESTO ANTES DEL USUARIO
INSERT INTO TIPO_USUARIO (nombre) VALUES ('Cliente');//ESTO ANTES DEL USUARIO


INSERT INTO USUARIO (id_tipo, nombre, apellido, correo, telefono, contraseña)
VALUES (1, 'Admin', 'Admin', 'admin@gmail.com', '123456789', 'admin2003');


INSERT INTO IDIOMA (idioma) VALUES ('Español');

INSERT INTO PAIS (nombre_pais) VALUES ('Guatemala');

-- Categoría principal: Tecnología
INSERT INTO CATEGORIA_PRODUCTO (id, id_categoria_padre, nombre_categoria) VALUES (1, NULL, 'Tecnología');

-- Subcategorías de Tecnología
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (1, 'Computadores y Accesorios');//CORRER ESTE SOLO ANTES DE LO QUE VA DESPUES
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (1, 'Celulares y Accesorios');

-- Subcategorías de Computadores 
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (2, 'Computadoras');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (2, 'Componentes');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (2, 'Accesorios Computadoras');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (2, 'Impresoras');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (2, 'Monitores');

-- Subcategorías de Celulares
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (3, 'Celulares');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (3, 'Accesorios Celulares');

-- Categoría principal: Moda
INSERT INTO CATEGORIA_PRODUCTO (id, id_categoria_padre, nombre_categoria) VALUES (11, NULL, 'Moda');

-- Subcategorías de Moda
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (11, 'Hombres'); //CORRER ESTE SOLO ANTES DE LO QUE VA DESPUES
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (11, 'Mujeres');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (11, 'Niños');

-- Subcategorías de Hombres
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (14, 'Ropa Niños');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (14, 'Zapatos Niños');

-- Subcategorías de Mujeres
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (12, 'Ropa Hombre');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (12, 'Zapatos Hombre');

-- Subcategorías de Niños
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (13, 'Ropa Mujer');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (13, 'Zapatos Mujer');

-- Categoría principal: Hogar
INSERT INTO CATEGORIA_PRODUCTO (id, id_categoria_padre, nombre_categoria) VALUES (21, NULL, 'Hogar');

-- Subcategorías de Hogar
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (21, 'Electrodomesticos');//CORRER ESTE SOLO ANTES DE LO QUE VA DESPUES
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (21, 'Muebles');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (21, 'Cocina');

-- Subcategorías de Muebles
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (23, 'Sala');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (23, 'Comedor');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (23, 'Dormitorio');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (23, 'Oficina');

-- Subcategorías de Sala
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (25, 'Sillones');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (25, 'Mesas Sala');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (25, 'Estanterías');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (25, 'Muebles Varios Sala');

-- Subcategorías de Comedor
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (26, 'Mesas Comedor');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (26, 'Sillas Comedor');

-- Subcategorías de Dormitorio
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (27, 'Camas');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (27, 'Armarios');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (27, 'Mesas de Noche');

-- Subcategorías de Oficina
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (28, 'Escritorios');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (28, 'Sillas Oficina');

-- Subcategorías de Cocina
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (24, 'Utensilios');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (24, 'Vajilla');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (24, 'Recipientes');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (24, 'Accesorios de Cocina');


INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (15, 'Camisas Niños');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (15, 'Pantalones Niños');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (15, 'Shorts Niños');
-- Subcategorías de Zapatos Hombre
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (16, 'Zapatos Deportivos Niños');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (16, 'Sneakers Niños');


INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (17, 'Camisas Hombre');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (17, 'Pantalones Hombre');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (17, 'Shorts Hombre');
-- Subcategorías de Zapatos Mujer
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (18, 'Zapatos Deportivos Hombre');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (18, 'Sneakers Hombre');

-- Subcategorías de Ropa Niños
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (19, 'Camisas Mujer');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (19, 'Pantalones Mujer');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (19, 'Shorts Mujer');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (19, 'Blusas');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (19, 'Vestidos');
-- Subcategorías de Zapatos Niños
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (20, 'Zapatos Deportivos Mujer');
INSERT INTO CATEGORIA_PRODUCTO (id_categoria_padre, nombre_categoria) VALUES (20, 'Sneakers Mujer');

--CREACION DE VARIACIONES
INSERT INTO VARIACION (nombre) VALUES ('TallaLetra');
INSERT INTO VARIACION (nombre) VALUES ('TallaNumerica');
INSERT INTO VARIACION (nombre) VALUES ('Color');
INSERT INTO VARIACION (nombre) VALUES ('Almacenamiento');

--Opciones de variaciones
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
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (3, 'Marrón');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (3, 'Dorado');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (3, 'Beige');

INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (1, 'XS');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (1, 'S');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (1, 'M');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (1, 'L');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (1, 'XL');


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


INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (4, '32GB');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (4, '64GB');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (4, '128GB');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (4, '256GB');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (4, '500GB');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (4, '1TB');
INSERT INTO OPCION_VARIACION (id_variacion, valor) VALUES (4, '2TB');

--Metodos de Envio
INSERT INTO METODO_ENVIO (nombre, precio) VALUES ('Envío estándar', 10);
INSERT INTO METODO_ENVIO (nombre, precio) VALUES ('Envío Express', 25);
INSERT INTO METODO_ENVIO (nombre, precio) VALUES ('Cargo Expreso', 25);

-- Inserciones para la tabla ESTADO_ORDEN
INSERT INTO ESTADO_ORDEN (estado) VALUES ('Pendiente');
INSERT INTO ESTADO_ORDEN (estado) VALUES ('En proceso');
INSERT INTO ESTADO_ORDEN (estado) VALUES ('Enviado');
INSERT INTO ESTADO_ORDEN (estado) VALUES ('Entregado');

INSERT INTO ESTADO_PRODUCTO (estado) VALUES ('DISPONIBLE');
INSERT INTO ESTADO_PRODUCTO (estado) VALUES ('AGOTADO');
INSERT INTO ESTADO_PRODUCTO (estado) VALUES ('ELIMINADO');

SELECT * FROM CATEGORIA_PRODUCTO;


