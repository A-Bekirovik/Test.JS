const mysql = require('mysql');

const pool = mysql.createPool({
  connectionLimit: 10, // Adjust as needed
  host: "81.172.209.161",
  port: "3306",
  user: "waterwiser",
  password: "waterwiser",
  database: "waterwiser"
});

var query1 = 'SELECT active FROM pumptoggles WHERE ToggleTime > (CURRENT_TIMESTAMP - INTERVAL 1 DAY) ORDER BY ToggleTime ASC';
var query2 = 'SELECT DISTINCT(ToggleTime) FROM pumptoggles WHERE ToggleTime > (CURRENT_TIMESTAMP - INTERVAL 1 DAY)';


function getSelection(formData){
  console.log("Form Data: " + formData);
  if(formData[1] == "pumpactivity"){
    switch(formData[0]){
      case 'day':
        query1 = 'SELECT active FROM pumptoggles WHERE ToggleTime > (CURRENT_TIMESTAMP - INTERVAL 1 DAY) AND ToggleTime < CURRENT_TIMESTAMP ORDER BY ToggleTime ASC';
        query2 = 'SELECT DISTINCT(ToggleTime) FROM pumptoggles WHERE ToggleTime > (CURRENT_TIMESTAMP - INTERVAL 1 DAY) AND ToggleTime < CURRENT_TIMESTAMP GROUP BY EXTRACT(HOUR FROM ToggleTime)';
        break;
      case 'week':
        query1 = 'SELECT COUNT(active) FROM pumptoggles WHERE ToggleTime > (CURRENT_TIMESTAMP - INTERVAL 7 DAY) AND ToggleTime < CURRENT_TIMESTAMP GROUP BY EXTRACT(DAY FROM ToggleTime) ORDER BY ToggleTime ASC';
        query2 = 'SELECT DISTINCT(ToggleTime) FROM pumptoggles WHERE ToggleTime > (CURRENT_TIMESTAMP - INTERVAL 7 DAY) AND ToggleTime < CURRENT_TIMESTAMP GROUP BY EXTRACT(DAY FROM ToggleTime) ORDER BY ToggleTime ASC';
        break;
      case 'month':
        query1 = 'SELECT COUNT(active) FROM pumptoggles WHERE ToggleTime > (CURRENT_TIMESTAMP - INTERVAL 1 MONTH) AND ToggleTime < CURRENT_TIMESTAMP GROUP BY EXTRACT(WEEK FROM ToggleTime)'
        query2 = 'SELECT DISTINCT(EXTRACT(WEEK FROM ToggleTime)) as week FROM pumptoggles WHERE ToggleTime > (CURRENT_TIMESTAMP - INTERVAL 1 MONTH) AND ToggleTime < CURRENT_TIMESTAMP GROUP BY week;'
        break;
      case 'quarter':
        query1 = 'SELECT COUNT(active) FROM pumptoggles where ToggleTime > (CURRENT_TIMESTAMP - INTERVAL 3 MONTH) AND ToggleTime < CURRENT_TIMESTAMP GROUP BY EXTRACT(MONTH FROM ToggleTime)'
        query2 = 'SELECT DISTINCT(EXTRACT(MONTH FROM ToggleTime)) as month FROM pumptoggles WHERE ToggleTime > (CURRENT_TIMESTAMP - INTERVAL 3 MONTH) AND ToggleTime < CURRENT_TIMESTAMP GROUP BY month'
        break;
      case 'year':
        query1 = 'SELECT COUNT(active) FROM pumptoggles WHERE ToggleTime > (CURRENT_TIMESTAMP - INTERVAL 1 YEAR) AND ToggleTime < CURRENT_TIMESTAMP GROUP BY EXTRACT(MONTH FROM ToggleTime)'
        query2 = 'SELECT DISTINCT(EXTRACT(MONTH FROM ToggleTime)) as month FROM pumptoggles WHERE ToggleTime > (CURRENT_TIMESTAMP - INTERVAL 1 YEAR) AND ToggleTime < CURRENT_TIMESTAMP GROUP BY month'
        break;
    }
  }
  if(formData[1] == "waterlevel"){
    switch(formData[0]){
      case 'day':
        query1 = 'SELECT value FROM sensortrigger WHERE TriggerTime > (CURRENT_TIMESTAMP - INTERVAL 1 DAY) AND TriggerTime < CURRENT_TIMESTAMP GROUP BY EXTRACT(HOUR FROM TriggerTime) ORDER BY TriggerTime ASC'
        query2 = 'SELECT DISTINCT(TriggerTime) FROM sensortrigger WHERE TriggerTime > (CURRENT_TIMESTAMP - INTERVAL 1 DAY) AND TriggerTime <= CURRENT_TIMESTAMP LIMIT 24'
        break;
      case 'week': 
        query1 = 'SELECT AVG(value) FROM sensortrigger WHERE TriggerTime > (CURRENT_TIMESTAMP - INTERVAL 7 DAY) AND TriggerTime < CURRENT_TIMESTAMP GROUP BY EXTRACT(DAY FROM TriggerTime) ORDER BY TriggerTime ASC'
        query2 = 'SELECT DISTINCT(TriggerTime) FROM sensortrigger WHERE TriggerTime > (CURRENT_TIMESTAMP - INTERVAL 7 DAY) AND TriggerTime <= CURRENT_TIMESTAMP LIMIT 7'
        break;
      case 'month':
        query1 = 'SELECT AVG(value) FROM sensortrigger WHERE TriggerTime > (CURRENT_TIMESTAMP - INTERVAL 1 MONTH) AND TriggerTime < CURRENT_TIMESTAMP GROUP BY EXTRACT(WEEK FROM TriggerTime) ORDER BY TriggerTime ASC'
        query2 = 'SELECT DISTINCT(TriggerTime) as month FROM sensortrigger WHERE TriggerTime > (CURRENT_TIMESTAMP - INTERVAL 1 MONTH) AND TriggerTime <= CURRENT_TIMESTAMP LIMIT 4'
        break;
      case 'quarter':
        query1 = 'SELECT AVG(value) FROM sensortrigger WHERE TriggerTime > (CURRENT_TIMESTAMP - INTERVAL 3 MONTH) AND TriggerTime < CURRENT_TIMESTAMP GROUP BY EXTRACT(MONTH FROM TriggerTime) ORDER BY TriggerTime ASC'
        query2 = 'SELECT DISTINCT(TriggerTime) as month FROM sensortrigger WHERE TriggerTime > (CURRENT_TIMESTAMP - INTERVAL 3 MONTH) AND TriggerTime < CURRENT_TIMESTAMP LIMIT 3'
        break;
      case 'year':
        query1 = 'SELECT AVG(value) FROM sensortrigger WHERE TriggerTime > (CURRENT_TIMESTAMP - INTERVAL 1 YEAR) AND TriggerTime < CURRENT_TIMESTAMP GROUP BY EXTRACT(MONTH FROM TriggerTime) ORDER BY TriggerTime ASC'
        query2 = 'SELECT DISTINCT(TriggerTime) as month FROM sensortrigger WHERE TriggerTime > (CURRENT_TIMESTAMP - INTERVAL 1 YEAR) AND TriggerTime < CURRENT_TIMESTAMP LIMIT 12'
        break;
    }
  }
  const data = getDataFromDatabase();
  return data;
}

