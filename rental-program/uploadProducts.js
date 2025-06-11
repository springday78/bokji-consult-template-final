const admin = require('firebase-admin');
const productList = require('./productList.json'); // 등록할 JSON 데이터
const serviceAccount = require('./bomnal-welfare-app-c3895-firebase-adminsdk-fbsvc-abbaf5a162.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function uploadAll() {
  const batch = db.batch();

  productList.forEach((item) => {
    const ref = db.collection('productList').doc(item.productCode); // 제품코드로 문서 ID 설정
    batch.set(ref, item);
  });

  await batch.commit();
  console.log('✅ 모든 제품이 업로드되었습니다!');
}

uploadAll();
