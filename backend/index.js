const port = 4000;
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cors = require("cors");
const oracledb = require('oracledb');




const corsOptions = {
  origin: '*'
};

app.use(cors(corsOptions));
app.use(express.json());



const dbConfig = {
  user: 'C##Final',
  password: '12345',
  connectString: 'localhost:1521/xe'
};

async function initialize() {
  try {
    await oracledb.createPool(dbConfig);
    console.log('Connected to Oracle Express');
  } catch (err) {
    console.error('Error connecting to Oracle Express:', err.message);
    process.exit(1);
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
    const { correo, contraseña } = req.body;

    // Verificar si el usuario existe y la contraseña es correcta
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      "SELECT id FROM USUARIO WHERE correo = ? AND contraseña = ?",
      [correo, contraseña]
    );
    await connection.end();

    if (rows.length === 0) {
      return res.status(401).json({ success: false, errors: "Correo o contraseña incorrectos." });
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
    const { nombre, apellido, correo, telefono, contraseña, id_pais, direccion, estado, ciudad, codigo_postal } = req.body;

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
      "INSERT INTO USUARIO (id_tipo, nombre, apellido, correo, telefono, contraseña) VALUES (2, ?, ?, ?, ?, ?)",
      [nombre, apellido, correo, telefono, contraseña]
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
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request().query(
        `SELECT id, nombre_categoria FROM CATEGORIA_PRODUCTO`
      );
      res.json(result.recordset.map(row => ({
        id: row.id,
        nombre_categoria: row.nombre_categoria
      })));
    } catch (error) {
      console.error('Error fetching parent categories:', error);
      res.status(500).json([]);
    } finally {
      sql.close();
    }
  });

  app.get("/itemproducts", async (req, res) => {
    try {
      const productId = req.query.id_producto;
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .input('productId', sql.Int, productId)
        .query(
          `SELECT id, cantidad_disp, precio, estado FROM ITEM_PRODUCTO WHERE id_producto = @productId`
        );
      res.json(result.recordset.map(row => ({
        id: row.id,
        cantidad_disp: row.cantidad_disp,
        precio: row.precio,
        estado: row.estado
      })));
    } catch (error) {
      console.error('Error fetching item products:', error);
      res.status(500).json([]);
    } finally {
      sql.close();
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
    let pool;
    try {
      const productId = req.params.productId;
      pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .input('productId', sql.Int, productId)
        .query(
          `SELECT id, cantidad_disp, precio, estado
           FROM ITEM_PRODUCTO
           WHERE id_producto = @productId`
        );
      res.json(result.recordset.map(row => ({
        id: row.id,
        cantidad_disp: row.cantidad_disp,
        precio: row.precio,
        estado: row.estado
      })));
    } catch (error) {
      console.error('Error fetching item products:', error);
      res.status(500).json({ error: "Error al obtener los ITEM_PRODUCTO" });
    } finally {
      if (pool) {
        pool.close();
      }
    }
  });

  app.get("/itemproducttitles/:productId", async (req, res) => {
    let pool;
    try {
      const productId = req.params.productId;
      pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .input('productId', sql.Int, productId)
        .query(
          `SELECT op.valor
           FROM CONFIGURACION_PRODUCTO cp
           INNER JOIN OPCION_VARIACION op ON cp.id_opcion_variacion = op.id
           WHERE cp.id_item_producto IN (
             SELECT id
             FROM ITEM_PRODUCTO
             WHERE id_producto = @productId
           )`
        );
      const titles = result.recordset.map(row => row.valor);
      res.json({ titles });
    } catch (error) {
      console.error('Error fetching item product titles:', error);
      res.status(500).json({ error: "Error al obtener los títulos de los ITEM_PRODUCTO" });
    } finally {
      if (pool) {
        pool.close();
      }
    }
  });

  
  app.post('/updateitemproduct', async (req, res) => {
    let pool;
    try {
      console.log("Request received:", req.body);
      const { id, cantidad_disp, precio, estado } = req.body;
      pool = await sql.connect(dbConfig);
      const query = `
        BEGIN TRANSACTION;
        UPDATE ITEM_PRODUCTO
        SET cantidad_disp = @cantidad_disp, precio = @precio, estado = @estado
        WHERE id = @id;
        COMMIT TRANSACTION;
      `;
      await pool.request()
        .input('id', sql.Int, id)
        .input('cantidad_disp', sql.Int, cantidad_disp)
        .input('precio', sql.Decimal(10, 2), precio)
        .input('estado', sql.Int, estado)
        .query(query);
      console.log("Item updated successfully");
      res.json({ success: true, message: '¡Item actualizado exitosamente!' });
    } catch (error) {
      console.error('Error al actualizar el item:', error);
      res.status(500).json({ success: false, error: 'Error al actualizar el item' });
    } finally {
      if (pool) {
        pool.close();
      }
    }
  });

  
  app.get("/parentcategoriesNav", async (req, res) => {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request().query(
        `SELECT id, nombre_categoria FROM CATEGORIA_PRODUCTO WHERE id_categoria_padre IS NULL`
      );
      res.json(result.recordset.map(row => ({
        id: row.id,
        nombre_categoria: row.nombre_categoria
      })));
    } catch (error) {
      console.error('Error fetching parent categories:', error);
      res.status(500).json([]);
    } finally {
      sql.close();
    }
  });
  

  app.get("/SubCategories/:categoryId", async (req, res) => {
    const { categoryId } = req.params;
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .input('categoryId', sql.Int, categoryId)
        .query(
          `SELECT id, nombre_categoria FROM CATEGORIA_PRODUCTO WHERE id_categoria_padre = @categoryId`
        );
      res.json(result.recordset.map(row => ({
        id: row.id,
        nombre_categoria: row.nombre_categoria
      })));
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      res.status(500).json([]);
    } finally {
      sql.close();
    }
  });

  app.get('/productos-recientes', async (req, res) => {
    let pool;
    try {
      pool = await sql.connect(dbConfig);
      const productosResult = await pool.request().query(
        `SELECT TOP 8 p.id, 
                p.nombre_producto, 
                p.descripcion_producto, 
                p.imagen_producto1, 
                c.nombre_categoria
          FROM PRODUCTO p
          INNER JOIN CATEGORIA_PRODUCTO c ON p.id_categoria = c.id
          WHERE p.estado = 1
          ORDER BY p.id DESC`
      );
      const idsProductos = productosResult.recordset.map(row => row.id);
      const preciosResult = await pool.request().query(
        `SELECT id_producto, precio
          FROM ITEM_PRODUCTO
          WHERE id_producto IN (${idsProductos.join(",")})`
      );
      const preciosPorId = {};
      for (const row of preciosResult.recordset) {
        preciosPorId[row.id_producto] = row.precio;
      }
      const productosConPrecios = productosResult.recordset.map(row => ({
        id: row.id,
        nombre_producto: row.nombre_producto,
        descripcion_producto: row.descripcion_producto,
        imagen_producto1: row.imagen_producto1,
        nombre_categoria: row.nombre_categoria,
        precio: preciosPorId[row.id] || null
      }));
      res.json(productosConPrecios);
    } catch (error) {
      console.error('Error al obtener productos recientes:', error);
      res.status(500).json({ error: 'Error al obtener productos recientes' });
    } finally {
      if (pool) {
        pool.close();
      }
    }
  });

  
  app.get("/firstOption/:idProducto", async (req, res) => {
    let pool;
    try {
      const idProducto = req.params.idProducto;
      pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .input('idProducto', sql.Int, idProducto)
        .query(
          `SELECT DISTINCT opv2.valor
           FROM CONFIGURACION_PRODUCTO cp
           INNER JOIN OPCION_VARIACION opv2 ON cp.id_opcion_variacion2 = opv2.id
           WHERE cp.id_item_producto IN (
             SELECT id
             FROM ITEM_PRODUCTO
             WHERE id_producto = @idProducto
           )`
        );
      const firstOptions = result.recordset.map(row => row.valor);
      res.json({ firstOptions });
    } catch (error) {
      console.error('Error fetching first options:', error);
      res.status(500).json({ error: "Error fetching first options" });
    } finally {
      if (pool) {
        pool.close();
      }
    }
  });

  app.get("/secondOption/:idOpcionVariacion/:productId", async (req, res) => {
    let pool;
    try {
      const { idOpcionVariacion, productId } = req.params;
      pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .input('idOpcionVariacion', sql.Int, idOpcionVariacion)
        .input('productId', sql.Int, productId)
        .query(
          `SELECT DISTINCT opv.valor
           FROM CONFIGURACION_PRODUCTO cp
           INNER JOIN OPCION_VARIACION opv ON cp.id_opcion_variacion1 = opv.id
           WHERE cp.id_opcion_variacion2 = @idOpcionVariacion
           AND cp.id_item_producto IN (
             SELECT id
             FROM ITEM_PRODUCTO
             WHERE id_producto = @productId
           )`
        );
      const secondOptions = result.recordset.map(row => row.valor);
      res.json({ secondOptions });
    } catch (error) {
      console.error('Error fetching second options:', error);
      res.status(500).json({ error: "Error fetching second options" });
    } finally {
      if (pool) {
        pool.close();
      }
    }
  });

  
  app.get("/checkAvailability/:idProducto/:idOpcionVariacion2/:idOpcionVariacion1", async (req, res) => {
    let pool;
    try {
      const { idProducto, idOpcionVariacion2, idOpcionVariacion1 } = req.params;
      pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .input('idProducto', sql.Int, idProducto)
        .input('idOpcionVariacion2', sql.Int, idOpcionVariacion2)
        .input('idOpcionVariacion1', sql.Int, idOpcionVariacion1)
        .query(
          `SELECT cp.id_item_producto, ip.cantidad_disp
           FROM CONFIGURACION_PRODUCTO cp
           INNER JOIN ITEM_PRODUCTO ip ON cp.id_item_producto = ip.id
           WHERE ip.id_producto = @idProducto
           AND cp.id_opcion_variacion2 = @idOpcionVariacion2
           AND cp.id_opcion_variacion1 = @idOpcionVariacion1`
        );
      if (result.recordset.length > 0) {
        res.json({ available: true, cantidad_disp: result.recordset[0].cantidad_disp });
      } else {
        res.json({ available: false, cantidad_disp: 0 });
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      res.status(500).json({ error: "Error checking availability" });
    } finally {
      if (pool) {
        pool.close();
      }
    }
  });

  
  app.get('/cart/:userId', async (req, res) => {
    let pool;
    try {
      const userId = req.params.userId;
      pool = await sql.connect(dbConfig);
      const cartResult = await pool.request()
        .input('userId', sql.Int, userId)
        .query(
          `SELECT c.id_producto, c.cantidad, p.nombre_producto, p.descripcion_producto, p.imagen_producto1, ip.precio
           FROM CARRITO c
           INNER JOIN PRODUCTO p ON c.id_producto = p.id
           INNER JOIN ITEM_PRODUCTO ip ON p.id = ip.id_producto
           WHERE c.id_usuario = @userId`
        );
      const cartItems = cartResult.recordset.map(row => ({
        id_producto: row.id_producto,
        cantidad: row.cantidad,
        nombre_producto: row.nombre_producto,
        descripcion_producto: row.descripcion_producto,
        imagen_producto1: row.imagen_producto1,
        precio: row.precio
      }));
      res.json(cartItems);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      res.status(500).json({ error: "Error fetching cart items" });
    } finally {
      if (pool) {
        pool.close();
      }
    }
  });
  


  
  //finaliza parte de steven


// Endpoint para crear un nuevo carrito para el usuario actual
app.post('/cart', async (req, res) => {
  try {
    const { userId } = req.body;
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `INSERT INTO CARRITO (id_usuario) VALUES (:userId) RETURNING id INTO :cartId`,
      {
        userId: { dir: oracledb.BIND_IN, val: userId },
        cartId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );
    connection.close();
    res.json({ cartId: result.outBinds.cartId[0] });
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

    connection = await oracledb.getConnection(dbConfig);

    let result;
    
    if (option2 === 0) {
      result = await connection.execute(
        `SELECT ip.id
         FROM ITEM_PRODUCTO ip
         INNER JOIN CONFIGURACION_PRODUCTO cp ON ip.id = cp.id_item_producto
         WHERE cp.id_opcion_variacion = :option1
         AND ip.id_producto = :productId
         AND NOT EXISTS (
           SELECT 1
           FROM CONFIGURACION_PRODUCTO
           WHERE id_item_producto = ip.id
           GROUP BY id_item_producto
           HAVING COUNT(*) > 1
         )`,
        { option1, productId }
      );
    } else {
      result = await connection.execute(
        `SELECT id_item_producto 
         FROM CONFIGURACION_PRODUCTO cp
         INNER JOIN ITEM_PRODUCTO ip ON cp.id_item_producto = ip.id
         WHERE cp.id_opcion_variacion IN (:option1, :option2)
         AND ip.id_producto = :productId
         GROUP BY id_item_producto HAVING COUNT(*) = 2`,
        { option1, option2, productId }
      );
    }

    if (result.rows.length > 0) {
      const itemId = result.rows[0][0];
      
      const priceResult = await connection.execute(
        `SELECT precio FROM ITEM_PRODUCTO WHERE id = :itemId`,
        [itemId]
      );

      const price = priceResult.rows[0][0];
      
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
        await connection.close();
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

    const connection = await oracledb.getConnection(dbConfig);

    // Comprobación si el registro ya existe en la tabla CARRITO_ITEM
    const checkResult = await connection.execute(
      `SELECT id FROM CARRITO_ITEM WHERE id_carrito = :cartId AND id_item_producto = :itemId`,
      { cartId, itemId }
    );

    if (checkResult.rows.length > 0) {
      // Si el registro ya existe, actualizar la cantidad
      const updateResult = await connection.execute(
        `UPDATE CARRITO_ITEM SET cantidad = cantidad + :quantity 
        WHERE id_carrito = :cartId AND id_item_producto = :itemId`,
        { cartId, itemId, quantity }
      );
    } else {
      // Si el registro no existe, insertar uno nuevo
      const insertResult = await connection.execute(
        `INSERT INTO CARRITO_ITEM (id_carrito, id_item_producto, cantidad) 
        VALUES (:cartId, :itemId, :quantity)`,
        { cartId, itemId, quantity }
      );
    }

    // Commit para realizar cambios permanentes
    await connection.commit();

    connection.close();
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
    connection = await oracledb.getConnection();

    for (const id_categoria of categorias) {
      // Insertar la promoción
      const queryPromotion = `
        INSERT INTO PROMOCION (nombre, descripcion, descuento_porcentaje, fecha_inicio, fecha_final) 
        VALUES (:nombre, :descripcion, :descuento_porcentaje, TO_DATE(:fecha_inicio, 'YYYY-MM-DD'), TO_DATE(:fecha_final, 'YYYY-MM-DD')) 
        RETURNING id INTO :id`;
      const bindsPromotion = {
        nombre: newPromotionData.nombre,
        descripcion: newPromotionData.descripcion,
        descuento_porcentaje: newPromotionData.descuento_porcentaje,
        fecha_inicio: newPromotionData.fecha_inicio,
        fecha_final: newPromotionData.fecha_final,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      };
      let resultPromotion = await connection.execute(queryPromotion, bindsPromotion, { autoCommit: true });
      const newPromotionId = resultPromotion.outBinds.id[0]; // Obtener el ID generado de la promoción

      // Insertar la relación entre la promoción y la categoría
      const queryPromotionCategory = `
        INSERT INTO PROMOCION_CATEGORIA (id_categoria, id_promocion) 
        VALUES (:id_categoria, :id_promocion)`;
      const bindsPromotionCategory = {
        id_categoria,
        id_promocion: newPromotionId
      };
      await connection.execute(queryPromotionCategory, bindsPromotionCategory, { autoCommit: true });
    }

    console.log("Promociones agregadas correctamente");

    res.json({ success: true });
  } catch (error) {
    console.error("Error al agregar las promociones:", error);
    res.status(500).json({ success: false, error: "Error al agregar las promociones" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error al cerrar la conexión:", closeError);
      }
    }
  }
});


app.get("/allpromociones", async (req, res) => {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT p.id, p.nombre, p.descripcion, p.descuento_porcentaje, p.fecha_inicio, p.fecha_final, c.nombre_categoria as categoria_nombre
       FROM PROMOCION p
       INNER JOIN PROMOCION_CATEGORIA pc ON p.id = pc.id_promocion
       INNER JOIN CATEGORIA_PRODUCTO c ON pc.id_categoria = c.id`
    );
    await connection.close();
    res.json(result.rows.map(row => ({
      id: row[0],
      nombre: row[1],
      descripcion: row[2],
      descuento_porcentaje: row[3],
      fecha_inicio: row[4],
      fecha_final: row[5],
      categoria_nombre: row[6]
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
    connection = await oracledb.getConnection(dbConfig);
    const query = `
      UPDATE PROMOCION SET
      nombre = :nombre,
      descripcion = :descripcion,
      descuento_porcentaje = :descuento_porcentaje,
      fecha_inicio = TO_DATE(:fecha_inicio, 'YYYY-MM-DD'),
      fecha_final = TO_DATE(:fecha_final, 'YYYY-MM-DD')
      WHERE id = :id
    `;
    const binds = { id, nombre, descripcion, descuento_porcentaje, fecha_inicio, fecha_final };
    await connection.execute(query, binds, { autoCommit: true });
    res.json({ success: true, message: '¡Promoción actualizada exitosamente!' });
  } catch (error) {
    console.error('Error updating promocion:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar la promoción' });
  } finally {
    if (connection) {
      try {
        await connection.close();
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
    connection = await oracledb.getConnection(dbConfig);
    
    // Eliminar referencias en la tabla PROMOCION_CATEGORIA primero
    const deleteRefsQuery = `DELETE FROM PROMOCION_CATEGORIA WHERE id_promocion = :promocionId`;
    await connection.execute(deleteRefsQuery, { promocionId }, { autoCommit: true });

    // Luego eliminar la promoción en la tabla PROMOCION
    const deletePromocionQuery = `DELETE FROM PROMOCION WHERE id = :promocionId`;
    await connection.execute(deletePromocionQuery, { promocionId }, { autoCommit: true });
    
    res.json({ success: true, message: '¡Promoción eliminada exitosamente!' });
  } catch (error) {
    console.error('Error removing promocion:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar la promoción' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error('Error al cerrar la conexión:', closeError);
      }
    }
  }
});


app.get("/searchpromocion", async (req, res) => {
  let connection;
  try {
    const searchTerm = req.query.search ? req.query.search.toLowerCase() : "";
    connection = await oracledb.getConnection(dbConfig);
    const query = `
      SELECT p.id, p.nombre, p.descripcion, p.descuento_porcentaje, p.fecha_inicio, p.fecha_final, c.nombre_categoria as categoria_nombre
      FROM PROMOCION p
      INNER JOIN PROMOCION_CATEGORIA pc ON p.id = pc.id_promocion
      INNER JOIN CATEGORIA_PRODUCTO c ON pc.id_categoria = c.id
      WHERE LOWER(p.nombre) LIKE '%' || :searchTerm || '%'`;
    const result = await connection.execute(query, { searchTerm });
    await connection.close();
    res.json(result.rows.map(row => ({
      id: row[0],
      nombre: row[1],
      descripcion: row[2],
      descuento_porcentaje: row[3],
      fecha_inicio: row[4],
      fecha_final: row[5],
      categoria_nombre: row[6]
    })));
  } catch (error) {
    console.error('Error searching promociones:', error);
    res.status(500).json([]);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
});

app.get("/cartItemCount/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT COUNT(ci.id) AS count
      FROM CARRITO_ITEM ci
      INNER JOIN CARRITO c ON ci.id_carrito = c.id
      INNER JOIN ITEM_PRODUCTO ip ON ci.id_item_producto = ip.id
      WHERE c.id_usuario = :userId
      AND ip.estado = 1`,
      [userId]
    );
    await connection.close();
    const cartItemCount = result.rows[0][0];
    res.json({ count: cartItemCount });
  } catch (error) {
    console.error('Error fetching cart item count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get("/cartItems/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT ci.id, p.imagen_producto1, 
       p.nombre_producto || ' ' || 
       LISTAGG(opv.valor, ', ') WITHIN GROUP (ORDER BY opv.valor) AS nombre_producto, 
       ip.precio, ci.cantidad, ip.id_producto
       FROM CARRITO_ITEM ci
       INNER JOIN ITEM_PRODUCTO ip ON ci.id_item_producto = ip.id
       INNER JOIN PRODUCTO p ON ip.id_producto = p.id
       LEFT JOIN CONFIGURACION_PRODUCTO cp ON ci.id_item_producto = cp.id_item_producto
       LEFT JOIN OPCION_VARIACION opv ON cp.id_opcion_variacion = opv.id
       WHERE ci.id_carrito = (SELECT id FROM CARRITO WHERE id_usuario = :userId) AND ip.estado = 1
       GROUP BY ci.id, p.imagen_producto1, p.nombre_producto, ip.precio, ci.cantidad, ip.id_producto`,
      [userId]
    );
    
    const items = [];
    for (const row of result.rows) {
      const productId = row[5]; // Obtener el id_producto
      const discount = await getDiscount(connection, productId); // Obtener el descuento del producto
      items.push({
        id: row[0],
        imagen_producto1: row[1],
        nombre_producto: row[2],
        precio: row[3],
        cantidad: row[4],
        descuento: discount
      });
    }

    await connection.close();
    res.json(items);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json([]);
  }
});

async function getDiscount(connection, productId) {
  try {
    const currentDate = new Date().toISOString().slice(0, 10); // Obtener la fecha actual en formato YYYY-MM-DD
    const result = await connection.execute(
      `SELECT pc.id_promocion, p.descuento_porcentaje
       FROM PROMOCION_CATEGORIA pc
       INNER JOIN PROMOCION p ON pc.id_promocion = p.id
       INNER JOIN PRODUCTO pr ON pc.id_categoria = pr.id_categoria
       WHERE pr.id = :productId
       AND p.fecha_inicio <= TO_DATE(:currentDate, 'YYYY-MM-DD')
       AND p.fecha_final >= TO_DATE(:currentDate, 'YYYY-MM-DD')`,
      [productId, currentDate, currentDate]
    );
    
    if (result.rows.length > 0) {
      return result.rows[0][1]; // Retorna el descuento si hay promoción
    } else {
      return 0; // Si no hay promoción, el descuento es 0
    }
  } catch (error) {
    console.error('Error fetching product discount:', error);
    return 0; // En caso de error, retorna 0 como descuento
  }
}



app.put("/cartItems/updateQuantity/:itemId", async (req, res) => {
  const itemId = req.params.itemId;
  const operation = req.body.operation; // Operation can be "increment" or "decrement"

  try {
    const connection = await oracledb.getConnection(dbConfig);
    let query;
    if (operation === "increment") {
      query = `UPDATE CARRITO_ITEM SET cantidad = cantidad + 1 WHERE id = :itemId`;
    } else if (operation === "decrement") {
      query = `UPDATE CARRITO_ITEM SET cantidad = cantidad - 1 WHERE id = :itemId AND cantidad > 1`;
    }
    const result = await connection.execute(query, [itemId], { autoCommit: true });
    
    // Get the updated item
    const updatedItemQuery = `SELECT * FROM CARRITO_ITEM WHERE id = :itemId`;
    const updatedItemResult = await connection.execute(updatedItemQuery, [itemId]);
    const updatedItem = updatedItemResult.rows[0];

    await connection.close();
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating quantity:', error);
    res.status(500).json({ error: 'Error updating quantity' });
  }
});

app.get("/userAddresses/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT d.ciudad, d.direccion, d.id
       FROM DIRECCION d
       INNER JOIN DIRECCION_USUARIO du ON d.id = du.id_direccion
       WHERE du.id_usuario = :userId`,
      [userId]
    );

    const addresses = result.rows.map((row) => ({
      ciudad: row[0],
      direccion: row[1],
      id: row[2]
    }));
    console.log("INFO DIRECCIONES: ", result.rows);
    await connection.close();
    res.json(addresses);
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    res.status(500).json([]);
  }
});

