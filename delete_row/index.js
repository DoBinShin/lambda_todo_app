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

function deleteRow(sql, values) {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (error, results) => {
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
     DELETE FROM TODO
     WHERE id IN (?);
    `;

    try {

      if(0 < event.body.length) {    

        const res = await deleteRow(query, [event.body]);

        if(event.body.length == res.affectedRows) {
            db.commit();
            return {
                statusCode : 200,
                body : JSON.stringify(res.affectedRows)
              }
        } 
        throw new Error("삭제 실패!");
      } 
      throw new Error("데이터가 없습니다.");
    } catch(err) {
      console.log(err);
      err.statusCode = 404;
      return err;
    } finally {
      db.destroy();
    }
}