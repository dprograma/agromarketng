export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  author: string
  authorRole: string
  date: string
  category: string
  readTime: string
  content: string
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'future-smart-farming-nigeria',
    title: 'The Future of Smart Farming in Nigeria: Technology Meets Agriculture',
    excerpt:
      'Discover how Nigerian farmers are leveraging IoT sensors, drones, and data analytics to increase yields and reduce costs.',
    author: 'AgroMarket Team',
    authorRole: 'Editorial',
    date: 'January 3, 2026',
    category: 'Technology',
    readTime: '6 min read',
    content: `
Nigeria's agricultural sector employs over 36 percent of the country's workforce, yet productivity per hectare remains significantly below global averages. That gap is closing fast, driven by affordable mobile technology and a new generation of farmers who are willing to embrace data-driven methods.

## IoT Sensors on the Farm

Low-cost soil moisture sensors are now available for under ₦15,000 and can connect to a farmer's smartphone via Bluetooth. A smallholder in Benue State who previously relied entirely on visual inspection to decide when to irrigate can now receive automatic alerts the moment soil moisture drops below an optimal threshold. The result is a typical 20–30 percent reduction in water usage and a measurable improvement in crop uniformity at harvest.

Temperature and humidity sensors serve a similar role in storage. Post-harvest losses account for an estimated 40 percent of Nigeria's food output annually. A ₦25,000 sensor kit installed in a grain store, paired with a simple fan and alert system, can extend safe storage life significantly and preserve the farmer's ability to wait for better market prices.

## Drones for Crop Monitoring

Commercial drone services have reached states like Kaduna, Oyo, and Anambra. For roughly ₦5,000 per hectare, a farmer can get an aerial NDVI (Normalized Difference Vegetation Index) map showing which parts of a field are under-performing — information that would otherwise require walking every row and takes only minutes to generate from the air. Several cooperatives in the North-West are sharing drone contracts to reduce per-member costs.

## Data Analytics and Market Prices

Perhaps the most immediately actionable technology is price data. Platforms like AgroMarket NG aggregate buying and selling prices across the country in real time, so a cassava farmer in Cross River State can compare Lagos, Abuja, and Onitsha prices before committing to a local buyer. Historically, information asymmetry heavily favoured middlemen. That advantage is eroding.

## Getting Started

You do not need to adopt every technology at once. Start with the simplest: a free Google Sheet to record your input costs and selling prices each season. Once you know your numbers, the decision about where to invest — a soil sensor, a drone survey, or a marketplace listing — becomes much clearer.
    `.trim(),
  },
  {
    slug: 'crop-rotation-tips',
    title: '10 Essential Tips for Successful Crop Rotation',
    excerpt:
      'Maximize your harvest and maintain soil health with these proven crop rotation strategies used by successful Nigerian farmers.',
    author: 'Dr. Chika Okafor',
    authorRole: 'Agronomist',
    date: 'December 28, 2025',
    category: 'Farming Tips',
    readTime: '7 min read',
    content: `
Crop rotation is one of the oldest and most reliable methods for maintaining soil fertility and reducing pest pressure without expensive inputs. Nigerian farmers who rotate well consistently outperform those who plant the same crop on the same land year after year.

## 1. Alternate Legumes with Cereals

Legumes (cowpea, groundnut, soybean) fix atmospheric nitrogen into the soil. Following them with a nitrogen-hungry cereal like maize or sorghum means the next season's fertiliser bill can be reduced by up to 30 percent.

## 2. Know Your Root Depths

Deep-rooted crops like cassava pull nutrients from lower soil horizons that shallow-rooted vegetables cannot reach. Rotating between deep and shallow-rooted crops makes full use of the soil profile.

## 3. Break Pest and Disease Cycles

Many soil-borne pathogens and insect pests are host-specific. Moving to a different crop family interrupts their reproductive cycle. Fusarium wilt, which devastates continuous tomato plots, cannot survive without a host. A single season of maize is enough to collapse the pathogen population.

## 4. Plan Three Seasons Ahead

Write out a three-year rotation plan before planting season. This prevents accidental repetition and makes input purchasing easier to plan.

## 5. Group Crops by Family

Avoid placing crops from the same botanical family back to back. Tomato and pepper are both Solanaceae — rotating one for the other does not break disease cycles.

## 6. Include a Green Manure Season

If a plot is exhausted, plant Mucuna (velvet bean) or Tithonia and incorporate it into the soil before it sets seed. The organic matter and nutrient return can revive tired land in a single season.

## 7. Adjust for Your Zone

Rotation schedules differ between the humid South and the drier North. In the South, where two to three seasons are possible per year, a two-year rotation completes faster. In the North, a two-year rotation may span four or five calendar years.

## 8. Keep Records

A hand-drawn field map with crop and date notes is enough. Farmers who keep records rotate more accurately and catch mistakes before they become expensive.

## 9. Use Cover Crops in the Off-Season

Rather than leaving land bare, plant a fast-growing cover crop like cowpea or Sudan grass during the dry season. It protects soil structure, suppresses weeds, and adds organic matter.

## 10. Rotate Livestock Too

If you run mixed farming, move animal pens seasonally. The manure deposit naturally fertilises the next planting area and reduces the parasite load in the permanent pen site.
    `.trim(),
  },
  {
    slug: 'pricing-agricultural-products',
    title: 'How to Price Your Agricultural Products Competitively',
    excerpt:
      'Learn the art and science of pricing your produce for maximum profit while staying competitive in the marketplace.',
    author: 'Emmanuel Adeyemi',
    authorRole: 'Agricultural Economist',
    date: 'December 20, 2025',
    category: 'Business',
    readTime: '5 min read',
    content: `
Pricing is where most smallholder farmers leave money on the table. The default approach — sell at whatever the local buyer offers — ignores the real cost of production and the true market price. A structured pricing approach can add tens of thousands of naira to your income each season without changing anything else on the farm.

## Calculate Your Cost of Production First

Before setting a price, know what it costs you to produce one kilogram or one bag. Add up:

- Seed or planting material
- Fertiliser and agrochemicals
- Labour (including your own time at a fair daily rate)
- Transport to market
- Storage costs if you are holding inventory

Divide the total by your expected yield. That is your break-even price. Never sell below it.

## Research Current Market Prices

Check prices on AgroMarket NG and in at least two physical markets before selling. Prices for the same commodity can vary by 30–50 percent between a rural collection point and a city wholesale market. If the price difference exceeds your transport cost, move the product yourself.

## Time Your Sales

Prices for most staples in Nigeria follow a predictable seasonal pattern. Maize, for example, is cheapest at harvest (September–October) and most expensive before the new harvest (June–August). Farmers with storage can capture a significant premium simply by waiting two to three months.

## Grade and Present Your Product

Buyers pay more for clean, sorted, uniformly sized produce. Investing an extra hour to remove damaged items and present your goods in consistent bags or crates can increase your selling price by 10–15 percent on the same commodity.

## Negotiate in Writing

For bulk sales, get the agreed price and quantity in writing — even a WhatsApp message counts. Verbal agreements are frequently revised downward at delivery, especially when buyers know a farmer is under pressure to sell quickly.

## List on AgroMarket NG

Listing your surplus on AgroMarket NG exposes it to buyers beyond your immediate geography. A buyer in Lagos seeing your Borno State groundnuts may offer a price no local intermediary would match.
    `.trim(),
  },
  {
    slug: 'organic-farming-guide',
    title: 'Organic Farming: Is It Right for Your Business?',
    excerpt:
      'Explore the benefits, challenges, and profitability of transitioning to organic farming methods in Nigeria.',
    author: 'Fatima Hassan',
    authorRole: 'Sustainable Agriculture Consultant',
    date: 'December 15, 2025',
    category: 'Sustainable Farming',
    readTime: '6 min read',
    content: `
Organic farming is growing rapidly in Nigeria, driven by export demand from Europe and the Middle East and by a domestic consumer segment willing to pay a premium for residue-free food. But organic certification is not for everyone. Here is an honest look at whether the transition makes sense for your operation.

## What Does "Organic" Actually Mean?

In Nigeria, "organic" most commonly means farming without synthetic fertilisers, pesticides, or herbicides. Certified organic farming goes further: it requires documented soil management, approved input lists, and third-party inspection. Certification bodies active in Nigeria include ECOCERT, ControlUnion, and the Organic Agriculture Project of Nigeria (OAPN).

## The Financial Reality

Organic premiums in export markets run 20–40 percent above conventional prices. Domestically, organic premium markets exist in Lagos, Abuja, and Port Harcourt, primarily in supermarkets serving upper-income consumers and expatriates.

However, transitioning typically takes three years — during which you bear organic management costs without being able to claim the premium. Yields may drop 15–25 percent in the first two seasons as the soil microbiome adjusts. The economics only work if you have committed buyers lined up before you transition.

## Crops With the Best Organic Potential in Nigeria

- **Sesame (Beniseed)**: Very strong export demand for certified organic sesame, particularly to Japan and Germany. Nigeria is already a major sesame exporter.
- **Shea nuts**: International cosmetics companies pay premium for traceable, sustainably harvested shea. Several companies accept organic equivalence standards without full certification.
- **Vegetables for urban markets**: Baby leaf vegetables, herbs, and cherry tomatoes for Lagos and Abuja hotels and restaurants.
- **Cocoa**: Premium organic cocoa commands significant export premiums and several NGOs offer transitional support.

## Practical First Steps

If you want to explore organic farming, start by removing synthetic pesticides from a small test plot while maintaining fertility with compost and green manure. Document every input. Find a potential buyer who will pay the organic premium before expanding. Do not invest in certification until you have confirmed market access.
    `.trim(),
  },
  {
    slug: 'crop-protection-guide',
    title: 'Protecting Your Crops from Common Pests and Diseases in Nigeria',
    excerpt:
      'Identify, prevent, and treat the most common crop threats with our comprehensive pest and disease management guide.',
    author: 'Dr. Chika Okafor',
    authorRole: 'Agronomist',
    date: 'December 10, 2025',
    category: 'Crop Management',
    readTime: '8 min read',
    content: `
Pest and disease losses are estimated to reduce Nigerian crop yields by 20–40 percent annually. Early identification and integrated management can recover most of that loss without excessive chemical inputs.

## Maize: Fall Armyworm

Fall Armyworm (Spodoptera frugiperda) arrived in West Africa in 2016 and is now the most destructive maize pest on the continent. Look for ragged holes in the whorl of young plants and dark frass (caterpillar droppings) in the leaf axils. At first infestation, apply sand or ash into the whorl. For severe attacks, approved biopesticides (Bt-based products) are effective and registered in Nigeria.

## Tomato: Early and Late Blight

Both blights are fungal diseases that spread rapidly in humid conditions. Early blight (Alternaria solani) appears as dark brown spots with concentric rings on lower leaves. Late blight (Phytophthora infestans) causes water-soaked lesions that spread within days. Prevention is far more effective than cure: use certified disease-free seeds, space plants to allow airflow, and avoid overhead irrigation. Apply copper-based fungicides preventatively at the start of the rainy season.

## Cassava: Mosaic Virus

Cassava mosaic disease is transmitted by whiteflies and causes yellow, distorted leaves and yield losses of 20–80 percent. Use certified virus-free cuttings from IITA or state agricultural development programmes. If infected plants appear, remove and burn them immediately to prevent whitefly spread.

## Cowpea: Aphids and Pod Borers

Aphids cluster on growing tips and undersides of young leaves, causing curling and stunting. A simple soapy water spray (50ml liquid soap per 10 litres water) controls light infestations. Maruca pod borer is the most damaging cowpea pest — plant early-maturing varieties where possible to reduce exposure.

## General Prevention Principles

1. **Use certified seeds**: Most disease-resistant varieties are available through NASC-accredited seed companies.
2. **Practise field hygiene**: Remove crop debris after harvest. It harbours overwintering pests and disease spores.
3. **Scout regularly**: Walk your fields twice a week during the growing season. Early detection is worth more than any chemical.
4. **Rotate crops**: As covered in our crop rotation guide, rotation disrupts host-specific pest populations.
5. **Record every spray**: Know what you applied, when, and whether it worked. This prevents inappropriate repeat applications and helps you refine your programme.
    `.trim(),
  },
  {
    slug: 'agricultural-loans-guide',
    title: 'Accessing Agricultural Loans in Nigeria: A Complete Guide',
    excerpt:
      'Navigate the process of securing funding for your farm with our complete guide to agricultural loans and grants in Nigeria.',
    author: 'Emmanuel Adeyemi',
    authorRole: 'Agricultural Economist',
    date: 'December 5, 2025',
    category: 'Finance',
    readTime: '7 min read',
    content: `
Access to credit is consistently cited as the number one constraint facing Nigerian farmers. The good news is that more financing options exist today than at any previous time — including several with below-market interest rates specifically designed for agriculture.

## CBN Anchor Borrowers' Programme (ABP)

The Central Bank of Nigeria's Anchor Borrowers' Programme provides loans to smallholder farmers growing specific commodities (rice, maize, cotton, cassava, wheat, and others). Loans are disbursed in kind — inputs are delivered, not cash — and repaid with a portion of the harvest through designated commodity aggregators. Interest rates are subsidised at 9 percent per annum. Apply through your state's Participating Financial Institution (PFI) or through registered Farmers' Associations that serve as aggregators.

## NIRSAL Microfinance Bank

The Nigeria Incentive-Based Risk Sharing System for Agricultural Lending (NIRSAL) operates a dedicated microfinance bank with agricultural loan products. Minimum loan: ₦50,000. Maximum: ₦3 million for smallholders. Interest rate: 9% per annum. Requirements include BVN, a farm plan, and group membership in most cases. Apply online at www.nirsal.com or visit any NIRSAL branch.

## Bank of Agriculture (BOA)

BOA offers medium- and long-term financing for larger agricultural investments including processing equipment, cold storage, and commercial farms. Interest rates range from 10–15 percent. Requirements include a bankable business plan, land documentation, and collateral.

## State Government Programmes

Many state governments run their own agricultural loan and input subsidy programmes. These vary significantly in availability and quality. Contact your State Agricultural Development Programme (ADP) office for current offerings in your state.

## Cooperative Groups

Forming or joining a registered cooperative is the most accessible route to credit for farmers without formal collateral. Cooperatives can access group loans at better terms than individuals and provide internal peer accountability that reduces default risk.

## Preparing a Strong Application

Regardless of which programme you apply to, your application will be stronger with:

- A simple farm business plan (2–3 pages covering your farm size, planned crop, expected costs, and expected revenue)
- Historical production records if available
- Land documentation (Certificate of Occupancy, tenancy agreement, or Customary Right of Occupancy)
- BVN and valid ID
- References from a local farmers' association or cooperative

Start small. A ₦200,000 loan successfully repaid opens the door to ₦2 million the following season.
    `.trim(),
  },
  {
    slug: 'water-conservation-techniques',
    title: 'Water Conservation Techniques for Nigerian Farms',
    excerpt:
      'Implement water-saving strategies that reduce costs and ensure sustainable farming even during dry seasons.',
    author: 'Fatima Hassan',
    authorRole: 'Sustainable Agriculture Consultant',
    date: 'November 28, 2025',
    category: 'Sustainable Farming',
    readTime: '5 min read',
    content: `
Water scarcity is intensifying across Nigeria's Middle Belt and the far North, while erratic rainfall makes even the South less reliable than it was a generation ago. Water conservation is no longer optional — it is essential for farm viability.

## Mulching

Mulching is the single highest-return water conservation practice available to any Nigerian farmer at any scale. Covering the soil around your crops with dry grass, crop residue, or plastic sheeting reduces evaporation from the soil surface by 40–70 percent. On irrigated plots, this directly translates to reduced pump hours and lower fuel costs. Use whatever organic material is available after harvest — maize stalks, rice straw, dried leaves.

## Drip Irrigation

Drip irrigation delivers water directly to the root zone, cutting water consumption by 30–60 percent compared to furrow irrigation. Entry-level drip kits sufficient for 0.1 hectares are available for ₦15,000–₦40,000. They are most cost-effective for high-value crops (vegetables, pepper, onion) where the input saving is recovered within a single season.

## Ridges and Basins

Contour ridges and planting basins slow runoff and allow more rainfall to infiltrate rather than flow away. On sloped land, planting along contour lines rather than up-and-down the slope can double water retention from a single rain event.

## Rainwater Harvesting

A simple 5,000-litre plastic tank, guttering from a storage shed roof, and a collection pipe can capture enough rainwater during the wet season to support a kitchen garden through several dry weeks. Cost: approximately ₦50,000–₦80,000 for basic installation.

## Soil Organic Matter

Soil with high organic matter retains significantly more water than bare, degraded soil. Adding compost, incorporating crop residues, and avoiding deep tillage that breaks up soil structure all improve water-holding capacity. This is a slow intervention — it takes two to three seasons to see measurable improvement — but it is free and compounds over time.

## Scheduling Irrigation at Night

If you use overhead or furrow irrigation, running it at night or in the early morning dramatically reduces evaporation losses compared to midday irrigation. This can reduce your required water volume by 20–25 percent with no equipment changes.

## Deficit Irrigation

Crops do not need maximum water at every growth stage. Research from IITA and other institutions shows that many crops can tolerate mild water stress during vegetative stages with little yield impact, then receive full irrigation during flowering and grain fill. This approach can cut total irrigation water use by 20–30 percent while preserving most of the yield.
    `.trim(),
  },
]

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug)
}
