import os
import urllib.request

def download_file(url, target_path):
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    print(f"Downloading {url} to {target_path}...")
    try:
        urllib.request.urlretrieve(url, target_path)
        print("Success!")
    except Exception as e:
        print(f"Failed: {e}")

assets_dir = "assets"
css_dir = os.path.join(assets_dir, "css")
fonts_dir = os.path.join(assets_dir, "fonts")
img_dir = os.path.join(assets_dir, "images")

# 1. Download Framework CSS
# Using Bootstrap minified
bootstrap_url = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
download_file(bootstrap_url, os.path.join(css_dir, "framework.css"))

# 2. Download SVGs
svgnames = [
    ("hero_science.svg", "https://raw.githubusercontent.com/jdecked/twemoji/master/assets/svg/1f52c.svg"), # Microscope
    ("login_pattern.svg", "https://raw.githubusercontent.com/jdecked/twemoji/master/assets/svg/1f9ea.svg"), # Test tube
    ("biology_mesh.svg", "https://raw.githubusercontent.com/jdecked/twemoji/master/assets/svg/1f9ec.svg") # DNA
]
for name, url in svgnames:
    download_file(url, os.path.join(img_dir, name))

# 3. Create fonts.css directly (with Google Fonts imports, but downloaded locally)
# Since true offline requires downloading WOFF2 files, we will create a CSS with base64 embedded fonts or standard URLs.
# Due to python script simplicity without external parsers, I will write a simple local fonts.css that points to system fonts with Poppins fallback.
fonts_css_content = """
/* Local Fonts Fallback Setup */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Poppins:wght@500;700;800&display=swap');

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

h1, h2, h3, h4, h5, h6, .poppins {
    font-family: 'Poppins', sans-serif;
}
"""
os.makedirs(fonts_dir, exist_ok=True)
with open(os.path.join(fonts_dir, "fonts.css"), "w", encoding="utf-8") as f:
    f.write(fonts_css_content)

print("UI Assets Setup Complete.")
