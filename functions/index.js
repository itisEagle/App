const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// 1. Configure Email Transporter (Use Gmail App Password)
// GOOGLE: Manage Account -> Security -> 2-Step Verification -> App Passwords
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your-email@gmail.com", // REPLACE THIS
    pass: "xxxx xxxx xxxx xxxx"    // REPLACE THIS (App Password, not login password)
  }
});

// 2. Purchase Gift Card Function
exports.buyGiftCard = functions.https.onCall(async (data, context) => {
  // Security: Check if user is logged in
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
  }

  const { platform, amount, price } = data;
  const userId = context.auth.uid;
  const userEmail = context.auth.token.email;

  // Run Atomic Transaction
  return db.runTransaction(async (t) => {
    // A. Get User Balance
    const userRef = db.collection("users").doc(userId);
    const userDoc = await t.get(userRef);

    if (!userDoc.exists) {
      throw new functions.https.HttpsError("not-found", "User not found");
    }

    const currentBalance = userDoc.data().balance || 0;

    // B. Check Balance
    if (currentBalance < price) {
      throw new functions.https.HttpsError("failed-precondition", "Insufficient Balance");
    }

    // C. Find Unused Code
    const inventoryQuery = db.collection("inventory")
      .where("platform", "==", platform)
      .where("value", "==", amount)
      .where("isUsed", "==", false)
      .limit(1);

    const inventorySnap = await t.get(inventoryQuery);

    if (inventorySnap.empty) {
      throw new functions.https.HttpsError("resource-exhausted", "Out of Stock");
    }

    const itemDoc = inventorySnap.docs[0];
    const giftCode = itemDoc.data().code;

    // D. Deduct Balance & Mark Code Used
    const newBalance = currentBalance - price;
    
    t.update(userRef, { balance: newBalance });
    t.update(itemDoc.ref, { 
      isUsed: true, 
      usedBy: userId, 
      usedAt: admin.firestore.FieldValue.serverTimestamp() 
    });

    // E. Save Order History
    const orderRef = db.collection("orders").doc();
    t.set(orderRef, {
      userId: userId,
      platform: platform,
      amount: amount,
      price: price,
      code: giftCode, // Saved in history just in case email fails
      date: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, code: giftCode, orderId: orderRef.id };
  })
  .then(async (result) => {
    // F. Send Email (Outside transaction to prevent lag)
    try {
      await transporter.sendMail({
        from: '"GameStore Nepal" <your-email@gmail.com>',
        to: userEmail,
        subject: `Your ${platform} Code: ${result.code}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
            <h2 style="color: #45a29e;">Purchase Successful!</h2>
            <p>Here is your digital code:</p>
            <div style="background: #eee; padding: 15px; font-size: 20px; font-weight: bold; letter-spacing: 2px; text-align: center;">
              ${result.code}
            </div>
            <p><strong>Platform:</strong> ${platform}</p>
            <p><strong>Value:</strong> ${amount}</p>
            <p><strong>Order ID:</strong> ${result.orderId}</p>
            <br/>
            <p style="font-size: 12px; color: #888;">Thank you for gaming with us!</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error("Email failed:", emailError);
      // We don't throw error here because purchase was successful
    }

    return result;
  });
});
