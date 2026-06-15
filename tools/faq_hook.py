"""MkDocs hooks for JavaJub.

1. on_page_content: detect Q&A pairs ("- **Вопрос?** ... _ответ_") in a page's
   markdown and inject FAQPage JSON-LD, without touching the guide prose.
   FAQ rich results are still used by Yandex (the primary RU search engine),
   so this targets "вопросы собеседования" style queries.

2. on_post_build: enrich the MkDocs-generated sitemap.xml with <priority> and
   <changefreq> so high-value guides/quizzes get more crawl budget.
"""

import gzip
import json
import os
import re

QUESTION_RE = re.compile(r"^\s*[-*]\s+\*\*(.+?)\*\*\s*(.*)$")
MAX_FAQ_PER_PAGE = 40
SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"


def _strip_inline(text):
    text = text.strip()
    text = re.sub(r"^_+|_+$", "", text).strip()
    text = re.sub(r"^Ответ:\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"`([^`]*)`", r"\1", text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)
    text = re.sub(r"\*([^*]+)\*", r"\1", text)
    text = re.sub(r"_([^_]+)_", r"\1", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _extract_answer(lines, start):
    for offset in range(1, 5):
        idx = start + offset
        if idx >= len(lines):
            break
        raw = lines[idx].strip()
        if raw == "":
            continue
        if raw.startswith("```") or raw[:1] in {"#", "|", ">"}:
            break
        if re.match(r"^_.*_$", raw) or re.match(r"^Ответ:", raw, flags=re.IGNORECASE):
            return _strip_inline(raw)
        if 20 <= len(raw) <= 400:
            return _strip_inline(raw)
        break
    return ""


def _extract_faq(markdown):
    lines = markdown.split("\n")
    faqs = []
    seen = set()
    for i, line in enumerate(lines):
        m = QUESTION_RE.match(line)
        if not m:
            continue
        question = _strip_inline(m.group(1))
        if not question.endswith("?") or len(question) < 8:
            continue
        # Inline answer on the same line, else look ahead.
        answer = _strip_inline(m.group(2)) if m.group(2) else ""
        if len(answer) < 12:
            answer = _extract_answer(lines, i)
        if len(answer) < 12:
            continue
        key = question.lower()
        if key in seen:
            continue
        seen.add(key)
        faqs.append((question, answer))
        if len(faqs) >= MAX_FAQ_PER_PAGE:
            break
    return faqs


def on_page_content(html, page, config, files):
    markdown = getattr(page, "markdown", None)
    if not markdown:
        return html
    faqs = _extract_faq(markdown)
    if len(faqs) < 2:
        return html
    data = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "inLanguage": "ru",
        "mainEntity": [
            {
                "@type": "Question",
                "name": q,
                "acceptedAnswer": {"@type": "Answer", "text": a},
            }
            for q, a in faqs
        ],
    }
    script = '<script type="application/ld+json">%s</script>' % json.dumps(
        data, ensure_ascii=False
    )
    return html + "\n" + script


# --------------------------------------------------------------------------- #
# Sitemap enrichment
# --------------------------------------------------------------------------- #

def _priority_for(loc):
    if loc.endswith("/java-sobesedovanie/"):
        return "0.9", "weekly"
    if "/guides/" in loc or "/tasks/" in loc:
        return "0.9", "weekly"
    if "/roadmaps/" in loc:
        return "0.9", "monthly"
    if "/quizzes/" in loc:
        return "0.8", "weekly"
    if loc.rstrip("/").endswith("javajub.com") or loc.endswith("/jobs/"):
        return "0.9", "weekly"
    return "0.6", "monthly"


def _exclude_from_sitemap(loc):
    return loc.endswith("/404/") or loc.endswith("/404.html")


def on_post_build(config):
    site_dir = config["site_dir"]
    sitemap_path = os.path.join(site_dir, "sitemap.xml")
    if not os.path.exists(sitemap_path):
        return
    with open(sitemap_path, "r", encoding="utf-8") as handle:
        xml = handle.read()

    def add_meta(match):
        block = match.group(0)
        loc_match = re.search(r"<loc>(.*?)</loc>", block)
        if not loc_match:
            return block
        loc = loc_match.group(1)
        if _exclude_from_sitemap(loc):
            return ""
        if "<priority>" in block:
            return block
        priority, changefreq = _priority_for(loc)
        insert = "    <changefreq>%s</changefreq>\n    <priority>%s</priority>\n" % (
            changefreq,
            priority,
        )
        return block.replace("</url>", insert + "  </url>")

    xml = re.sub(r"<url>.*?</url>", add_meta, xml, flags=re.DOTALL)

    with open(sitemap_path, "w", encoding="utf-8") as handle:
        handle.write(xml)

    gz_path = sitemap_path + ".gz"
    if os.path.exists(gz_path):
        with gzip.open(gz_path, "wb") as handle:
            handle.write(xml.encode("utf-8"))
