const fs = require('fs');
let html = fs.readFileSync('login.html', 'utf8');

const strToRemove = `                                <option value="Instituto Técnico Industrial">Instituto Técnico Industrial</option>
                            </select>`;
const newStr = `<input type="text" id="admin-inv-ie-select" placeholder="Escribe el nombre de la institución..." value="IE Instituto Montenegro" style="width: 100%; padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-weight: 700; font-size: 0.9rem; box-sizing: border-box; background: white;">`;

html = html.replace(strToRemove, newStr);

fs.writeFileSync('login.html', html, 'utf8');
