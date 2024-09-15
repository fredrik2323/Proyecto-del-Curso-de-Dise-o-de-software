const express = require('express');

const app = express();
const path = require('path');

const cors = require('cors');
const { Pool } = require('pg');


const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'laboratorio',
  password: 'JOvr83970226*',
  port: 5432,
});

app.use(express.static(path.join(__dirname, 'public')));

app.post('/saveData', async (req, res) => {
  try {
    const { r1, r2, r3, hongo } = req.body;
    
    // Realizar la suma de R1, R2 y R3
    const total = parseInt(r1) + parseInt(r2) + parseInt(r3);

    const insertQuery = 'INSERT INTO reporte (resul, name) VALUES ($1, $2)';
    await pool.query(insertQuery, [total, hongo]);

    res.json({ message: 'Datos guardados en la base de datos' });
  } catch (error) {
    console.error('Error al insertar en la base de datos', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/inicio', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'inicio.html'));
});

app.get('/nuevaCuenta', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'nuevaCuenta.html'));
  });

app.get('/inicio/informe', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'informe.html'));
  });

  app.get('/inicio/microorganismo/eliminarMicroorganismo', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'eliminarMicroorganismo.html'));
  });

  app.get('/inicio/analisis', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'analisis.html'));
  });

  app.get('/inicio/microorganismo/agregarMicroorganismo', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'agregarMicroorganismo.html'));
  });

  app.get('/inicio/analisis/resultado', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'resultado.html'));
  });

  app.get('/inicio/informe/historial', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'historial.html'));
  });

  app.get('/inicio/informe/eliminarInforme', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'eliminarInforme.html'));
  });

  app.get('/inicio/estadisticas', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'estadisticas.html'));
  });

  app.get('/inicio/microorganismos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'microorganismos.html'));
  });

  app.get('/inicio/test', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test.html'));
  });


const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


app.use(express.urlencoded({ extended: true }));
app.use(express.json({ type: '*/*' }));
app.use(cors());



