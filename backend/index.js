const port = 4000;
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cors = require("cors");
const mysql = require('mysql2/promise');




const corsOptions = {
  origin: '*'
};

app.use(cors(corsOptions));
app.use(express.json());



const dbConfig = {
  host: 'localhost',
  user: 'usuario',  
  password: 'password',  
  database: 'shopper'  
};

async function initialize() {
  try {
    const connection = await mysql.createConnection(dbConfig); // Crear conexión MySQL
    console.log('Connected to MySQL');
    await connection.end(); // Cerrar conexión
  } catch (err) {
    console.error('Error connecting to MySQL:', err.message);
    process.exit(1); // Salir si hay un error
  }
}

initialize();


const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    return cb(null, file.originalname);
  },
});

// Modificar multer para aceptar múltiples archivos
const upload = multer({ storage: storage }).array('product', 3); // Cambiado a 'product' para que coincida con el nombre del campo esperado

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: 0, message: 'Error al cargar imágenes' });
    }

    const imageUrls = req.files.map((file) => `http://localhost:4000/images/${file.filename}`);

    res.json({
      success: 1,
      image_urls: imageUrls,
    });
  });
});

app.use('/images', express.static('upload/images'));


app.get("/", (req, res) => {
  res.send("Root");
});

app.post('/login', async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    // Verificar si el usuario existe y la contrasena es correcta
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      "SELECT id FROM USUARIO WHERE correo = ? AND contrasena = ?",
      [correo, contrasena]
    );
    await connection.end();

    if (rows.length === 0) {
      return res.status(401).json({ success: false, errors: "Correo o contrasena incorrectos." });
    }
    const userId = rows[0].id;

    // Si las credenciales son correctas, se permite el acceso a la página
    res.status(200).json({ success: true, message: "Inicio de sesión exitoso.", userId });
  } catch (error) {
    console.error("Error en el inicio de sesión:", error);
    res.status(500).json({ success: false, errors: "Error en el servidor al iniciar sesión." });
  }
});



app.post('/signup', async (req, res) => {
  const connection = await mysql.createConnection(dbConfig);

  try {
    const { nombre, apellido, correo, telefono, contrasena, id_pais, direccion, estado, ciudad, codigo_postal } = req.body;

    // Iniciar transacción
    await connection.beginTransaction();

    // Verificar si el usuario ya está registrado
    const [resultUsuarioExistente] = await connection.execute(
      "SELECT * FROM USUARIO WHERE correo = ?",
      [correo]
    );
    if (resultUsuarioExistente.length > 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, errors: "Usuario ya registrado, inicia sesión." });
    }

    // Insertar usuario
    const [resultUsuario] = await connection.execute(
      "INSERT INTO USUARIO (id_tipo, nombre, apellido, correo, telefono, contrasena) VALUES (2, ?, ?, ?, ?, ?)",
      [nombre, apellido, correo, telefono, contrasena]
    );
    const idUsuario = resultUsuario.insertId;

    // Insertar dirección
    const [resultDireccion] = await connection.execute(
      "INSERT INTO DIRECCION (direccion, estado, ciudad, codigo_postal, id_pais) VALUES (?, ?, ?, ?, ?)",
      [direccion, estado, ciudad, codigo_postal, id_pais]
    );
    const idDireccion = resultDireccion.insertId;

    // Asociar dirección con usuario
    await connection.execute(
      "INSERT INTO DIRECCION_USUARIO (id_usuario, id_direccion) VALUES (?, ?)",
      [idUsuario, idDireccion]
    );

    await connection.commit(); // Confirmar transacción

    res.status(200).json({ success: true, message: "Usuario registrado exitosamente." });
  } catch (error) {
    await connection.rollback(); // Revertir transacción en caso de error
    console.error("Error en el registro de usuario:", error);
    res.status(500).json({ success: false, errors: "Error en el servidor al registrar usuario." });
  } finally {
    await connection.end(); // Cerrar conexión
  }
});





// Endpoint para obtener la lista de países
app.get('/countries', async (req, res) => {
  const connection = await mysql.createConnection(dbConfig);

  try {
    const [rows] = await connection.execute('SELECT * FROM PAIS');
    const countries = rows.map(row => ({
      id: row.id,
      nombre_pais: row.nombre_pais
    }));

    res.json(countries);
  } catch (error) {
    console.error("Error al obtener la lista de países:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    await connection.end(); // Cerrar conexión
  }
});


app.get("/allproducts", async (req, res) => {
  let connection;
  
  try {
    // Establece la conexión con la base de datos
    connection = await mysql.createConnection(dbConfig);
    
    // Ejecuta la consulta para obtener todos los productos con el nombre de la categoría
    const [rows] = await connection.execute(
      `SELECT p.id, p.nombre_producto, p.descripcion_producto, p.imagen_producto1, c.nombre_categoria
       FROM PRODUCTO p
       INNER JOIN CATEGORIA_PRODUCTO c ON p.id_categoria = c.id
       WHERE p.estado = 1`
    );
    
    // Envía los productos como respuesta
    res.json(rows.map(row => ({
      id: row.id,
      nombre_producto: row.nombre_producto,
      descripcion_producto: row.descripcion_producto,
      imagen_producto1: row.imagen_producto1,
      nombre_categoria: row.nombre_categoria
    })));
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los productos" });
  } finally {
    // Cierra la conexión
    if (connection) {
      try {
        await connection.end();
      } catch (error) {
        console.error(error);
      }
    }
  }
});
    
    
app.get("/allproductsDisplay", async (req, res) => {
  let connection;

  try {
    // Establece la conexión con la base de datos
    connection = await mysql.createConnection(dbConfig);

    // Ejecuta la consulta para obtener todos los productos con el nombre de la categoría
    const [productosResult] = await connection.execute(
      `SELECT p.id, p.nombre_producto, p.descripcion_producto, p.imagen_producto1, p.imagen_producto2, p.imagen_producto3, c.nombre_categoria, p.id_categoria
       FROM PRODUCTO p
       INNER JOIN CATEGORIA_PRODUCTO c ON p.id_categoria = c.id
       WHERE p.estado = 1`
    );

    // Extraer los ids de los productos de la primera consulta
    const idsProductos = productosResult.map(row => row.id);

    // Dividir los ids de los productos en grupos de menos de 1000
    const gruposIds = [];
    while (idsProductos.length > 0) {
      gruposIds.push(idsProductos.splice(0, 1000));
    }

    // Consultar precios para cada grupo de IDs de productos
    const preciosPorId = {};
    for (const grupo of gruposIds) {
      const [preciosResult] = await connection.execute(
        `SELECT id_producto, precio
         FROM ITEM_PRODUCTO
         WHERE id_producto IN (${grupo.map(() => '?').join(",")})`,
        grupo
      );

      // Mapear los precios a un objeto para facilitar la búsqueda
      for (const row of preciosResult) {
        preciosPorId[row.id_producto] = row.precio;
      }
    }

    // Enviar los productos con sus precios correspondientes
    const productosConPrecios = productosResult.map(row => ({
      id: row.id,
      nombre_producto: row.nombre_producto,
      descripcion_producto: row.descripcion_producto,
      imagen_producto1: row.imagen_producto1,
      imagen_producto2: row.imagen_producto2,
      imagen_producto3: row.imagen_producto3,
      nombre_categoria: row.nombre_categoria,
      id_categoria: row.id_categoria,
      precio: preciosPorId[row.id] || 0 // Obtener el precio del objeto de precios utilizando el id del producto como clave
    }));

    // Enviar los productos como respuesta
    res.json(productosConPrecios);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los productos" });
  } finally {
    // Cierra la conexión
    if (connection) {
      try {
        await connection.end();
      } catch (error) {
        console.error(error);
      }
    }
  }
});
    
    
  

app.post('/addproduct', async (req, res) => {
  const newProductData = {
    id_categoria: req.body.id_categoria,
    nombre_producto: req.body.nombre_producto,
    descripcion_producto: req.body.descripcion_producto,
    imagen_producto1: req.body.imagen_producto1,
    imagen_producto2: req.body.imagen_producto2,
    imagen_producto3: req.body.imagen_producto3,
    estado: req.body.estado,
  };

  let connection;

  try {
    // Establece la conexión con la base de datos
    connection = await mysql.createConnection(dbConfig);

    // Verificar si el producto ya existe
    const [resultCheckProduct] = await connection.execute(
      `SELECT id FROM PRODUCTO WHERE nombre_producto = ?`,
      [newProductData.nombre_producto]
    );

    if (resultCheckProduct.length > 0) {
      // Si el producto ya existe, obtén su ID y continúa con el resto del código
      const existingProductId = resultCheckProduct[0].id;
      await handleItemAndConfigInsertion(existingProductId, req, res, connection);
    } else {
      // Si el producto no existe, procede a insertarlo
      await insertNewProduct(newProductData, req, res, connection);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: "Error al verificar o insertar el producto en MySQL" });
  } finally {
    // Cierra la conexión
    if (connection) {
      try {
        await connection.end();
      } catch (err) {
        console.error(err.message);
      }
    }
  }
});

