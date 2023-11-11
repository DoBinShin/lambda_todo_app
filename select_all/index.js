const mysql = require("mysql");
const config = require("./config.json");

const db = mysql.createConnection({
    host : config.host,
    port : config.port,
    user : config.user,
    password : config.password,
    database : config.database,
    connectionLimit : 60
});

db.connect(error => {
    if (error) throw error;
    console.log('Connected to the database.');
});

function getList(sql) {
  return new Promise((resolve, reject) => {
    db.query(sql, (error, results) => {
       if (error) {
          reject(error);
       } else {
          resolve(results);
       }
    });
  });
}

module.exports.handler = async (event) => {
    
    const query =`SELECT * FROM TODO`;   
    
    try {     
        
        const result = await getList(query);
        return {
            statusCode : 200,
            body : JSON.stringify(result)
        }
    } catch(err) {
        console.log(err);
        err.statusCode = 404;
        err.message = "조회 실패";
        return err;
    } finally {
        db.destroy();
    }
}
