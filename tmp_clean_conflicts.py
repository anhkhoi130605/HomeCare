
import os
import re

def resolve_conflicts(directory):
    files_with_conflicts = []
    # Pattern to match the conflict block
    # Note: re.DOTALL makes . match newlines
    conflict_pattern = re.compile(r'<<<<<<< HEAD.*?=======', re.DOTALL)
    footer_pattern = re.compile(r'>>>>>>> [a-f0-9]+', re.DOTALL)

    for root, dirs, files in os.walk(directory):
        if '.git' in dirs:
            dirs.remove('.git')
        if '.next' in dirs:
            dirs.remove('.next')
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
            
        for file in files:
            if file.endswith(('.jsx', '.js', '.ts', '.tsx', '.css', '.html', '.json', '.md')):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    if '<<<<<<< HEAD' in content:
                        print(f"Processing {file_path}")
                        # Replace the HEAD block up to ======= with nothing
                        # We use a more precise replacement to keep the hash side
                        
                        # Split by markers
                        lines = content.splitlines()
                        new_lines = []
                        in_head = False
                        in_hash = False
                        
                        for line in lines:
                            if line.startswith('<<<<<<< HEAD'):
                                in_head = True
                            elif line.startswith('======='):
                                in_head = False
                                in_hash = True
                            elif line.startswith('>>>>>>>'):
                                in_hash = False
                            else:
                                if not in_head and in_hash:
                                    # Keep lines from the hash side
                                    new_lines.append(line)
                                elif not in_head and not in_hash:
                                    # Keep lines outside conflict markers
                                    new_lines.append(line)
                        
                        new_content = '\n'.join(new_lines)
                        
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        files_with_conflicts.append(file_path)
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")
    
    return files_with_conflicts

if __name__ == "__main__":
    target_dir = r"c:\Users\ADMIN\OneDrive\Máy tính\Ki5\SWP391\HomeCare"
    resolved = resolve_conflicts(target_dir)
    print(f"\nSuccessfully resolved conflicts in {len(resolved)} files.")
    for f in resolved:
        print(f" - {f}")
