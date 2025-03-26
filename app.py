import streamlit as st
import streamlit.components.v1 as components
import os

# --- Configuration ---
# Adjust these if your files are in a subdirectory relative to app.py
HTML_FILENAME = "index.html"
CSS_FILENAME = "style.css"
JS_FILENAME = "script.js"

# Calculate paths relative to the script's location
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
HTML_PATH = os.path.join(SCRIPT_DIR, HTML_FILENAME)
CSS_PATH = os.path.join(SCRIPT_DIR, CSS_FILENAME)
JS_PATH = os.path.join(SCRIPT_DIR, JS_FILENAME)

# Game dimensions (adjust if needed, add buffer for controls/title)
# Canvas is 400x400. Add space for title, score, controls, button.
COMPONENT_WIDTH = 450
COMPONENT_HEIGHT = 720 # Might need tweaking based on final layout

# --- Streamlit App ---
st.set_page_config(page_title="Streamlit Snake Game", layout="centered")

# st.title("🐍 Snake Game in Streamlit")
# st.write("Use Arrow Keys or the on-screen buttons to control the snake.")

# --- Read Game Files ---
try:
    with open(HTML_PATH, 'r', encoding='utf-8') as f:
        html_content = f.read()
    with open(CSS_PATH, 'r', encoding='utf-8') as f:
        css_content = f.read()
    with open(JS_PATH, 'r', encoding='utf-8') as f:
        js_content = f.read()

    # --- Inject CSS and JS into HTML ---
    # Replace the external links/scripts with inline content

    # Inject CSS (replace link tag)
    # Ensure your index.html has exactly: <link rel="stylesheet" href="style.css">
    html_content = html_content.replace(
        '<link rel="stylesheet" href="style.css">',
        f'<style>\n{css_content}\n</style>',
        1 # Replace only the first occurrence
    )

    # Inject JS (replace script tag)
    # Ensure your index.html has exactly: <script src="script.js"></script>
    # IMPORTANT: Be careful if your JS code contains '</script>'. It's rare but could break this simple replace.
    html_content = html_content.replace(
        '<script src="script.js"></script>',
        f'<script>\n{js_content}\n</script>',
        1 # Replace only the first occurrence
    )

    # --- Display the Game using Streamlit Components ---
    components.html(
        html_content,
        width=COMPONENT_WIDTH,
        height=COMPONENT_HEIGHT,
        scrolling=False # Game should ideally fit, disable scrolling
    )

#    st.caption("Game embedded using Streamlit Components.")

except FileNotFoundError:
    st.error(f"Error: Could not find game files.")
    st.error(f"Ensure '{HTML_FILENAME}', '{CSS_FILENAME}', and '{JS_FILENAME}' are in the same directory as this script ({SCRIPT_DIR}).")
except Exception as e:
    st.error(f"An unexpected error occurred: {e}")
