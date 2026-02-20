const admin = require("./firebaseAdmin");
const db = admin.database();

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405 };
    
    try {
        const { uid, deviceId } = JSON.parse(event.body);
        const user = await admin.auth().getUser(uid);
        
        await db.ref(`activeSessions/${user.email.replace('.', '_')}`).set({
            uid,
            deviceId,
            lastLogin: new Date().toISOString()
        });
        
        return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};