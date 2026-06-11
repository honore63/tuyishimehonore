
import os
import re

new_html = """      <div class="prompt-container">
        <form id="ai-form" class="prompt-box">
          <input id="ai-input" class="prompt-input" type="text" placeholder="Ask anything, @ to mention, / for workflows" autocomplete="off" required />
          <div class="prompt-toolbar">
            <div class="prompt-toolbar-left">
              <label class="prompt-tool-btn" title="Upload a document">
                <input type="file" id="ai-file" accept=".txt,.pdf" style="display:none;" />
                <i class="fa-solid fa-plus"></i>
              </label>
              <button type="button" class="prompt-tool-btn"><i class="fa-solid fa-angle-up"></i> Fast</button>
              <button type="button" class="prompt-tool-btn"><i class="fa-solid fa-angle-up"></i> Gemini 3.1 Pro (Low)</button>
            </div>
            <div class="prompt-toolbar-right">
              <button type="button" class="prompt-tool-btn"><i class="fa-solid fa-microphone"></i></button>
              <button type="submit" class="prompt-send-btn"><i class="fa-solid fa-arrow-right"></i></button>
            </div>
          </div>
        </form>
        <div id="ai-file-status" class="ai-file-status"></div>
      </div>"""

pattern = r'<form id="ai-form".*?</form>\s*<label class="ai-file-label">.*?</label>\s*<div id="ai-file-status".*?</div>'

for root, _, files in os.walk("frontend"):
    for file in files:
        if file.endswith(".html"):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            new_content = re.sub(pattern, new_html, content, flags=re.DOTALL)
            if new_content != content:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Updated {filepath}")

