import sys
import json
import fitz  # PyMuPDF

def extract_outline(pdf_path):
    doc = fitz.open(pdf_path)
    # Title: largest bold text on first page
    first_page = doc[0]
    blocks = first_page.get_text('dict')['blocks']
    max_size = 0
    title = ''
    for b in blocks:
        for l in b.get('lines', []):
            for s in l.get('spans', []):
                if s.get('flags', 0) & 2:  # bold
                    if s['size'] > max_size:
                        max_size = s['size']
                        title = s['text']
    if not title:
        # fallback: largest text
        for b in blocks:
            for l in b.get('lines', []):
                for s in l.get('spans', []):
                    if s['size'] > max_size:
                        max_size = s['size']
                        title = s['text']
    # Outline: H1/H2/H3 by font size hierarchy
    font_sizes = set()
    headings = []
    for page_num in range(len(doc)):
        page = doc[page_num]
        blocks = page.get_text('dict')['blocks']
        for b in blocks:
            for l in b.get('lines', []):
                for s in l.get('spans', []):
                    font_sizes.add(s['size'])
    font_sizes = sorted(list(font_sizes), reverse=True)
    if len(font_sizes) < 3:
        font_sizes += [0] * (3 - len(font_sizes))
    size_to_level = {font_sizes[0]: 'H1', font_sizes[1]: 'H2', font_sizes[2]: 'H3'}
    for page_num in range(len(doc)):
        page = doc[page_num]
        blocks = page.get_text('dict')['blocks']
        for b in blocks:
            for l in b.get('lines', []):
                for s in l.get('spans', []):
                    level = size_to_level.get(s['size'])
                    if level:
                        headings.append({
                            'level': level,
                            'text': s['text'],
                            'page': page_num + 1
                        })
    return {'title': title, 'outline': headings}

if __name__ == '__main__':
    try:
        pdf_path = sys.argv[1]
        result = extract_outline(pdf_path)
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1) 