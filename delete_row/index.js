const pool = require("./database");

const conn = pool.promise();

module.exports.handler = async(event) => {
    
    const query = `
     DELETE FROM TODO
     WHERE id IN (?);
    `;

    try {

      if(0 < event.body.length) {    

        const [row, fields] = await conn.query(query, [event.body]);
        
        if(event.body.length == row.length) {
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