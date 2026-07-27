import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import os

def create_video():
    img_dir = "images"
    output_path = "video_promo.mp4"
    
    # Slides config
    slides = [
        {"file": "family.png", "text": "¿Batallas diarias por\nlas tareas escolares?"},
        {"file": "personalization.png", "text": "Descubre el Homeschooling\ndel Futuro con IA."},
        {"file": "subjects.png", "text": "Matemáticas y Ciencias\n100% Gamificadas."},
        {"file": "ai_tablet.png", "text": "Educación Constructivista\nque se adapta a su ritmo."},
        {"file": "growth.png", "text": "Únete a la comunidad y\ngana dinero refiriendo."}
    ]
    
    logo_path = os.path.join(img_dir, "logo.png")
    logo = Image.open(logo_path).convert("RGBA") if os.path.exists(logo_path) else None
    if logo:
        # Resize logo for video
        logo = logo.resize((150, int(150 * logo.height / logo.width)), Image.Resampling.LANCZOS)
    
    # Video settings
    width, height = 1280, 720
    fps = 30
    duration_per_slide = 3 # seconds
    frames_per_slide = fps * duration_per_slide
    
    # Try to load a nice font
    try:
        font = ImageFont.truetype("arialbd.ttf", 60)
    except IOError:
        font = ImageFont.load_default()
        
    try:
        font_small = ImageFont.truetype("arial.ttf", 40)
    except IOError:
        font_small = ImageFont.load_default()

    # Initialize video writer
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    print("Generando video promocional...")
    
    for slide in slides:
        filepath = os.path.join(img_dir, slide["file"])
        if not os.path.exists(filepath):
            print(f"Skipping {slide['file']} - not found.")
            continue
            
        img_orig = Image.open(filepath).convert("RGB")
        
        # Calculate aspect ratios to crop image to fill 1280x720
        img_w, img_h = img_orig.size
        target_ratio = width / height
        img_ratio = img_w / img_h
        
        if img_ratio > target_ratio:
            # Image is wider, crop sides
            new_w = int(img_h * target_ratio)
            left = (img_w - new_w) // 2
            img_cropped = img_orig.crop((left, 0, left + new_w, img_h))
        else:
            # Image is taller, crop top/bottom
            new_h = int(img_w / target_ratio)
            top = (img_h - new_h) // 2
            img_cropped = img_orig.crop((0, top, img_w, top + new_h))
            
        # Animate frames (Ken Burns zoom effect from 1.0 to 1.1)
        for i in range(frames_per_slide):
            scale = 1.0 + 0.1 * (i / frames_per_slide)
            
            # Crop a smaller center portion to simulate zoom, then resize to 1280x720
            crop_w = int(img_cropped.width / scale)
            crop_h = int(img_cropped.height / scale)
            c_left = (img_cropped.width - crop_w) // 2
            c_top = (img_cropped.height - crop_h) // 2
            
            frame_img = img_cropped.crop((c_left, c_top, c_left + crop_w, c_top + crop_h))
            frame_img = frame_img.resize((width, height), Image.Resampling.LANCZOS)
            
            # Create a transparent overlay for text at the bottom
            overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
            draw = ImageDraw.Draw(overlay)
            
            # Draw gradient-like black rectangle at bottom
            draw.rectangle([0, height - 200, width, height], fill=(0, 0, 0, 150))
            
            # Draw text
            text_bbox = draw.textbbox((0, 0), slide["text"], font=font)
            text_w = text_bbox[2] - text_bbox[0]
            text_h = text_bbox[3] - text_bbox[1]
            draw.text(((width - text_w) // 2, height - 160), slide["text"], font=font, fill=(255, 255, 255, 255), align="center")
            
            # Paste logo
            if logo:
                overlay.paste(logo, (40, 40), logo)
                
            # Merge overlay
            frame_img.paste(overlay, (0,0), overlay)
            
            # Convert to cv2 format (BGR)
            frame_cv2 = cv2.cvtColor(np.array(frame_img), cv2.COLOR_RGB2BGR)
            out.write(frame_cv2)
            
    # Final outro slide (2 seconds)
    print("Agregando cierre...")
    for i in range(fps * 2):
        frame_img = Image.new("RGB", (width, height), (6, 78, 59)) # Brand green color
        draw = ImageDraw.Draw(frame_img)
        
        # Center logo
        if logo:
            logo_large = logo.resize((300, int(300 * logo.height / logo.width)), Image.Resampling.LANCZOS)
            frame_img.paste(logo_large, ((width - 300) // 2, 150), logo_large)
            
        outro_text = "Inscríbete hoy en:\nwww.peidagogosteam.com"
        text_bbox = draw.textbbox((0, 0), outro_text, font=font)
        text_w = text_bbox[2] - text_bbox[0]
        draw.text(((width - text_w) // 2, 500), outro_text, font=font, fill=(255, 255, 255, 255), align="center")
        
        frame_cv2 = cv2.cvtColor(np.array(frame_img), cv2.COLOR_RGB2BGR)
        out.write(frame_cv2)
        
    out.release()
    print(f"Video guardado exitosamente en {output_path}")

if __name__ == "__main__":
    create_video()
