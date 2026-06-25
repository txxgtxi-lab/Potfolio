import os
import json
import re

# Root path of Colorist images
colorist_dir = 'Pot/Colorist'
output_file = 'database.js'

def natural_sort_key(s):
    return [int(text) if text.isdigit() else text.lower() for text in re.split(r'(\d+)', s)]

def generate_database():
    if not os.path.exists(colorist_dir):
        print(f"Error: {colorist_dir} does not exist.")
        return

    projects = []
    
    # Get all subdirectories in Colorist
    subdirs = sorted([d for d in os.listdir(colorist_dir) if os.path.isdir(os.path.join(colorist_dir, d))])
    
    for folder_name in subdirs:
        # Exclude McDonals project
        if 'mcdonals' in folder_name.lower():
            continue
            
        folder_path = os.path.join(colorist_dir, folder_name)
        # If it is Listerine Pocketmist, use the 'Main' subdirectory to show different images
        if 'listerine' in folder_name.lower():
            folder_path = os.path.join(folder_path, 'Main')
        # If it is the Before Morning short film, use the 'Final' subdirectory
        elif '20260204' in folder_name:
            folder_path = os.path.join(folder_path, 'Final')
        
        # Extract title by removing date prefix (e.g., '20230708 Sherlock holmes' -> 'Sherlock holmes')
        # We strip leading digits and spaces
        clean_title = re.sub(r'^\d+\s*', '', folder_name)
        clean_title = clean_title.strip()
        
        # Find all images in this folder
        image_files = []
        for file in os.listdir(folder_path):
            # Check if file is an image and not a Mac system file
            if file.lower().endswith(('.jpg', '.jpeg', '.png')) and not file.startswith('._'):
                # For BangBang, exclude the old Frame 04 image to let the script sample a different one
                if 'bangbang' in folder_name.lower() and '250715_20.jpg' in file.lower():
                    continue
                image_files.append(file)
        
        # Sort image files naturally (chronologically/numerically)
        image_files.sort(key=natural_sort_key)
        
        # Shift sampling offset for Before Morning project (20260204) to get a completely new set of shots
        if '20260204' in folder_name:
            image_files = image_files[5:88]
        # Shift sampling offset for Garnier project to get a completely new set of beauty shots
        elif 'garnier' in folder_name.lower():
            image_files = image_files[4:45]
        
        # Sample at most 6 images, evenly distributed, with strict deduplication
        total_files = len(image_files)
        if total_files > 6:
            seen_indices = set()
            sampled_files = []
            step = (total_files - 1) / 5.0
            for i in range(6):
                idx = int(round(i * step))
                idx = min(idx, total_files - 1)
                # If this index was already used, search forward for next unused one
                original_idx = idx
                while idx in seen_indices and idx < total_files - 1:
                    idx += 1
                # If still colliding, search backward
                if idx in seen_indices:
                    idx = original_idx
                    while idx in seen_indices and idx > 0:
                        idx -= 1
                seen_indices.add(idx)
                sampled_files.append(image_files[idx])
            image_files = sampled_files
        else:
            # Fewer or equal to 6: use all, but deduplicate by path just in case
            seen = set()
            unique_files = []
            for f in image_files:
                if f not in seen:
                    seen.add(f)
                    unique_files.append(f)
            image_files = unique_files
        
        if not image_files:
            continue
            
        images = []
        for idx, img_file in enumerate(image_files):
            # Construct relative path using forward slashes for web usage
            rel_path = os.path.join(folder_path, img_file).replace('\\', '/')
            
            # Determine card width layout based on index to create an organic masonry look
            if idx % 5 == 0:
                layout = 'span-wide'
            else:
                layout = 'span-normal'
                
            images.append({
                'src': rel_path,
                'title': f"Frame {idx + 1:02d}",
                'desc': f"Onelight color grading showcase still from {clean_title}",
                'layout': layout
            })
            
        projects.append({
            'id': folder_name.lower().replace(' ', '-').replace("'", ""),
            'title': clean_title,
            'category': 'onelight',
            'typeLabel': 'Onelight Showcase',
            'meta': f"Stills from Onelight color grading project: {clean_title}",
            'images': images
        })
        
    # Write to database.js
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("/* Automatically generated database file by generate_db.py */\n")
        f.write("const projects = ")
        f.write(json.dumps(projects, indent=2, ensure_ascii=False))
        f.write(";\n")
        
    print(f"Successfully generated database with {len(projects)} projects and output to {output_file}")

if __name__ == '__main__':
    generate_database()
