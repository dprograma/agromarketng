#!/usr/bin/env python3
"""
Script to fix Next.js dynamic route parameter types from sync to async
"""

import os
import re
import glob

def fix_route_params(file_path):
    """Fix route parameters in a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Pattern to match params type definitions
        # Looking for: params: { paramName: string } or similar
        param_pattern = r'params:\s*\{\s*([^}]+)\s*\}'
        
        # Replace with Promise wrapper
        def replace_params(match):
            inner_params = match.group(1)
            return f'params: Promise<{{{ inner_params } }}>'
        
        # Apply the replacement
        new_content = re.sub(param_pattern, replace_params, content)
        
        # Also need to fix the usage of params inside functions
        # Look for direct access like params.paramName and replace with await params
        
        # Find all parameter names used
        param_names = []
        for match in re.finditer(r'params:\s*Promise<\{\s*([^}]+)\s*\}>', new_content):
            inner = match.group(1)
            # Extract parameter names
            for param_match in re.finditer(r'(\w+):\s*string', inner):
                param_names.append(param_match.group(1))
        
        # Replace direct params access with destructured await
        for param_name in param_names:
            # Look for patterns like params.paramName or context.params.paramName
            patterns = [
                (f'params\.{param_name}', f'(await params).{param_name}'),
                (f'context\.params\.{param_name}', f'(await context.params).{param_name}'),
            ]
            
            for old_pattern, replacement in patterns:
                new_content = re.sub(old_pattern, replacement, new_content)
        
        # Write back if changed
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Fixed: {file_path}")
            return True
        else:
            print(f"No changes needed: {file_path}")
            return False
            
    except Exception as e:
        print(f"Error processing {file_path}: {str(e)}")
        return False

def main():
    # Find all route.ts files in the app directory
    route_files = glob.glob('app/**/route.ts', recursive=True)
    
    fixed_count = 0
    for file_path in route_files:
        if fix_route_params(file_path):
            fixed_count += 1
    
    print(f"\nFixed {fixed_count} files out of {len(route_files)} route files")

if __name__ == '__main__':
    main() 