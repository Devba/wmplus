"""Genera .html hermanos para los anexos docs/reports/*.md (trazabilidad).
Uso: python3 docs/reports/build_html.py
Convierte encabezados, listas, tablas pipe y código; sin dependencias.
"""
import html
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
CSS = (
    "body{font-family:Arial,Helvetica,sans-serif;max-width:860px;margin:36px auto;"
    "color:#0f172a;line-height:1.55;padding:0 16px}"
    "h1{font-size:23px;border-bottom:2px solid #1e3a8a;padding-bottom:6px}"
    "h2{font-size:18px;color:#1e3a8a;margin-top:26px}"
    "h3{font-size:15px;color:#334155}"
    "table{border-collapse:collapse;width:100%;font-size:13px;margin:8px 0}"
    "th,td{border:1px solid #94a3b8;padding:4px 8px;text-align:left;vertical-align:top}"
    "th{background:#1e293b;color:#fff}"
    "code{background:#f1f5f9;padding:1px 5px;border-radius:3px;font-size:12.5px}"
    "pre{background:#0f172a;color:#e2e8f0;padding:10px;border-radius:6px;overflow:auto;font-size:12.5px}"
    "pre code{background:none;color:inherit}"
)


def inline(s):
    s = html.escape(s)
    s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
    s = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", s)
    return s


def md_table(block):
    rows = []
    for ln in block:
        cells = [inline(c.strip()) for c in ln.strip().strip("|").split("|")]
        rows.append(cells)
    if len(rows) >= 2 and all(re.match(r"^:?-+:?$", c) for c in
                              [re.sub(r"<[^>]+>", "", x) for x in rows[1]]):
        del rows[1]
    out = ["<table>"]
    for i, r in enumerate(rows):
        tag = "th" if i == 0 else "td"
        out.append("<tr>" + "".join(f"<{tag}>{c}</{tag}>" for c in r) + "</tr>")
    out.append("</table>")
    return "\n".join(out)


def convert(md):
    out = []
    lines = md.split("\n")
    i, in_list, in_pre = 0, False, False
    while i < len(lines):
        ln = lines[i]
        if ln.strip().startswith("```"):
            out.append("</pre>" if in_pre else "<pre><code>")
            in_pre = not in_pre
            i += 1
            continue
        if in_pre:
            out.append(html.escape(ln))
            i += 1
            continue
        if ln.startswith("### "):
            out.append(f"<h3>{inline(ln[4:])}</h3>")
        elif ln.startswith("## "):
            out.append(f"<h2>{inline(ln[3:])}</h2>")
        elif ln.startswith("# "):
            out.append(f"<h1>{inline(ln[2:])}</h1>")
        elif re.match(r"^\s*\|.*\|\s*$", ln):
            block = []
            while i < len(lines) and re.match(r"^\s*\|.*\|\s*$", lines[i]):
                block.append(lines[i])
                i += 1
            out.append(md_table(block))
            continue
        elif re.match(r"^(\d+\.|[-*]) ", ln.strip()):
            if not in_list:
                out.append("<ul>")
                in_list = True
            out.append(f"<li>{inline(re.sub(r'^(\d+\.|[-*]) ', '', ln.strip()))}</li>")
        else:
            if in_list:
                out.append("</ul>")
                in_list = False
            if ln.strip():
                out.append(f"<p>{inline(ln.strip())}</p>")
        i += 1
    if in_list:
        out.append("</ul>")
    return "\n".join(out)


def main():
    for fn in sorted(os.listdir(HERE)):
        if not fn.endswith(".md"):
            continue
        with open(os.path.join(HERE, fn), encoding="utf-8") as f:
            md = f.read()
        title = "Anexo de trazabilidad"
        m = re.search(r"^# (.+)$", md, re.M)
        if m:
            title = m.group(1)
        body = convert(md)
        page = (f"<!DOCTYPE html><html lang=\"es\"><head><meta charset=\"utf-8\">"
                f"<title>{html.escape(title)}</title><style>{CSS}</style></head>"
                f"<body>{body}</body></html>")
        out = os.path.join(HERE, fn[:-3] + ".html")
        with open(out, "w", encoding="utf-8") as f:
            f.write(page)
        print("generado:", os.path.basename(out), len(page), "bytes")


if __name__ == "__main__":
    main()
