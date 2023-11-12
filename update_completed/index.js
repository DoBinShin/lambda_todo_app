const mysql = require("mysql2");
const pool = require("./database");

const conn = pool.promise();

module.exports.handler = async(event) => {
    
    const query = `
     UPDATE TODO
     SET completed = ?
     WHERE id = ?;
    `;

    try {

      const param = JSON.parse(event.body);

      if(0 < param.length) {    
        
        let sqls = "";
        param.forEach(item => {
          sqls += mysql.format(query, [item.completed, item.id]);
        });

        const [row, fields] = await conn.query(sqls);

        console.log(param, row);

        if(param.length == row.length) {
          conn.commit;
          return {
            statusCode : 200,
            headers: {
              "Content-Type": "application/json"
            },
            body : JSON.stringify({
                    message : "SUCCESS",
                  })
          }   
        }
        conn.rollback;
        throw new Error("수정 실패!"); 
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