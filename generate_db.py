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
    
    # Process Behind the Scenes first
    bts_dir = 'เบื้องหลัง'
    if os.path.exists(bts_dir) and os.path.isdir(bts_dir):
        bts_images = []
        bts_files = []
        for file in os.listdir(bts_dir):
            if file.lower().endswith(('.jpg', '.jpeg', '.png')) and not file.startswith('._'):
                bts_files.append(file)
        bts_files.sort(key=natural_sort_key)
        
        for idx, img_file in enumerate(bts_files):
            rel_path = os.path.join(bts_dir, img_file).replace('\\', '/')
            if idx % 5 == 0:
                layout = 'span-wide'
            else:
                layout = 'span-normal'
            bts_images.append({
                'src': rel_path,
                'title': f"Behind the Scenes {idx + 1:02d}",
                'desc': f"ภาพบรรยากาศเบื้องหลังการทำงานและการปรับแต่งสี",
                'layout': layout
            })
        if bts_images:
            projects.append({
                'id': 'behind-the-scenes',
                'title': 'เบื้องหลังการทำงานจริง',
                'category': 'behind-the-scenes',
                'typeLabel': 'Behind the Scenes',
                'meta': 'ภาพบรรยากาศการทำงานและเบื้องหลังการปรับแต่งสี Onelight',
                'images': bts_images
            })
            
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
        if total_files > 6 and 'botus' not in folder_name.lower():
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
            
        # Override specific frames for Garnier as requested by user
        if 'garnier' in folder_name.lower():
            if len(image_files) >= 6:
                image_files[2] = 'default_1.13.1.JPG'
                image_files[4] = 'default_1.16.2.JPG'
        
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
        
        # Add VFX project right after BOTUS
        if '20250307 botus' in folder_name.lower():
            vfx_folder = os.path.join(colorist_dir, folder_name, 'VFX')
            if os.path.exists(vfx_folder) and os.path.isdir(vfx_folder):
                vfx_metadata = [
                    {
                        'file': '1/1.jpg',
                        'title': 'VFX Set 1 - Step 01 (Original Plate)',
                        'desc': 'ภาพดิบก่อนเริ่มทำเทคนิคพิเศษ'
                    },
                    {
                        'file': '1/2.jpg',
                        'title': 'VFX Set 1 - Step 02 (Blue Screen Keying)',
                        'desc': 'การเจาะแยกตัวละครออกจากฉากหลัง'
                    },
                    {
                        'file': '1/3.jpg',
                        'title': 'VFX Set 1 - Step 03 (Compositing & Grading)',
                        'desc': 'ภาพสำเร็จรวมฉากหลังพร้อมปรับแต่งโทนสี'
                    },
                    {
                        'file': '2/1.jpg',
                        'title': 'VFX Set 2 - Step 01 (Original Plate)',
                        'desc': 'ภาพดิบแสดงจอโน้ตบุ๊กเปล่าและกรีนมาร์กเกอร์'
                    },
                    {
                        'file': '2/2.jpg',
                        'title': 'VFX Set 2 - Step 02 (Screen Masking & Tracking)',
                        'desc': 'การทำแทร็กกิงหน้าจอเพื่อเตรียมซ้อนภาพ'
                    },
                    {
                        'file': '2/3.jpg',
                        'title': 'VFX Set 2 - Step 03 (Screen Insertion & Grading)',
                        'desc': 'ภาพสำเร็จซ้อนวิดีโอลงบนจอโน้ตบุ๊กพร้อมปรับสี'
                    }
                ]
                
                vfx_images = []
                for vfx_meta in vfx_metadata:
                    vfx_file = vfx_meta['file']
                    if os.path.exists(os.path.join(vfx_folder, vfx_file)):
                        vfx_rel_path = os.path.join(vfx_folder, vfx_file).replace('\\', '/')
                        vfx_images.append({
                            'src': vfx_rel_path,
                            'title': vfx_meta['title'],
                            'desc': vfx_meta['desc'],
                            'layout': 'span-normal'
                        })
                
                if vfx_images:
                    projects.append({
                        'id': 'botus-vfx',
                        'title': 'BOTUS (VFX Breakdown)',
                        'category': 'vfx',
                        'typeLabel': 'VFX Breakdown',
                        'meta': 'ขั้นตอนการทำงาน VFX ในภาพยนตร์ Botus',
                        'images': vfx_images
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
