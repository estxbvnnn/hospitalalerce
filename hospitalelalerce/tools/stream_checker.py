"""
Comprobar si un streamer está en vivo en Twitch o Kick y mostrar un panel bonito en terminal.

Requisitos:
  pip install requests rich
  (opcional) pip install python-dotenv   # para usar archivo .env

Dónde colocar las credenciales (no las pongas en el código):
- En Linux / macOS (temporal en sesión):
    export TWITCH_CLIENT_ID="tu_client_id"
    export TWITCH_OAUTH_TOKEN="tu_oauth_token"

  Para que sea persistente, añade las líneas anteriores a ~/.bashrc o ~/.zshrc.

- En Windows CMD (persistente):
    setx TWITCH_CLIENT_ID "tu_client_id"
    setx TWITCH_OAUTH_TOKEN "tu_oauth_token"
  IMPORTANTE: abrir una nueva consola después de setx para que surtan efecto.

- En PowerShell (temporal en sesión):
    $env:TWITCH_CLIENT_ID = "tu_client_id"
    $env:TWITCH_OAUTH_TOKEN = "tu_oauth_token"
  Para persistir en PowerShell:
    [Environment]::SetEnvironmentVariable("TWITCH_CLIENT_ID","tu_client_id","User")
    [Environment]::SetEnvironmentVariable("TWITCH_OAUTH_TOKEN","tu_oauth_token","User")
  Luego abrir una nueva sesión.

- Usando un archivo .env (recomendado para desarrollo local, no subirlo al repo):
    TWITCH_CLIENT_ID=tu_client_id
    TWITCH_OAUTH_TOKEN=tu_oauth_token
  y luego instala python-dotenv y el script cargará .env automáticamente.

Uso:
  python stream_checker.py twitch:miusuario kick:otrousuario
  o ejecutar sin argumentos y te pedirá los nombres.
"""

import os
import sys
import re
import requests
# Intentar cargar .env si está disponible (opcional)
try:
    from dotenv import load_dotenv
    load_dotenv()  # carga variables desde .env en el directorio actual
except Exception:
    pass

from typing import Optional, Tuple
from rich import box
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.align import Align

console = Console()

def check_twitch(username: str) -> Tuple[bool, Optional[str]]:
    """
    Devuelve (is_live, title_or_reason).
    Requiere TWITCH_CLIENT_ID y TWITCH_OAUTH_TOKEN en variables de entorno.
    """
    client_id = os.getenv("TWITCH_CLIENT_ID")
    oauth = os.getenv("TWITCH_OAUTH_TOKEN")
    if not client_id or not oauth:
        return False, "Credenciales Twitch no configuradas (TWITCH_CLIENT_ID/TWITCH_OAUTH_TOKEN)"

    headers = {
        "Client-ID": client_id,
        "Authorization": f"Bearer {oauth}"
    }
    url = f"https://api.twitch.tv/helix/streams?user_login={username}"
    try:
        r = requests.get(url, headers=headers, timeout=8)
        if r.status_code == 401:
            return False, "Token Twitch inválido"
        r.raise_for_status()
        data = r.json()
        if data.get("data"):
            stream = data["data"][0]
            title = stream.get("title") or ""
            game = stream.get("game_name") or ""
            return True, f"{title} — {game}" if title or game else "En vivo"
        return False, "Offline"
    except Exception as e:
        return False, f"Error conexión Twitch: {e}"

def check_kick_api(username: str) -> Optional[bool]:
    """
    Intento de llamada a API pública de Kick. Devuelve True/False si se determina,
    None si no se pudo determinar por este método.
    """
    # Intento razonable de endpoint público (no oficial). Si cambia la API, este método puede fallar.
    endpoints = [
        f"https://kick.com/api/v1/channels/{username}",
        f"https://kick.com/api/v1/channel/{username}",
    ]
    for url in endpoints:
        try:
            r = requests.get(url, timeout=8)
            if r.status_code == 200:
                j = r.json()
                # Varias posibles estructuras
                if isinstance(j, dict):
                    # Buscamos claves comunes
                    if j.get("is_live") is not None:
                        return bool(j.get("is_live"))
                    # estructura anidada
                    if "livestream" in j and isinstance(j["livestream"], dict):
                        if j["livestream"].get("is_live") is not None:
                            return bool(j["livestream"].get("is_live"))
                # si no se reconoce, continuar a scraping
            elif r.status_code == 404:
                return False
        except Exception:
            continue
    return None

