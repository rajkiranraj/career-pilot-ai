import { createHmac } from "crypto";

const keyId = "rzp_test_SnIZxBLLUdHiyO";
const keySecret = "11xhkzuwUsByIt1ZkOV8Exzr";

async function test() {
  console.log("Testing Razorpay Order Creation...");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString('base64'),
    },
    body: JSON.stringify({
      amount: 99900,
      currency: "INR",
      receipt: "receipt_test_" + Date.now(),
    }),
  });

  const data = await response.json();
  console.log("Response Status:", response.status);
  console.log("Response Body:", data);
}

test();
