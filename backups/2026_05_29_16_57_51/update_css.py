with open('css/styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Replace bento-card styling to use flexbox
css = css.replace(
    '.bento-card {\n    background: white;\n    border-radius: 16px;\n    padding: 2rem;\n    box-shadow: 0 4px 20px rgba(0,0,0,0.08);\n    border: 1px solid rgba(0,0,0,0.02);\n    transition: transform 0.3s ease;\n}',
    '.bento-card {\n    background: white;\n    border-radius: 16px;\n    padding: 2rem;\n    box-shadow: 0 4px 20px rgba(0,0,0,0.08);\n    border: 1px solid rgba(0,0,0,0.02);\n    transition: transform 0.3s ease;\n    display: flex;\n    align-items: center;\n    gap: 1.5rem;\n}'
)

css = css.replace(
    '.bento-icon {\n    font-size: 2.5rem;\n    margin-bottom: 1rem;\n}',
    '.bento-icon {\n    font-size: 2rem;\n    margin-bottom: 0;\n    flex-shrink: 0;\n}'
)

with open('css/styles.css', 'w', encoding='utf-8') as f:
    f.write(css)
