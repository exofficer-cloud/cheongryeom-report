// Vercel serverless RSS proxy for Hanion clickTop.xml
const FEED_URL = "https://www.hanion.co.kr/rss/clickTop.xml";

function decodeXml(value = "") {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .trim();
}

function field(xml, tag) {
  const re = new RegExp("<" + tag + "(?:\\s[^>]*)?>([\\s\\S]*?)<\\/" + tag + "\\s*>", "i");
  const match = xml.match(re);
  return match ? decodeXml(match[1]) : "";
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await fetch(FEED_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CheongryeomReport/1.0; +https://cheongryeom-report-sigma.vercel.app/)",
        "Accept": "application/rss+xml, application/xml, text/xml, */*"
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error("원본 RSS 서버 응답 오류: HTTP " + response.status);
    }

    const xml = await response.text();
    if (!/<(?:rss|feed|rdf:RDF)\b/i.test(xml)) {
      throw new Error("원본 주소가 RSS/XML 문서를 반환하지 않았습니다.");
    }

    const items = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item\s*>/gi)]
      .map(match => {
        const entry = match[1];
        const title = field(entry, "title");
        let link = field(entry, "link");
        const pubDate = field(entry, "pubDate") || field(entry, "dc:date") || field(entry, "date");
        if (link && link.startsWith("//")) link = "https:" + link;
        return { title, link, pubDate };
      })
      .filter(item => item.title && item.link)
      .slice(0, 10);

    if (!items.length) {
      throw new Error("RSS에서 표시할 기사 항목을 찾지 못했습니다.");
    }

    return res.status(200).json({ source: FEED_URL, fetchedAt: new Date().toISOString(), items });
  } catch (error) {
    return res.status(502).json({
      error: "RSS 기사를 불러오지 못했습니다.",
      detail: error && error.message ? error.message : "알 수 없는 오류",
      source: FEED_URL
    });
  }
}