app.get("/shippingMethods", async (req, res) => {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT id, nombre, precio FROM METODO_ENVIO`
    );

    const shippingMethods = result.rows.map((row) => ({
      id: row[0],
      nombre: row[1],
      precio: row[2]
    }));

    await connection.close();
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
    const itemId = parseInt(req.body.itemId);;
    
    // Obtener el id del carrito del usuario
    connection = await oracledb.getConnection(dbConfig);
    const getCartIdQuery = `SELECT id FROM CARRITO WHERE id_usuario = :userId`;
    const cartIdResult = await connection.execute(getCartIdQuery, { userId });
    
    
    if (cartIdResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'El usuario no tiene un carrito' });
    }
    
    const cartId = parseInt(cartIdResult.rows[0][0]);
    
    console.log(cartId, itemId);
    // Eliminar el artículo del carrito
    const deleteCartItemQuery = `DELETE FROM CARRITO_ITEM WHERE id = :itemId`;
    const deleteResult = await connection.execute(deleteCartItemQuery, { itemId }, { autoCommit: true });
    
    if (deleteResult.rowsAffected && deleteResult.rowsAffected === 1) {
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
        await connection.close();
      } catch (closeError) {
        console.error('Error al cerrar la conexión:', closeError);
      }
    }
  }
});

app.post('/addAddress', async (req, res) => {
  const { userId, direccion, estado, ciudad, codigo_postal, id_pais } = req.body;
  try {
    const connection = await oracledb.getConnection(dbConfig);
    const insertAddressQuery = `
      INSERT INTO DIRECCION (direccion, estado, ciudad, codigo_postal, id_pais)
      VALUES (:direccion, :estado, :ciudad, :codigo_postal, :id_pais)
      RETURNING id INTO :id`;
    const result = await connection.execute(insertAddressQuery, {
      direccion,
      estado,
      ciudad,
      codigo_postal,
      id_pais,
      id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
    });
    const direccionId = result.outBinds.id[0];
    
    const insertUserAddressQuery = `
      INSERT INTO DIRECCION_USUARIO (id_usuario, id_direccion)
      VALUES (:userId, :direccionId)`;
    await connection.execute(insertUserAddressQuery, {
      userId,
      direccionId
    });

    await connection.commit();
    await connection.close();
    res.json({ success: true, message: '¡Dirección agregada exitosamente!' });
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ success: false, error: 'Error al agregar la dirección' });
  }
});

app.get("/promo-category", async (req, res) => {
  try {
    const currentDate = new Date().toISOString().slice(0, 10);
    const query = `
      SELECT pc.id_categoria, cp.id_categoria_padre, cp.nombre_categoria, p.nombre, p.descripcion 
      FROM PROMOCION_CATEGORIA pc
      INNER JOIN PROMOCION p ON pc.id_promocion = p.id
      INNER JOIN CATEGORIA_PRODUCTO cp ON pc.id_categoria = cp.id
      WHERE TO_DATE(:currentDate, 'YYYY-MM-DD') BETWEEN p.fecha_inicio AND p.fecha_final
      ORDER BY DBMS_RANDOM.RANDOM
    `;
    const binds = { currentDate };
    const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };
    
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(query, binds, options);
    await connection.close();

    const promoCategory = result.rows[0];
    const idPadre = result.rows[1];
    const nombre = result.rows[2];
    const promo = result.rows[3];
    const desc = result.rows[4];

    // Verificar si se encontró una promoción activa
    if (promoCategory) {
      res.json(promoCategory, idPadre, nombre, promo, desc);
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

    connection = await oracledb.getConnection(dbConfig);

    for (const cartItem of cartItems) {
      const { id_item_producto, cantidad } = cartItem;

      // Obtener la información del producto del carrito
      const cartItemQuery = `
        SELECT ip.id_producto, ip.cantidad_disp, p.nombre_producto
        FROM CARRITO_ITEM ci
        INNER JOIN ITEM_PRODUCTO ip ON ci.id_item_producto = ip.id
        INNER JOIN PRODUCTO p ON ip.id_producto = p.id
        WHERE ci.id = :id_item_producto`;
      const cartItemResult = await connection.execute(cartItemQuery, [id_item_producto]);
      const [cartItemInfo] = cartItemResult.rows;
      
      const cantidad_disp = parseInt(cartItemInfo[1]);
      const nombre_producto = cartItemInfo[2];
      
      console.log("Nombre Item: ",cartItemInfo[2]);
      console.log("Cantidad Item: ",cartItemInfo[1]);
      console.log("Cantidad carrito: ", cantidad);
      // Verificar la disponibilidad del producto
      if (cantidad_disp < cantidad) {
        console.log("ERROR: NO HAY EXISTENCIAS SUFICIENTES DE ", nombre_producto);
        console.log("Solo hay ", cantidad_disp, " existencias");
        return res.status(400).json({ error: `No hay suficientes existencias de ${nombre_producto}. Solo hay ${cantidad_disp} disponibles.` });
    }
    
    }

    // Si todas las verificaciones pasan, se realiza el checkout
    // Aquí podrías agregar la lógica para procesar el pago y actualizar el estado del carrito, etc.

    res.json({ success: true, message: "Compra realizada exitosamente." });

  } catch (error) {
    console.error('Error en el proceso de checkout:', error);
    res.status(500).json({ error: "Ocurrió un error al procesar el checkout." });
  } finally {
    if (connection) {
      try {
        await connection.close();
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

    connection = await oracledb.getConnection(dbConfig);

    const query = `
      SELECT numero_tarjeta, nombre_portador, id
      FROM METODO_PAGO_USUARIO
      WHERE id_usuario = :userId`;
    const result = await connection.execute(query, [userId]);

    const paymentMethods = result.rows.map(row => ({ 
      numero_tarjeta: row[0], 
      nombre_portador: row[1],
      id: row[2]
    }));
    res.json(paymentMethods);
    console.log(paymentMethods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ error: "Error al obtener métodos de pago del usuario." });
  } finally {
    if (connection) {
      try {
        await connection.close();
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
    console.log("Datos Ingresados: ",req.body);
    connection = await oracledb.getConnection(dbConfig);

    const query = `
      SELECT COUNT(*) AS count
      FROM TARJETA
      WHERE numero_tarjeta = :numero_tarjeta
      AND cvv = :cvv
      AND fecha_vencimiento = :fecha_expiracion`;
    const result = await connection.execute(query, [numero_tarjeta, cvv, fecha_expiracion]);
    console.log("Datos TARJETA: ", result.rows[0]);
    const exists = result.rows[0] != 0;
    res.json({ exists });
  } catch (error) {
    console.error('Error verificando la tarjeta:', error);
    res.status(500).json({ error: "Error al verificar la tarjeta." });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error cerrando la conexión:', err);
      }
    }
  }
});

app.post("/savePaymentMethod", async (req, res) => {
  const { userId, numero_tarjeta, cvv, nombre_portador, fecha_expiracion } = req.body;
  console.log(req.body);
  try {
    const connection = await oracledb.getConnection(dbConfig);

    // Insertar el método de pago del usuario
    const insertPaymentMethodQuery = `
      INSERT INTO METODO_PAGO_USUARIO (id_usuario, numero_tarjeta, cvv, nombre_portador, fecha_expiracion)
      VALUES (:userId, :numero_tarjeta, :cvv, :nombre_portador, :fecha_expiracion)`;
    await connection.execute(insertPaymentMethodQuery, {
      userId,
      numero_tarjeta,
      cvv,
      nombre_portador,
      fecha_expiracion
    });

    // Confirmar la transacción y cerrar la conexión
    await connection.commit();
    await connection.close();

    // Responder con un mensaje de éxito
    res.json({ success: true, message: '¡Método de pago agregado exitosamente!' });
  } catch (error) {
    console.error('Error al guardar el método de pago del usuario:', error);
    res.status(500).json({ success: false, error: 'Error al guardar el método de pago del usuario.' });
  }
});

app.post("/checkoutSaldo", async (req, res) => {
  let connection;
  try {
    const { userId, paymentMethodId } = req.body;
    connection = await oracledb.getConnection(dbConfig);

    // Obtener detalles del método de pago seleccionado
    const paymentMethodQuery = `
      SELECT numero_tarjeta, cvv, fecha_expiracion
      FROM METODO_PAGO_USUARIO
      WHERE id = :paymentMethodId`;
    const paymentMethodResult = await connection.execute(paymentMethodQuery, [paymentMethodId]);
    const [paymentMethodInfo] = paymentMethodResult.rows;
    
    // Obtener ID del banco asociado a la tarjeta
    const cardQuery = `
      SELECT id_banco
      FROM TARJETA
      WHERE numero_tarjeta = :numero_tarjeta
      AND cvv = :cvv
      AND fecha_vencimiento = :fecha_expiracion`;
    const cardResult = await connection.execute(cardQuery, paymentMethodInfo);
    const [cardInfo] = cardResult.rows;
    console.log(cardResult.rows[0]);
    // Obtener saldo asociado al banco
    const bankQuery = `
      SELECT saldo
      FROM BANCO
      WHERE id = :id_banco`;
    const bankResult = await connection.execute(bankQuery, cardResult.rows[0]);
    const bankInfo = bankResult.rows[0];
    console.log(bankResult.rows[0]);
    // Responder con el saldo obtenido
    res.json({ success: true, saldo: bankInfo });

  } catch (error) {
    console.error('Error en el proceso de checkout:', error);
    res.status(500).json({ error: "Ocurrió un error al procesar el checkout." });
  } finally {
    if (connection) {
      try {
        await connection.close();
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

  try {
    const connection = await oracledb.getConnection(dbConfig);

    // Insertar la orden en la base de datos
    const insertOrderQuery = `
      INSERT INTO ORDEN (id_usuario, fecha_hora, id_metodo_pago, direccion_envio, metodo_envio, total_orden, estado_orden)
      VALUES (:userId2, CURRENT_TIMESTAMP, :metodoPago2, :direccionEnvio2, :metodoEnvio2, :totalCompra2, 1)
      RETURNING id INTO :outId`;
    const bindVars = {
      userId2,
      metodoPago2,
      direccionEnvio2,
      metodoEnvio2,
      totalCompra2,
      outId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
    };
    const result = await connection.execute(insertOrderQuery, bindVars);
    const orderId = result.outBinds.outId[0];

    // Buscar los registros en CARRITO_ITEM
    const cartQuery = `
      SELECT ci.id_item_producto, ci.cantidad 
      FROM CARRITO_ITEM ci
      JOIN ITEM_PRODUCTO ip ON ci.id_item_producto = ip.id
      WHERE ci.id_carrito = (SELECT id FROM CARRITO WHERE id_usuario = :userId) AND ip.estado = 1`;
    const cartItemsResult = await connection.execute(cartQuery, [userId2]);
    const cartItems = cartItemsResult.rows;

    // Insertar los registros en ORDEN_ITEM
    for (const [id_item_producto, cantidad] of cartItems) {
      const priceQuery = `SELECT precio FROM ITEM_PRODUCTO WHERE id = :id_item_producto`;
      const priceResult = await connection.execute(priceQuery, [id_item_producto]);
      const precio = priceResult.rows[0][0];

      const insertOrderItemQuery = `
        INSERT INTO ORDEN_ITEM (id_item_producto, id_orden, cantidad, precio)
        VALUES (:id_item_producto, :ordenId, :cantidad, :precio)`;
      await connection.execute(insertOrderItemQuery, {
        id_item_producto,
        ordenId: orderId,
        cantidad,
        precio
      });

      // Actualizar cantidad_disp en ITEM_PRODUCTO y estado si es necesario
      const updateProductQuery = `
        UPDATE ITEM_PRODUCTO
        SET cantidad_disp = cantidad_disp - :cantidad
        WHERE id = :id_item_producto`;
      await connection.execute(updateProductQuery, { cantidad, id_item_producto });

      const checkZeroQuantityQuery = `
        SELECT cantidad_disp
        FROM ITEM_PRODUCTO
        WHERE id = :id_item_producto`;
      const checkZeroResult = await connection.execute(checkZeroQuantityQuery, [id_item_producto]);
      const newQuantity = checkZeroResult.rows[0][0];

      if (newQuantity === 0) {
        const updateProductStatusQuery = `
          UPDATE ITEM_PRODUCTO
          SET estado = 2
          WHERE id = :id_item_producto`;
        await connection.execute(updateProductStatusQuery, [id_item_producto]);

        const checkOtherActiveProductsQuery = `
    SELECT id
    FROM ITEM_PRODUCTO
    WHERE id_producto = (SELECT id_producto FROM ITEM_PRODUCTO WHERE id = :id_item_producto) AND estado = 1`;
  const checkOtherActiveResult = await connection.execute(checkOtherActiveProductsQuery, { id_item_producto });
  if (checkOtherActiveResult.rows.length === 0) {
    const updateProductMasterQuery = `
      UPDATE PRODUCTO
      SET estado = 2
      WHERE id = (SELECT id_producto FROM ITEM_PRODUCTO WHERE id = :id_item_producto)`;
    await connection.execute(updateProductMasterQuery, { id_item_producto });
        }
      }
    }

    
    // Confirmar la transacción y cerrar la conexión
    // Después de confirmar la transacción y cerrar la conexión

// Buscar el método de pago del usuario
const metodoPagoUsuarioQuery = `
SELECT numero_tarjeta, cvv, fecha_expiracion
FROM METODO_PAGO_USUARIO
WHERE id = :metodoPago2`;
const metodoPagoUsuarioResult = await connection.execute(metodoPagoUsuarioQuery, [metodoPago2]);
const metodoPagoUsuario = metodoPagoUsuarioResult.rows[0];

// Buscar la tarjeta correspondiente
const tarjetaQuery = `
SELECT id, id_banco
FROM TARJETA
WHERE numero_tarjeta = :numeroTarjeta AND cvv = :cvv AND fecha_vencimiento = :fechaExpiracion`;
const tarjetaResult = await connection.execute(tarjetaQuery, metodoPagoUsuario);
const tarjetaId = tarjetaResult.rows[0][0];
const idBanco = tarjetaResult.rows[0][1];

// Actualizar saldo en la tabla del banco
const updateBancoQuery = `
UPDATE BANCO
SET saldo = saldo - :totalCompra2
WHERE id = :idBanco`;
await connection.execute(updateBancoQuery, [totalCompra2, idBanco]);

// Eliminar todos los elementos de la tabla CARRITO_ITEM asociados al carrito
const deleteCartItemsQuery = `
  DELETE FROM CARRITO_ITEM
  WHERE id_carrito = (SELECT id FROM CARRITO WHERE id_usuario = :userId)`;
await connection.execute(deleteCartItemsQuery, [userId2]);


    await connection.commit();
    await connection.close();
    

    // Responder con un mensaje de éxito
    res.json({ success: true, message: '¡Orden guardada exitosamente!' });
  } catch (error) {
    console.error('Error al guardar la orden:', error);
    res.status(500).json({ success: false, error: 'Error al guardar la orden.' });
  }
});

app.get("/allordenes", async (req, res) => {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT o.id, o.id_usuario, u.nombre || ' ' || u.apellido AS nombre_usuario, d.direccion AS direccion_envio, me.nombre AS metodo_envio, o.total_orden, eo.estado, TO_CHAR(o.fecha_hora, 'YYYY-MM-DD HH24:MI') AS fecha_hora
       FROM ORDEN o
       INNER JOIN USUARIO u ON o.id_usuario = u.id
       INNER JOIN DIRECCION d ON o.direccion_envio = d.id
       INNER JOIN METODO_ENVIO me ON o.metodo_envio = me.id
       INNER JOIN ESTADO_ORDEN eo ON o.estado_orden = eo.id
       ORDER BY o.fecha_hora DESC`
    );
    await connection.close();
    res.json(result.rows.map(row => ({
      id: row[0],
      id_usuario: row[1],
      nombre_usuario: row[2],
      direccion_envio: row[3],
      metodo_envio: row[4],
      total_orden: row[5],
      estado_orden: row[6],
      fecha_hora: row[7]
    })));
  } catch (error) {
    console.error('Error fetching ordenes:', error);
    res.status(500).json([]);
  }
});



