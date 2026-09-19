"""Import pinned GitHub downloads: python3 scripts/import-dictionary-sources.py DOWNLOAD_DIR.

Download the URLs in data/dictionary-sources.json first. Builds never use the network.
Raw JSON bytes (including every source field) are preserved in deterministic gzip files.
"""
import gzip
import hashlib
import json
import lzma
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REVISED_SHA = 'a6dc997417507eb510fc29822bc514de2c92728c'
XINHUA_SHA = 'fe6d6c2e8baa82187f4c96bbe042e43f96c05666'
SOURCES = [
    ('revised', 'g0v/moedict-data', REVISED_SHA, 'dict-revised.json.xz', 'dict-revised.json.xz', 'title', '5cc4ec0efd7e549621edf9b46d261989230c1729d9dc2c8e2056f4b21c8a93da'),
    ('xinhua-character', 'pwxcoo/chinese-xinhua', XINHUA_SHA, 'word.json', 'data/word.json', 'word', '8ae3453eacc5b0f3fdfba47eac8bb686cd73914d278e8b851ae6ef81082f80e7'),
    ('xinhua-word', 'pwxcoo/chinese-xinhua', XINHUA_SHA, 'ci.json', 'data/ci.json', 'ci', '739e086d61dc9b95cd1df92095720e6391f952a41c476d3281ef95ebed869a09'),
    ('xinhua-idiom', 'pwxcoo/chinese-xinhua', XINHUA_SHA, 'idiom.json', 'data/idiom.json', 'word', '1d4b4f454ce1c416d6a1ab2369d6e66c0ff99e04390172eef70790499e21ce19'),
]

def main():
    downloads = Path(sys.argv[1])
    manifest = []
    for source_id, repo, revision, filename, upstream, head, expected in SOURCES:
        source = (downloads / filename).read_bytes()
        if hashlib.sha256(source).hexdigest() != expected:
            raise ValueError(f'{filename}: upstream checksum mismatch')
        raw = lzma.decompress(source) if filename.endswith('.xz') else source
        entries = json.loads(raw)
        if not isinstance(entries, list) or any(not isinstance(e.get(head), str) or not e[head] for e in entries):
            raise ValueError(f'{filename}: invalid entries')
        snapshot = f'data/{source_id}-source.json.gz'
        with (ROOT / snapshot).open('wb') as output:
            with gzip.GzipFile(filename='', mode='wb', fileobj=output, mtime=0, compresslevel=9) as compressed:
                compressed.write(raw)
        manifest.append(dict(id=source_id, repository=repo, revision=revision,
                             url=f'https://raw.githubusercontent.com/{repo}/{revision}/{upstream}',
                             sourceSha256=expected, snapshot=snapshot,
                             snapshotSha256=hashlib.sha256((ROOT / snapshot).read_bytes()).hexdigest(),
                             entries=len(entries), uniqueHeads=len({e[head] for e in entries})))
    (ROOT / 'data/dictionary-sources.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(manifest, indent=2))

if __name__ == '__main__':
    main()
