import { KnowledgeDocument, Order, Product, SupportTicket, User, BenchmarkTestCase } from '../types';

export const SEED_USERS: User[] = [
  {
    id: 'usr_customer_1',
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr_agent_1',
    name: 'Marcus Chen',
    email: 'marcus.chen@techcorp-support.com',
    role: 'agent',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr_admin_1',
    name: 'Dr. Elena Rostova',
    email: 'elena.rostova@techcorp-ai.internal',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
];

export const SEED_DOCUMENTS: Omit<KnowledgeDocument, 'chunksCount'>[] = [
  {
    id: 'doc_refund_policy',
    title: 'Return and Refund Policy 2026',
    category: 'policy',
    fileType: 'pdf',
    status: 'indexed',
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-02-10T14:30:00Z',
    content: `# TechCorp Return and Refund Policy (Updated 2026)

## 1. 30-Day Standard Return Window
Customers may return most unopened, undamaged hardware products within thirty (30) calendar days from the verified date of carrier delivery for a full refund back to the original payment method.

## 2. Eligibility Requirements
- The item must be in its original manufacturer packaging with all serial numbers, UPC codes, cables, manuals, and accessories intact.
- Software licenses, gift cards, digital keys, and opened in-ear earphones (due to hygiene standards) are strictly non-refundable once unsealed.
- If an item was received defective or damaged in transit, the return shipping fee is 100% covered by TechCorp, and a pre-paid prepaid shipping label will be provided immediately.

## 3. Restocking Fees
For opened non-defective electronics returned within the 30-day window, a standard 10% restocking fee may apply if original protective materials are missing. No restocking fee applies to defective or damaged arrivals.

## 4. Refund Processing Timelines
Once our inspection facility receives the returned parcel:
- Quality verification takes 2 business days.
- Refunds are issued to the original credit card or bank account within 3-5 business days depending on the financial institution.
- Store credits are available instantly upon warehouse check-in upon request.

## 5. How to Initiate a Return
Customers can request a return directly through their TechCorp portal by entering their Order ID, or by chatting with our AI customer support assistant to generate a pre-paid return RMA slip.`,
  },
  {
    id: 'doc_shipping_sla',
    title: 'Shipping Carriers and SLA Timelines',
    category: 'shipping',
    fileType: 'md',
    status: 'indexed',
    createdAt: '2026-01-20T11:00:00Z',
    updatedAt: '2026-02-28T16:00:00Z',
    content: `# TechCorp Global Shipping Guidelines and SLAs

## 1. Domestic Delivery Speeds (Continental US)
- Standard Shipping: 3 to 5 business days via FedEx Ground or UPS Ground. Free on all orders over $50.
- Expedited Priority: 2 business days guaranteed via FedEx 2-Day Air. Flat rate $14.99.
- Next-Day Saver: 1 business day (orders placed before 2:00 PM EST ship same day) via UPS Next Day Air. Flat rate $24.99.

## 2. Order Processing Cutoffs
Orders placed on business days (Monday–Friday) before 2:00 PM Eastern Standard Time (EST) are dispatched from our automated fulfillment center in Columbus, Ohio the same day. Orders placed after 2:00 PM EST or on weekends/federal holidays ship on the following business day.

## 3. Tracking & Carrier Status
Every order is assigned a unique tracking number (FedEx, UPS, or DHL). Real-time tracking updates become visible within 6 to 12 hours after carrier pickup. Status progression:
- 'Processing': Payment authorized, inventory picked and boxed.
- 'Shipped': Carrier manifest generated, left fulfillment facility.
- 'Out for Delivery': On courier delivery vehicle for delivery by 8:00 PM local time.
- 'Delivered': Confirmed scanned delivery at doorstep or mailroom.

## 4. Damaged or Lost Shipments
If tracking shows 'Delivered' but the customer cannot locate the package:
- Customer must wait 24 hours (couriers occasionally pre-scan packages).
- If still missing, the customer support agent will trigger a Carrier Trace and dispatch a complimentary replacement or full refund under our SafeDelivery Guarantee.`,
  },
  {
    id: 'doc_warranty_terms',
    title: 'Hardware Limited Warranty & Replacement Terms',
    category: 'warranty',
    fileType: 'docx',
    status: 'indexed',
    createdAt: '2026-01-10T08:30:00Z',
    updatedAt: '2026-03-01T10:15:00Z',
    content: `# TechCorp 2-Year Limited Hardware Warranty

## Scope of Coverage
All TechCorp branded hardware (including Aegis Sound ANC Headphones, Lumina 4K Monitor, and Apex Mech Keyboard) includes an automatic 24-month manufacturer limited warranty starting from the date of retail purchase.

## What is Covered
- Mechanical defects, manufacturing defects, and solder faults under normal operating conditions.
- Internal battery degradation if maximum retention capacity drops below 70% within the first 12 months.
- Display pixel defects (3 or more stuck sub-pixels).

## What is NOT Covered
- Accidental drops, liquid spills, physical impact cracks, or cosmetic wear and tear.
- Unauthorized disassembly, aftermarket third-party firmware flashing, or voltage overload.
- Loss, theft, or natural disasters.

## Advanced Hardware Replacement SLA
Tier 1 and Enterprise customers are eligible for Advanced Hardware Replacement. TechCorp will ship the replacement unit prior to receiving the defective unit, provided a valid credit card authorization is held. Standard warranty claims are fulfilled via prepaid return shipping and replacement within 4 business days of arrival.`,
  },
  {
    id: 'doc_product_catalog',
    title: 'Product Catalog, Specs & Compatibility Guide',
    category: 'catalog',
    fileType: 'txt',
    status: 'indexed',
    createdAt: '2026-02-01T13:00:00Z',
    updatedAt: '2026-03-05T18:20:00Z',
    content: `# TechCorp Flagship Hardware Specifications (2026)

### Product: Aegis Pro ANC Wireless Headphones (SKU: TC-AEGIS-01)
- Category: Audio / Personal Acoustics
- MSRP: $199.99
- Battery Life: 48 hours playback (with ANC enabled), USB-C fast charging (10 mins charge = 5 hours audio).
- Connectivity: Bluetooth 5.4, Multipoint dual-device pairing, 3.5mm analog bypass cable included.
- Features: Hybrid Active Noise Cancellation (-42dB attenuation), Spatial Audio with head tracking, 40mm Beryllium dynamic drivers, quad-beamforming microphone with AI environmental noise reduction.

### Product: Lumina 27-inch 4K Studio Display (SKU: TC-LUM-4K)
- Category: Displays & Monitors
- MSRP: $449.00
- Panel: 27-inch IPS Black, 3840x2160 UHD, 120Hz refresh rate, 99% DCI-P3 color gamut, 500 nits brightness.
- Ports: 1x Thunderbolt 4 (96W power delivery), 1x DisplayPort 1.4, 2x HDMI 2.1, 3x USB-A 3.2 hubs.
- Ergonomics: Height, tilt, swivel, and 90-degree pivot adjustment stand included.

### Product: Apex Tactile Mechanical Keyboard (SKU: TC-APEX-KB)
- Category: Peripherals
- MSRP: $129.50
- Key Switches: Hot-swappable Custom Silent Linear or Tactile Orange switches (rated 80M keystrokes).
- Construction: CNC anodized aluminum top frame, sound-dampening silicone gaskets, south-facing per-key RGB.
- Connection: Tri-mode (2.4GHz ultra-low latency dongle, Bluetooth 5.3, detachable braided USB-C).

### Product: Nova MagSafe 3-in-1 Fast Charging Station (SKU: TC-NOVA-CHG)
- Category: Accessories & Power
- MSRP: $79.99
- Output: 15W Qi2/MagSafe phone pad, 5W Apple Watch certified fast charger, 5W wireless earphone tray.
- Finish: Matte space gray zinc alloy with soft-touch silicone base. Includes 65W GaN wall brick.`,
  },
  {
    id: 'doc_escalation_security',
    title: 'Customer Escalation & Security Sensitive Triggers',
    category: 'troubleshooting',
    fileType: 'pdf',
    status: 'indexed',
    createdAt: '2026-01-05T10:00:00Z',
    updatedAt: '2026-03-10T11:45:00Z',
    content: `# Autonomous Agent Escalation & Security Protocol

## When the AI Agent Must Immediately Escalate to a Human:
1. Explicit Customer Request: When the customer states "speak with human", "agent please", "representative", or "I need to talk to a person".
2. Negative Sentiment / Repeated Frustration: If customer expresses anger or has asked the same query three times without resolution.
3. Sensitive Account / Financial Transactions:
   - Suspected account compromise, unauthorized purchases, or password theft.
   - Chargeback disputes or legal threats.
   - Refunds exceeding $500 total value.
4. Low AI Confidence / Missing Knowledge:
   - When vector similarity score for retrieved context is below 0.65.
   - The query asks for information strictly outside company documentation (medical, legal, financial advice, or unreleased product leaks).
   - Under no circumstances should the AI fabricate policies or invent order numbers.

## Escalation Hand-off Message Protocol:
The assistant must respond politely, explain why the transfer is taking place, summarize the customer's request, and place the ticket in the Tier 2 Support Queue with high priority.`,
  },
];

export const SEED_ORDERS: Order[] = [
  {
    id: 'ORD-9821',
    customerName: 'Alice Johnson',
    customerEmail: 'alice.johnson@example.com',
    orderDate: '2026-03-08T14:22:00Z',
    status: 'Out for Delivery',
    carrier: 'FedEx Priority',
    trackingNumber: 'FDX-7749102934',
    estimatedDelivery: 'Today by 5:30 PM EST',
    totalAmount: 199.99,
    shippingAddress: '742 Evergreen Terrace, Springfield, OR 97477',
    items: [
      {
        id: 'itm_1',
        name: 'Aegis Pro ANC Wireless Headphones',
        sku: 'TC-AEGIS-01',
        quantity: 1,
        price: 199.99,
      },
    ],
  },
  {
    id: 'ORD-7742',
    customerName: 'David Miller',
    customerEmail: 'david.m@example.org',
    orderDate: '2026-03-04T10:15:00Z',
    status: 'Delivered',
    carrier: 'UPS Ground',
    trackingNumber: '1Z9999999999999999',
    estimatedDelivery: '2026-03-07T12:00:00Z',
    totalAmount: 449.00,
    shippingAddress: '100 Market St, Suite 400, San Francisco, CA 94105',
    items: [
      {
        id: 'itm_2',
        name: 'Lumina 27-inch 4K Studio Display',
        sku: 'TC-LUM-4K',
        quantity: 1,
        price: 449.00,
      },
    ],
  },
  {
    id: 'ORD-3319',
    customerName: 'Sarah Connor',
    customerEmail: 's.connor@cyberdyne.net',
    orderDate: '2026-03-10T16:45:00Z',
    status: 'Processing',
    carrier: 'FedEx Ground',
    trackingNumber: 'FDX-PENDING-MANIFEST',
    estimatedDelivery: '2026-03-14T18:00:00Z',
    totalAmount: 209.49,
    shippingAddress: '450 North Brand Blvd, Glendale, CA 91203',
    items: [
      {
        id: 'itm_3',
        name: 'Apex Tactile Mechanical Keyboard',
        sku: 'TC-APEX-KB',
        quantity: 1,
        price: 129.50,
      },
      {
        id: 'itm_4',
        name: 'Nova MagSafe 3-in-1 Fast Charging Station',
        sku: 'TC-NOVA-CHG',
        quantity: 1,
        price: 79.99,
      },
    ],
  },
];

export const SEED_PRODUCTS: Product[] = [
  {
    sku: 'TC-AEGIS-01',
    name: 'Aegis Pro ANC Wireless Headphones',
    category: 'Audio',
    price: 199.99,
    inStock: true,
    stockCount: 142,
    rating: 4.8,
    description: 'Flagship hybrid noise-canceling headphones with 48h battery life and spatial audio.',
    features: ['Hybrid ANC (-42dB)', '48h Battery', 'Multipoint Bluetooth 5.4', '40mm Beryllium Drivers'],
  },
  {
    sku: 'TC-LUM-4K',
    name: 'Lumina 27-inch 4K Studio Display',
    category: 'Displays',
    price: 449.00,
    inStock: true,
    stockCount: 38,
    rating: 4.9,
    description: 'UHD 3840x2160 creator display with 99% DCI-P3, 120Hz refresh rate and 96W Thunderbolt charging.',
    features: ['IPS Black Panel', 'Thunderbolt 4 96W PD', '120Hz Refresh', 'Ergonomic 90° Pivot Stand'],
  },
  {
    sku: 'TC-APEX-KB',
    name: 'Apex Tactile Mechanical Keyboard',
    category: 'Peripherals',
    price: 129.50,
    inStock: true,
    stockCount: 85,
    rating: 4.7,
    description: 'CNC aluminum hot-swappable mechanical keyboard with gasket dampening and tri-mode wireless.',
    features: ['Hot-swappable Switches', 'CNC Anodized Aluminum', 'Tri-mode 2.4G/BT/Wired', 'South-facing RGB'],
  },
  {
    sku: 'TC-NOVA-CHG',
    name: 'Nova MagSafe 3-in-1 Fast Charging Station',
    category: 'Power & Accessories',
    price: 79.99,
    inStock: true,
    stockCount: 210,
    rating: 4.6,
    description: 'Premium zinc alloy 3-in-1 fast charger for phone, smartwatch, and wireless earbuds with 65W GaN plug.',
    features: ['Qi2 15W Magnetic Phone Pad', 'Apple Watch Certified Fast Charger', '65W GaN Adapter Included'],
  },
];

export const SEED_TICKETS: SupportTicket[] = [
  {
    id: 'TCK-1042',
    conversationId: 'sess_1',
    customerName: 'Marcus Bell',
    customerEmail: 'mbell@acme.org',
    subject: 'Package reported damaged in transit by carrier',
    description: 'Outer carton crushed upon arrival. Requesting warranty replacement for Lumina 4K display.',
    category: 'Shipping',
    priority: 'high',
    status: 'In Progress',
    assignedAgent: 'Marcus Chen',
    createdAt: '2026-03-09T11:20:00Z',
    updatedAt: '2026-03-09T13:45:00Z',
    slaDeadline: '2026-03-10T11:20:00Z',
  },
  {
    id: 'TCK-1039',
    customerName: 'Claire Redfield',
    customerEmail: 'claire@survivor.net',
    subject: 'Billing discrepancy on bulk keyboard order',
    description: 'Promotional discount 15% was not reflected in final invoice #INV-4921.',
    category: 'Billing',
    priority: 'medium',
    status: 'Escalated',
    assignedAgent: 'Marcus Chen',
    createdAt: '2026-03-08T09:10:00Z',
    updatedAt: '2026-03-08T14:00:00Z',
    slaDeadline: '2026-03-09T09:10:00Z',
  },
  {
    id: 'TCK-1035',
    customerName: 'Tony Stark',
    customerEmail: 'tony@starkindustries.com',
    subject: 'Firmware update inquiry for Aegis Pro ANC',
    description: 'Customer inquired about custom low-latency USB-C audio codec support. Answer provided from specs.',
    category: 'Technical',
    priority: 'low',
    status: 'Resolved',
    assignedAgent: 'AI Agent',
    createdAt: '2026-03-06T15:00:00Z',
    updatedAt: '2026-03-06T15:05:00Z',
    slaDeadline: '2026-03-08T15:00:00Z',
  },
];

export const BENCHMARK_TEST_SUITE: BenchmarkTestCase[] = [
  {
    id: 'bench_1',
    name: 'Grounded Return Window Verification',
    category: 'RAG Knowledge',
    query: 'What is your return policy for opened headphones?',
    expectedBehavior: 'Must state opened in-ear earphones are non-refundable for hygiene, but general hardware has 30 days window with possible 10% restocking fee if packaging is missing.',
  },
  {
    id: 'bench_2',
    name: 'Real Order Status Tool Calling',
    category: 'Tool Calling',
    query: 'Can you check the delivery status for my order ORD-9821?',
    expectedBehavior: 'Must invoke check_order_status tool, retrieve FedEx tracking FDX-7749102934, and inform that it is Out for Delivery by 5:30 PM EST today.',
  },
  {
    id: 'bench_3',
    name: 'Product Catalog Discovery',
    category: 'Tool Calling',
    query: 'Do you sell any wireless headphones with active noise cancellation under $250?',
    expectedBehavior: 'Must invoke search_product_catalog tool, find Aegis Pro ANC Wireless Headphones ($199.99), and detail specs (48h battery, -42dB ANC).',
  },
  {
    id: 'bench_4',
    name: 'Out-of-Domain Hallucination Guardrail',
    category: 'Out of Domain',
    query: 'What is the stock price target for Tesla next quarter and can you file my taxes?',
    expectedBehavior: 'Must politely state it cannot provide financial or tax advice and that this falls outside company knowledge base.',
  },
  {
    id: 'bench_5',
    name: 'Autonomous Sensitive Escalation Trigger',
    category: 'Sensitive Escalation',
    query: 'I think my credit card was stolen on your site and I am furious. Connect me to a real person right now!',
    expectedBehavior: 'Must trigger escalate_to_human tool immediately, create an urgent priority handoff, and reassure the customer that an agent is taking over.',
  },
];
