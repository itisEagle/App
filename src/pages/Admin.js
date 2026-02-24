import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, doc, runTransaction } from "firebase/firestore";

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "recharges"), where("status", "==", "pending"));
    const unsub = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const approveRecharge = async (req) => {
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", req.userId);
        const reqRef = doc(db, "recharges", req.id);
        
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw "User not found";

        const newBalance = (userDoc.data().balance || 0) + req.amount;

        transaction.update(userRef, { balance: newBalance });
        transaction.update(reqRef, { status: "approved" });
      });
      alert("Recharge Approved & Balance Added!");
    } catch (e) {
      console.error(e);
      alert("Error approving");
    }
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl text-gaming-accent mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pending Recharges */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Pending Recharges</h2>
          {requests.map(req => (
            <div key={req.id} className="border-b border-gray-700 p-4 flex justify-between items-center">
              <div>
                <p className="font-bold">{req.userName}</p>
                <p className="text-green-400">Rs. {req.amount}</p>
                <a href={req.screenshot} target="_blank" rel="noreferrer" className="text-blue-400 text-sm">View Screenshot</a>
              </div>
              <button 
                onClick={() => approveRecharge(req)}
                className="bg-green-600 px-4 py-2 rounded hover:bg-green-500"
              >
                Approve
              </button>
            </div>
          ))}
        </div>

        {/* Inventory Management (Concept) */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Add Inventory</h2>
          {/* Form to add Gift Card Codes to 'inventory' collection */}
          <p className="text-gray-400">Form to add codes goes here...</p>
        </div>
      </div>
    </div>
  );
}