def check_kick_scrape(username: str) -> Tuple[bool, Optional[str]]:
    """
    Scraping ligerito de la página pública de Kick buscando indicadores 'isLive' o similares.
    Devuelve (is_live, message).
    """
    url = f"https://kick.com/{username}"
    try:
        r = requests.get(url, timeout=8, headers={"User-Agent": "Mozilla/5.0"})
        if r.status_code == 404:
            return False, "No encontrado (404)"
        text = r.text
        # buscar patrones comunes
        if re.search(r'["\']isLive["\']\s*:\s*true', text, re.IGNORECASE):
            return True, "En vivo (detectado en HTML)"
        if re.search(r'["\']is_live["\']\s*:\s*true', text, re.IGNORECASE):
            return True, "En vivo (detectado en HTML)"
        # buscar 'isLive":false' explícito
        if re.search(r'["\']isLive["\']\s*:\s*false', text, re.IGNORECASE) or re.search(r'["\']is_live["\']\s*:\s*false', text, re.IGNORECASE):
            return False, "Offline (detectado en HTML)"
        # fallback: buscar etiquetas que indiquen live viewer or stream title
        if re.search(r'live now|en vivo|is live', text, re.IGNORECASE):
            return True, "Posible en vivo (heurística)"
        return False, "Offline (heurística)"
    except Exception as e:
        return False, f"Error conexión Kick: {e}"

def check_kick(username: str) -> Tuple[bool, Optional[str]]:
    api_result = check_kick_api(username)
    if api_result is True:
        return True, "En vivo (API)"
    if api_result is False:
        return False, "Offline (API)"
    # si api_result es None, intentar scrape
    return check_kick_scrape(username)

def render_panel(results: dict):
    """
    results: { "twitch": (is_live, msg), "kick": (is_live, msg) }
    """
    table = Table.grid(expand=True)
    table.add_column(justify="center")
    table.add_column(justify="center")
    for platform, (is_live, msg, username) in results.items():
        status = "[green]EN VIVO[/green]" if is_live else "[red]OFFLINE[/red]"
        title = msg or ""
        link = ""
        if platform == "twitch":
            link = f"https://twitch.tv/{username}"
        elif platform == "kick":
            link = f"https://kick.com/{username}"
        block = Table.grid()
        block.add_column()
        block.add_row(f"[bold]{platform.upper()}[/bold]")
        block.add_row(status)
        if title:
            block.add_row(f"[dim]{title}[/dim]")
        block.add_row(f"[link={link}]{link}[/link]")
        table.add_row(Panel(block, padding=(1,2), title=f"{platform}", border_style="bright_blue"))
    panel = Panel(Align.center(table), title="[bold cyan]Estado de Streamers[/bold cyan]", box=box.ROUNDED, border_style="cyan")
    console.print(panel)

def parse_args(argv):
    twitch_user = None
    kick_user = None
    for arg in argv[1:]:
        if arg.startswith("twitch:"):
            twitch_user = arg.split("twitch:",1)[1]
        elif arg.startswith("kick:"):
            kick_user = arg.split("kick:",1)[1]
    return twitch_user, kick_user

def main():
    twitch_user, kick_user = parse_args(sys.argv)
    if not twitch_user and not kick_user:
        console.print("[bold]Ingrese usuarios (dejar vacío para omitir):[/bold]")
        twitch_user = console.input("Twitch username: ").strip() or None
        kick_user = console.input("Kick username: ").strip() or None

    results = {}
    if twitch_user:
        is_live, msg = check_twitch(twitch_user)
        results["twitch"] = (is_live, msg, twitch_user)
    if kick_user:
        is_live, msg = check_kick(kick_user)
        results["kick"] = (is_live, msg, kick_user)

    if not results:
        console.print("[yellow]No se proporcionaron usuarios para comprobar.[/yellow]")
        return

    render_panel(results)

if __name__ == "__main__":
    main()
