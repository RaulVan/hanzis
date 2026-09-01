"""One-time import of the official MOE XLSX, preserving every field and reading.

Usage: python3 scripts/import-moe-data.py /path/to/dict_concised_2014_20260626.zip
Not used by npm build; the checked-in JSON gzip is its reproducible input.
"""
import gzip
import hashlib
import io
import json
import re
import sys
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

source = Path(sys.argv[1])
root = Path(__file__).resolve().parent.parent
ns = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
archive = zipfile.ZipFile(source)
workbook = zipfile.ZipFile(io.BytesIO(archive.read("dict_concised_2014_20260626.xlsx")))


def decode_excel(text):
    # Decode OOXML's ST_Xstring escapes once; do not normalize/translate content.
    return re.sub(r"_x([0-9A-Fa-f]{4})_", lambda match: chr(int(match[1], 16)), text)


shared = ET.fromstring(workbook.read("xl/sharedStrings.xml"))
strings = [decode_excel("".join(node.text or "" for node in item.findall(".//s:t", ns))) for item in shared]
sheet = ET.fromstring(workbook.read("xl/worksheets/sheet1.xml"))
rows = []
for row in sheet.findall(".//s:row", ns):
    cells = {}
    for cell in row.findall("s:c", ns):
        value = cell.find("s:v", ns)
        content = "" if value is None else value.text or ""
        cells[re.sub(r"\d", "", cell.attrib["r"])] = strings[int(content)] if cell.attrib.get("t") == "s" else content
    rows.append(cells)
headers = rows[0]
entries = [{header: row.get(column, "") for column, header in headers.items()} for row in rows[1:]]
if not all(entry["字詞名"] and entry["字詞號"] for entry in entries):
    raise ValueError("Source contains a row without its headword or identifier")
data = {"version": "2014_20260626", "sourceZipSha256": hashlib.sha256(source.read_bytes()).hexdigest(), "entries": entries}
serialized = json.dumps(data, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
output = root / "data/moe-concised-source.json.gz"
output.write_bytes(gzip.compress(serialized, compresslevel=9, mtime=0))
print(json.dumps({"entries": len(entries), "singleCharacterEntries": sum(len(entry["字詞名"]) == 1 for entry in entries), "compressedBytes": output.stat().st_size, "sourceZipSha256": data["sourceZipSha256"], "snapshotSha256": hashlib.sha256(output.read_bytes()).hexdigest()}, indent=2))
for word in ("學", "漢", "行"):
    print(json.dumps([entry for entry in entries if entry["字詞名"] == word][:1], ensure_ascii=False))
