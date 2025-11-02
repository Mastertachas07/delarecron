// index.js
const admin = require("firebase-admin");
const { CronJob } = require("cron");

// ✅ Configuración de Firebase con variables de entorno seguras
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
};

// Inicializa Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ✅ Función que da 50 coins semanales a cada usuario
async function giveWeeklyCoins() {
  try {
    const usersSnapshot = await db.collection("usuarios").get();
    const batch = db.batch();

    usersSnapshot.forEach((userDoc) => {
      const userRef = db.collection("usuarios").doc(userDoc.id);
      const currentCoins = userDoc.data().coins || 0;
      batch.update(userRef, { coins: currentCoins + 50 }); // +50 coins semanales
    });

    await batch.commit();
    console.log("✅ Coins entregadas correctamente a todos los usuarios");
  } catch (err) {
    console.error("❌ Error dando coins:", err);
  }
}

// ✅ Cron Job: se ejecuta cada lunes a medianoche (hora de México)
const job = new CronJob(
  "0 0 * * 1",
  giveWeeklyCoins,
  null,
  true,
  "America/Mexico_City"
);

job.start();
console.log("🚀 Cron job iniciado. Esperando próxima ejecución...");