async function insertNewProduct(newProductData, req, res, connection) {
    // Insertar en Oracle
    const queryProducto = `INSERT INTO PRODUCTO (id_categoria, nombre_producto, descripcion_producto, imagen_producto1, imagen_producto2, imagen_producto3, estado) 
                           VALUES (:id_categoria, :nombre_producto, :descripcion_producto, :imagen_producto1, :imagen_producto2, :imagen_producto3, :estado) 
                           RETURNING id INTO :id`;
    const bindsProducto = {
        id_categoria: newProductData.id_categoria,
        nombre_producto: newProductData.nombre_producto,
        descripcion_producto: newProductData.descripcion_producto,
        imagen_producto1: newProductData.imagen_producto1,
        imagen_producto2: newProductData.imagen_producto2,
        imagen_producto3: newProductData.imagen_producto3,
        estado: newProductData.estado,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
    };

    let result = await connection.execute(queryProducto, bindsProducto, { autoCommit: true });
    const newProductId = result.outBinds.id[0]; // Obtener el ID generado

    await handleItemAndConfigInsertion(newProductId, req, res, connection);
}

async function insertNewProduct(newProductData, req, res, connection) {
  // Insertar en MySQL
  const queryProducto = `INSERT INTO PRODUCTO (id_categoria, nombre_producto, descripcion_producto, imagen_producto1, imagen_producto2, imagen_producto3, estado) 
                         VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const valuesProducto = [
    newProductData.id_categoria,
    newProductData.nombre_producto,
    newProductData.descripcion_producto,
    newProductData.imagen_producto1,
    newProductData.imagen_producto2,
    newProductData.imagen_producto3,
    newProductData.estado
  ];

  let result = await connection.execute(queryProducto, valuesProducto);
  const newProductId = result[0].insertId; // Obtener el ID generado

  await handleItemAndConfigInsertion(newProductId, req, res, connection);
}

async function handleItemAndConfigInsertion(productId, req, res, connection) {
  // Insertar en ITEM_PRODUCTO
  const newItemData = {
    id_producto: productId,
    cantidad_disp: req.body.cantidad,
    precio: Number(parseFloat(req.body.precio).toFixed(2)),
    estado: req.body.estado,
  };

  const queryItem = `INSERT INTO ITEM_PRODUCTO (id_producto, cantidad_disp, precio, estado) 
                     VALUES (?, ?, ?, ?)`;
  const valuesItem = [
    newItemData.id_producto,
    newItemData.cantidad_disp,
    newItemData.precio,
    newItemData.estado
  ];

  let result = await connection.execute(queryItem, valuesItem);
  const itemId = result[0].insertId; // Obtener el ID generado

  // Verificar si id_opcion_variacion_1 tiene valor
  if (req.body.id_opcion_variacion_1 && req.body.id_opcion_variacion_1 !== "") {
    // Insertar dos veces en CONFIGURACION_PRODUCTO
    const newConfigData = [
      {
        id_item_producto: itemId,
        id_opcion_variacion: req.body.id_opcion_variacion
      },
      {
        id_item_producto: itemId,
        id_opcion_variacion: req.body.id_opcion_variacion_1
      }
    ];

    const queryConfig = `INSERT INTO CONFIGURACION_PRODUCTO (id_item_producto, id_opcion_variacion) 
                         VALUES (?, ?)`;
    for (const data of newConfigData) {
      const valuesConfig = [data.id_item_producto, data.id_opcion_variacion];
      result = await connection.execute(queryConfig, valuesConfig);
      console.log("Inserted into CONFIGURACION_PRODUCTO:", result[0].affectedRows);
    }
  } else {
    // Insertar solo una vez en CONFIGURACION_PRODUCTO
    const newConfigData = {
      id_item_producto: itemId,
      id_opcion_variacion: req.body.id_opcion_variacion
    };

    const queryConfig = `INSERT INTO CONFIGURACION_PRODUCTO (id_item_producto, id_opcion_variacion) 
                         VALUES (?, ?)`;
    const valuesConfig = [newConfigData.id_item_producto, newConfigData.id_opcion_variacion];

    result = await connection.execute(queryConfig, valuesConfig);
    console.log("Inserted into CONFIGURACION_PRODUCTO:", result[0].affectedRows);
  }

  console.log("Inserted into MySQL:", result[0].affectedRows);
  res.json({ success: true, name: req.body.nombre_producto });
}






  
app.get("/categories", async (req, res) => {
  try {
    const categorias = await obtenerCategorias();
    res.json(categorias);
  } catch (error) {
    console.error("Error al obtener las categorías desde MySQL:", error.message);
    res.status(500).json({ error: "Error al obtener las categorías" });
  }
});

async function obtenerCategorias() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const query = `
      SELECT id, nombre_categoria
      FROM CATEGORIA_PRODUCTO cp1
      WHERE NOT EXISTS (
          SELECT 1
          FROM CATEGORIA_PRODUCTO cp2
          WHERE cp1.id = cp2.id_categoria_padre
      )
    `;

    const [rows] = await connection.execute(query);
    // Mapear correctamente los resultados
    return rows.map(row => ({
      id: row.id,
      nombre_categoria: row.nombre_categoria
    }));
  } catch (err) {
    console.error("Error al obtener las categorías desde MySQL:", err.message);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (err) {
        console.error("Error al cerrar la conexión:", err.message);
      }
    }
  }
}
  
  
  
app.get("/variations", async (req, res) => {
  try {
    const variaciones = await obtenerVariaciones();
    res.json(variaciones);
  } catch (error) {
    console.error("Error al obtener las variaciones desde MySQL:", error.message);
    res.status(500).json({ error: "Error al obtener las variaciones" });
  }
});

async function obtenerVariaciones() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const query = `SELECT id, nombre FROM VARIACION`;
    const [rows] = await connection.execute(query);
    // Mapear correctamente los resultados
    return rows.map(row => ({
      id: row.id,
      nombre: row.nombre
    }));
  } catch (err) {
    console.error("Error al obtener las variaciones desde MySQL:", err.message);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (err) {
        console.error("Error al cerrar la conexión:", err.message);
      }
    }
  }
}
  
  
app.get("/options", async (req, res) => {
  try {
    const idVariacion = req.query.idVariacion;
    const opcionesVariacion = await obtenerOpcionesVariacion(idVariacion);
    res.json(opcionesVariacion);
  } catch (error) {
    console.error("Error al obtener las opciones desde MySQL:", error.message);
    res.status(500).json({ error: "Error al obtener las opciones" });
  }
});

async function obtenerOpcionesVariacion(idVariacion) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const query = `SELECT id, valor FROM OPCION_VARIACION WHERE id_variacion = ?`;
    const [rows] = await connection.execute(query, [idVariacion]);
    // Mapear correctamente los resultados
    return rows.map(row => ({
      id: row.id,
      valor: row.valor
    }));
  } catch (err) {
    console.error("Error al obtener las opciones desde MySQL:", err.message);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (err) {
        console.error("Error al cerrar la conexión:", err.message);
      }
    }
  }
}
  
  
app.post("/removeproduct", async (req, res) => {
  let connection;

  try {
    const productId = req.body.id;

    // Obtener una nueva conexión
    connection = await mysql.createConnection(dbConfig);

    // Iniciar la transacción y ejecutar las consultas SQL dentro de ella
    await connection.beginTransaction();

    const updateItemProductQuery = `
      UPDATE ITEM_PRODUCTO 
      SET estado = ? 
      WHERE id_producto = ?;
    `;
    const updateProductQuery = `
      UPDATE PRODUCTO 
      SET estado = ? 
      WHERE id = ?;
    `;

    // Ejecutar las consultas
    await connection.execute(updateItemProductQuery, [3, productId]);
    await connection.execute(updateProductQuery, [3, productId]);

    // Confirmar la transacción
    await connection.commit();

    console.log("Producto eliminado correctamente");

    res.json({ success: true, message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error(error.message);
    try {
      // Deshacer la transacción en caso de error
      if (connection) await connection.rollback();
    } catch (rollbackError) {
      console.error("Error al deshacer la transacción:", rollbackError.message);
    }
    res.status(500).json({ success: false, error: "Error al eliminar el producto" });
  } finally {
    // Cerrar la conexión
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error("Error al cerrar la conexión:", closeError.message);
      }
    }
  }
});
  
async function getCategoryById(categoryId) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      `SELECT * FROM CATEGORIA_PRODUCTO WHERE id = ?`, [categoryId]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error al obtener la categoría por ID:', error.message);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error('Error al cerrar la conexión:', closeError.message);
      }
    }
  }
}
  
app.post('/addcategory', async (req, res) => {
  let connection;

  try {
    const { name, parentId } = req.body;

    // Verificar si parentId es válido
    const parentCategory = parentId && await getCategoryById(parentId);
    if (parentId && !parentCategory) {
      throw new Error('El parentId proporcionado no es válido');
    }

    // Construir la consulta SQL
    const query = `
      INSERT INTO CATEGORIA_PRODUCTO
      ${parentId ? '(id_categoria_padre, nombre_categoria)' : '(nombre_categoria)'}
      VALUES ${parentId ? '(?, ?)' : '(?)'}
    `;

    // Valores para la consulta
    const values = parentId ? [parentId, name] : [name];

    connection = await mysql.createConnection(dbConfig);
    await connection.execute(query, values);

    console.log('Categoría añadida correctamente');

    res.json({ success: true, message: 'Categoría añadida correctamente' });
  } catch (error) {
    console.error('Error al agregar la categoría:', error.message);
    res.status(500).json({ success: false, error: 'Error al agregar la categoría' });
  } finally {
    // Cerrar la conexión
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error('Error al cerrar la conexión:', closeError.message);
      }
    }
  }
});

  

  //parte de Steven 
  //es con mssql configuracion de la bd a dbConfig

  app.get("/parentcategories", async (req, res) => {
    let connection;
    try {
      connection = await mysql.createConnection(dbConfig);
      const [rows] = await connection.execute(
        `SELECT id, nombre_categoria FROM CATEGORIA_PRODUCTO`
      );
      res.json(rows.map(row => ({
        id: row.id,
        nombre_categoria: row.nombre_categoria
      })));
    } catch (error) {
      console.error('Error fetching parent categories:', error);
      res.status(500).json([]);
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  });
  
  app.get("/itemproducts", async (req, res) => {
    let connection;
    try {
      const productId = req.query.id_producto;
      connection = await mysql.createConnection(dbConfig);
      const [rows] = await connection.execute(
        `SELECT id, cantidad_disp, precio, estado FROM ITEM_PRODUCTO WHERE id_producto = ?`,
        [productId]
      );
      res.json(rows.map(row => ({
        id: row.id,
        cantidad_disp: row.cantidad_disp,
        precio: row.precio,
        estado: row.estado
      })));
    } catch (error) {
      console.error('Error fetching item products:', error);
      res.status(500).json([]);
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  });
  
  app.get("/searchproduct", async (req, res) => {
    let connection;
    try {
      const searchTerm = req.query.search ? `%${req.query.search.toLowerCase()}%` : "%";
      connection = await mysql.createConnection(dbConfig);
      const [rows] = await connection.execute(
        `SELECT p.id, p.nombre_producto, p.descripcion_producto, p.imagen_producto1, c.nombre_categoria
         FROM PRODUCTO p
         INNER JOIN CATEGORIA_PRODUCTO c ON p.id_categoria = c.id
         WHERE LOWER(p.nombre_producto) LIKE ? AND p.estado = 1`,
        [searchTerm]
      );
      res.json(rows.map(row => ({
        id: row.id,
        nombre_producto: row.nombre_producto,
        descripcion_producto: row.descripcion_producto,
        imagen_producto1: row.imagen_producto1,
        nombre_categoria: row.nombre_categoria
      })));
    } catch (error) {
      console.error('Error searching products:', error);
      res.status(500).json({ error: "Error searching products" });
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  });
  
  app.get("/productos", async (req, res) => {
    let connection;
    try {
      const searchTerm = req.query.search ? `%${req.query.search.toLowerCase()}%` : "%";
      connection = await mysql.createConnection(dbConfig);
      const [rows] = await connection.execute(
        `SELECT p.id, p.nombre_producto, p.descripcion_producto, p.imagen_producto1, c.nombre_categoria
         FROM PRODUCTO p
         INNER JOIN CATEGORIA_PRODUCTO c ON p.id_categoria = c.id
         WHERE LOWER(p.nombre_producto) LIKE ? AND p.estado = 1`,
        [searchTerm]
      );
      res.json(rows.map(row => ({
        id: row.id,
        nombre_producto: row.nombre_producto,
        descripcion_producto: row.descripcion_producto,
        imagen_producto1: row.imagen_producto1,
        nombre_categoria: row.nombre_categoria
      })));
    } catch (error) {
      console.error('Error searching products:', error);
      res.status(500).json({ error: "Error searching products" });
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  });
  
  app.get("/itemproducts/:productId", async (req, res) => {
    let connection;
    try {
      const productId = req.params.productId;
      connection = await mysql.createConnection(dbConfig);
      const [rows] = await connection.execute(
        `SELECT id, cantidad_disp, precio, estado FROM ITEM_PRODUCTO WHERE id_producto = ?`,
        [productId]
      );
      res.json(rows.map(row => ({
        id: row.id,
        cantidad_disp: row.cantidad_disp,
        precio: row.precio,
        estado: row.estado
      })));
    } catch (error) {
      console.error('Error fetching item products:', error);
      res.status(500).json({ error: "Error al obtener los ITEM_PRODUCTO" });
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  });
  
  app.get("/itemproducttitles/:productId", async (req, res) => {
    let connection;
    try {
      const productId = req.params.productId;
      connection = await mysql.createConnection(dbConfig);
      const [rows] = await connection.execute(
        `SELECT op.valor
         FROM CONFIGURACION_PRODUCTO cp
         INNER JOIN OPCION_VARIACION op ON cp.id_opcion_variacion = op.id
         WHERE cp.id_item_producto IN (
           SELECT id
           FROM ITEM_PRODUCTO
           WHERE id_producto = ?
         )`,
        [productId]
      );
      const titles = rows.map(row => row.valor);
      res.json({ titles });
    } catch (error) {
      console.error('Error fetching item product titles:', error);
      res.status(500).json({ error: "Error al obtener los títulos de los ITEM_PRODUCTO" });
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  });
  
  app.post('/updateitemproduct', async (req, res) => {
    let connection;
    try {
      console.log("Request received:", req.body);
      const { id, cantidad_disp, precio, estado } = req.body;
      connection = await mysql.createConnection(dbConfig);
      const query = `
        UPDATE ITEM_PRODUCTO
        SET cantidad_disp = ?, precio = ?, estado = ?
        WHERE id = ?
      `;
      await connection.execute(query, [cantidad_disp, precio, estado, id]);
      console.log("Item updated successfully");
      res.json({ success: true, message: '¡Item actualizado exitosamente!' });
    } catch (error) {
      console.error('Error al actualizar el item:', error);
      res.status(500).json({ success: false, error: 'Error al actualizar el item' });
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  });
  
  app.get("/parentcategoriesNav", async (req, res) => {
    let connection;
    try {
      connection = await mysql.createConnection(dbConfig);
      const [rows] = await connection.execute(
        `SELECT id, nombre_categoria FROM CATEGORIA_PRODUCTO WHERE id_categoria_padre IS NULL`
      );
      res.json(rows.map(row => ({
        id: row.id,
        nombre_categoria: row.nombre_categoria
      })));
    } catch (error) {
      console.error('Error fetching parent categories:', error);
      res.status(500).json([]);
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  });
  
  app.get("/SubCategories/:categoryId", async (req, res) => {
    let connection;
    try {
      const { categoryId } = req.params;
      connection = await mysql.createConnection(dbConfig);
      const [rows] = await connection.execute(
        `SELECT id, nombre_categoria FROM CATEGORIA_PRODUCTO WHERE id_categoria_padre = ?`,
        [categoryId]
      );
      res.json(rows.map(row => ({
        id: row.id,
        nombre_categoria: row.nombre_categoria
      })));
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      res.status(500).json([]);
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  });
  
  app.get('/productos-recientes', async (req, res) => {
    let connection;
    try {
      connection = await mysql.createConnection(dbConfig);
      const [productosResult] = await connection.execute(
        `SELECT p.id, 
                p.nombre_producto, 
                p.descripcion_producto, 
                p.imagen_producto1, 
                c.nombre_categoria
          FROM PRODUCTO p
          INNER JOIN CATEGORIA_PRODUCTO c ON p.id_categoria = c.id
          WHERE p.estado = 1
          ORDER BY p.id DESC
          LIMIT 8`
      );
      const idsProductos = productosResult.map(row => row.id);
      if (idsProductos.length > 0) {
        const placeholders = idsProductos.map(() => '?').join(',');
        const [preciosResult] = await connection.execute(
          `SELECT id_producto, precio
           FROM ITEM_PRODUCTO
           WHERE id_producto IN (${placeholders})`,
          [...idsProductos]
        );
        const preciosPorId = {};
        for (const row of preciosResult) {
          preciosPorId[row.id_producto] = row.precio;
        }
        const productosConPrecios = productosResult.map(row => ({
          id: row.id,
          nombre_producto: row.nombre_producto,
          descripcion_producto: row.descripcion_producto,
          imagen_producto1: row.imagen_producto1,
          nombre_categoria: row.nombre_categoria,
          precio: preciosPorId[row.id] || null
        }));
        res.json(productosConPrecios);
      } else {
        res.json([]);
      }
    } catch (error) {
      console.error('Error al obtener productos recientes:', error);
      res.status(500).json({ error: 'Error al obtener productos recientes' });
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  });
  
  
  app.get("/firstOption/:idProducto", async (req, res) => {
    let connection;
  
    try {
      connection = await mysql.createConnection(dbConfig);
  
      const [rows] = await connection.execute(
        `SELECT ov.id, ov.valor, v.nombre AS variationType
         FROM CONFIGURACION_PRODUCTO cp
         INNER JOIN OPCION_VARIACION ov ON cp.id_opcion_variacion = ov.id
         INNER JOIN VARIACION v ON ov.id_variacion = v.id
         WHERE cp.id_item_producto IN (
           SELECT id
           FROM ITEM_PRODUCTO
           WHERE id_producto = ?
         )
         ORDER BY ov.id_variacion`,
        [req.params.idProducto]
      );
  
      const options = rows.map(row => ({
        id: row.id,
        value: row.valor,
        variationType: row.variationType
      }));
      
      // Agrupar opciones por tipo de variación
      const groupedOptions = options.reduce((acc, option) => {
        if (!acc[option.variationType]) {
          acc[option.variationType] = [];
        }
        
        // Verificar si la opción ya existe en el grupo
        const exists = acc[option.variationType].some(opt => opt.value === option.value);
        if (!exists) {
          acc[option.variationType].push(option);
        }
        
        return acc;
      }, {});
  
      // Extraer las claves (nombres de los tipos de variación)
      const variationTypes = Object.keys(groupedOptions);
      console.log("Tipos de Variacion:", variationTypes);
      // Crear objetos para almacenar las opciones de variación agrupadas por tipo
      let variationOptions1 = [];
      let variationOptions2 = [];
  
      // Iterar sobre cada tipo de variación
      variationTypes.forEach((variationType, index) => {
        // Obtener las opciones de variación correspondientes a este tipo
        const options = groupedOptions[variationType];
  
        // Asignar las opciones al primer grupo
        if (index === 0) {
          variationOptions1 = options;
        }
      });
  
      // Enviar las opciones agrupadas por tipo como parte de la respuesta JSON
      res.json({ variationOptions1, variationTypes });
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error fetching options" });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch (error) {
          console.error(error);
        }
      }
    }
  });
  
  app.get("/secondOption/:idOpcionVariacion/:productId", async (req, res) => {
    let connection;
  
    try {
      connection = await mysql.createConnection(dbConfig);
  
      const productId = parseInt(req.params.productId);
      const idOpcionVariacion = parseInt(req.params.idOpcionVariacion);
  
      // Obtener las opciones de variación correspondientes al producto seleccionado
      const [firstOptionRows] = await connection.execute(
        `SELECT cp.id_opcion_variacion
         FROM CONFIGURACION_PRODUCTO cp
         INNER JOIN ITEM_PRODUCTO ip ON cp.id_item_producto = ip.id
         WHERE ip.id_producto = ?`,
        [productId]
      );
  
      // Obtener los IDs de las opciones de variación
      const usedVariationIds = firstOptionRows.map(row => row.id_opcion_variacion);
  
      // Filtrar las opciones de variación para excluir la opción seleccionada en el primer option list
      const filteredVariationIds = usedVariationIds.filter(id => id !== idOpcionVariacion);
  
      // Si no hay IDs filtrados, devolver una respuesta vacía
      if (filteredVariationIds.length === 0) {
        return res.json({ variationOptions2: [] });
      }
  
      // Obtener las opciones de variación correspondientes a los IDs filtrados
      const [rows] = await connection.execute(
        `SELECT ov.id, ov.valor, v.nombre AS variationType
         FROM OPCION_VARIACION ov
         INNER JOIN VARIACION v ON ov.id_variacion = v.id
         WHERE ov.id IN (${filteredVariationIds.join(',')})`
      );
  
      const options = rows.map(row => ({
        id: row.id,
        value: row.valor,
        variationType: row.variationType
      }));
  
      // Agrupar opciones por tipo de variación
      const groupedOptions = options.reduce((acc, option) => {
        if (!acc[option.variationType]) {
          acc[option.variationType] = [];
        }
  
        // Verificar si la opción ya existe en el grupo
        const exists = acc[option.variationType].some(opt => opt.value === option.value);
        if (!exists) {
          acc[option.variationType].push(option);
        }
  
        return acc;
      }, {});
  
      // Extraer las claves (nombres de los tipos de variación)
      const variationTypes = Object.keys(groupedOptions);
  
      // Crear objetos para almacenar las opciones de variación agrupadas por tipo
      let variationOptions2 = [];
  
      // Iterar sobre cada tipo de variación
      variationTypes.forEach(variationType => {
        // Obtener las opciones de variación correspondientes a este tipo
        const options = groupedOptions[variationType];
  
        // Asignar las opciones al segundo grupo
        variationOptions2 = options;
      });
  
      // Enviar las opciones agrupadas por tipo como parte de la respuesta JSON
      res.json({ variationOptions2 });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error fetching options" });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch (error) {
          console.error(error);
        }
      }
    }
  });
  
  app.get("/checkAvailability/:idProducto/:idOpcionVariacion2/:idOpcionVariacion1", async (req, res) => {
    let connection;
  
    try {
      connection = await mysql.createConnection(dbConfig);
  
      const idProducto = req.params.idProducto;
      const idOpcionVariacion1 = req.params.idOpcionVariacion1;
      const idOpcionVariacion2 = req.params.idOpcionVariacion2;
  
      const [rows] = await connection.execute(
        `SELECT COUNT(*) AS count
         FROM CONFIGURACION_PRODUCTO cp1
         INNER JOIN CONFIGURACION_PRODUCTO cp2 ON cp1.id_item_producto = cp2.id_item_producto
         INNER JOIN ITEM_PRODUCTO ip ON cp1.id_item_producto = ip.id
         WHERE cp1.id_opcion_variacion = ?
         AND cp2.id_opcion_variacion = ?
         AND ip.id_producto = ?`,
        [idOpcionVariacion1, idOpcionVariacion2, idProducto]
      );
  
      const count = rows[0].count;
  
      if (count > 0) {
        // Si existe un registro que cumple con las condiciones, la combinación está disponible
        res.json({ available: true });
      } else {
        // Si no existe ningún registro que cumpla las condiciones, la combinación está agotada
        res.json({ available: false });
      }
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error checking availability" });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch (error) {
          console.error(error);
        }
      }
    }
  });
  
  app.get('/cart/:userId', async (req, res) => {
    let connection;
  
    try {
      const userId = req.params.userId;
      connection = await mysql.createConnection(dbConfig);
      
      // Verificar si el usuario existe antes de ejecutar la consulta
      const [userCheck] = await connection.execute(
        `SELECT 1 FROM USUARIO WHERE id = ?`,
        [userId]
      );
  
      // Si el usuario no existe, devolver un mensaje apropiado
      if (userCheck.length === 0) {
        await connection.end();
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
  
      // Si el usuario existe, ejecutar la consulta para buscar el carrito
      const [result] = await connection.execute(
        `SELECT id FROM CARRITO WHERE id_usuario = ?`,
        [userId]
      );
  
      console.log("Usuario que ya tiene carrito: ", userId);
      console.log("Carrito del Usuario que ya tiene carrito: ", result[0]);
  
      await connection.end();
      
      if (result.length > 0) {
        res.json({ cartExists: true, cartId: result[0].id });
      } else {
        res.json({ cartExists: false });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch (error) {
          console.error(error);
        }
      }
    }
  });
  
  


  
  //finaliza parte de steven


// Endpoint para crear un nuevo carrito para el usuario actual
app.post('/cart', async (req, res) => {
  try {
    const { userId } = req.body;
    const connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      'INSERT INTO CARRITO (id_usuario) VALUES (?)',
      [userId]
    );

    // Getting the inserted cart ID
    const cartId = result.insertId;

    await connection.end();
    res.json({ cartId });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint para obtener el id_item_producto según las opciones seleccionadas
app.get('/configurationProduct/:option1/:option2/:productId', async (req, res) => {
  let connection = null;

  try {
    const option1 = parseInt(req.params.option1);
    const option2 = parseInt(req.params.option2);
    const productId = parseInt(req.params.productId);

    connection = await mysql.createConnection(dbConfig);

    let [result] = [];

    if (option2 === 0) {
      [result] = await connection.execute(
        `SELECT ip.id
         FROM ITEM_PRODUCTO ip
         INNER JOIN CONFIGURACION_PRODUCTO cp ON ip.id = cp.id_item_producto
         WHERE cp.id_opcion_variacion = ?
         AND ip.id_producto = ?
         AND NOT EXISTS (
           SELECT 1
           FROM CONFIGURACION_PRODUCTO
           WHERE id_item_producto = ip.id
           GROUP BY id_item_producto
           HAVING COUNT(*) > 1
         )`,
        [option1, productId]
      );
    } else {
      [result] = await connection.execute(
        `SELECT id_item_producto 
         FROM CONFIGURACION_PRODUCTO cp
         INNER JOIN ITEM_PRODUCTO ip ON cp.id_item_producto = ip.id
         WHERE cp.id_opcion_variacion IN (?, ?)
         AND ip.id_producto = ?
         GROUP BY id_item_producto HAVING COUNT(*) = 2`,
        [option1, option2, productId]
      );
    }

    if (result.length > 0) {
      const itemId = result[0].id_item_producto || result[0].id;

      const [priceResult] = await connection.execute(
        `SELECT precio FROM ITEM_PRODUCTO WHERE id = ?`,
        [itemId]
      );

      const price = priceResult[0].precio;

      res.json({ success: true, itemId, price });
    } else {
      res.json({ success: false, message: 'No se encontró el producto con las opciones seleccionadas.' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (error) {
        console.error(error);
      }
    }
  }
});




// Endpoint para agregar un nuevo registro o actualizar la cantidad en CARRITO_ITEM
app.post('/cartItem/:cartId/:itemId', async (req, res) => {
  try {
    const cartId = parseInt(req.params.cartId);
    const itemId = parseInt(req.params.itemId);
    const { quantity } = req.body;
    
    console.log("Cart ID:", cartId);
    console.log("Item ID:", itemId);
    console.log("Quantity:", quantity);

    const connection = await mysql.createConnection(dbConfig);

    // Comprobación si el registro ya existe en la tabla CARRITO_ITEM
    const [checkResult] = await connection.execute(
      `SELECT id FROM CARRITO_ITEM WHERE id_carrito = ? AND id_item_producto = ?`,
      [cartId, itemId]
    );

    if (checkResult.length > 0) {
      // Si el registro ya existe, actualizar la cantidad
      await connection.execute(
        `UPDATE CARRITO_ITEM SET cantidad = cantidad + ? 
        WHERE id_carrito = ? AND id_item_producto = ?`,
        [quantity, cartId, itemId]
      );
    } else {
      // Si el registro no existe, insertar uno nuevo
      await connection.execute(
        `INSERT INTO CARRITO_ITEM (id_carrito, id_item_producto, cantidad) 
        VALUES (?, ?, ?)`,
        [cartId, itemId, quantity]
      );
    }

    // Commit para realizar cambios permanentes
    await connection.commit();

    await connection.end();
    res.json({ success: true, message: 'Producto agregado al carrito con éxito.' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post("/addpromotions", async (req, res) => {
  const newPromotionData = {
    nombre: req.body.nombre,
    descripcion: req.body.descripcion,
    descuento_porcentaje: req.body.descuento_porcentaje,
    fecha_inicio: req.body.fecha_inicio,
    fecha_final: req.body.fecha_final
  };

  const categorias = req.body.categorias; // Obtener las categorías seleccionadas

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    for (const id_categoria of categorias) {
      // Insertar la promoción
      const queryPromotion = `
        INSERT INTO PROMOCION (nombre, descripcion, descuento_porcentaje, fecha_inicio, fecha_final) 
        VALUES (?, ?, ?, ?, ?)`;
      const [resultPromotion] = await connection.execute(queryPromotion, [
        newPromotionData.nombre,
        newPromotionData.descripcion,
        newPromotionData.descuento_porcentaje,
        newPromotionData.fecha_inicio,
        newPromotionData.fecha_final
      ]);
      const newPromotionId = resultPromotion.insertId; // Obtener el ID generado de la promoción

      // Insertar la relación entre la promoción y la categoría
      const queryPromotionCategory = `
        INSERT INTO PROMOCION_CATEGORIA (id_categoria, id_promocion) 
        VALUES (?, ?)`;
      await connection.execute(queryPromotionCategory, [id_categoria, newPromotionId]);
    }

    console.log("Promociones agregadas correctamente");

    res.json({ success: true });
  } catch (error) {
    console.error("Error al agregar las promociones:", error);
    res.status(500).json({ success: false, error: "Error al agregar las promociones" });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error("Error al cerrar la conexión:", closeError);
      }
    }
  }
});


app.get("/allpromociones", async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      `SELECT p.id, p.nombre, p.descripcion, p.descuento_porcentaje, p.fecha_inicio, p.fecha_final, c.nombre_categoria as categoria_nombre
       FROM PROMOCION p
       INNER JOIN PROMOCION_CATEGORIA pc ON p.id = pc.id_promocion
       INNER JOIN CATEGORIA_PRODUCTO c ON pc.id_categoria = c.id`
    );
    await connection.end();
    res.json(rows.map(row => ({
      id: row.id,
      nombre: row.nombre,
      descripcion: row.descripcion,
      descuento_porcentaje: row.descuento_porcentaje,
      fecha_inicio: row.fecha_inicio,
      fecha_final: row.fecha_final,
      categoria_nombre: row.categoria_nombre
    })));
  } catch (error) {
    console.error('Error fetching promociones:', error);
    res.status(500).json([]);
  }
});

app.post("/updatepromocion", async (req, res) => {
  let connection;
  try {
    const { id, nombre, descripcion, descuento_porcentaje, fecha_inicio, fecha_final } = req.body;
    
    connection = await mysql.createConnection(dbConfig);
    
    const query = `
      UPDATE PROMOCION SET
      nombre = ?,
      descripcion = ?,
      descuento_porcentaje = ?,
      fecha_inicio = ?,
      fecha_final = ?
      WHERE id = ?
    `;
    
    await connection.execute(query, [nombre, descripcion, descuento_porcentaje, fecha_inicio, fecha_final, id]);
    
    res.json({ success: true, message: '¡Promoción actualizada exitosamente!' });
  } catch (error) {
    console.error('Error updating promocion:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar la promoción' });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error('Error al cerrar la conexión:', closeError);
      }
    }
  }
});

app.delete('/removepromocion', async (req, res) => {
  let connection;
  try {
    const promocionId = req.body.id;
    connection = await mysql.createConnection(dbConfig);
    
    // Eliminar referencias en la tabla PROMOCION_CATEGORIA primero
    const deleteRefsQuery = `DELETE FROM PROMOCION_CATEGORIA WHERE id_promocion = ?`;
    await connection.execute(deleteRefsQuery, [promocionId]);

    // Luego eliminar la promoción en la tabla PROMOCION
    const deletePromocionQuery = `DELETE FROM PROMOCION WHERE id = ?`;
    await connection.execute(deletePromocionQuery, [promocionId]);
    
    res.json({ success: true, message: '¡Promoción eliminada exitosamente!' });
  } catch (error) {
    console.error('Error removing promocion:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar la promoción' });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error('Error al cerrar la conexión:', closeError);
      }
    }
  }
});


app.get("/searchpromocion", async (req, res) => {
  let connection;
  try {
    const searchTerm = req.query.search ? `%${req.query.search.toLowerCase()}%` : "%";
    connection = await mysql.createConnection(dbConfig);
    const query = `
      SELECT p.id, p.nombre, p.descripcion, p.descuento_porcentaje, p.fecha_inicio, p.fecha_final, c.nombre_categoria as categoria_nombre
      FROM PROMOCION p
      INNER JOIN PROMOCION_CATEGORIA pc ON p.id = pc.id_promocion
      INNER JOIN CATEGORIA_PRODUCTO c ON pc.id_categoria = c.id
      WHERE LOWER(p.nombre) LIKE ?`;
    const [rows] = await connection.execute(query, [searchTerm]);
    await connection.end();
    res.json(rows.map(row => ({
      id: row.id,
      nombre: row.nombre,
      descripcion: row.descripcion,
      descuento_porcentaje: row.descuento_porcentaje,
      fecha_inicio: row.fecha_inicio,
      fecha_final: row.fecha_final,
      categoria_nombre: row.categoria_nombre
    })));
  } catch (error) {
    console.error('Error searching promociones:', error);
    res.status(500).json([]);
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
});

app.get("/cartItemCount/:userId", async (req, res) => {
  try {
    // Obtener el userId de los parámetros de la solicitud
    const userId = req.params.userId;
    
    // Establecer una conexión con la base de datos MySQL
    const connection = await mysql.createConnection(dbConfig);

    // Ejecutar la consulta SQL
    const [rows, fields] = await connection.execute(
      `SELECT COUNT(ci.id) AS count
      FROM CARRITO_ITEM ci
      INNER JOIN CARRITO c ON ci.id_carrito = c.id
      INNER JOIN ITEM_PRODUCTO ip ON ci.id_item_producto = ip.id
      WHERE c.id_usuario = ?
      AND ip.estado = 1`,
      [userId]
    );

    // Cerrar la conexión con MySQL
    await connection.end();

    // Obtener el conteo de ítems en el carrito del resultado de la consulta
    const cartItemCount = rows[0].count;
    
    // Enviar la respuesta con el conteo de ítems del carrito
    res.json({ count: cartItemCount });
  } catch (error) {
    // Manejar errores y enviar una respuesta de error
    console.error('Error al obtener el conteo de ítems del carrito:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get("/cartItems/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    // Establecer una conexión con la base de datos MySQL
    const connection = await mysql.createConnection(dbConfig);

    // Ejecutar la consulta SQL para obtener los ítems del carrito
    const [rows] = await connection.execute(
      `SELECT ci.id, p.imagen_producto1, 
       CONCAT(p.nombre_producto, ' ', 
       COALESCE(GROUP_CONCAT(opv.valor ORDER BY opv.valor SEPARATOR ', '), '')) AS nombre_producto, 
       ip.precio, ci.cantidad, ip.id_producto
       FROM CARRITO_ITEM ci
       INNER JOIN ITEM_PRODUCTO ip ON ci.id_item_producto = ip.id
       INNER JOIN PRODUCTO p ON ip.id_producto = p.id
       LEFT JOIN CONFIGURACION_PRODUCTO cp ON ci.id_item_producto = cp.id_item_producto
       LEFT JOIN OPCION_VARIACION opv ON cp.id_opcion_variacion = opv.id
       WHERE ci.id_carrito = (SELECT id FROM CARRITO WHERE id_usuario = ?) AND ip.estado = 1
       GROUP BY ci.id, p.imagen_producto1, p.nombre_producto, ip.precio, ci.cantidad, ip.id_producto`,
      [userId]
    );

    // Crear una lista para almacenar los ítems del carrito
    const items = [];
    for (const row of rows) {
      const productId = row.id_producto; // Obtener el id_producto
      const discount = await getDiscount(connection, productId); // Obtener el descuento del producto
      items.push({
        id: row.id,
        imagen_producto1: row.imagen_producto1,
        nombre_producto: row.nombre_producto,
        precio: row.precio,
        cantidad: row.cantidad,
        descuento: discount
      });
    }

    // Cerrar la conexión con MySQL
    await connection.end();
    // Enviar la respuesta con los ítems del carrito
    res.json(items);
  } catch (error) {
    // Manejar errores y enviar una respuesta de error
    console.error('Error al obtener los ítems del carrito:', error);
    res.status(500).json([]);
  }
});

// Función para obtener el descuento de un producto
async function getDiscount(connection, productId) {
  try {
    const currentDate = new Date().toISOString().slice(0, 10); // Obtener la fecha actual en formato YYYY-MM-DD

    // Ejecutar la consulta SQL para obtener el descuento del producto
    const [result] = await connection.execute(
      `SELECT pc.id_promocion, p.descuento_porcentaje
       FROM PROMOCION_CATEGORIA pc
       INNER JOIN PROMOCION p ON pc.id_promocion = p.id
       INNER JOIN PRODUCTO pr ON pc.id_categoria = pr.id_categoria
       WHERE pr.id = ?
       AND p.fecha_inicio <= ?
       AND p.fecha_final >= ?`,
      [productId, currentDate, currentDate]
    );

    if (result.length > 0) {
      return result[0].descuento_porcentaje; // Retorna el descuento si hay promoción
    } else {
      return 0; // Si no hay promoción, el descuento es 0
    }
  } catch (error) {
    // Manejar errores y retornar 0 como descuento en caso de error
    console.error('Error al obtener el descuento del producto:', error);
    return 0;
  }
}



app.put("/cartItems/updateQuantity/:itemId", async (req, res) => {
  const itemId = req.params.itemId;
  const operation = req.body.operation; // La operación puede ser "increment" o "decrement"

  try {
    // Establecer una conexión con la base de datos MySQL
    const connection = await mysql.createConnection(dbConfig);
    
    // Determinar la consulta SQL basada en la operación
    let query;
    if (operation === "increment") {
      query = `UPDATE CARRITO_ITEM SET cantidad = cantidad + 1 WHERE id = ?`;
    } else if (operation === "decrement") {
      query = `UPDATE CARRITO_ITEM SET cantidad = cantidad - 1 WHERE id = ? AND cantidad > 1`;
    }
    
    // Ejecutar la consulta para actualizar la cantidad
    await connection.execute(query, [itemId]);

    // Obtener el ítem actualizado
    const [updatedItemResult] = await connection.execute(
      `SELECT * FROM CARRITO_ITEM WHERE id = ?`,
      [itemId]
    );
    const updatedItem = updatedItemResult[0];

    // Cerrar la conexión con MySQL
    await connection.end();

    // Enviar la respuesta con el ítem actualizado
    res.json(updatedItem);
  } catch (error) {
    // Manejar errores y enviar una respuesta de error
    console.error('Error al actualizar la cantidad:', error);
    res.status(500).json({ error: 'Error al actualizar la cantidad' });
  }
});

app.get("/userAddresses/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    // Crear una conexión a MySQL
    const connection = await mysql.createConnection(dbConfig);

    // Ejecutar la consulta
    const [rows] = await connection.execute(
      `SELECT d.ciudad, d.direccion, d.id
       FROM DIRECCION d
       INNER JOIN DIRECCION_USUARIO du ON d.id = du.id_direccion
       WHERE du.id_usuario = ?`, // Utilizar ? como marcador de posición
      [userId] // Pasar el parámetro
    );

    // Formatear los resultados
    const addresses = rows.map((row) => ({
      ciudad: row.ciudad,
      direccion: row.direccion,
      id: row.id
    }));
    
    console.log("INFO DIRECCIONES: ", rows);

    // Cerrar la conexión
    await connection.end();

    // Enviar la respuesta
    res.json(addresses);
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    res.status(500).json([]);
  }
});

app.get("/shippingMethods", async (req, res) => {
  try {
    // Crear una conexión a MySQL
    const connection = await mysql.createConnection(dbConfig);

    // Ejecutar la consulta
    const [rows] = await connection.execute(
      `SELECT id, nombre, precio FROM METODO_ENVIO`
    );

    // Formatear los resultados
    const shippingMethods = rows.map((row) => ({
      id: row.id,
      nombre: row.nombre,
      precio: row.precio
    }));

    // Cerrar la conexión
    await connection.end();

    // Enviar la respuesta
    res.json(shippingMethods);
  } catch (error) {
    console.error('Error fetching shipping methods:', error);
    res.status(500).json([]);
  }
});

app.delete('/removeCartItem', async (req, res) => {
  let connection;
  try {
    const userId = req.body.userId;
    const itemId = parseInt(req.body.itemId);

    // Obtener el id del carrito del usuario
    connection = await mysql.createConnection(dbConfig);
    const getCartIdQuery = `SELECT id FROM CARRITO WHERE id_usuario = ?`;
    const [cartIdResult] = await connection.execute(getCartIdQuery, [userId]);

    if (cartIdResult.length === 0) {
      return res.status(404).json({ success: false, error: 'El usuario no tiene un carrito' });
    }

    const cartId = parseInt(cartIdResult[0].id);

    console.log(cartId, itemId);
    
    // Eliminar el artículo del carrito
    const deleteCartItemQuery = `DELETE FROM CARRITO_ITEM WHERE id = ?`;
    const [deleteResult] = await connection.execute(deleteCartItemQuery, [itemId]);

    if (deleteResult.affectedRows && deleteResult.affectedRows === 1) {
      return res.json({ success: true, message: '¡Artículo eliminado del carrito exitosamente!' });
    } else {
      return res.status(500).json({ success: false, error: 'Error al eliminar el artículo del carrito' });
    }
  } catch (error) {
    console.error('Error removing cart item:', error);
    return res.status(500).json({ success: false, error: 'Error al eliminar el artículo del carrito' });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error('Error al cerrar la conexión:', closeError);
      }
    }
  }
});

app.post('/addAddress', async (req, res) => {
  const { userId, direccion, estado, ciudad, codigo_postal, id_pais } = req.body;
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    // Iniciar transacción
    await connection.beginTransaction();

    // Insertar nueva dirección
    const insertAddressQuery = `
      INSERT INTO DIRECCION (direccion, estado, ciudad, codigo_postal, id_pais)
      VALUES (?, ?, ?, ?, ?)`;
    
    const [result] = await connection.execute(insertAddressQuery, [
      direccion,
      estado,
      ciudad,
      codigo_postal,
      id_pais
    ]);

    // Obtener el ID de la dirección insertada
    const direccionId = result.insertId;

    // Insertar relación entre usuario y dirección
    const insertUserAddressQuery = `
      INSERT INTO DIRECCION_USUARIO (id_usuario, id_direccion)
      VALUES (?, ?)`;

    await connection.execute(insertUserAddressQuery, [userId, direccionId]);

    // Confirmar la transacción
    await connection.commit();

    res.json({ success: true, message: '¡Dirección agregada exitosamente!' });
  } catch (error) {
    console.error('Error adding address:', error);

    // Revertir la transacción en caso de error
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Error al revertir la transacción:', rollbackError);
      }
    }

    res.status(500).json({ success: false, error: 'Error al agregar la dirección' });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error('Error al cerrar la conexión:', closeError);
      }
    }
  }
});

app.get("/promo-category", async (req, res) => {
  let connection;
  try {
    const currentDate = new Date().toISOString().slice(0, 10); // Obtener la fecha actual en formato 'YYYY-MM-DD'
    
    const query = `
      SELECT pc.id_categoria, cp.id_categoria_padre, cp.nombre_categoria, p.nombre, p.descripcion 
      FROM PROMOCION_CATEGORIA pc
      INNER JOIN PROMOCION p ON pc.id_promocion = p.id
      INNER JOIN CATEGORIA_PRODUCTO cp ON pc.id_categoria = cp.id
      WHERE ? BETWEEN p.fecha_inicio AND p.fecha_final
      ORDER BY RAND()
      LIMIT 1
    `;

    const binds = [currentDate];

    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(query, binds);

    await connection.end();

    // Verificar si se encontró una promoción activa
    if (rows.length > 0) {
      const promoCategory = rows[0];
      res.json({
        idCategoria: promoCategory.id_categoria,
        idPadre: promoCategory.id_categoria_padre,
        nombreCategoria: promoCategory.nombre_categoria,
        nombrePromocion: promoCategory.nombre,
        descripcionPromocion: promoCategory.descripcion
      });
    } else {
      res.status(404).json({ error: 'No active promotions found' });
    }
  } catch (error) {
    console.error('Error fetching promo category:', error);
    res.status(500).json({ error: 'Error fetching promo category' });
  }
});

app.post("/checkout", async (req, res) => {
  let connection;
  try {
    const { userId, shippingMethod, cartItems } = req.body;

    // Verificar que se haya seleccionado un método de envío
    if (!shippingMethod) {
      return res.status(400).json({ error: "Debes seleccionar un método de envío." });
    }

    // Establecer conexión con MySQL
    connection = await mysql.createConnection(dbConfig);

    for (const cartItem of cartItems) {
      const { id_item_producto, cantidad } = cartItem;

      // Obtener la información del producto del carrito
      const cartItemQuery = `
        SELECT ip.id_producto, ip.cantidad_disp, p.nombre_producto
        FROM CARRITO_ITEM ci
        INNER JOIN ITEM_PRODUCTO ip ON ci.id_item_producto = ip.id
        INNER JOIN PRODUCTO p ON ip.id_producto = p.id
        WHERE ci.id = ?`;

      const [cartItemResult] = await connection.execute(cartItemQuery, [id_item_producto]);
      
      if (cartItemResult.length === 0) {
        return res.status(404).json({ error: "Producto no encontrado en el carrito." });
      }

      const cartItemInfo = cartItemResult[0];

      const cantidad_disp = parseInt(cartItemInfo.cantidad_disp);
      const nombre_producto = cartItemInfo.nombre_producto;
      
      console.log("Nombre Item: ", nombre_producto);
      console.log("Cantidad Item: ", cantidad_disp);
      console.log("Cantidad carrito: ", cantidad);

      // Verificar la disponibilidad del producto
      if (cantidad_disp < cantidad) {
        console.log("ERROR: NO HAY EXISTENCIAS SUFICIENTES DE ", nombre_producto);
        console.log("Solo hay ", cantidad_disp, " existencias");
        return res.status(400).json({ error: `No hay suficientes existencias de ${nombre_producto}. Solo hay ${cantidad_disp} disponibles.` });
      }
    }

    // Aquí podrías agregar la lógica para procesar el pago y actualizar el estado del carrito, etc.

    res.json({ success: true, message: "Compra realizada exitosamente." });

  } catch (error) {
    console.error('Error en el proceso de checkout:', error);
    res.status(500).json({ error: "Ocurrió un error al procesar el checkout." });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (err) {
        console.error('Error cerrando la conexión:', err);
      }
    }
  }
});

app.get("/paymentMethods/:userId", async (req, res) => {
  let connection;
  try {
    const userId = req.params.userId;

    // Establecer conexión con MySQL
    connection = await mysql.createConnection(dbConfig);

    const query = `
      SELECT numero_tarjeta, nombre_portador, id
      FROM METODO_PAGO_USUARIO
      WHERE id_usuario = ?`;

    // Ejecutar la consulta con el userId
    const [rows] = await connection.execute(query, [userId]);

    // Transformar el resultado en un arreglo de objetos
    const paymentMethods = rows.map(row => ({ 
      numero_tarjeta: row.numero_tarjeta, 
      nombre_portador: row.nombre_portador,
      id: row.id
    }));

    // Enviar los métodos de pago como respuesta
    res.json(paymentMethods);
    console.log(paymentMethods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ error: "Error al obtener métodos de pago del usuario." });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (err) {
        console.error('Error cerrando la conexión:', err);
      }
    }
  }
});

app.post("/checkCreditCard", async (req, res) => {
  let connection;
  try {
    const { numero_tarjeta, cvv, fecha_expiracion } = req.body;
    console.log("Datos Ingresados: ", req.body);

    // Establecer conexión con MySQL
    connection = await mysql.createConnection(dbConfig);

    const query = `
      SELECT COUNT(*) AS count
      FROM TARJETA
      WHERE numero_tarjeta = ?
      AND cvv = ?
      AND fecha_vencimiento = ?`;

    // Ejecutar la consulta con los parámetros correspondientes
    const [rows] = await connection.execute(query, [numero_tarjeta, cvv, fecha_expiracion]);
    
    console.log("Datos TARJETA: ", rows[0]);
    
    // Verificar si la tarjeta existe
    const exists = rows[0].count !== 0;
    
    // Enviar respuesta indicando si la tarjeta existe
    res.json({ exists });
  } catch (error) {
    console.error('Error verificando la tarjeta:', error);
    res.status(500).json({ error: "Error al verificar la tarjeta." });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (err) {
        console.error('Error cerrando la conexión:', err);
      }
    }
  }
});

app.post("/savePaymentMethod", async (req, res) => {
  const { userId, numero_tarjeta, cvv, nombre_portador, fecha_expiracion } = req.body;
  console.log(req.body);

  let connection;
  try {
    // Establecer conexión con MySQL
    connection = await mysql.createConnection(dbConfig);

    // Insertar el método de pago del usuario
    const insertPaymentMethodQuery = `
      INSERT INTO METODO_PAGO_USUARIO (id_usuario, numero_tarjeta, cvv, nombre_portador, fecha_expiracion)
      VALUES (?, ?, ?, ?, ?)`;

    // Ejecutar la consulta con los parámetros correspondientes
    await connection.execute(insertPaymentMethodQuery, [
      userId,
      numero_tarjeta,
      cvv,
      nombre_portador,
      fecha_expiracion
    ]);

    // Confirmar la transacción
    await connection.commit();

    // Enviar respuesta de éxito
    res.json({ success: true, message: '¡Método de pago agregado exitosamente!' });
  } catch (error) {
    console.error('Error al guardar el método de pago del usuario:', error);
    res.status(500).json({ success: false, error: 'Error al guardar el método de pago del usuario.' });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (err) {
        console.error('Error cerrando la conexión:', err);
      }
    }
  }
});

app.post("/checkoutSaldo", async (req, res) => {
  let connection;
  try {
    const { userId, paymentMethodId } = req.body;
    connection = await mysql.createConnection(dbConfig);

    // Obtener detalles del método de pago seleccionado
    const paymentMethodQuery = `
      SELECT numero_tarjeta, cvv, fecha_expiracion
      FROM METODO_PAGO_USUARIO
      WHERE id = ?`;
    const [paymentMethodResult] = await connection.execute(paymentMethodQuery, [paymentMethodId]);
    const [paymentMethodInfo] = paymentMethodResult;

    // Obtener ID del banco asociado a la tarjeta
    const cardQuery = `
      SELECT id_banco
      FROM TARJETA
      WHERE numero_tarjeta = ?
      AND cvv = ?
      AND fecha_vencimiento = ?`;
    const [cardResult] = await connection.execute(cardQuery, [paymentMethodInfo.numero_tarjeta, paymentMethodInfo.cvv, paymentMethodInfo.fecha_expiracion]);
    const [cardInfo] = cardResult;

    // Obtener saldo asociado al banco
    const bankQuery = `
      SELECT saldo
      FROM BANCO
      WHERE id = ?`;
    const [bankResult] = await connection.execute(bankQuery, [cardInfo.id_banco]);
    const [bankInfo] = bankResult;

    // Responder con el saldo obtenido
    res.json({ success: true, saldo: bankInfo.saldo });
  } catch (error) {
    console.error('Error en el proceso de checkout:', error);
    res.status(500).json({ error: "Ocurrió un error al procesar el checkout." });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (err) {
        console.error('Error cerrando la conexión:', err);
      }
    }
  }
});

app.post("/saveOrder", async (req, res) => {
  const { userId, direccionEnvio, metodoEnvio, metodoPago, totalCompra } = req.body;
  const totalCompra2 = parseFloat(totalCompra);
  const userId2 = parseInt(userId);
  const direccionEnvio2 = parseInt(direccionEnvio);
  const metodoEnvio2 = parseInt(metodoEnvio);
  const metodoPago2 = parseInt(metodoPago);

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // Iniciar transacción
    await connection.beginTransaction();

    // Insertar la orden en la base de datos
    const insertOrderQuery = `
      INSERT INTO ORDEN (id_usuario, fecha_hora, id_metodo_pago, direccion_envio, metodo_envio, total_orden, estado_orden)
      VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?, ?, 1)`;
    const [result] = await connection.execute(insertOrderQuery, [userId2, metodoPago2, direccionEnvio2, metodoEnvio2, totalCompra2]);
    const orderId = result.insertId;

    // Buscar los registros en CARRITO_ITEM
    const cartQuery = `
      SELECT ci.id_item_producto, ci.cantidad 
      FROM CARRITO_ITEM ci
      JOIN ITEM_PRODUCTO ip ON ci.id_item_producto = ip.id
      WHERE ci.id_carrito = (SELECT id FROM CARRITO WHERE id_usuario = ?) AND ip.estado = 1`;
    const [cartItems] = await connection.execute(cartQuery, [userId2]);

    // Insertar los registros en ORDEN_ITEM
    for (const item of cartItems) {
      const { id_item_producto, cantidad } = item;

      const priceQuery = `SELECT precio FROM ITEM_PRODUCTO WHERE id = ?`;
      const [priceResult] = await connection.execute(priceQuery, [id_item_producto]);
      const precio = priceResult[0].precio;

      const insertOrderItemQuery = `
        INSERT INTO ORDEN_ITEM (id_item_producto, id_orden, cantidad, precio)
        VALUES (?, ?, ?, ?)`;
      await connection.execute(insertOrderItemQuery, [id_item_producto, orderId, cantidad, precio]);

      // Actualizar cantidad_disp en ITEM_PRODUCTO y estado si es necesario
      const updateProductQuery = `
        UPDATE ITEM_PRODUCTO
        SET cantidad_disp = cantidad_disp - ?
        WHERE id = ?`;
      await connection.execute(updateProductQuery, [cantidad, id_item_producto]);

      const checkZeroQuantityQuery = `
        SELECT cantidad_disp
        FROM ITEM_PRODUCTO
        WHERE id = ?`;
      const [checkZeroResult] = await connection.execute(checkZeroQuantityQuery, [id_item_producto]);
      const newQuantity = checkZeroResult[0].cantidad_disp;

      if (newQuantity === 0) {
        const updateProductStatusQuery = `
          UPDATE ITEM_PRODUCTO
          SET estado = 2
          WHERE id = ?`;
        await connection.execute(updateProductStatusQuery, [id_item_producto]);

        const checkOtherActiveProductsQuery = `
          SELECT id
          FROM ITEM_PRODUCTO
          WHERE id_producto = (SELECT id_producto FROM ITEM_PRODUCTO WHERE id = ?) AND estado = 1`;
        const [checkOtherActiveResult] = await connection.execute(checkOtherActiveProductsQuery, [id_item_producto]);
        if (checkOtherActiveResult.length === 0) {
          const updateProductMasterQuery = `
            UPDATE PRODUCTO
            SET estado = 2
            WHERE id = (SELECT id_producto FROM ITEM_PRODUCTO WHERE id = ?)`;
          await connection.execute(updateProductMasterQuery, [id_item_producto]);
        }
      }
    }

    // Buscar el método de pago del usuario
    const metodoPagoUsuarioQuery = `
      SELECT numero_tarjeta, cvv, fecha_expiracion
      FROM METODO_PAGO_USUARIO
      WHERE id = ?`;
    const [metodoPagoUsuarioResult] = await connection.execute(metodoPagoUsuarioQuery, [metodoPago2]);
    const metodoPagoUsuario = metodoPagoUsuarioResult[0];

    // Buscar la tarjeta correspondiente
    const tarjetaQuery = `
      SELECT id, id_banco
      FROM TARJETA
      WHERE numero_tarjeta = ? AND cvv = ? AND fecha_vencimiento = ?`;
    const [tarjetaResult] = await connection.execute(tarjetaQuery, [metodoPagoUsuario.numero_tarjeta, metodoPagoUsuario.cvv, metodoPagoUsuario.fecha_expiracion]);
    const tarjetaId = tarjetaResult[0].id;
    const idBanco = tarjetaResult[0].id_banco;

    // Actualizar saldo en la tabla del banco
    const updateBancoQuery = `
      UPDATE BANCO
      SET saldo = saldo - ?
      WHERE id = ?`;
    await connection.execute(updateBancoQuery, [totalCompra2, idBanco]);

    // Eliminar todos los elementos de la tabla CARRITO_ITEM asociados al carrito
    const deleteCartItemsQuery = `
      DELETE FROM CARRITO_ITEM
      WHERE id_carrito = (SELECT id FROM CARRITO WHERE id_usuario = ?)`;
    await connection.execute(deleteCartItemsQuery, [userId2]);

    // Confirmar la transacción
    await connection.commit();

    // Responder con un mensaje de éxito
    res.json({ success: true, message: '¡Orden guardada exitosamente!' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error al guardar la orden:', error);
    res.status(500).json({ success: false, error: 'Error al guardar la orden.' });
  } finally {
    if (connection) await connection.close();
  }
});


app.get("/allordenes", async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      `SELECT o.id, o.id_usuario, CONCAT(u.nombre, ' ', u.apellido) AS nombre_usuario, d.direccion AS direccion_envio, me.nombre AS metodo_envio, o.total_orden, eo.estado, DATE_FORMAT(o.fecha_hora, '%Y-%m-%d %H:%i') AS fecha_hora
       FROM ORDEN o
       INNER JOIN USUARIO u ON o.id_usuario = u.id
       INNER JOIN DIRECCION d ON o.direccion_envio = d.id
       INNER JOIN METODO_ENVIO me ON o.metodo_envio = me.id
       INNER JOIN ESTADO_ORDEN eo ON o.estado_orden = eo.id
       ORDER BY o.fecha_hora DESC`
    );
    await connection.close();
    res.json(result.map(row => ({
      id: row.id,
      id_usuario: row.id_usuario,
      nombre_usuario: row.nombre_usuario,
      direccion_envio: row.direccion_envio,
      metodo_envio: row.metodo_envio,
      total_orden: row.total_orden,
      estado_orden: row.estado,
      fecha_hora: row.fecha_hora
    })));
  } catch (error) {
    console.error('Error fetching ordenes:', error);
    res.status(500).json([]);
  }
});



app.get("/estadoordenes", async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      `SELECT id, estado FROM ESTADO_ORDEN`
    );
    await connection.close();
    res.json(result.map(row => ({
      id: row.id,
      estado: row.estado
    })));
  } catch (error) {
    console.error('Error fetching estado ordenes:', error);
    res.status(500).json([]);
  }
});

app.put("/modifyorder/:id", async (req, res) => {
  const orderId = req.params.id;
  const { estado } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [estadoResult] = await connection.execute(
      `SELECT id FROM ESTADO_ORDEN WHERE estado = ?`,
      [estado]
    );

    if (estadoResult.length === 0) {
      return res.status(400).send("Estado de orden no válido.");
    }

    const estadoId = estadoResult[0].id;

    const [result] = await connection.execute(
      `UPDATE ORDEN SET estado_orden = ? WHERE id = ?`,
      [estadoId, orderId]
    );

    await connection.end();
    
    if (result.affectedRows === 0) {
      return res.status(404).send("Orden no encontrada.");
    }

    res.status(200).send("Orden modificada exitosamente.");
  } catch (error) {
    console.error('Error modificando orden:', error);
    res.status(500).send("Error al modificar la orden.");
  }
});

app.post('/loginAdmin', async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    // Verificar si el usuario existe y la contrasena es correcta
    const connection = await mysql.createConnection(dbConfig);
    const [resultUsuario] = await connection.execute(
      "SELECT id, id_tipo FROM USUARIO WHERE correo = ? AND contrasena = ?",
      [correo, contrasena]
    );
    await connection.end();

    if (resultUsuario.length === 0) {
      return res.status(401).json({ success: false, errors: "Correo o contrasena incorrectos." });
    }

    const userId = resultUsuario[0].id;
    const userType = resultUsuario[0].id_tipo;

    if (userType !== 1) {
      return res.status(403).json({ success: false, errors: "Usuario no autorizado para acceder a la página de administración." });
    }

    // Si las credenciales son correctas y el usuario es administrador, se permite el acceso a la página de administración
    res.status(200).json({ success: true, message: "Inicio de sesión exitoso.", userId });
  } catch (error) {
    console.error("Error en el inicio de sesión:", error);
    res.status(500).json({ success: false, errors: "Error en el servidor al iniciar sesión." });
  }
});

app.post('/obtenerPrecio', async (req, res) => {
  try {
    const { productId } = req.body;

    // Realizar consulta para obtener el precio del producto
    const connection = await mysql.createConnection(dbConfig);
    const [resultPrecio] = await connection.execute(
      "SELECT precio FROM ITEM_PRODUCTO WHERE id_producto = ?",
      [productId]
    );
    await connection.end();

    if (resultPrecio.length === 0) {
      return res.status(404).json({ success: false, errors: "No se encontró el precio para el producto especificado." });
    }

    const precio = resultPrecio[0].precio;

    // Enviar el precio al frontend
    res.status(200).json({ success: true, precio });
  } catch (error) {
    console.error("Error al obtener el precio del producto:", error);
    res.status(500).json({ success: false, errors: "Error en el servidor al obtener el precio del producto." });
  }
});

app.post("/addadmin", async (req, res) => {
  const newUserData = {
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    correo: req.body.correo,
    telefono: req.body.telefono,
    contrasena: req.body.contrasena,
    id_tipo: 1, // Tipo de usuario fijo
  };

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // Insertar el usuario
    const queryUser = `
      INSERT INTO USUARIO (nombre, apellido, correo, telefono, contrasena, id_tipo) 
      VALUES (?, ?, ?, ?, ?, ?)`;
    await connection.execute(queryUser, [
      newUserData.nombre,
      newUserData.apellido,
      newUserData.correo,
      newUserData.telefono,
      newUserData.contrasena,
      newUserData.id_tipo,
    ]);

    console.log("Usuario agregado correctamente");

    res.json({ success: true });
  } catch (error) {
    console.error("Error al agregar el usuario:", error);
    res.status(500).json({ success: false, error: "Error al agregar el usuario" });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error("Error al cerrar la conexión:", closeError);
      }
    }
  }
});

app.get("/searchAdmin", async (req, res) => {
  let connection;
  try {
    // Obtener el término de búsqueda y formatearlo
    const searchTerm = req.query.search ? `%${req.query.search.toLowerCase()}%` : "%";

    connection = await mysql.createConnection(dbConfig);

    // Consulta SQL para buscar por nombre o apellido
    const query = `
      SELECT id, nombre, apellido, correo, telefono
      FROM USUARIO
      WHERE LOWER(nombre) LIKE ? OR LOWER(apellido) LIKE ?`;

    const [rows] = await connection.execute(query, [searchTerm, searchTerm]);

    // Responder con los datos formateados
    res.json({
      success: true,
      admins: rows.map(row => ({
        id: row.id,
        nombre: row.nombre,
        apellido: row.apellido,
        correo: row.correo,
        telefono: row.telefono
      }))
    });
  } catch (error) {
    console.error('Error searching usuarios:', error);
    res.status(500).json({ success: false, error: "Error al buscar usuarios" });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
});

app.post('/verAdmins', async (req, res) => {
  
});

app.delete('/eliminarAdmin', async (req, res) => {
  let connection;

  try {
    // Validar la presencia del ID
    const id = req.body.id;
    if (!id) {
      return res.status(400).json({ success: false, error: "El ID del administrador es requerido" });
    }

    // Establecer conexión a la base de datos
    connection = await mysql.createConnection(dbConfig);

    // Ejecutar la consulta para eliminar al administrador
    const deleteAdminQuery = 'DELETE FROM USUARIO WHERE id = ?';
    const [result] = await connection.execute(deleteAdminQuery, [id]);

    // Comprobar si se ha eliminado algún registro
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: "Administrador no encontrado" });
    }

    // Responder con un mensaje de éxito
    res.json({ success: true, message: "Administrador eliminado exitosamente" });

  } catch (error) {
    console.error('Error al eliminar administrador:', error);
    return res.status(500).json({ success: false, error: "Error al eliminar administrador" });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (err) {
        console.error('Error cerrando la conexión:', err);
      }
    }
  }
});


app.listen(port, (error) => {
  if (!error) console.log("Server Running on port " + port);
  else console.log("Error : ", error);
});
