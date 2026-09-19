"""Exercise the actual CLI against an isolated miniature upstream Git/SQLite repo."""
from contextlib import closing
import gzip
import json
import shutil
import sqlite3
import subprocess
import tempfile
import unittest
from pathlib import Path


class ImportTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.base = Path(self.temp.name)
        self.project = self.base / 'project'
        for folder in ('scripts', 'data', 'licenses'):
            (self.project / folder).mkdir(parents=True)
        self.script = self.project / 'scripts/import-haitang.py'
        shutil.copyfile('scripts/import-haitang.py', self.script)
        self.repo = self.base / 'source'
        self.db = self.repo / 'src/database/poetry.db'
        (self.db.parent / 'json').mkdir(parents=True)
        self.tables = {
            'works': [dict(id=1, title='测试诗', author='佚名', dynasty='唐', content='春风。', author_id=1)],
            'authors': [dict(id=1, name='佚名')], 'dynasties': [dict(id=1, name='唐')],
            'collections': [dict(id=1, name='测试选集')], 'collection_kinds': [dict(id=1, name='主题')],
            'collection_works': [dict(id=1, work_id=1, collection_id=1)],
            'quotes': [dict(id=1, work_id=1, quote='春风。')],
            'collection_quotes': [dict(id=1, quote_id=1, collection_id=1)],
            'version': [dict(version='fixture', generated_at='2026-09-19')],
        }
        with closing(sqlite3.connect(self.db)) as connection:
            for table, rows in self.tables.items():
                columns = ','.join(f'"{key}" {"INTEGER" if isinstance(value, int) else "TEXT"}' for key, value in rows[0].items())
                connection.execute(f'CREATE TABLE "{table}" ({columns})')
                connection.execute(f'INSERT INTO "{table}" VALUES ({",".join("?" for _ in rows[0])})', list(rows[0].values()))
            connection.commit()
        self.write_json()
        (self.repo / 'LICENSE').write_text('Fixture license\n')
        (self.repo / 'README.md').write_text('Fixture source\n')
        self.git('init', '-q')
        self.git('config', 'user.name', 'Test')
        self.git('config', 'user.email', 'test@example.invalid')
        self.commit()

    def tearDown(self):
        self.temp.cleanup()

    def git(self, *args):
        return subprocess.check_output(['git', '-C', str(self.repo), *args], text=True, stderr=subprocess.PIPE)

    def commit(self):
        self.git('add', 'src/database', 'README.md', 'LICENSE')
        self.git('commit', '-qm', 'fixture')

    def write_json(self):
        for table, rows in self.tables.items():
            (self.db.parent / 'json' / f'{table}.json').write_text(json.dumps({table: rows}, ensure_ascii=False))

    def run_import(self, *args):
        return subprocess.run(['python3', str(self.script), '--repo', str(self.repo), *args], capture_output=True, text=True)

    def test_preview_determinism_and_change_report(self):
        result = self.run_import()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(list((self.project / 'data').iterdir()), [])
        self.assertEqual(self.run_import('--write').returncode, 0)
        snapshot = self.project / 'data/haitang-source.json.gz'
        first = snapshot.read_bytes()
        self.assertEqual(self.run_import('--write').returncode, 0)
        self.assertEqual(first, snapshot.read_bytes())
        with closing(sqlite3.connect(self.db)) as connection:
            connection.execute("UPDATE works SET title='更新诗' WHERE id=1")
            connection.commit()
        self.tables['works'][0]['title'] = '更新诗'
        self.write_json()
        self.commit()
        report = self.base / 'report.json'
        self.assertEqual(self.run_import('--report', str(report)).returncode, 0)
        self.assertEqual(json.loads(report.read_text())['changeIds']['works']['changed'], ['1'])
        self.assertEqual(first, snapshot.read_bytes(), 'preview must not overwrite the imported source')

    def test_drift_requires_explicit_acceptance_and_keeps_sqlite(self):
        self.tables['works'][0]['content'] = 'JSON differs'
        self.write_json()
        self.commit()
        self.assertNotEqual(self.run_import('--write').returncode, 0)
        self.assertFalse((self.project / 'data/haitang-source.json.gz').exists())
        self.assertEqual(self.run_import('--write', '--allow-json-drift').returncode, 0)
        snapshot = json.loads(gzip.decompress((self.project / 'data/haitang-source.json.gz').read_bytes()))
        self.assertEqual(snapshot['tables']['works'][0]['content'], '春风。')

    def test_dirty_source_rejected(self):
        (self.repo / 'README.md').write_text('uncommitted')
        self.assertNotEqual(self.run_import('--write').returncode, 0)
        self.assertEqual(list((self.project / 'data').iterdir()), [])


if __name__ == '__main__':
    unittest.main()
