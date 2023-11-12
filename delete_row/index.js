const pool = require("./database");

const conn = pool.promise();

module.exports.handler = async(event) => {
    
    const query = `
     DELETE FROM TODO
     WHERE id IN (?);
    `;

    try {
      
      const param = JSON.parse(event.body);

      if(0 < param.length) {    

        const [row, fields] = await conn.query(query, [param]);
        
        console.log(param, row);
        
        if(param.length == row.affectedRows) {
          conn.commit;
          return {
            statusCode : 200,
            headers: {
              "Content-Type": "application/json"
            },
            body : JSON.stringify({
                    message : "SUCCESS"
                  })
          }
        }
        conn.rollback;
        throw new Error("삭제 실패!");
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