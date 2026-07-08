import json
import time
import sys
import os

PROGRESS_FILE = 'batch_progress.json'

def update_progress(current, total, status="processing"):
    data = {
        "current": current,
        "total": total,
        "status": status,
        "percentage": int((current / total) * 100) if total > 0 else 0
    }
    with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f)

def main():
    if len(sys.argv) < 2:
        print("Falta el parámetro de la semana.")
        sys.exit(1)
        
    semana = sys.argv[1]
    total_guias = 216
    
    print(f"Iniciando generación Batch para la Semana {semana}")
    update_progress(0, total_guias, "processing")
    
    for i in range(1, total_guias + 1):
        # SIMULACIÓN: Tiempo de llamada a un LLM (acelerado para la demo)
        # En producción, aquí estaría: response = requests.post(LLM_API_URL, json=payload)
        time.sleep(0.05) # Demora intencional para mostrar el polling y progreso
        update_progress(i, total_guias, "processing")
        
    update_progress(total_guias, total_guias, "completed")
    print("Generación Batch finalizada.")

if __name__ == "__main__":
    main()
