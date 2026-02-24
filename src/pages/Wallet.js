import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Swal from "sweetalert2";

export default function Wallet() {
  const { user, userData } = useAuth();
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRecharge = async (e) => {
    e.preventDefault();
    if (!file || !amount) return;
    setLoading(true);

    try {
      // 1. Upload Screenshot
      const storageRef = ref(storage, `receipts/${user.uid}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      // 2. Create Request Doc
      await addDoc(collection(db, "recharges"), {
        userId: user.uid,
        userName: userData.name,
        userEmail: userData.email,
        amount: Number(amount),
        screenshot: url,
        status: "pending",
        date: serverTimestamp()
      });

      Swal.fire("Success", "Recharge request sent! Wait for admin approval.", "success");
      setAmount("");
      setFile(null);
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
    setLoading(false);
  };

  return (
    <div className="p-8 bg-gaming-bg min-h-screen text-gaming-text">
      <h2 className="text-3xl font-bold text-gaming-accent mb-6">My Wallet</h2>
      
      <div className="bg-gaming-card p-6 rounded-xl shadow-neon max-w-md">
        <p className="text-xl mb-4">Current Balance: <span className="text-green-400">Rs. {userData?.balance || 0}</span></p>
        
        <div className="border border-gaming-highlight p-4 rounded mb-4">
          <p className="font-bold text-gaming-accent">eSewa Detail:</p>
          <p>ID: 98XXXXXXXX</p>
          <p>Name: GameStore Nepal</p>
        </div>

        <form onSubmit={handleRecharge} className="space-y-4">
          <input 
            type="number" 
            placeholder="Amount (Rs)" 
            className="w-full p-3 bg-black border border-gaming-highlight rounded text-white"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
          <input 
            type="file" 
            onChange={e => setFile(e.target.files[0])}
            className="text-sm text-gray-400"
          />
          <button 
            disabled={loading}
            className="w-full py-3 bg-gaming-accent text-black font-bold rounded hover:shadow-neon transition"
          >
            {loading ? "Uploading..." : "Submit Payment Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
