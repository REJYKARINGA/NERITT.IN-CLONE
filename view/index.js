<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            margin: 0;
        }

        /* Common styles for both cursors */
        .cs_cursor_1, .cs_cursor_2 {
            position: absolute;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999; /* Make sure it's above other elements */
            transition: transform 0.2s ease; /* Add a smooth transition effect */
        }

        /* Custom styles for the first cursor */
        .cs_cursor_1 {
            /* Customize the color for the first cursor */
            border: 2px solid #129393; /* Set border color for cursor 1 */
            background-color: transparent; /* Make the background transparent */

            /* Add additional styles as needed */
        }

        /* Custom styles for the second cursor */
        .cs_cursor_2 {
            /* Customize the color for the second cursor */
            background-color: #129393; /* Set background color for cursor 2 */
            width: 8px; /* Set a smaller width for cursor 2 */
            height: 8px; /* Set a smaller height for cursor 2 */
            transition: transform 0.5s ease; /* Slowly transition cursor 2 */
        }

    </style>
</head>
<body>
    <h1>Welcome to Razorpay Integration</h1>
    <form action="/payment" method="POST">
        <script
            src="https://checkout.razorpay.com/v1/checkout.js"
            data-key="YOUR_PUBLIC_KEY"
            data-amount="50000"
            data-currency="INR"
            data-buttontext="Pay with Razorpay"
            data-name="Demo Store"
            data-description="Test Transaction"
            data-image="https://example.com/your_logo.jpg"
            data-order_id="<%= order.id %>"
            data-prefill.name="Your Name"
            data-prefill.email="your_email@example.com"
            data-theme.color="#F37254"
        ></script>
        <input type="hidden" custom="Hidden Element" name="hidden">
    </form>
</body>
</html>
