with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

css_to_add = '''
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        input[type=number] {
            -moz-appearance: textfield;
        }
'''

if '::-webkit-inner-spin-button' not in html:
    html = html.replace('</style>', css_to_add + '\n    </style>')
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("CSS inyectado.")