function queryDatabase(query, values) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }

      connection.query(query, values, (queryErr, results) => {
        connection.release();

        if (queryErr) {
          reject(queryErr);
        } else {
          resolve(results);
        }
      });
    });
  });
}

async function getDataFromDatabase() {
  try {
    if(query1 != null && query2 != null){
      const results1 = await queryDatabase(query1);
      const results2 = await queryDatabase(query2);

      const data1 = results1.map(row => Object.values(row)[0]);
      const data2 = results2.map(row => Object.values(row)[0]);

      const data = [data1, data2];

      console.log(data1);
      console.log(data2);

      return data;
  }}
  catch (error) {
    throw error;
  }
}

async function getInitialPumpStatus() {
  const query = 'SELECT active FROM pumptoggles WHERE pumpID = 1 ORDER BY ToggleTime DESC LIMIT 1';

  try {
    const result = await queryDatabase(query);
    return result[0].active;
  } catch (error) {
    console.error('Error updating database:', error.message);
  }
}

async function updatePumpToggle(data) {
  const query = `
    INSERT INTO pumptoggles(pumpID, active, ToggleTime)
    VALUES (1, ?, CURRENT_TIMESTAMP)
  `;

  try {
    const result = await queryDatabase(query, [data.pumpActive]);
    console.log('Database updated successfully:', result);
  } catch (error) {
    console.error('Error updating database:', error.message);
  }
}

module.exports = {
  getDataFromDatabase,
  updatePumpToggle,
  getInitialPumpStatus,
  getSelection
}