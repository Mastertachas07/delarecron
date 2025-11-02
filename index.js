const admin = require("firebase-admin");
const { CronJob } = require("cron");

// Leer credenciales desde variable de entorno (segura)
const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Función que da coins a los usuarios
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

// Ejecutar cada lunes a medianoche (hora de México)
const job = new CronJob(
  "0 0 * * 1",
  giveWeeklyCoins,
  null,
  true,
  "America/Mexico_City"
);

job.start();
console.log("🚀 Cron job iniciado. Esperando próxima ejecución...");
