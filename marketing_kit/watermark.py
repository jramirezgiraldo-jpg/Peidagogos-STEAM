import os
from PIL import Image, ImageDraw, ImageFont

def watermark_images():
    img_dir = "images"
    logo_path = os.path.join(img_dir, "logo.png")
    
    if not os.path.exists(logo_path):
        print("Logo not found!")
        return

    # Load logo
    logo = Image.open(logo_path).convert("RGBA")
    
    # Target images
    targets = ["family.png", "ai_tablet.png", "growth.png", "personalization.png", "subjects.png"]
    
    for filename in targets:
        filepath = os.path.join(img_dir, filename)
        if not os.path.exists(filepath):
            continue
            
        print(f"Watermarking {filename}...")
        img = Image.open(filepath).convert("RGBA")
        
        # Resize logo to 15% of image width
        target_width = int(img.width * 0.15)
        aspect_ratio = logo.height / logo.width
        target_height = int(target_width * aspect_ratio)
        logo_resized = logo.resize((target_width, target_height), Image.Resampling.LANCZOS)
        
        # Position logo at top-left with padding
        padding = 20
        img.paste(logo_resized, (padding, padding), logo_resized)
        
        # Add text "peidagogos.com" at bottom right
        draw = ImageDraw.Draw(img)
        text = "www.peidagogosteam.com"
        
        # Try to use a default font or load a TTF
        try:
            font = ImageFont.truetype("arial.ttf", size=int(img.height * 0.04))
        except IOError:
            font = ImageFont.load_default()
            
        # Calculate text width to align it properly to the right
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # Add slight shadow to text for visibility
        x_pos = img.width - text_width - 20
        y_pos = img.height - text_height - 20
        
        draw.text((x_pos+2, y_pos+2), text, font=font, fill=(0, 0, 0, 180))
        draw.text((x_pos, y_pos), text, font=font, fill=(255, 255, 255, 255))
        
        # Save output
        output_path = os.path.join(img_dir, "wm_" + filename)
        img.convert("RGB").save(output_path, "PNG")
        print(f"Saved {output_path}")

if __name__ == "__main__":
    watermark_images()
