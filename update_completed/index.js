const mysql = require("mysql");
const config = require("./config.json");

const db = mysql.createConnection({
    host : config.host,
    port : config.port,
    user : config.user,
    password : config.password,
    database : config.database,
    connectionLimit : 60,
    multipleStatements : true
});

db.connect(error => {
    if (error) throw error;
    console.log('Connected to the database.');
});

function putCompleted(sql) {
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

module.exports.handler = async(event) => {
    
    const query = `
     UPDATE TODO
     SET completed = ?
     WHERE id = ?;
    `;

    try {

      if(0 < event.body.length) {    
        
        let sqls = "";
        event.body.forEach(item => {
          sqls += mysql.format(query, [item.completed, item.id]);
        });

        const res = await putCompleted(sqls);

        let count = 0;
        res.forEach(item => {
            count += item.changedRows;
        });

        console.log(sqls);

        return {
          statusCode : 200,
          body : count
        }        
      } else {
        throw new Error("데이터가 없습니다.");
      }
    } catch(err) {
      console.log(err);
      err.statusCode = 404;
      return err;
    } finally {
      db.destroy();
    }
}