// Endpoint para enviar datos del informe de microorganismo
app.post('/submit', async (req, res) => {
  const {
    fecha,
    identificadorMuestra,
    nombreMuestra,
    descripcion,
    grupo,
    microorganismo,
    factorConversion,
    dilucionEmpleada,
    r1,
    r2,
    r3,
    nombre_usuario
  } = req.body;

  try {
    // Obtener el id del usuario seleccionado
    const userIdQuery = 'SELECT id FROM usuario WHERE nombre_completo = $1';
    const userIdResult = await pool.query(userIdQuery, [nombre_usuario]);

    if (userIdResult.rows.length > 0) {
      const userId = userIdResult.rows[0].id;

      // Convertir datos antes de la inserción
      const formattedFecha = new Date(fecha); // Convierte la fecha a tipo Date
      const formattedFactorConversion = parseInt(factorConversion); // Convierte el factorConversion a entero
      const formattedDilucionEmpleada = parseInt(dilucionEmpleada); // Convierte la dilucionEmpleada a entero

      // Calcular UFC y realizar la inserción en la base de datos
      const total = (parseInt(r1) + parseInt(r2) + parseInt(r3)) / 3;
      const UFC = total * formattedFactorConversion * formattedDilucionEmpleada;
      const UFCentero = parseInt(UFC);

      const insertQuery = `
        INSERT INTO analisis_microbiolgico 
        (fecha, identificador_muestra, nombre_muestra, descripcion_muestra, usuario_id, grupo, microorganismo, factor_conversion, dilucion_empleada, ufc)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;

      await pool.query(insertQuery, [
        formattedFecha,
        identificadorMuestra,
        nombreMuestra,
        descripcion,
        userId,
        grupo,
        microorganismo,
        formattedFactorConversion,
        formattedDilucionEmpleada,
        UFCentero
      ]);

      res.status(201).json({ message: 'Datos del análisis guardados en la base de datos' });
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error al guardar datos del análisis en la base de datos:', error);
    res.status(500).json({ error: 'Error al guardar datos del análisis' });
  }
});



app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
      // Realizar la verificación en la base de datos
      const userQuery = 'SELECT * FROM usuario WHERE nombre_usuario = $1 AND contraseña = $2';
      const result = await pool.query(userQuery, [username, password]);

      if (result.rows.length > 0) {
          res.json({ message: 'Credenciales válidas' });
      } else {
          res.status(401).json({ error: 'Credenciales inválidas' });
      }
  } catch (error) {
      console.error('Error al autenticar:', error);
      res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.post('/register', async (req, res) => {
  const { usuario, contrasena, nombre_completo, rol } = req.body;

  try {
      const insertQuery = 'INSERT INTO usuario (nombre_usuario, contraseña, nombre_completo) VALUES ($1, $2, $3)';
      await pool.query(insertQuery, [usuario, contrasena, nombre_completo]);

      res.status(201).json({ message: 'Cuenta creada exitosamente' });
  } catch (error) {
      console.error('Error al crear cuenta:', error);
      res.status(500).json({ error: 'Error al crear la cuenta' });
  }
});

app.get('/obtenerAnalisis', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT ON (identificador_muestra) identificador_muestra, 
      TO_CHAR(am.fecha, 'DD-MM-YYYY') as fecha,
      u.nombre_completo
      FROM analisis_microbiolgico AS am
      FULL OUTER JOIN usuario AS u ON am.usuario_id = u.id
      WHERE am.fecha IS NOT NULL
      ORDER BY identificador_muestra, am.fecha DESC;
      
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener los análisis:', error);
    res.status(500).json({ error: 'Error al obtener los análisis' });
  }
});



function formatToCustomScientificNotation(number) {
  const exponent = Math.floor(Math.log10(number));
  const coefficient = (number / Math.pow(10, exponent)).toFixed(2);
  return `${coefficient} x 10^${exponent}`;
}

// Endpoint para mostrar el informe detallado
app.get('/obtenerAnalisisDetalle', async (req, res) => {
  const analysisId = req.query.id;

  try {
      const query = `
          SELECT TO_CHAR(am.fecha, 'DD-MM-YYYY') as fecha, identificador_muestra, nombre_muestra, descripcion_muestra, nombre_completo, 
          grupo, microorganismo, factor_conversion, dilucion_empleada, ufc 
          FROM analisis_microbiolgico AS am
          FULL OUTER JOIN usuario AS u
          ON am.usuario_id = u.id
          WHERE fecha IS NOT NULL AND identificador_muestra = $1
          ORDER BY grupo
      `;
      const result = await pool.query(query, [analysisId]);

      if (result.rows.length > 0) {
          // Convertir el valor de "UFC" a notación personalizada
          const rowsWithCustomScientificNotation = result.rows.map(row => {
            return {
              ...row,
              ufc: formatToCustomScientificNotation(parseFloat(row.ufc))
            };
          });

          res.json(rowsWithCustomScientificNotation);
      } else {
          res.status(404).json({ error: 'Informes no encontrados' });
      }
  } catch (error) {
      console.error('Error al obtener detalles del informe:', error);
      res.status(500).json({ error: 'Error al obtener detalles del informe' });
  }
});



app.get('/getMicroorganisms', async (req, res) => {
  const group = req.query.group;

  try {
      let tableName;
      switch (group) {
          case 'hongos':
              tableName = 'hongos';
              break;
          case 'pseudo-hongos':
              tableName = 'pseudo_hongos';
              break;
          case 'levaduras':
              tableName = 'levaduras';
              break;
          case 'bacterias anaerobicas':
              tableName = 'bacterias_anerobicas';
              break;
          case 'bacterias aerobicas':
              tableName = 'bacterias_aerobicas';
              break;
          case 'Actinomycetes':
              tableName = 'Actinomycetes';
              break;
          default:
              res.status(400).json({ error: 'Grupo no válido' });
              return;
      }

      const query = `SELECT * FROM ${tableName}`;
      const result = await pool.query(query);
      res.json(result.rows);
  } catch (error) {
      console.error('Error al obtener microorganismos:', error);
      res.status(500).json({ error: 'Error al obtener microorganismos' });
  }
});

app.get('/getUsers', async (req, res) => {
  try {
      const query = 'SELECT id, nombre_completo FROM usuario';
      const result = await pool.query(query);
      res.json(result.rows);
  } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

app.get('/obtenerEstadisticasPorMesConAnio', async (req, res) => {
  try {
      const { fechaInicio, fechaFin } = req.query;
      const query = `
          SELECT TO_CHAR(fecha, 'Mon YYYY') AS mes_anio, COUNT(*) AS cantidad
          FROM analisis_microbiolgico
          WHERE fecha IS NOT NULL AND fecha BETWEEN $1 AND $2
          GROUP BY TO_CHAR(fecha, 'Mon YYYY')
          ORDER BY TO_DATE(TO_CHAR(fecha, 'Mon YYYY'), 'Mon YYYY')
      `;
      const result = await pool.query(query, [fechaInicio, fechaFin]);
      res.json(result.rows);
  } catch (error) {
      console.error('Error al obtener estadísticas por mes con año:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas por mes con año' });
  }
});

app.post('/addMicroorganismo', async (req, res) => {
  const { grupo, nombreMicroorganismo } = req.body;

  try {
      const tableName = grupo.replace(/ /g, '_'); // Reemplazar espacios con guiones bajos
      const insertQuery = `INSERT INTO ${tableName} (nombre) VALUES ($1)`;
      await pool.query(insertQuery, [nombreMicroorganismo]);

      res.status(201).json({ message: 'Microorganismo agregado exitosamente' });
  } catch (error) {
      console.error('Error al agregar microorganismo:', error);
      res.status(500).json({ error: 'Error al agregar microorganismo' });
  }
});

app.delete('/eliminarAnalisis', async (req, res) => {
  const analysisId = req.query.id;

  try {
      const deleteQuery = 'DELETE FROM analisis_microbiolgico WHERE identificador_muestra = $1';
      await pool.query(deleteQuery, [analysisId]);

      res.status(200).json({ message: 'Informe eliminado exitosamente' });
  } catch (error) {
      console.error('Error al eliminar el informe:', error);
      res.status(500).json({ error: 'Error al eliminar el informe' });
  }
});

app.delete('/eliminarMicroorganismo', async (req, res) => {
    const { grupo, microorganismo } = req.body;

    try {
        const tableName = grupo.replace(/ /g, '_');
        const deleteQuery = `DELETE FROM ${tableName} WHERE nombre = $1`;
        await pool.query(deleteQuery, [microorganismo]);

        res.status(200).json({ message: 'Microorganismo eliminado con éxito' });
    } catch (error) {
        console.error('Error al eliminar microorganismo:', error);
        res.status(500).json({ error: 'Error al eliminar microorganismo' });
    }
});