app.get("/estadoordenes", async (req, res) => {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT id, estado FROM ESTADO_ORDEN`
    );
    await connection.close();
    res.json(result.rows.map(row => ({
      id: row[0],
      estado: row[1]
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
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `UPDATE ORDEN SET estado_orden = (
        SELECT id FROM ESTADO_ORDEN WHERE estado = :estado
      ) WHERE id = :orderId`,
      {
        estado,
        orderId
      },
      { autoCommit: true }
    );
    await connection.close();
    res.status(200).send("Orden modificada exitosamente.");
  } catch (error) {
    console.error('Error modificando orden:', error);
    res.status(500).send("Error al modificar la orden.");
  }
});

app.post('/loginAdmin', async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    // Verificar si el usuario existe y la contraseña es correcta
    const connection = await oracledb.getConnection(dbConfig);
    const resultUsuario = await connection.execute(
      "SELECT id, id_tipo FROM USUARIO WHERE correo = :correo AND contraseña = :contraseña",
      [correo, contraseña]
    );
    await connection.close();

    if (resultUsuario.rows.length === 0) {
      return res.status(401).json({ success: false, errors: "Correo o contraseña incorrectos." });
    }
    
    const userId = resultUsuario.rows[0][0];
    const userType = resultUsuario.rows[0][1];

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
    const connection = await oracledb.getConnection(dbConfig);
    const resultPrecio = await connection.execute(
      "SELECT precio FROM ITEM_PRODUCTO WHERE id_producto = :productId",
      [productId]
    );
    await connection.close();

    if (resultPrecio.rows.length === 0) {
      return res.status(404).json({ success: false, errors: "No se encontró el precio para el producto especificado." });
    }

    const precio = resultPrecio.rows[0][0];

    // Enviar el precio al frontend
    res.status(200).json({ success: true, precio });
  } catch (error) {
    console.error("Error al obtener el precio del producto:", error);
    res.status(500).json({ success: false, errors: "Error en el servidor al obtener el precio del producto." });
  }
});


app.listen(port, (error) => {
  if (!error) console.log("Server Running on port " + port);
  else console.log("Error : ", error);
});
