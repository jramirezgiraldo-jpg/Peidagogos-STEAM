// Módulo de persistencia local y biblioteca de actividades creadas
const STORAGE_KEY_HISTORY = "Peidagogos_activities_history";

export function getSavedActivities() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Error al leer actividades guardadas:", e);
    return [];
  }
}

export function saveActivityToHistory({ id, activityTypeId, activityTitle, topic, grade, htmlContent }) {
  try {
    const list = getSavedActivities();
    const newEntry = {
      id: id || ("act_" + Date.now()),
      activityTypeId,
      activityTitle,
      topic,
      grade,
      htmlContent,
      createdAt: new Date().toISOString()
    };

    // Agrega al inicio y guarda hasta las últimas 50 actividades
    const updated = [newEntry, ...list.filter(item => item.id !== newEntry.id)].slice(0, 50);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
    return newEntry;
  } catch (e) {
    console.error("Error al guardar actividad:", e);
    return null;
  }
}

export function deleteActivityFromHistory(activityId) {
  try {
    const list = getSavedActivities().filter(item => item.id !== activityId);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(list));
    return true;
  } catch (e) {
    console.error("Error al eliminar actividad:", e);
    return false;
  }
}

export function downloadHtmlFile(fileName, htmlContent) {
  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName.endsWith(".html") ? fileName : `${fileName}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
