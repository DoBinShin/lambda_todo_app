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

function addTodo(sql) {
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
     INSERT INTO TODO
     SET ?;
    `;

    try {

      if(0 < event.body.length) {    
        
        let sqls = "";
        event.body.forEach(item => {
          sqls += mysql.format(query, [item.id, item.title, item.completed]);
        });

        const res = await addTodo(sqls);

        let ids = [];
        res.forEach(item => {
            ids.push(item.insertId);
        });

        console.log(sqls);

        return {
          statusCode : 200,
          body : JSON.stringify(ids)
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