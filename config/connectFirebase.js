const {initializeApp} = require('firebase/app');
const { getDatabase,set,ref,get,update,remove } = require('firebase/database');

const firebaseConfig = {
    databaseURL : "https://warehousestockdrinks-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app1 = initializeApp(firebaseConfig);
const db = getDatabase(app1);

module.exports = db;