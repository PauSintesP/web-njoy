import requests
import json

# URL del backend en Vercel
api_url = "https://projecte-n-bdpw17a74-pausintesps-projects.vercel.app"

# Datos de registro
registration_data = {
    "email": "testuser@example.com",
    "contrasena": "password123",
    "nombre": "John",
    "apellidos": "Doe",
    "fecha_nacimiento": "1995-05-15"
}

print("Enviando datos al backend:")
print(json.dumps(registration_data, indent=2))
print()

try:
    response = requests.post(
        f"{api_url}/register",
        json=registration_data,
        headers={"Content-Type": "application/json"}
    )
    
    print( f"Status Code: {response.status_code}")
    print("Response:")
    print(json.dumps(response.json(), indent=2))
    
except requests.exceptions.RequestException as e:
    print(f"Error: {e}")
    if hasattr(e, 'response') and e.response is not None:
        print(f"Status Code: {e.response.status_code}")
        print("Response:")
        try:
            print(json.dumps(e.response.json(), indent=2))
        except:
            print(e.response.text)
