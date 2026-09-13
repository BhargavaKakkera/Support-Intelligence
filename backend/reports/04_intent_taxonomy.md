# Intent Taxonomy (AmazonHelp)

Based on the keyword and bigram analysis of 82,546 first-messages to AmazonHelp, the following 8 intents have been identified.

## 1. Delivery Delay
- **Definition:** Customer expects an order that has not arrived yet but is tracking as delayed, or questioning delivery timeframe.
- **Include:** "next day delivery didn't arrive", "where is my package", "still waiting for delivery"
- **Exclude:** Package is marked as delivered but missing.
- **Typical resolution:** Ask for order details, provide tracking update, or apologize for logistics delay.
- **Automation suitability:** High (can look up status if API exists)
- **Escalation:** Escalate if delayed by more than 5 days.

## 2. Missing/Lost Package
- **Definition:** Package is marked as delivered, but the customer does not have it.
- **Include:** "package says delivered but I didn't get it", "missing package"
- **Exclude:** Package that is just delayed in transit.
- **Typical resolution:** Ask customer to check around house/neighbors, wait 24h, or offer replacement/refund.
- **Automation suitability:** Medium (requires fraud check).
- **Escalation:** High value items or repeated missing claims should be escalated.

## 3. Returns & Refunds
- **Definition:** Questions about returning an item or getting a refund.
- **Include:** "how to return", "where is my refund", "want to cancel and refund"
- **Exclude:** Cancelling an order before it ships (Order Cancellation).
- **Typical resolution:** Provide return label instructions or check refund processing status.
- **Automation suitability:** High.

## 4. Order Cancellation
- **Definition:** Customer wants to cancel an order that hasn't shipped, or accidentally placed an order.
- **Include:** "cancel order", "placed by mistake"
- **Exclude:** Returning an already delivered item.
- **Typical resolution:** Provide link to cancel order if it hasn't shipped.
- **Automation suitability:** High.

## 5. Prime Membership & Billing
- **Definition:** Questions regarding Amazon Prime subscription fees, accidental sign-ups, or benefits.
- **Include:** "charged for prime", "cancel prime membership", "what is this charge"
- **Exclude:** Issues with Amazon Pay or Gift Cards.
- **Typical resolution:** Provide link to manage subscription or offer courtesy refund for unused Prime.
- **Automation suitability:** Medium.
- **Escalation:** Escalate if customer is very angry about unauthorized charges.

## 6. Digital Services (Prime Video / Music)
- **Definition:** Issues streaming Prime Video, Music, or reading Kindle books.
- **Include:** "prime video not working", "can't watch movie"
- **Exclude:** Hardware issues (e.g., Firestick won't turn on).
- **Typical resolution:** Troubleshooting steps, clear cache, or check service outages.
- **Automation suitability:** Medium (troubleshooting tree).

## 7. Hardware & Devices (Echo / Fire TV)
- **Definition:** Technical support for Amazon-branded hardware.
- **Include:** "echo dot won't connect", "fire stick remote broken"
- **Exclude:** General app issues on non-Amazon hardware.
- **Typical resolution:** Hard reset instructions, warranty replacement.
- **Automation suitability:** Medium.

## 8. Payment & Gift Cards
- **Definition:** Issues with Amazon Pay, gift card balances, or payment methods.
- **Include:** "gift card not working", "amazon pay error"
- **Exclude:** Prime membership billing.
- **Typical resolution:** Check account balance, verify payment method.
- **Automation suitability:** Low (sensitive financial data).
- **Escalation:** High (escalate fraud/payment issues).
