const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer"); // npm install nodemailer

admin.initializeApp();
const db = admin.firestore();

// Configure Email Transporter (Use App Password for Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sb5846868@gmail.com",
    pass: "SKTC"
  }
});

exports.buyGiftCard = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Login required");

  const { productId, platform, amount, price } = data;
  const userId = context.auth.uid;

  // Run as a Transaction (Atomic Operation)
  return db.runTransaction(async (t) => {
    // 1. Get User
    const userRef = db.collection("users").doc(userId);
    const userDoc = await t.get(userRef);
    const userBalance = userDoc.data().balance;

    if (userBalance < price) {
      throw new functions.https.HttpsError("failed-precondition", "Insufficient Balance");
    }

    // 2. Find an unused code for this product
    const inventoryQuery = db.collection("inventory")
      .where("platform", "==", platform)
      .where("value", "==", amount) // e.g., 100 Diamonds
      .where("isUsed", "==", false)
      .limit(1);

    const inventorySnap = await t.get(inventoryQuery);

    if (inventorySnap.empty) {
      throw new functions.https.HttpsError("resource-exhausted", "Out of Stock");
    }

    const itemDoc = inventorySnap.docs[0];
    const giftCode = itemDoc.data().code;

    // 3. Execute Updates
    const newBalance = userBalance - price;
    t.update(userRef, { balance: newBalance });
    t.update(itemDoc.ref, { isUsed: true, usedBy: userId, usedAt: admin.firestore.FieldValue.serverTimestamp() });

    // 4. Create Order Record
    const orderRef = db.collection("orders").doc();
    t.set(orderRef, {
      userId,
      platform,
      code: giftCode,
      amount: amount,
      price: price,
      date: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, code: giftCode, orderId: orderRef.id };
  }).then(async (result) => {
    // 5. Send Email (After transaction success)
    await transporter.sendMail({
      from: "GameStore Nepal <noreply@gamestore.np>",
      to: context.auth.token.email,
      subject: `Your ${platform} Code is here!`,
      html: `
        <h1>Order Successful!</h1>
        <p>Platform: ${platform}</p>
        <p>Value: ${amount}</p>
        <p style="font-size: 24px; color: blue; font-weight: bold;">Code: ${result.code}</p>
        <p>Order ID: ${result.orderId}</p>
      `
    });
    return result;
  });
});
