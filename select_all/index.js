const pool = require("./database");

const conn = pool.promise();

module.exports.handler = async (event) => {
    const query =`
        SELECT * FROM TODO A
        ORDER BY A.ORDER ASC
    `;   
    
    try {     
        const [row, fields] = await conn.query(query);
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(row)
        }
    } catch(err) {
        console.log(err);
        err.statusCode = 404;
        err.message = "조회 실패";
        return err;
    } finally {
        conn.releaseConnection();
    }
}
