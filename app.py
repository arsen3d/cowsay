import gradio as gr
import requests

def greet(name):
    try:
        response = requests.post('http://localhost:9876/run/job', json={
            "module":"github.com/Lilypad-Tech/lilypad-module-cowsay:main",
            "input":{"name":"Message",
                "value":name
                }
        })
        response.raise_for_status()
        data = response.json()["dataid"]

        response = requests.get(f'http://localhost:9876/files/{data}/stdout')

        return response.text
        #//"Hello, " + data['result'] + "!!!!!"
    except requests.RequestException as e:
        return f"Error: {e}"

gr.Interface(greet, "textbox", "textbox").launch()