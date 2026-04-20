import json
import glob

files = glob.glob(r'C:\\Users\\PRADEEEP\\.claude\\**\\*.jsonl', recursive=True)
for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        for line in f:
            if 'export async function POST' in line and ('mcqset' in line or 'route.ts' in line):
                print(f"FOUND MATCH IN POST in {fpath}")
                try: 
                    d = json.loads(line)
                    # output the whole JSON or search strings
                    def find_content(obj):
                        if isinstance(obj, str):
                            if 'export async function POST' in obj and 'mcqset' in obj.lower():
                                with open('route_backup.txt', 'a', encoding='utf-8') as out:
                                    out.write("======\n")
                                    out.write(obj)
                                    out.write("\n")
                        elif isinstance(obj, dict):
                            for v in obj.values(): find_content(v)
                        elif isinstance(obj, list):
                            for v in obj: find_content(v)
                    find_content(d)
                except: pass
            if 'export default function MCQBanner' in line and ('MCQBanner.tsx' in line or 'components' in line):
                try:
                    d = json.loads(line)
                    def find_content_banner(obj):
                        if isinstance(obj, str):
                            if 'export default function MCQBanner' in obj:
                                with open('MCQBanner_backup.txt', 'a', encoding='utf-8') as out:
                                    out.write("======\n")
                                    out.write(obj)
                                    out.write("\n")
                        elif isinstance(obj, dict):
                            for v in obj.values(): find_content_banner(v)
                        elif isinstance(obj, list):
                            for v in obj: find_content_banner(v)
                    find_content_banner(d)
                except:
                    pass
