"""Read-only Haitang audit/import. See docs/haitang-database.md for the update workflow.

python3 scripts/import-haitang.py --repo /path/to/haitang [--write]
Default is a preview; --write replaces only this project's versioned source snapshot.
"""
import argparse
import collections
import gzip
import hashlib
import json
import sqlite3
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TABLES = ('works', 'authors', 'dynasties', 'collections', 'collection_kinds',
          'collection_works', 'quotes', 'collection_quotes', 'version')
SNAPSHOT = ROOT / 'data/haitang-source.json.gz'
MANIFEST = ROOT / 'data/haitang-manifest.json'


def sha(data):
    return hashlib.sha256(data).hexdigest()


def encoded(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()


def changes(old, new):
    a = {str(row['id']): row for row in old}
    b = {str(row['id']): row for row in new}
    return {'added': sorted(b.keys() - a.keys()), 'removed': sorted(a.keys() - b.keys()),
            'changed': sorted(key for key in a.keys() & b.keys() if a[key] != b[key])}


def inspect(repo):
    revision = subprocess.check_output(['git', '-C', str(repo), 'rev-parse', 'HEAD'], text=True).strip()
    dirty = subprocess.check_output(['git', '-C', str(repo), 'status', '--porcelain', '--',
                                    'src/database', 'LICENSE', 'README.md'], text=True)
    if dirty.strip():
        raise ValueError('Source database or notices are modified. Commit the intended upstream changes before importing.')
    database = repo / 'src/database/poetry.db'
    connection = sqlite3.connect(database.resolve().as_uri() + '?mode=ro', uri=True)
    connection.row_factory = sqlite3.Row
    if connection.execute('PRAGMA integrity_check').fetchone()[0] != 'ok':
        raise ValueError('SQLite integrity check failed')
    tables = {}
    comparisons = {}
    files = {'src/database/poetry.db': sha(database.read_bytes())}
    for table in TABLES:
        order = 'version' if table == 'version' else 'id'
        tables[table] = [dict(row) for row in connection.execute(f'SELECT * FROM "{table}" ORDER BY "{order}"')]
        if not tables[table]:
            raise ValueError(f'Empty source table: {table}')
        path = repo / f'src/database/json/{table}.json'
        raw = path.read_bytes()
        files[str(path.relative_to(repo))] = sha(raw)
        rows = json.loads(raw)[table]
        a = {str(row[order]): row for row in rows}
        b = {str(row[order]): row for row in tables[table]}
        if len(a) != len(rows) or len(b) != len(tables[table]):
            raise ValueError(f'Duplicate primary keys in {table}')
        differing = [key for key in a.keys() & b.keys()
                     if any(a[key][field] != b[key][field] for field in a[key].keys() & b[key].keys())]
        comparisons[table] = {'jsonRows': len(rows), 'sqliteRows': len(b),
                             'onlyJsonIds': sorted(a.keys() - b.keys()), 'onlySqliteIds': sorted(b.keys() - a.keys()),
                             'sharedValueDifferences': len(differing), 'differentIds': sorted(differing),
                             'sqliteOnlyFields': sorted(set(b[next(iter(b))]) - set(a[next(iter(a))]))}
    connection.close()
    for row in tables['works']:
        if not isinstance(row['id'], int) or row['id'] <= 0 or any(not isinstance(row.get(key), str) or not row[key].strip() for key in ('title', 'author', 'dynasty', 'content')):
            raise ValueError('Invalid work identity or required text')
        for field in ('kind_cn', 'layout', 'content_tr', 'foreword', 'intro', 'annotation', 'translation', 'master_comment'):
            if row.get(field) is not None and not isinstance(row[field], str):
                raise ValueError(f'Work {row["id"]}: invalid text field {field}')
    work_ids = {row['id'] for row in tables['works']}
    author_ids = {row['id'] for row in tables['authors']}
    collection_ids = {row['id'] for row in tables['collections']}
    quote_ids = {row['id'] for row in tables['quotes']}
    missing = {
        'workAuthors': sum(row['author_id'] not in author_ids for row in tables['works']),
        'collectionWorks': sum(row['work_id'] not in work_ids or row['collection_id'] not in collection_ids for row in tables['collection_works']),
        'quoteWorks': sum(row['work_id'] not in work_ids for row in tables['quotes']),
        'collectionQuotes': sum(row['quote_id'] not in quote_ids or row['collection_id'] not in collection_ids for row in tables['collection_quotes']),
    }
    old = json.loads(gzip.decompress(SNAPSHOT.read_bytes()))['tables'] if SNAPSHOT.exists() else {}
    delta = {table: changes(old.get(table, []), tables[table]) for table in TABLES if table != 'version'}
    notice_files = {'LICENSE': 'haitang-MIT.txt', 'README.md': 'haitang-README.txt'}
    for name in notice_files:
        files[name] = sha((repo / name).read_bytes())
    report = {'repository': 'https://github.com/leozxl/haitang', 'revision': revision,
              'databaseVersion': tables['version'], 'counts': {key: len(value) for key, value in tables.items()},
              'missingReferences': missing, 'jsonComparison': comparisons,
              'changes': {key: {name: len(ids) for name, ids in value.items()} for key, value in delta.items()},
              'changeIds': delta, 'sourceSha256': files}
    return tables, report, notice_files


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', type=Path, required=True)
    parser.add_argument('--write', action='store_true')
    parser.add_argument('--allow-json-drift', action='store_true', help='Explicitly accept audited JSON/SQLite differences; SQLite remains authoritative')
    parser.add_argument('--report', type=Path, help='Save the complete audit and changed IDs outside the source repository')
    args = parser.parse_args()
    tables, report, notices = inspect(args.repo.resolve())
    if args.report:
        args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    summary = {key: value for key, value in report.items() if key not in ('changeIds', 'sourceSha256', 'jsonComparison')}
    summary['jsonSharedDifferences'] = {key: value['sharedValueDifferences'] for key, value in report['jsonComparison'].items()}
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    if not args.write:
        print('Preview only: no project files changed. Use --write after reviewing the report.')
        return
    if not args.allow_json_drift and any(row['sharedValueDifferences'] or row['onlyJsonIds'] or row['onlySqliteIds'] for row in report['jsonComparison'].values()):
        raise ValueError('SQLite and JSON disagree on shared records. Synchronize them or review --report and explicitly accept with --allow-json-drift.')
    raw = encoded({'tables': tables})
    # Fixed gzip header; no timestamp or source file name.
    with SNAPSHOT.open('wb') as output:
        with gzip.GzipFile(filename='', mode='wb', fileobj=output, mtime=0, compresslevel=9) as stream:
            stream.write(raw)
    manifest = {key: value for key, value in report.items() if key not in ('changes', 'changeIds')}
    manifest.update(snapshot='data/haitang-source.json.gz', snapshotSha256=sha(SNAPSHOT.read_bytes()),
                    rawSha256=sha(raw), formatVersion=1)
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    for source, target in notices.items():
        content = (args.repo / source).read_text()
        (ROOT / 'licenses' / target).write_text('\n'.join(line.rstrip() for line in content.splitlines()).rstrip() + '\n')
    print('Imported verified snapshot. Run npm run assets, npm run check and npm run build.')


if __name__ == '__main__':
    main()
