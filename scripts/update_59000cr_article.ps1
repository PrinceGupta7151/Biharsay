$articlesPath = "d:\biharsay\src\data\articles.json"
$articles = Get-Content -Raw -Path $articlesPath -Encoding UTF8 | ConvertFrom-Json

# Remove old corrupted or matching entries
$targetIds = @(
    "59000-crore-heading-to-bihar-and-that-may-not-be-the-biggest-story",
    "59000-crore-heading-to-bihar",
    "%e2%82%b959000-crore-is-heading-to-bihar-and-that-may-not-be-the-biggest-story"
)

$filtered = [System.Collections.Generic.List[Object]]::new()
foreach ($a in $articles) {
    if ($targetIds -contains $a.id) {
        Write-Host "Removing existing matching article: $($a.id)"
    } else {
        $filtered.Add($a)
    }
}

$newArticle = [PSCustomObject]@{
    id = "59000-crore-heading-to-bihar-and-that-may-not-be-the-biggest-story"
    legacyId = 5611
    title = "₹59,000 crore is heading to Bihar — and that may not be the biggest story"
    summary = "Capital is moving into Bihar with Adani Group planning ₹50,000–60,000 crore in infrastructure, Campa Cola investing ₹1,000 crore in Begusarai, and ₹51,600 crore in recent industrial MoUs."
    content = "<h2>₹59,000 Crore Is Heading to Bihar — and That May Not Be the Biggest Story</h2>`n<p><strong>Is Bihar entering a new economic cycle?</strong></p>`n<p>Something big is quietly changing in Bihar.</p>`n<p>For years, one story dominated Bihar’s economy. People left. Bihar to Delhi. Bihar to Mumbai. Bihar to Bengaluru. Bihar to Pune. Young people often had to leave home to find better jobs.</p>`n<p>Now, however, another story is taking shape. <strong>Capital is moving into Bihar.</strong></p>`n<p>Large companies are showing interest in the state. New factories are coming up. Big infrastructure projects are taking shape. Investment proposals are also growing.</p>`n<p>The numbers are hard to ignore:</p>`n<ul>`n  <li>The <strong>Adani Group</strong> has announced plans to invest around <strong>₹50,000–60,000 crore</strong> in Bihar over the next three to four years, covering power, roads, logistics, cement, and infrastructure.</li>`n  <li><strong>Reliance Consumer Products</strong>, through its Campa Cola business, is investing around <strong>₹1,000 crore</strong> in a bottling plant in Begusarai.</li>`n  <li>In August 2026, Bihar signed investment MoUs worth around <strong>₹51,600 crore</strong> across sectors such as steel, textiles, food processing, pharmaceuticals, and nuclear energy.</li>`n</ul>`n<p>These are separate announcements, not one single ₹59,000-crore investment package. Still, together, they point towards something much more interesting: <strong>businesses are starting to take Bihar seriously.</strong></p>`n<h2>Why Are Businesses Looking at Bihar Now?</h2>`n<p>Large companies do not invest thousands of crores based only on sentiment. They look for markets, resources, and future growth. Bihar has all three.</p>`n<p>First, the state has a huge population—a large potential consumer market with rising incomes and changing consumption patterns. Bihar also has a large workforce ready to support new factories, warehouses, and businesses. Moreover, improved roads and transport links make moving people and goods easier.</p>`n<p>The state’s location between eastern and northern India allows businesses to reach multiple critical markets. Most importantly, Bihar still has enormous room to grow: instead of fighting for existing demand, businesses can help create new demand.</p>`n<h2>The Adani Investment Could Change the Conversation</h2>`n<p>The Adani Group’s investment plan stands out because of its size. The group has announced plans to invest ₹50,000–60,000 crore over the next three to four years across power, roads, logistics, gas distribution, cement, and infrastructure.</p>`n<p>One major project involves a <strong>2,400 MW thermal power plant at Pirpainti in Bhagalpur district</strong>. Better power supply helps factories operate reliably, and improved logistics reduces transit costs. Over time, these links create a wider business network for local suppliers, transport companies, and construction workers.</p>`n<h2>Campa Cola Brings Another Kind of Investment</h2>`n<p>Reliance Consumer Products plans to invest around <strong>₹1,000 crore</strong> in a bottling plant in the BIADA area of Begusarai. Reports indicate capacity to produce around <strong>200 million bottles annually</strong> and create more than <strong>1,500 direct and indirect jobs</strong>.</p>`n<p>This connects a major consumer brand with a growing local market, demonstrating that Bihar’s opportunity is not limited to heavy industry. Consumer businesses are entering as well, reinforcing the economic cycle.</p>`n<h2>₹51,600 Crore in MoUs Adds Another Signal</h2>`n<p>In August, Bihar signed MoUs worth around ₹51,600 crore across steel, nuclear energy, textiles, food processing, and pharmaceuticals. Notable proposals include:</p>`n<ul>`n  <li><strong>Global Renewable Advanced Clean Energy:</strong> ₹22,500-crore nuclear energy project</li>`n  <li><strong>Nakshatra Iron & Steel:</strong> ₹6,836 crore</li>`n  <li><strong>Ankur Steel:</strong> ₹6,000 crore</li>`n  <li><strong>Shri Langta Baba Metals & Power:</strong> ₹5,500 crore</li>`n</ul>`n<p>While MoUs require approvals, funding, and land to become operational factories, the sheer scale signals that the conversation around Bihar has permanently shifted.</p>`n<h2>From Migration to Opportunity</h2>`n<p>For decades, migration shaped Bihar’s economic identity. Now, imagine a different situation: a young person finding a job near home, a local entrepreneur supplying a large factory, a farmer supplying a nearby food-processing unit, and a transport operator securing regular industrial contracts. That is the transformation capital can bring.</p>`n<h2>The Real Opportunity Is Bigger Than the Investment Number</h2>`n<p>It is easy to focus on headlines of ₹50,000 crore or ₹59,000 crore. But the bigger story is the direction of money: <strong>capital is looking east.</strong> When capital enters a region, it brings skills, technology, suppliers, and new business models, creating opportunities for people who previously had to leave.</p>`n<p>Follow Bihar Say at <strong><a href=\"https://www.biharsay.com/\" target=\"_blank\" rel=\"noopener noreferrer\">www.biharsay.com</a></strong> for more regular updates, untold stories, and meaningful developments from Bihar — and become part of our 15K+ community worldwide.</p>"
    category = "Investments & Economic"
    categorySlug = "investments-economic"
    date = "Sep 3, 2026"
    author = "Bihar Say | Amrita"
    imageUrl = "/legacy-images/59000-crore-heading-to-bihar.jpg"
    readTime = "5 min read"
    views = 3120
    isFeatured = false
}

$filtered.Insert(0, $newArticle)

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$json = $filtered | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText($articlesPath, $json, $utf8NoBom)
Write-Host "Updated articles.json successfully with $($filtered.Count) articles!"
