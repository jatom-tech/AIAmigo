import yaml
import os

def load_modules(config_path="config/modules.yaml"):
    with open(config_path, 'r') as file:
        modules = yaml.safe_load(file)["modules"]
        
    active_modules = [m for m in modules if m.get("enabled", False)]
    
    print("Aktiverede moduler:")
    for mod in active_modules:
        print(f"- {mod['name']} ({mod['path']})")
        
    return active_modules

if __name__ == "__main__":
    load_modules()
