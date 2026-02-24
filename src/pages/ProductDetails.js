import { useState } from "react";
import { functions } from "../firebase";
import { httpsCallable } from "firebase/functions";
import Swal from "sweetalert2";

export default function ProductDetails({ platform, priceOptions }) {
  const [selectedOption, setSelectedOption] = useState(priceOptions[0]);
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    setLoading(true);
    const buyGiftCard = httpsCallable(functions, 'buyGiftCard');

    try {
      const result = await buyGiftCard({
        platform: platform,
        amount: selectedOption.value, // e.g. "100 Diamonds"
        price: selectedOption.price   // e.g. 150 (Rupees)
      });

      Swal.fire({
        title: "Purchase Successful!",
        text: `Your Code: ${result.data.code}`,
        icon: "success",
        footer: "A copy has been sent to your email."
      });
    } catch (error) {
      Swal.fire("Failed", error.message, "error");
    }
    setLoading(false);
  };

  return (
    <div className="bg-gaming-card p-6 rounded-xl shadow-neon border border-gray-700">
      <h2 className="text-2xl text-gaming-accent font-bold mb-4">{platform}</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        {priceOptions.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedOption(opt)}
            className={`p-3 rounded border ${selectedOption === opt ? 'bg-gaming-highlight border-gaming-accent' : 'border-gray-600'}`}
          >
            {opt.value} <br/> <span className="text-sm">Rs. {opt.price}</span>
          </button>
        ))}
      </div>

      <button
        onClick={handleBuy}
        disabled={loading}
        className="w-full bg-gaming-accent text-black font-bold py-3 rounded shadow-[0_0_15px_rgba(102,252,241,0.5)] hover:shadow-neon transition transform hover:scale-105"
      >
        {loading ? "Processing..." : `Buy Now (Rs. ${selectedOption.price})`}
      </button>
    </div>
  );
}
