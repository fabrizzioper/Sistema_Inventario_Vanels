from googleapiclient.discovery import build
from openai import OpenAI

GOOGLE_API_KEY = "AIzaSyC-9YcEh6iKwNOpL7M2XSYfyK0mMnDA47c"
GOOGLE_CX_ID = "633f61ff38e354d6e"
OPENAI_API_KEY = "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"

service = build("customsearch", "v1", developerKey=GOOGLE_API_KEY)
client = OpenAI(api_key=OPENAI_API_KEY)


def buscar_en_google(codigo_producto):
    print("\n=== RESULTADOS CRUDOS DE GOOGLE ===")
    result = service.cse().list(
        q=f"Información producto {codigo_producto}",
        cx=GOOGLE_CX_ID,
        num=10
    ).execute()
    
    items = result.get("items", [])
    for idx, item in enumerate(items, 1):
        print(f"\nResultado {idx}:")
        print(f"Título: {item.get('title', 'No título')}")
        print(f"Snippet: {item.get('snippet', 'No snippet')}")
        print(f"Link: {item.get('link', 'No link')}")
        print("-" * 50)
    
    return items


def procesar_con_gpt(resultados):
    print("\n=== TEXTO ENVIADO A GPT ===")
    # MODIFICADO: Enviar solo el primer resultado en lugar de 3
    resultados_texto = "\n".join(
        [f"Título: {item['title']}\nDescripción: {item.get('snippet', 'No hay descripción')}" 
         for item in resultados[:1]]
    )
    print(resultados_texto)
    print("-" * 50)
    
    messages = [
        {
            "role": "user",
            "content": f"Del siguiente producto(zapatillas), extrae solo nombre del modelo de zapatilla y marca (Nike, Adidas, Puma, etc...), si el nombre esta en ingles no le cambies de nombre, en formato 'Nombre: X, Marca: Y':\n{resultados_texto}"
        }
    ]
    
    # MODIFICADO: Reducir max_tokens a 50 para respuesta más rápida
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        max_tokens=50
    )
    
    print("\n=== RESPUESTA DE GPT ===")
    respuesta = completion.choices[0].message.content
    print(respuesta)
    print("-" * 50)
    
    return respuesta

def obtener_imagen_producto(codigo_producto):
    print("\n=== BÚSQUEDA DE IMAGEN ===")
    try:
        result = service.cse().list(
            q=f"producto {codigo_producto} Perú",
            cx=GOOGLE_CX_ID,
            searchType='image',
            num=1,
            cr='countryPE',
            gl='pe',
            hl='es-419',
            imgSize='LARGE'
        ).execute()
        
        imagen = result.get('items', [{}])[0].get('link', "No se encontró imagen")
        print(f"URL de imagen encontrada: {imagen}")
        print("-" * 50)
        return imagen
    except Exception as e:
        error_msg = f"Error: {str(e)}"
        print(error_msg)
        print("-" * 50)
        return error_msg
    
def buscar_producto(codigo_producto):
    resultados = buscar_en_google(codigo_producto)
    if not resultados:
        return "No se encontró información del producto."
    return procesar_con_gpt(resultados)

if __name__ == "__main__":
    codigo_producto = input("Código del producto: ")
    print("\n=== INICIANDO BÚSQUEDA ===")
    print(f"Buscando producto con código: {codigo_producto}")
    print("-" * 50)
    
    resultado = buscar_producto(codigo_producto)
    link_imagen = obtener_imagen_producto(codigo_producto)
    
    print("\n=== RESULTADO FINAL ===")
    print(f"Información procesada:\n{resultado}")
    print(f"\nImagen del producto:\n{link_imagen}")
