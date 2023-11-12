const mysql = require("mysql2");
const {v4: uuidv4} = require("uuid");
const pool = require("./database");

const conn = pool.promise();

// uuid setting
const uuid = () => {
  const tokens = uuidv4().split('-')
  return tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4];
}

module.exports.handler = async(event) => {
    
    const query = ` 
      INSERT INTO TODO (ID, TITLE, COMPLETED)
      VALUES(?,?,?);
    `;
  
    try {

      const param = JSON.parse(event.body);

      if(0 < param.length) {            
        let sqls = "";
        
        let ids = [];
        param.forEach(item => {
          const randomId = uuid();
          ids.push(randomId);
          sqls += mysql.format(query, [randomId, item.title, item.completed]);
        });

        const [row, fields] = await conn.query(sqls);
        
        console.log(param, row);
        
        if(param.length == row.affectedRows) {
          conn.commit;
          return {
            statusCode : 200,
            headers: {
              "Content-Type": "application/json"
            },
            body : JSON.stringify(ids)
          }    
        }
        conn.rollback;
        throw new Error("저장 실패!");
      } 
      throw new Error("데이터가 없습니다.");
    } catch(err) {
      console.log(err);
      err.statusCode = 404;
      return err;
    } finally {
      conn.releaseConnection();
    }
}