with open(r'd:\Peidagogos_Oficial\login.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()
occurrences = []
for i, l in enumerate(lines):
    if 'id="student-main-content"' in l:
        occurrences.append(str(i+1) + ': ' + l.rstrip().encode('ascii','ignore').decode('ascii')[:120])
print('Occurrences of student-main-content id:')
for o in occurrences:
    print(o)
