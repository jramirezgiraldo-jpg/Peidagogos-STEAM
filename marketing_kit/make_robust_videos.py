import numpy as np
from PIL import Image, ImageDraw, ImageFont
import os
import imageio

def generate_video(output_path, slides, logo=None, width=1280, height=720, fps=30, duration_per_slide=3):
    frames_per_slide = fps * duration_per_slide
    
    # Try to load a nice font
    try:
        font = ImageFont.truetype("arialbd.ttf", 60)
    except IOError:
        font = ImageFont.load_default()
        
    writer = imageio.get_writer(output_path, fps=fps, codec='libx264', quality=8, pixelformat='yuv420p')
    print(f"Generando {output_path}...")
    
    for slide in slides:
        filepath = os.path.join("images", slide["file"])
        if not os.path.exists(filepath):
            print(f"Skipping {slide['file']} - not found.")
            continue
            
        img_orig = Image.open(filepath).convert("RGB")
        
        # Calculate aspect ratios to crop image to fill 1280x720
        img_w, img_h = img_orig.size
        target_ratio = width / height
        img_ratio = img_w / img_h
        
        if img_ratio > target_ratio:
            new_w = int(img_h * target_ratio)
            left = (img_w - new_w) // 2
            img_cropped = img_orig.crop((left, 0, left + new_w, img_h))
        else:
            new_h = int(img_w / target_ratio)
            top = (img_h - new_h) // 2
            img_cropped = img_orig.crop((0, top, img_w, top + new_h))
            
        # Animate frames (Ken Burns zoom effect from 1.0 to 1.1)
        for i in range(frames_per_slide):
            scale = 1.0 + 0.1 * (i / frames_per_slide)
            
            crop_w = int(img_cropped.width / scale)
            crop_h = int(img_cropped.height / scale)
            c_left = (img_cropped.width - crop_w) // 2
            c_top = (img_cropped.height - crop_h) // 2
            
            frame_img = img_cropped.crop((c_left, c_top, c_left + crop_w, c_top + crop_h))
            frame_img = frame_img.resize((width, height), Image.Resampling.LANCZOS)
            
            # Transparent overlay for text at the bottom
            overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
            draw = ImageDraw.Draw(overlay)
            
            # Gradient-like black rectangle at bottom
            draw.rectangle([0, height - 200, width, height], fill=(0, 0, 0, 160))
            
            # Text
            text_bbox = draw.textbbox((0, 0), slide["text"], font=font)
            text_w = text_bbox[2] - text_bbox[0]
            draw.text(((width - text_w) // 2, height - 160), slide["text"], font=font, fill=(255, 255, 255, 255), align="center")
            
            # Logo
            if logo:
                overlay.paste(logo, (40, 40), logo)
                
            frame_img.paste(overlay, (0,0), overlay)
            
            # Write to imageio
            writer.append_data(np.array(frame_img))
            
    # Final outro slide (2 seconds)
    print("Agregando cierre...")
    for i in range(fps * 2):
        frame_img = Image.new("RGB", (width, height), (6, 78, 59))
        draw = ImageDraw.Draw(frame_img)
        
        if logo:
            logo_large = logo.resize((300, int(300 * logo.height / logo.width)), Image.Resampling.LANCZOS)
            frame_img.paste(logo_large, ((width - 300) // 2, 150), logo_large)
            
        outro_text = "Inscríbete hoy en:\nwww.peidagogosteam.com"
        text_bbox = draw.textbbox((0, 0), outro_text, font=font)
        text_w = text_bbox[2] - text_bbox[0]
        draw.text(((width - text_w) // 2, 500), outro_text, font=font, fill=(255, 255, 255, 255), align="center")
        
        writer.append_data(np.array(frame_img))
        
    writer.close()
    print(f"Video guardado exitosamente: {output_path}")

def main():
    logo_path = os.path.join("images", "logo.png")
    logo = Image.open(logo_path).convert("RGBA") if os.path.exists(logo_path) else None
    if logo:
        logo = logo.resize((150, int(150 * logo.height / logo.width)), Image.Resampling.LANCZOS)

    # Video 1: Original Promo (re-rendered with H.264 for browser compatibility)
    slides_promo = [
        {"file": "family.png", "text": "¿Batallas diarias por\nlas tareas escolares?"},
        {"file": "personalization.png", "text": "Descubre el Homeschooling\ndel Futuro con IA."},
        {"file": "subjects.png", "text": "Matemáticas y Ciencias\n100% Gamificadas."},
        {"file": "ai_tablet.png", "text": "Educación Constructivista\nque se adapta a su ritmo."},
        {"file": "growth.png", "text": "Únete a la comunidad y\ngana dinero refiriendo."}
    ]
    generate_video("video_promo.mp4", slides_promo, logo)

    # Video 2: Avatar Video 1 (Math & Science)
    slides_avatar1 = [
        {"file": "avatar_math.png", "text": "Aprende Matemáticas Jugando."},
        {"file": "avatar_science.png", "text": "Explora la Ciencia\ncomo un verdadero Avatar."}
    ]
    generate_video("video_avatar1.mp4", slides_avatar1, logo)

    # Video 3: Avatar Video 2 (Gamification & Achievement)
    slides_avatar2 = [
        {"file": "avatar_mascot.png", "text": "Educación Guiada por\nInteligencia Artificial."},
        {"file": "avatar_trophy.png", "text": "Gana medallas y descubre\ntodo tu potencial."}
    ]
    generate_video("video_avatar2.mp4", slides_avatar2, logo)

if __name__ == "__main__":
    main()
