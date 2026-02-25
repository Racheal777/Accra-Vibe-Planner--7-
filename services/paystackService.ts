// This is a global type from the Paystack script
declare var PaystackPop: any;

interface PaymentParams {
    email: string;
    amount: number; // Amount in Cedis
    onSuccess: (reference: { reference: string }) => void;
    onClose: () => void;
}

/**
 * Initiates a Paystack payment.
 * IMPORTANT: The Paystack Public Key must be stored in an environment
 * variable named PAYSTACK_PUBLIC_KEY.
 */
export const initiatePayment = ({ email, amount, onSuccess, onClose }: PaymentParams) => {
    if (typeof PaystackPop === 'undefined' || !PaystackPop) {
        console.error("Paystack JS script not loaded or initialized.");
        alert("Payment service is currently unavailable. Please check your connection and try again.");
        return;
    }

    const paystackPublicKey = process.env.PAYSTACK_PUBLIC_KEY;

    if (!paystackPublicKey) {
        console.error("Paystack Public Key is not configured in environment variables.");
        alert("Payment service is not configured. Please contact support.");
        return;
    }
    
    const handler = PaystackPop.setup({
        key: paystackPublicKey,
        email: email,
        amount: amount * 100, // Paystack expects the amount in the smallest currency unit (pesewas)
        currency: 'GHS',
        ref: '' + Math.floor((Math.random() * 1000000000) + 1), // Generate a unique reference
        callback: onSuccess,
        onClose: onClose,
    });
    
    handler.openIframe();
};