const mysql = require("mysql");
const {v4: uuidv4} = require("uuid");
const config = require("./config.json");

// uuid setting
const uuid = () => {
  const tokens = uuidv4().split('-')
  return tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4];
}

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
     VALUES(?,?,?);
    `;

    try {

      if(0 < event.body.length) {    
        
        let sqls = "";
        
        event.body.forEach(item => {
          sqls += mysql.format(query, [uuid(), item.title, item.completed]);
        });


        const res = await addTodo(sqls);

        db.commit();

        let ids = [];
        res.forEach(item => {
            ids.push(item.insertId);
        });

        console.log(sqls, ids);

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