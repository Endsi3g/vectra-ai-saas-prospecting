import sqlite3
import sys

def main():
    db_path = r'C:\Users\upris\.gemini\antigravity\conversations\2147ffbd-752b-4024-a122-61e0cb883110.db'
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute('SELECT step_payload FROM steps WHERE idx=786')
    row = cursor.fetchone()
    if not row:
        print("Row 786 not found")
        return
    payload = row[0]
    start_idx = payload.find(b'Voici ma cle API de Nylas')
    if start_idx == -1:
        print("Nylas text not found")
        return
    
    # Extract from start_idx
    content_bytes = payload[start_idx:]
    
    # We want to find where the string ends. 
    # Since it is a protobuf, let's find the length of the string if possible,
    # or find where the markdown text stops.
    # In the markdown text, there are no null bytes. The protobuf might have a null byte or control character indicating the next field tag.
    # Let's decode as utf-8 and find the first control character or invalid char.
    text = content_bytes.decode('utf-8', errors='replace')
    
    # Let's inspect the characters and truncate when we see non-printable characters.
    # We allow standard markdown printable chars, spaces, newlines, tabs, and common punctuation/unicode.
    # Let's find the first character that is clearly not part of the text.
    # A good way is to search for the end of the text.
    # Let's find the occurrence of "```" or see where it starts showing replacement characters like '\ufffd' or control characters.
    end_idx = len(text)
    for i, char in enumerate(text):
        o = ord(char)
        # Control characters other than tab, newline, carriage return
        if o < 32 and char not in '\r\n\t':
            end_idx = i
            break
        # Protobuf tag characters or replacement characters
        if char == '\ufffd':
            end_idx = i
            break
            
    clean_text = text[:end_idx]
    
    output_path = r'C:\Users\upris\content-osv2\Vectra OS\apps\web\nylas_ui_instructions.md'
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(clean_text)
    print(f"Extracted clean text of length {len(clean_text)} to {output_path}")

if __name__ == '__main__':
    main()
