with open(r'd:\Peidagogos_Oficial\login.html', 'r', encoding='utf-8') as f:
    content = f.read()

# The admin one is at line 881 (first occurrence)
# We need to rename only the FIRST occurrence to admin-main-content
first_idx = content.find('id="student-main-content"')
second_idx = content.find('id="student-main-content"', first_idx + 1)

if first_idx >= 0 and second_idx >= 0:
    # Check which container it's inside
    admin_container_idx = content.find('<div id="dashboard-screen-container"')
    student_container_idx = content.find('<div id="student-dashboard-container"')
    
    print(f"Admin container at index: {admin_container_idx}")
    print(f"Student container at index: {student_container_idx}")
    print(f"First student-main-content at index: {first_idx}")
    print(f"Second student-main-content at index: {second_idx}")
    
    # The one inside dashboard-screen-container (admin) should be renamed
    if admin_container_idx < first_idx < student_container_idx:
        print("First occurrence is inside admin container - renaming to admin-main-content")
        content = content[:first_idx] + 'id="admin-main-content"' + content[first_idx + len('id="student-main-content"'):]
        
        with open(r'd:\Peidagogos_Oficial\login.html', 'w', encoding='utf-8') as f:
            f.write(content)
        print("OK: Renamed admin's student-main-content to admin-main-content")
    else:
        print("WARNING: Order is unexpected, manual check needed")
else:
    print(f"Occurrences found: first={first_idx}, second={second_idx}")
