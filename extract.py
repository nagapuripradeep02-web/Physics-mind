import json
import glob
import os

files = glob.glob(r'C:\Users\PRADEEEP\.claude\**\*.jsonl', recursive=True)
for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        for line in f:
            if ('mcqset/route.ts' in line or 'MCQBanner.tsx' in line) and '"tool_use"' in line:
                try:
                    data = json.loads(line)
                    # recursively search the dict for "input" containing the file text
                    def find_files(obj):
                        if isinstance(obj, dict):
                            if obj.get('name') == 'WriteFile' or obj.get('name') == 'write_to_file' or obj.get('name') == 'Replace' or obj.get('name') == 'str_replace':
                                content = obj.get('input', {}).get('content', '') or obj.get('input', {}).get('file_text', '') or obj.get('input', {}).get('new_string', '')
                                path = obj.get('input', {}).get('path', '') or obj.get('input', {}).get('file', '')
                                if path and content and ('mcqset' in path.lower() or 'MCQBanner' in path):
                                    print(f"FOUND IN {fpath} for {path}")
                                    with open(os.path.basename(path) + '_backup.txt', 'w', encoding='utf-8') as out:
                                        out.write(content)
                            for v in obj.values(): find_files(v)
                        elif isinstance(obj, list):
                            for v in obj: find_files(v)
                    find_files(data)
                except Exception as e:
                    pass
