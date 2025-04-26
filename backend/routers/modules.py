from fastapi import APIRouter
import yaml

router = APIRouter()

@router.get("/modules")
def get_active_modules():
    try:
        with open("config/modules.yaml", "r") as file:
            data = yaml.safe_load(file)
        active = [mod['name'] for mod in data['modules'] if mod.get('enabled', False)]
        return {"active_modules": active}
    except Exception as e:
        return {"error": str(e)}